/* =========================================================
   DOKUMENTASI.JS
   Flipbook + Firebase
   Data dibaca dari: website/dokumentasi
   ========================================================= */

const book = document.getElementById("documentationBook");
const loadingPage = document.getElementById("dokumentasiLoading");

const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const closeBtn = document.getElementById("closeBtn");

let pages = [];
let currentPage = 0;

/* =========================================================
   UTILITY
   ========================================================= */

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
   LIGHTBOX
   ========================================================= */

function openLightbox(src) {
    if (!lightbox || !lightboxImg) return;

    lightboxImg.src = src;
    lightbox.classList.add("active");
    document.body.classList.add("lightbox-open");
}

function closeLightbox() {
    if (!lightbox) return;

    lightbox.classList.remove("active");
    document.body.classList.remove("lightbox-open");
}

if (closeBtn) {
    closeBtn.addEventListener("click", closeLightbox);
}

if (lightbox) {
    lightbox.addEventListener("click", function (event) {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });
}

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {
        closeLightbox();
    }

    if (event.key === "ArrowRight") {
        nextPage();
    }

    if (event.key === "ArrowLeft") {
        prevPage();
    }
});

/* =========================================================
   FLIPBOOK
   ========================================================= */

function updatePageZIndex() {

    pages.forEach((page, index) => {
        page.style.zIndex = pages.length - index;
    });
}

function updateButtons() {

    if (!prevBtn || !nextBtn) return;

    prevBtn.disabled = currentPage <= 0;
    nextBtn.disabled = currentPage >= pages.length;
}

function nextPage() {

    if (currentPage >= pages.length) {
        return;
    }

    const page = pages[currentPage];

    if (!page) return;

    page.classList.add("flipped");

    currentPage++;

    updateButtons();
}

function prevPage() {

    if (currentPage <= 0) {
        return;
    }

    currentPage--;

    const page = pages[currentPage];

    if (!page) return;

    page.classList.remove("flipped");

    updateButtons();
}

if (nextBtn) {
    nextBtn.addEventListener("click", nextPage);
}

if (prevBtn) {
    prevBtn.addEventListener("click", prevPage);
}

/* =========================================================
   BUAT HALAMAN DOKUMENTASI
   ========================================================= */

function createDocumentationPage(item, index) {

    const title = escapeHtml(
        item.judul || `Dokumentasi ${index + 1}`
    );

    const description = escapeHtml(
        item.deskripsi || ""
    );

    const photo = item.foto || "img/dokumentasi/berbagi (1).jpeg";

    const page = document.createElement("div");

    page.className = "page";

    page.dataset.documentationId = item.id;

    page.innerHTML = `
        <div class="front">

            <div class="page-content">

                <img
                    src="${photo}"
                    alt="${title}"
                    class="documentation-photo"
                >

                <h2>${title}</h2>

                <p>${description}</p>

            </div>

        </div>

        <div class="back">

            <div class="page-content">

                <img
                    src="${photo}"
                    alt="${title}"
                    class="documentation-photo"
                >

                <h2>${title}</h2>

                <p>${description}</p>

            </div>

        </div>
    `;

    page
        .querySelectorAll(".documentation-photo")
        .forEach(function (image) {

            image.addEventListener("click", function () {
                openLightbox(image.src);
            });

        });

    return page;
}

/* =========================================================
   RENDER DATA FIREBASE
   ========================================================= */

function renderDocumentation(data) {

    if (!book) return;

    /* Hapus halaman lama dari Firebase */
    book
        .querySelectorAll("[data-documentation-id]")
        .forEach(function (page) {
            page.remove();
        });

    /* Hapus loading */
    if (loadingPage) {
        loadingPage.remove();
    }

    const items = Object.entries(data || {})
        .map(function ([id, value]) {

            return {
                id: id,
                ...(value || {})
            };

        })
        .filter(function (item) {

            return (
                item.foto ||
                item.judul ||
                item.deskripsi
            );

        })
        .sort(function (a, b) {

            const urutanA = Number(a.urutan ?? 999999);
            const urutanB = Number(b.urutan ?? 999999);

            if (urutanA !== urutanB) {
                return urutanA - urutanB;
            }

            return String(a.id)
                .localeCompare(String(b.id));
        });

    /* Kalau belum ada dokumentasi */
    if (items.length === 0) {

        const emptyPage = document.createElement("div");

        emptyPage.className = "page";

        emptyPage.dataset.documentationId = "empty";

        emptyPage.innerHTML = `
            <div class="front">

                <div class="page-content">

                    <h2>Belum Ada Dokumentasi</h2>

                    <p>
                        Dokumentasi kegiatan OSIS
                        akan tampil di sini.
                    </p>

                </div>

            </div>

            <div class="back">

                <div class="page-content">

                    <h2>Belum Ada Dokumentasi</h2>

                    <p>
                        Silakan tambahkan dokumentasi
                        melalui panel admin.
                    </p>

                </div>

            </div>
        `;

        book.appendChild(emptyPage);

    } else {

        items.forEach(function (item, index) {

            const page =
                createDocumentationPage(item, index);

            book.appendChild(page);

        });
    }

    /* Ambil semua halaman terbaru */
    pages = Array.from(
        book.querySelectorAll(".page")
    );

    currentPage = 0;

    pages.forEach(function (page) {
        page.classList.remove("flipped");
    });

    updatePageZIndex();
    updateButtons();
}

/* =========================================================
   CSS TAMBAHAN
   ========================================================= */

const documentationStyle =
    document.createElement("style");

documentationStyle.textContent = `

    .documentation-photo {
        cursor: zoom-in;
    }

    .buttons button:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }

    .lightbox.active {
        display: flex;
    }

    body.lightbox-open {
        overflow: hidden;
    }

`;

document.head.appendChild(documentationStyle);

/* =========================================================
   FIREBASE
   ========================================================= */

function showFirebaseError(message) {

    if (!book) return;

    book.innerHTML = `
        <div class="page">

            <div class="front">

                <div class="page-content">

                    <h2>Dokumentasi belum dapat dimuat</h2>

                    <p>${escapeHtml(message)}</p>

                </div>

            </div>

        </div>
    `;

    pages = Array.from(
        book.querySelectorAll(".page")
    );

    currentPage = 0;

    updatePageZIndex();
    updateButtons();

    console.error(
        "[Dokumentasi]",
        message
    );
}

if (
    typeof firebase === "undefined" ||
    !firebase.database
) {

    showFirebaseError(
        "Firebase belum termuat. Periksa firebase-config.js."
    );

} else {

    try {

        const dokumentasiRef =
            firebase
                .database()
                .ref("website/dokumentasi");

        dokumentasiRef.on(
            "value",

            function (snapshot) {

                renderDocumentation(
                    snapshot.val()
                );

            },

            function (error) {

                showFirebaseError(
                    error?.message ||
                    "Terjadi kesalahan saat membaca database."
                );

            }
        );

    } catch (error) {

        showFirebaseError(
            error?.message ||
            "Gagal menghubungkan dokumentasi ke Firebase."
        );

    }
}
