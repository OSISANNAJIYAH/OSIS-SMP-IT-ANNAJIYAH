/* =========================================================
   VOTING KETUA OSIS - SISTEM DINAMIS FIREBASE
   Data:
   website/voting/config
   website/voting/kandidat
   website/voting/votes
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const kandidatRef = database.ref("website/voting/kandidat");
    const configRef = database.ref("website/voting/config");
    const votesRef = database.ref("website/voting/votes");

    const container = document.querySelector(".candidate-container");
    const resultBox = document.querySelector(".result-box");
    const statusText = document.getElementById("vote-status");
    const chartCanvas = document.getElementById("chart");

    if (!container || !statusText) {
        return;
    }

    let kandidatData = {};
    let configData = {
        dibuka: false,
        tampilkanHasil: true
    };
    let votesData = {};
    let chart = null;
    let alreadyVoted = localStorage.getItem("osisVotingHasVoted") === "true";

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getKandidatArray() {
        return Object.entries(kandidatData)
            .map(([id, data]) => ({
                id,
                ...(data || {})
            }))
            .sort((a, b) => {
                const na = Number(a.nomor ?? a.urutan ?? 9999);
                const nb = Number(b.nomor ?? b.urutan ?? 9999);
                return na - nb;
            });
    }

    function getTotalVotes() {
        return getKandidatArray().reduce((total, kandidat) => {
            return total + Number(votesData[kandidat.id] || 0);
        }, 0);
    }

    function renderStatus() {
        const kandidat = getKandidatArray();

        if (!kandidat.length) {
            statusText.innerHTML =
                "ℹ️ Belum ada kandidat yang tersedia.";
            return;
        }

        if (!configData.dibuka) {
            statusText.innerHTML =
                "🔒 <strong>Voting sedang ditutup.</strong>";
            return;
        }

        if (alreadyVoted) {
            statusText.innerHTML =
                "✅ Kamu sudah menggunakan hak suara pada perangkat ini.";
            return;
        }

        statusText.innerHTML =
            "🟢 <strong>Voting sedang dibuka.</strong> Silakan pilih satu kandidat.";
    }

    function renderCandidates() {
        const kandidat = getKandidatArray();

        container.innerHTML = "";

        if (!kandidat.length) {
            container.innerHTML = `
                <div style="
                    width:100%;
                    padding:40px;
                    text-align:center;
                    border-radius:24px;
                    background:rgba(255,255,255,.06);
                    border:1px solid rgba(255,255,255,.12);
                ">
                    <h2>Belum Ada Kandidat</h2>
                    <p>Admin belum menambahkan kandidat Ketua OSIS.</p>
                </div>
            `;
            return;
        }

        const total = getTotalVotes();
        const maxVote = kandidat.length
            ? Math.max(...kandidat.map(k => Number(votesData[k.id] || 0)))
            : 0;

        kandidat.forEach((data) => {
            const vote = Number(votesData[data.id] || 0);
            const isLeading = maxVote > 0 && vote === maxVote;
            const foto = data.foto || "img/profil.png";

            const card = document.createElement("div");
            card.className = "candidate-card" + (isLeading ? " leading" : "");
            card.dataset.id = data.id;

            const percent = total > 0 ? (vote / total) * 100 : 0;

            card.innerHTML = `
                <div class="rank-badge">#${escapeHtml(data.nomor || "")}</div>
                ${isLeading ? `<div class="crown">👑</div>` : ""}

                <div class="candidate-image">
                    <img
                        src="${escapeHtml(foto)}"
                        alt="Foto ${escapeHtml(data.nama || "Kandidat")}"
                        onerror="this.src='img/profil.png'"
                    >
                </div>

                <h3>Kandidat #${escapeHtml(data.nomor || "")}</h3>

                <div class="live-vote">
                    <div class="live-dot"></div>
                    <span class="vote-number">${vote}</span>
                </div>

                <h2>${escapeHtml(data.nama || "Tanpa Nama")}</h2>

                <p>"${escapeHtml(data.deskripsi || "Tidak ada deskripsi kandidat.")}"</p>

                <div style="
                    margin:15px 0 4px;
                    font-size:.85rem;
                    opacity:.75;
                ">
                    ${percent.toFixed(1)}% dari total suara
                </div>

                <button
                    class="vote-btn"
                    type="button"
                    data-id="${escapeHtml(data.id)}"
                    ${!configData.dibuka || alreadyVoted ? "disabled" : ""}
                >
                    ${!configData.dibuka ? "Voting Ditutup" :
                      alreadyVoted ? "Sudah Memilih" : "Vote"}
                </button>
            `;

            const button = card.querySelector(".vote-btn");

            if (button && configData.dibuka && !alreadyVoted) {
                button.addEventListener("click", function () {
                    pilihKandidat(data.id, data.nama || "Kandidat");
                });
            }

            container.appendChild(card);
        });
    }

    async function pilihKandidat(kandidatId, namaKandidat) {
        if (!configData.dibuka) {
            alert("Voting sedang ditutup.");
            return;
        }

        if (alreadyVoted) {
            alert("Kamu sudah menggunakan hak suara pada perangkat ini.");
            return;
        }

        const konfirmasi = confirm(
            `Yakin ingin memilih ${namaKandidat}?\\n\\n` +
            "Setelah suara dikirim, pilihan tidak dapat diubah."
        );

        if (!konfirmasi) return;

        const buttons = container.querySelectorAll(".vote-btn");
        buttons.forEach(btn => btn.disabled = true);

        try {
            const snapshot = await configRef.once("value");
            const configTerbaru = snapshot.val() || {};

            if (!configTerbaru.dibuka) {
                alert("Voting baru saja ditutup oleh admin.");
                renderAll();
                return;
            }

            const targetRef = votesRef.child(kandidatId);

            await targetRef.transaction(function (current) {
                return Number(current || 0) + 1;
            });

            localStorage.setItem("osisVotingHasVoted", "true");
            alreadyVoted = true;

            alert("✅ Voting berhasil! Terima kasih sudah menggunakan hak suara.");

            renderAll();

        } catch (error) {
            console.error("Gagal mengirim suara:", error);
            alert("❌ Suara gagal dikirim. Silakan coba lagi.");
            renderAll();
        }
    }

    function renderResults() {
        if (!resultBox) return;

        if (!configData.tampilkanHasil) {
            resultBox.style.display = "none";
            return;
        }

        resultBox.style.display = "";

        const kandidat = getKandidatArray();
        const labels = kandidat.map(k => k.nama || "Tanpa Nama");
        const values = kandidat.map(k => Number(votesData[k.id] || 0));
        const total = values.reduce((a, b) => a + b, 0);

        const progressContainer =
            resultBox.querySelector(".progress-container");

        if (progressContainer) {
            progressContainer.innerHTML = "";

            kandidat.forEach((k, index) => {
                const vote = values[index];
                const percent = total ? (vote / total) * 100 : 0;

                const item = document.createElement("div");
                item.className = "progress-item";

                item.innerHTML = `
                    <span>${escapeHtml(k.nama || "Tanpa Nama")}</span>
                    <div class="progress-bar">
                        <div
                            class="progress-fill"
                            style="width:${percent}%"
                        ></div>
                    </div>
                    <span>${percent.toFixed(1)}%</span>
                `;

                progressContainer.appendChild(item);
            });
        }

        if (chartCanvas && typeof Chart !== "undefined") {
            if (!chart) {
                chart = new Chart(chartCanvas, {
                    type: "doughnut",
                    data: {
                        labels,
                        datasets: [{
                            data: values,
                            backgroundColor: [
                                "#3b82f6",
                                "#9333ea",
                                "#06b6d4",
                                "#22c55e",
                                "#f59e0b",
                                "#ef4444",
                                "#14b8a6",
                                "#8b5cf6"
                            ],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        animation: {
                            duration: 900
                        },
                        plugins: {
                            legend: {
                                labels: {
                                    color: "white"
                                }
                            }
                        }
                    }
                });
            } else {
                chart.data.labels = labels;
                chart.data.datasets[0].data = values;
                chart.update();
            }
        }
    }

    function renderAll() {
        renderStatus();
        renderCandidates();
        renderResults();
    }

    configRef.on("value", function (snapshot) {
        configData = {
            dibuka: false,
            tampilkanHasil: true,
            ...(snapshot.val() || {})
        };

        renderAll();
    });

    kandidatRef.on("value", function (snapshot) {
        kandidatData = snapshot.val() || {};
        renderAll();
    });

    votesRef.on("value", function (snapshot) {
        votesData = snapshot.val() || {};
        renderAll();

        if (resultBox) {
            resultBox.classList.add("vote-pop");
            setTimeout(() => {
                resultBox.classList.remove("vote-pop");
            }, 500);
        }
    });

    renderAll();
});
