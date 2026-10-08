// =============================================
// SISTEM BIDANG OSIS - HOMEPAGE
// =============================================

document.addEventListener("DOMContentLoaded", function () {

    const container = document.getElementById("bidang-index-container");
    const loading = document.getElementById("bidang-index-loading");

    if (!container) {
        console.error("Container bidang tidak ditemukan.");
        return;
    }

    // =============================================
    // GAMBAR CADANGAN UNTUK BIDANG LAMA
    // =============================================

    const defaultImages = {
        bidang1: "img/agama.png",
        bidang2: "img/kebersihan.png",
        bidang3: "img/disiplin.png",
        bidang4: "img/prestasi.png",
        bidang5: "img/humas.png",
        bidang6: "img/media.png"
    };

    // =============================================
    // ESCAPE HTML
    // =============================================

    function escapeHtml(value) {

        const div = document.createElement("div");

        div.textContent = value ?? "";

        return div.innerHTML;

    }

    // =============================================
    // LOADING
    // =============================================

    function showLoading() {

        if (loading) {
            loading.style.display = "block";
        }

    }

    function hideLoading() {

        if (loading) {
            loading.style.display = "none";
        }

    }

    // =============================================
    // FIREBASE
    // =============================================

    if (
        typeof firebase === "undefined" ||
        typeof firebase.database !== "function"
    ) {

        console.error("Firebase Database belum tersedia.");

        if (loading) {
            loading.textContent =
                "Firebase belum siap.";
        }

        return;

    }

    showLoading();

    // =============================================
    // AMBIL DATA BIDANG
    // =============================================

    firebase
        .database()
        .ref("website/bidang")
        .once("value")

        .then(function (snapshot) {

            const data = snapshot.val() || {};

            // =============================================
            // UBAH OBJECT MENJADI ARRAY
            // =============================================

            const bidangArray = Object.keys(data)

                .map(function (id) {

                    return {

                        id: id,

                        ...data[id]

                    };

                })

                .sort(function (a, b) {

                    const urutanA =
                        Number(a.urutan ?? 9999);

                    const urutanB =
                        Number(b.urutan ?? 9999);

                    return urutanA - urutanB;

                });

            // =============================================
            // BERSIHKAN CONTAINER
            // =============================================

            container.innerHTML = "";

            // =============================================
            // JIKA TIDAK ADA BIDANG
            // =============================================

            if (bidangArray.length === 0) {

                container.innerHTML = `

                    <p class="bidang-empty">

                        Belum ada bidang OSIS.

                    </p>

                `;

                hideLoading();

                return;

            }

            // =============================================
            // BUAT CARD
            // =============================================

            bidangArray.forEach(function (bidang) {

                const card =
                    document.createElement("div");

                card.className = "menu-card";

                // =============================================
                // GAMBAR
                //
                // PRIORITAS:
                // 1. foto Firebase
                // 2. gambar Firebase
                // 3. gambar lama
                // 4. agama.png
                // =============================================

                const image =
                    bidang.foto ||
                    bidang.gambar ||
                    defaultImages[bidang.id] ||
                    "img/agama.png";

                // =============================================
                // NAMA
                // =============================================

                const nama =
                    bidang.nama ||
                    "Bidang OSIS";

                // =============================================
                // LINK UNIVERSAL
                // =============================================

                const link =
                    "bidang.html?id=" +
                    encodeURIComponent(bidang.id);

                // =============================================
                // CARD HTML
                // =============================================

                card.innerHTML = `

                    <img
                        src="${escapeHtml(image)}"
                        alt="${escapeHtml(nama)}"
                        class="menu-card-img"
                        loading="lazy"
                    >

                    <h3 class="menu-card-title">

                        - ${escapeHtml(nama)} -

                    </h3>

                    <a
                        href="${link}"
                        class="menu-card-price"
                    >

                        Klik disini

                    </a>

                `;

                // =============================================
                // FALLBACK JIKA GAMBAR ERROR
                // =============================================

                const img =
                    card.querySelector(".menu-card-img");

                img.addEventListener("error", function () {

                    // Jangan loop jika gambar cadangan juga gagal

                    if (
                        this.dataset.fallbackApplied === "true"
                    ) {
                        return;
                    }

                    this.dataset.fallbackApplied = "true";

                    this.src =
                        defaultImages[bidang.id] ||
                        "img/agama.png";

                });

                // =============================================
                // MASUKKAN CARD
                // =============================================

                container.appendChild(card);

            });

            hideLoading();

        })

        .catch(function (error) {

            console.error(
                "Gagal memuat bidang:",
                error
            );

            container.innerHTML = `

                <p class="bidang-empty">

                    Gagal memuat bidang OSIS.

                    <br>

                    Silakan coba lagi.

                </p>

            `;

            hideLoading();

        });

});