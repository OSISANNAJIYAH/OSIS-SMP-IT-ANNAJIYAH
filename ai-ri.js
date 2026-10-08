/* =========================================================
   AI.ri — Asisten OSIS SMP IT An-Najiyah
   v2 — smarter, Firebase-aware, navbar-safe
   No external AI API / no API key required.
========================================================= */
(function () {
  "use strict";

  if (window.__AIRI_V2_LOADED__) return;
  window.__AIRI_V2_LOADED__ = true;

  const state = {
    visiMisi: null,
    struktur: null,
    bidang: {},
    dokumentasi: {},
    voting: { config: {}, kandidat: {}, votes: {} },
    ready: false,
    loading: false,
    lastIntent: null,
    lastBidang: null,
    history: []
  };

  const $ = (s) => document.querySelector(s);
  const escapeHTML = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokens(text) {
    return normalize(text).split(" ").filter(Boolean);
  }

  function hasAny(text, words) {
    const n = normalize(text);
    return words.some(w => n.includes(normalize(w)));
  }

  function score(text, phrases) {
    const n = normalize(text);
    const ts = new Set(tokens(n));
    let total = 0;
    phrases.forEach(p => {
      const q = normalize(p);
      if (!q) return;
      if (n.includes(q)) total += q.includes(" ") ? 5 : 3;
      q.split(" ").forEach(t => { if (t.length > 2 && ts.has(t)) total += 1; });
    });
    return total;
  }

  function findBidang(query) {
    const list = Object.entries(state.bidang || {});
    let best = null;
    let bestScore = 0;
    for (const [id, data] of list) {
      const name = data?.nama || data?.judul || data?.name || "";
      const s = score(query, [name]);
      if (s > bestScore) { bestScore = s; best = { id, data }; }
    }
    return bestScore > 0 ? best : null;
  }

  function getMembers(data) {
    const members = data?.anggota || data?.members || {};
    if (Array.isArray(members)) return members.filter(Boolean);
    return Object.values(members || {}).filter(Boolean);
  }

  function memberText(member) {
    if (typeof member === "string") return member;
    return member?.nama || member?.name || member?.namaLengkap || "Anggota";
  }

  function getStructurePeople() {
    const s = state.struktur || {};
    const keys = ["ketua", "wakil", "sekretaris", "bendahara"];
    const out = [];
    keys.forEach(k => {
      const x = s[k];
      if (!x) return;
      const nama = typeof x === "string" ? x : (x.nama || x.name || x.namaLengkap);
      const jabatan = typeof x === "object" ? (x.jabatan || x.role || "") : "";
      if (nama) out.push({ role: jabatan || (k[0].toUpperCase() + k.slice(1)), nama });
    });
    return out;
  }

  async function loadData() {
    if (state.loading) return;
    state.loading = true;
    try {
      if (!window.firebase || !firebase.database) throw new Error("Firebase belum siap");
      const db = firebase.database();
      const paths = [
        ["visiMisi", "website/visiMisi"],
        ["struktur", "struktur"],
        ["bidang", "website/bidang"],
        ["dokumentasi", "website/dokumentasi"],
        ["voting", "website/voting"]
      ];
      const results = await Promise.all(paths.map(([, path]) => db.ref(path).once("value")));
      state.visiMisi = results[0].val() || {};
      state.struktur = results[1].val() || {};
      state.bidang = results[2].val() || {};
      state.dokumentasi = results[3].val() || {};
      const v = results[4].val() || {};
      state.voting = {
        config: v.config || {},
        kandidat: v.kandidat || {},
        votes: v.votes || {}
      };
      state.ready = true;
    } catch (err) {
      console.warn("AI.ri: data Firebase belum dapat dimuat", err);
      state.ready = false;
    } finally {
      state.loading = false;
    }
  }

  function listenRealtime() {
    try {
      const db = firebase.database();
      db.ref("website/visiMisi").on("value", s => state.visiMisi = s.val() || {});
      db.ref("struktur").on("value", s => state.struktur = s.val() || {});
      db.ref("website/bidang").on("value", s => state.bidang = s.val() || {});
      db.ref("website/dokumentasi").on("value", s => state.dokumentasi = s.val() || {});
      db.ref("website/voting/config").on("value", s => state.voting.config = s.val() || {});
      db.ref("website/voting/kandidat").on("value", s => state.voting.kandidat = s.val() || {});
      db.ref("website/voting/votes").on("value", s => state.voting.votes = s.val() || {});
    } catch (e) { console.warn("AI.ri realtime listener:", e); }
  }

  function parseMisi(value) {
    if (Array.isArray(value)) {
      return value
        .map(x => typeof x === "string" ? x.trim() : (x?.text || x?.isi || x?.misi || x?.deskripsi || ""))
        .filter(Boolean);
    }

    if (value && typeof value === "object") {
      return Object.values(value)
        .map(x => typeof x === "string" ? x.trim() : (x?.text || x?.isi || x?.misi || x?.deskripsi || ""))
        .filter(Boolean);
    }

    if (typeof value === "string") {
      return value
        .split(/\r?\n+/)
        .map(line => line
          .replace(/^\s*(?:[-*•]\s*|\d+[.)]\s*)/, "")
          .trim()
        )
        .filter(Boolean);
    }

    return [];
  }

  function visiAnswer() {
    const v = state.visiMisi || {};
    const visi = v.visi || v.VISI || v.vision || "";
    const misi = parseMisi(v.misi || v.MISI || v.mission || v.misiList);

    if (!visi && !misi.length) {
      return "🎯 Data visi dan misi belum tersedia di database.";
    }

    const misiText = misi.length
      ? `<ol>${misi.map(x => `<li>${escapeHTML(x)}</li>`).join("")}</ol>`
      : "<p>Misi belum tersedia di database.</p>";

    return `🎯 <b>Visi OSIS</b><br>${escapeHTML(visi || "Belum tersedia.")}<br><br>📌 <b>Misi OSIS</b>${misiText}`;
  }

  function structureAnswer(query) {
    const people = getStructurePeople();
    if (!people.length) return "👥 Data pengurus belum tersedia di database.";
    const askedRole = hasAny(query, ["ketua", "wakil", "sekretaris", "bendahara"]);
    if (askedRole) {
      const found = people.filter(p => normalize(query).includes(normalize(p.role)));
      if (found.length) return found.map(p => `👤 <b>${p.role}</b>: ${escapeHTML(p.nama)}`).join("<br>");
    }
    return `👥 <b>Pengurus inti OSIS</b><br>${people.map(p => `• ${p.role}: <b>${escapeHTML(p.nama)}</b>`).join("<br>")}`;
  }

  function bidangAnswer(query) {
    const found = findBidang(query);
    if (found) {
      state.lastBidang = found.id;
      const d = found.data || {};
      const name = d.nama || d.judul || d.name || "Bidang OSIS";
      const desc = d.deskripsi || d.description || "Belum ada deskripsi bidang.";
      const members = getMembers(d);
      const memberList = members.length
        ? `<br><br>👥 <b>Anggota:</b><br>${members.map(m => `• ${escapeHTML(memberText(m))}`).join("<br>")}`
        : "";
      return `🏫 <b>${escapeHTML(name)}</b><br>${escapeHTML(desc)}${memberList}`;
    }

    const entries = Object.entries(state.bidang || {});
    if (!entries.length) return "🏫 Data bidang OSIS belum tersedia di database.";
    const list = entries.map(([, d]) => d?.nama || d?.judul || d?.name).filter(Boolean);
    return `🏫 <b>Bidang OSIS yang tersedia:</b><br>${list.map((x,i) => `${i+1}. ${escapeHTML(x)}`).join("<br>")}`;
  }

  function documentationAnswer() {
    const docs = Object.values(state.dokumentasi || {}).filter(Boolean);
    if (!docs.length) return "📸 Saat ini belum ada dokumentasi yang tersimpan.";
    const latest = docs.slice(-3).reverse();
    return `📸 Ada <b>${docs.length}</b> dokumentasi di website.<br><br>` +
      latest.map(d => `• <b>${escapeHTML(d.judul || d.title || "Dokumentasi")}</b>${d.deskripsi ? ` — ${escapeHTML(d.deskripsi)}` : ""}`).join("<br>") +
      `<br><br>➡️ Kamu bisa membuka halaman <b>Dokumentasi</b> dari navbar.`;
  }

  function votingAnswer(query) {
    const cfg = state.voting.config || {};
    const candidates = Object.values(state.voting.kandidat || {}).filter(Boolean)
      .sort((a,b) => (Number(a.nomor || a.urutan || 999) - Number(b.nomor || b.urutan || 999)));
    if (hasAny(query, ["kandidat", "calon", "calon ketua", "siapa yang ikut"])) {
      if (!candidates.length) return "🗳️ Belum ada data kandidat voting.";
      return `🗳️ <b>Kandidat Ketua OSIS:</b><br>${candidates.map((c,i) => `• ${escapeHTML(c.nomor || i+1)} — <b>${escapeHTML(c.nama || "Tanpa nama")}</b>${c.deskripsi ? `: ${escapeHTML(c.deskripsi)}` : ""}`).join("<br>")}`;
    }
    const opened = cfg.dibuka === true || cfg.dibuka === "true";
    const results = cfg.tampilkanHasil !== false;
    return `🗳️ <b>Status Voting</b><br>Voting saat ini: <b>${opened ? "DIBUKA" : "DITUTUP"}</b>.<br>Hasil: <b>${results ? "ditampilkan" : "disembunyikan"}</b>.<br><br>${candidates.length ? `Tersedia <b>${candidates.length}</b> kandidat.` : "Belum ada kandidat."}`;
  }

  function genericAnswer(query) {
    const q = normalize(query);
    if (!q) return "Silakan tulis pertanyaanmu 😊";

    if (hasAny(q, ["halo", "hai", "hello", "assalamualaikum", "selamat pagi", "selamat siang", "selamat sore", "selamat malam"])) {
      return "Waalaikumsalam 👋 Aku <b>AI.ri</b>, asisten website OSIS SMP IT An-Najiyah. Kamu bisa bertanya tentang OSIS, pengurus, bidang, dokumentasi, visi-misi, atau voting. 🤖";
    }
    if (hasAny(q, ["terima kasih", "makasih", "thanks"])) return "Sama-sama! 😎 Kalau masih ada yang ingin kamu tanyakan tentang website OSIS, langsung saja.";
    if (hasAny(q, ["apa itu osis", "pengertian osis", "fungsi osis", "tentang osis"])) return "🏫 <b>OSIS</b> adalah Organisasi Siswa Intra Sekolah. OSIS menjadi wadah siswa untuk belajar berorganisasi, bekerja sama, memimpin, bertanggung jawab, dan menjalankan berbagai kegiatan sekolah.";
    if (hasAny(q, ["visi", "misi", "tujuan osis"])) { state.lastIntent = "visi"; return visiAnswer(); }
    if (hasAny(q, ["siapa ketua", "ketua osis", "siapa wakil", "wakil ketua", "siapa sekretaris", "sekretaris osis", "siapa bendahara", "bendahara osis", "pengurus", "struktur organisasi", "struktur osis", "pengurus osis"])) { state.lastIntent = "struktur"; return structureAnswer(q); }
    if (hasAny(q, ["bidang apa", "bidang osis", "ada bidang", "daftar bidang", "apa saja bidang", "divisi osis", "seksi bidang", "anggota bidang"])) { state.lastIntent = "bidang"; return bidangAnswer(q); }
    if (hasAny(q, ["dokumentasi", "foto kegiatan", "album", "galeri", "foto osis", "kegiatan osis"])) { state.lastIntent = "dokumentasi"; return documentationAnswer(); }
    if (hasAny(q, ["voting", "pemilihan", "pilih ketua", "calon ketua", "kandidat ketua", "hasil voting"])) { state.lastIntent = "voting"; return votingAnswer(q); }
    if (hasAny(q, ["kontak", "hubungi osis", "nomor osis", "whatsapp osis", "alamat sekolah", "lokasi sekolah"])) return "📞 Untuk informasi kontak, silakan buka bagian <b>Kontak</b> pada website OSIS. Aku tidak akan mengarang nomor atau alamat yang belum tersimpan di data website.";
    if (hasAny(q, ["kamu siapa", "siapa kamu", "nama kamu", "apa itu ai ri", "ai ri siapa"])) return "🤖 Aku <b>AI.ri</b> — asisten informasi website OSIS SMP IT An-Najiyah. Aku membaca data yang tersedia di website dan Firebase, lalu membantu menjawab pertanyaan tentang OSIS.";
    if (hasAny(q, ["berapa bidang", "jumlah bidang"])) {
      return `🏫 Saat ini ada <b>${Object.keys(state.bidang || {}).length}</b> bidang yang tersimpan di website.`;
    }

    // Follow-up berdasarkan konteks percakapan.
    if (state.lastIntent === "bidang") return bidangAnswer(q);
    if (state.lastIntent === "struktur") return structureAnswer(q);
    if (state.lastIntent === "voting") return votingAnswer(q);

    // Pencarian berdasarkan nama bidang meskipun kalimatnya bebas.
    const b = findBidang(q);
    if (b) return bidangAnswer(q);

    return "🤖 Aku belum menemukan jawaban yang cukup pasti dari data website. Coba tanyakan seperti:<br><br>• <b>Siapa ketua OSIS?</b><br>• <b>Apa saja bidang OSIS?</b><br>• <b>Siapa anggota bidang Keagamaan dan Pendidikan?</b><br>• <b>Apa visi dan misi OSIS?</b><br>• <b>Siapa kandidat voting?</b>";
  }

  function addMessage(html, type) {
    const body = $("#airiChatBody");
    if (!body) return;
    const div = document.createElement("div");
    div.className = `airi-msg ${type}`;
    div.innerHTML = html;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function showTyping() {
    const body = $("#airiChatBody");
    if (!body) return;
    const d = document.createElement("div");
    d.id = "airiTyping";
    d.className = "airi-msg bot airi-typing";
    d.innerHTML = `<span></span><span></span><span></span>`;
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }

  function removeTyping() { $("#airiTyping")?.remove(); }

  function ask(question) {
    const q = String(question || "").trim();
    if (!q) return;
    addMessage(escapeHTML(q), "user");
    state.history.push({ role: "user", text: q });
    showTyping();
    setTimeout(() => {
      removeTyping();
      const answer = genericAnswer(q);
      addMessage(answer, "bot");
      state.history.push({ role: "bot", text: answer });
    }, 260);
  }

  function createUI() {
    const style = document.createElement("style");
    style.id = "airi-v2-style";
    style.textContent = `
      #airiRoot{position:fixed;right:20px;bottom:20px;z-index:2147483000;font-family:Inter,Poppins,Arial,sans-serif}
      #airiToggle{border:1px solid rgba(255,255,255,.2);background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#fff;border-radius:999px;padding:14px 20px;font-weight:800;box-shadow:0 12px 35px rgba(0,0,0,.35);cursor:pointer;transition:.25s;display:flex;align-items:center;gap:8px}
      #airiToggle:hover{transform:translateY(-3px);box-shadow:0 18px 42px rgba(0,0,0,.45)}
      #airiPanel{position:absolute;right:0;bottom:68px;width:390px;height:min(650px,calc(100vh - 120px));min-height:420px;background:rgba(7,20,40,.97);border:1px solid rgba(148,163,184,.28);border-radius:22px;box-shadow:0 25px 80px rgba(0,0,0,.55);backdrop-filter:blur(18px);overflow:hidden;display:none;flex-direction:column}
      #airiPanel.open{display:flex;animation:airiIn .22s ease-out}
      @keyframes airiIn{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}
      .airi-head{height:62px;flex:0 0 62px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg,#0b2547,#102f55);border-bottom:1px solid rgba(255,255,255,.09)}
      .airi-brand{display:flex;align-items:center;gap:10px;color:#fff}.airi-brand-icon{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,#38bdf8,#2563eb);font-size:20px}.airi-brand strong{display:block;font-size:15px}.airi-brand small{display:block;color:#9fb2c9;font-size:10px;margin-top:2px}
      #airiClose{width:34px;height:34px;border:0;border-radius:10px;background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:20px}
      #airiTemplates{padding:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px;border-bottom:1px solid rgba(255,255,255,.08)}
      .airi-template{border:1px solid rgba(148,163,184,.2);background:rgba(255,255,255,.06);color:#e5edf8;border-radius:12px;padding:9px 10px;text-align:left;cursor:pointer;font-size:11px;font-weight:700;line-height:1.3}.airi-template:hover{background:rgba(37,99,235,.25);border-color:rgba(56,189,248,.5)}
      #airiChatBody{flex:1;min-height:0;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
      .airi-msg{max-width:88%;padding:10px 12px;border-radius:15px;font-size:13px;line-height:1.55;word-break:break-word}.airi-msg.bot{align-self:flex-start;background:rgba(30,48,75,.9);color:#eaf2fb;border-top-left-radius:5px}.airi-msg.user{align-self:flex-end;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;border-top-right-radius:5px}.airi-msg ol{padding-left:19px;margin:6px 0}.airi-msg li{margin:4px 0}
      .airi-typing{display:flex;gap:4px;align-items:center;width:52px}.airi-typing span{width:6px;height:6px;background:#8fb4dc;border-radius:50%;animation:airiDot 1s infinite}.airi-typing span:nth-child(2){animation-delay:.15s}.airi-typing span:nth-child(3){animation-delay:.3s}@keyframes airiDot{50%{transform:translateY(-4px);opacity:.5}}
      .airi-input-wrap{flex:0 0 auto;padding:10px;border-top:1px solid rgba(255,255,255,.08);background:rgba(4,15,30,.85);display:flex;gap:8px}.airi-input-wrap input{min-width:0;flex:1;border:1px solid rgba(148,163,184,.22);outline:0;background:rgba(255,255,255,.06);color:#fff;border-radius:13px;padding:12px;font-size:13px}.airi-input-wrap input::placeholder{color:#8093aa}.airi-send{width:46px;border:0;border-radius:13px;background:#2563eb;color:#fff;font-size:19px;cursor:pointer}.airi-note{font-size:9px;color:#73869c;text-align:center;padding:0 10px 8px;background:rgba(4,15,30,.85)}
      @media(max-width:700px){#airiRoot{right:12px;bottom:12px}#airiPanel{position:fixed;right:12px;left:12px;bottom:70px;width:auto;height:min(650px,calc(100vh - 105px));min-height:0}.airi-msg{max-width:92%}}
      @media(max-width:430px){#airiToggle{padding:12px 16px}.airi-template{font-size:10px}}
    `;
    document.head.appendChild(style);

    const root = document.createElement("div");
    root.id = "airiRoot";
    root.innerHTML = `
      <div id="airiPanel" aria-hidden="true">
        <div class="airi-head">
          <div class="airi-brand"><div class="airi-brand-icon">🤖</div><div><strong>AI.ri</strong><small>Asisten OSIS SMP IT An-Najiyah</small></div></div>
          <button id="airiClose" aria-label="Tutup">×</button>
        </div>
        <div id="airiTemplates">
          <button class="airi-template" data-q="Apa visi dan misi OSIS?">🎯 Visi & Misi</button>
          <button class="airi-template" data-q="Siapa saja pengurus OSIS?">👥 Pengurus</button>
          <button class="airi-template" data-q="Apa saja bidang OSIS?">🏫 Bidang OSIS</button>
          <button class="airi-template" data-q="Siapa anggota bidang Keagamaan dan Pendidikan?">📚 Anggota Bidang</button>
          <button class="airi-template" data-q="Bagaimana melihat dokumentasi OSIS?">📸 Dokumentasi</button>
          <button class="airi-template" data-q="Siapa kandidat Ketua OSIS?">🗳️ Kandidat Voting</button>
        </div>
        <div id="airiChatBody">
          <div class="airi-msg bot">Halo 👋 Aku <b>AI.ri</b>. Tanya apa saja tentang OSIS, pengurus, bidang, dokumentasi, visi-misi, atau voting.</div>
        </div>
        <div class="airi-input-wrap"><input id="airiInput" autocomplete="off" placeholder="Tanyakan sesuatu tentang OSIS..."><button class="airi-send" id="airiSend">➤</button></div>
        <div class="airi-note">AI.ri menggunakan informasi yang tersedia di website OSIS.</div>
      </div>
      <button id="airiToggle" aria-label="Buka AI.ri">🤖 <span>AI.ri</span></button>
    `;
    document.body.appendChild(root);

    const panel = $("#airiPanel");
    $("#airiToggle").addEventListener("click", () => {
      const open = panel.classList.toggle("open");
      panel.setAttribute("aria-hidden", String(!open));
      if (open) setTimeout(() => $("#airiInput")?.focus(), 100);
    });
    $("#airiClose").addEventListener("click", () => panel.classList.remove("open"));
    $("#airiSend").addEventListener("click", () => { const i = $("#airiInput"); ask(i.value); i.value = ""; });
    $("#airiInput").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); $("#airiSend").click(); } });
    document.querySelectorAll(".airi-template").forEach(btn => btn.addEventListener("click", () => ask(btn.dataset.q)));
  }

  function start() {
    if (!document.body) return setTimeout(start, 50);
    // Hapus UI AI.ri lama yang mungkin masih berasal dari index.html/script lama.
    ["chatToggle", "chatBox", "chatBody", "userInput", "sendBtn"].forEach(id => document.getElementById(id)?.remove());
    createUI();
    loadData().then(listenRealtime);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
