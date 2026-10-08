// =============================================
// HALAMAN UNIVERSAL BIDANG OSIS
// =============================================

document.addEventListener("DOMContentLoaded", function () {

    const params = new URLSearchParams(window.location.search);
    const bidangId = params.get("id");

    const loading = document.getElementById("bidang-loading");
    const bidangFoto = document.getElementById("bidang-foto");
    const bidangNama = document.getElementById("bidang-nama");
    const bidangDeskripsi = document.getElementById("bidang-deskripsi");
    const anggotaList = document.getElementById("anggota-list");
    const anggotaEmpty = document.getElementById("anggota-empty");
    const memberCount = document.getElementById("member-count");

    const popup = document.getElementById("popup");
    const popupImg = document.getElementById("popup-img");
    const popupName = document.getElementById("popup-name");
    const popupRole = document.getElementById("popup-role");
    const popupDesc = document.getElementById("popup-desc");
    const popupClose = document.getElementById("popup-close");
    const popupBackdrop = popup ? popup.querySelector(".popup-backdrop") : null;

    function hideLoading() {
        if (!loading) return;
        loading.classList.add("hide");
        setTimeout(() => loading.remove(), 500);
    }

    function showError(message) {
        if (bidangNama) bidangNama.textContent = "Bidang tidak ditemukan";
        if (bidangDeskripsi) bidangDeskripsi.textContent = message;
        if (anggotaList) anggotaList.innerHTML = "";
        if (anggotaEmpty) {
            anggotaEmpty.hidden = false;
            anggotaEmpty.querySelector("h3").textContent = "Data tidak tersedia";
            anggotaEmpty.querySelector("p").textContent = message;
        }
        if (memberCount) memberCount.textContent = "0 anggota";
        hideLoading();
    }

    function escapeHtml(value) {
        const div = document.createElement("div");
        div.textContent = value ?? "";
        return div.innerHTML;
    }

    function openPopup(member) {
        if (!popup) return;

        popupImg.src = member.foto || "img/user.png";
        popupName.textContent = member.nama || "Tanpa Nama";
        popupRole.textContent = member.jabatan || member.role || "ANGGOTA";
        popupDesc.textContent = member.deskripsi || "Tidak ada deskripsi.";

        popup.classList.add("show");
        popup.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closePopup() {
        if (!popup) return;
        popup.classList.remove("show");
        popup.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    if (popupClose) popupClose.addEventListener("click", closePopup);
    if (popupBackdrop) popupBackdrop.addEventListener("click", closePopup);
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") closePopup();
    });

    if (!bidangId) {
        showError("ID bidang tidak ditemukan pada alamat halaman.");
        return;
    }

    if (typeof firebase === "undefined" || typeof firebase.database !== "function") {
        showError("Firebase belum siap. Silakan muat ulang halaman.");
        return;
    }

    firebase.database().ref("website/bidang/" + bidangId).once("value")
        .then(function (snapshot) {

            const bidang = snapshot.val();

            if (!bidang) {
                showError("Bidang ini belum tersedia atau sudah dihapus.");
                return;
            }

            const foto = bidang.foto || bidang.gambar || "img/agama.png";

            bidangFoto.src = foto;
            bidangFoto.alt = bidang.nama || "Bidang OSIS";
            bidangNama.textContent = bidang.nama || "Bidang OSIS";
            bidangDeskripsi.textContent = bidang.deskripsi || "Belum ada deskripsi bidang.";

            const members = bidang.anggota || bidang.members || {};

            const memberArray = Object.keys(members)
                .map(function (id) {
                    return {
                        id: id,
                        ...members[id]
                    };
                })
                .sort(function (a, b) {
                    return (a.nama || "").localeCompare(b.nama || "", "id");
                });

            memberCount.textContent = memberArray.length + " anggota";
            anggotaList.innerHTML = "";

            if (memberArray.length === 0) {
                anggotaEmpty.hidden = false;
                hideLoading();
                return;
            }

            anggotaEmpty.hidden = true;

            memberArray.forEach(function (member) {

                const card = document.createElement("article");
                card.className = "member-card";
                card.tabIndex = 0;

                const fotoMember = member.foto || "img/user.png";
                const nama = member.nama || "Tanpa Nama";
                const jabatan = member.jabatan || member.role || "ANGGOTA";
                const deskripsi = member.deskripsi || "";

                card.innerHTML = `
                    <div class="member-photo-wrap">
                        <img
                            src="${escapeHtml(fotoMember)}"
                            alt="${escapeHtml(nama)}"
                            class="member-photo"
                            loading="lazy"
                        >
                    </div>
                    <h3 class="member-name">${escapeHtml(nama)}</h3>
                    <div class="member-role">${escapeHtml(jabatan)}</div>
                    ${deskripsi ? `<p class="member-desc">${escapeHtml(deskripsi)}</p>` : ""}
                `;

                const img = card.querySelector(".member-photo");
                img.addEventListener("error", function () {
                    if (this.dataset.fallback) return;
                    this.dataset.fallback = "true";
                    this.src = "img/user.png";
                });

                card.addEventListener("click", function () {
                    openPopup(member);
                });

                card.addEventListener("keydown", function (event) {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openPopup(member);
                    }
                });

                anggotaList.appendChild(card);
            });

            hideLoading();
        })
        .catch(function (error) {
            console.error("Gagal memuat bidang:", error);
            showError("Terjadi kesalahan saat mengambil data bidang.");
        });
});
