/* =====================================================
   ADMIN DOKUMENTASI OSIS ANNAJIYAH
   Firebase Realtime Database
   Tanpa Firebase Storage
===================================================== */


/* =====================================================
   ELEMENTS
===================================================== */

const dokumentasiDatabaseRef =
    firebase.database().ref("website/dokumentasi");


const dokumentasiCard =
    document.querySelector(
        '[data-module="dokumentasi"]'
    );


const dokumentasiEditor =
    document.getElementById(
        "dokumentasiEditor"
    );


const closeDokumentasiEditor =
    document.getElementById(
        "closeDokumentasiEditor"
    );


const addDokumentasiButton =
    document.getElementById(
        "addDokumentasi"
    );


const dokumentasiList =
    document.getElementById(
        "dokumentasiList"
    );


const saveDokumentasiButton =
    document.getElementById(
        "saveDokumentasi"
    );


const dokumentasiStatus =
    document.getElementById(
        "dokumentasiStatus"
    );


const moduleMessage =
    document.getElementById(
        "moduleMessage"
    );


/* =====================================================
   STATE
===================================================== */

let dokumentasiData = {};


/* =====================================================
   BUAT ID
===================================================== */

function buatDokumentasiId() {

    return (
        "dokumentasi_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeDokumentasiHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;

}


/* =====================================================
   FORMAT FILE
===================================================== */

function validasiFoto(file) {

    if (!file) {

        return false;

    }


    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    return allowedTypes.includes(
        file.type
    );

}


/* =====================================================
   KOMPRES FOTO
===================================================== */

function prosesFotoDokumentasi(file) {

    return new Promise(
        (resolve, reject) => {

            if (!validasiFoto(file)) {

                reject(
                    new Error(
                        "Format foto harus JPG, PNG, atau WebP."
                    )
                );

                return;

            }


            if (
                file.size >
                10 * 1024 * 1024
            ) {

                reject(
                    new Error(
                        "Ukuran foto maksimal 10 MB."
                    )
                );

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    const img =
                        new Image();


                    img.onload =
                        function () {

                            const maxWidth =
                                1200;

                            const maxHeight =
                                900;


                            let width =
                                img.width;

                            let height =
                                img.height;


                            /*
                               Pertahankan rasio foto.
                            */

                            if (
                                width >
                                maxWidth
                            ) {

                                height =
                                    height *
                                    (
                                        maxWidth /
                                        width
                                    );

                                width =
                                    maxWidth;

                            }


                            if (
                                height >
                                maxHeight
                            ) {

                                width =
                                    width *
                                    (
                                        maxHeight /
                                        height
                                    );

                                height =
                                    maxHeight;

                            }


                            const canvas =
                                document.createElement(
                                    "canvas"
                                );


                            canvas.width =
                                Math.round(width);

                            canvas.height =
                                Math.round(height);


                            const ctx =
                                canvas.getContext(
                                    "2d"
                                );


                            ctx.drawImage(
                                img,
                                0,
                                0,
                                canvas.width,
                                canvas.height
                            );


                            const dataUrl =
                                canvas.toDataURL(
                                    "image/jpeg",
                                    0.78
                                );


                            resolve(
                                dataUrl
                            );

                        };


                    img.onerror =
                        function () {

                            reject(
                                new Error(
                                    "Foto tidak dapat diproses."
                                )
                            );

                        };


                    img.src =
                        event.target.result;

                };


            reader.onerror =
                function () {

                    reject(
                        new Error(
                            "Gagal membaca file foto."
                        )
                    );

                };


            reader.readAsDataURL(file);

        }
    );

}


/* =====================================================
   BUAT CARD DOKUMENTASI
===================================================== */

function buatCardDokumentasi(
    id,
    data = {}
) {

    const card =
        document.createElement("div");


    card.className =
        "dokumentasi-admin-card";


    card.dataset.id =
        id;


    card.innerHTML = `

        <div class="dokumentasi-preview">

            <img
                class="dokumentasi-preview-image"
                src="${
                    escapeDokumentasiHtml(
                        data.foto ||
                        ""
                    )
                }"
                alt="Preview dokumentasi"
            >

            <div
                class="dokumentasi-preview-empty"
                ${
                    data.foto
                        ? 'style="display:none;"'
                        : ""
                }
            >
                📸
                <span>
                    Belum ada foto
                </span>
            </div>

        </div>


        <div class="dokumentasi-form">

            <div class="dokumentasi-card-top">

                <div>

                    <span class="editor-label">
                        DOKUMENTASI
                    </span>

                    <h3>
                        Dokumentasi Kegiatan
                    </h3>

                </div>


                <button
                    type="button"
                    class="delete-dokumentasi-button"
                >
                    🗑️ Hapus
                </button>

            </div>


            <label>
                Foto
            </label>

            <input
                type="file"
                class="dokumentasi-file"
                accept="image/jpeg,image/png,image/webp"
            >


            <p class="editor-hint">
                JPG, PNG, atau WebP. Maksimal 10 MB.
            </p>


            <label>
                Judul Dokumentasi
            </label>

            <input
                type="text"
                class="dokumentasi-judul"
                value="${escapeDokumentasiHtml(
                    data.judul || ""
                )}"
                placeholder="Contoh: Kegiatan Berbagi Takjil"
            >


            <label>
                Deskripsi
            </label>

            <textarea
                class="dokumentasi-deskripsi"
                rows="5"
                placeholder="Ceritakan kegiatan ini..."
            >${escapeDokumentasiHtml(
                data.deskripsi || ""
            )}</textarea>

        </div>

    `;


    /* =================================================
       FILE INPUT
    ================================================= */

    const fileInput =
        card.querySelector(
            ".dokumentasi-file"
        );


    const image =
        card.querySelector(
            ".dokumentasi-preview-image"
        );


    const emptyPreview =
        card.querySelector(
            ".dokumentasi-preview-empty"
        );


    fileInput.addEventListener(
        "change",
        async function () {

            const file =
                this.files[0];


            if (!file) {
                return;
            }


            try {

                dokumentasiStatus.style.color =
                    "#fbbf24";

                dokumentasiStatus.textContent =
                    "Memproses foto...";


                const dataUrl =
                    await prosesFotoDokumentasi(
                        file
                    );


                /*
                   Simpan foto sementara
                   pada card.
                */

                card._selectedPhoto =
                    dataUrl;


                image.src =
                    dataUrl;


                image.style.display =
                    "block";


                emptyPreview.style.display =
                    "none";


                dokumentasiStatus.textContent =
                    "Foto siap disimpan.";


            } catch (error) {

                console.error(
                    error
                );


                this.value =
                    "";


                dokumentasiStatus.style.color =
                    "#f87171";

                dokumentasiStatus.textContent =
                    error.message;

            }

        }
    );


    /* =================================================
       DELETE
    ================================================= */

    const deleteButton =
        card.querySelector(
            ".delete-dokumentasi-button"
        );


    deleteButton.addEventListener(
        "click",
        async function () {

            const yakin =
                confirm(
                    "Hapus dokumentasi ini?"
                );


            if (!yakin) {
                return;
            }


            const existing =
                dokumentasiData[id];


            /*
               Kalau data sudah ada di Firebase,
               hapus langsung.
            */

            if (
                existing &&
                existing._tersimpan === true
            ) {

                try {

                    deleteButton.disabled =
                        true;

                    deleteButton.textContent =
                        "Menghapus...";


                    await dokumentasiDatabaseRef
                        .child(id)
                        .remove();


                } catch (error) {

                    console.error(
                        error
                    );


                    alert(
                        "Gagal menghapus dokumentasi."
                    );


                    deleteButton.disabled =
                        false;

                    deleteButton.textContent =
                        "🗑️ Hapus";


                    return;

                }

            }


            delete dokumentasiData[id];


            card.remove();


            cekDokumentasiKosong();


            dokumentasiStatus.style.color =
                "#4ade80";

            dokumentasiStatus.textContent =
                "Dokumentasi dihapus.";

        }
    );


    dokumentasiList.appendChild(
        card
    );

}


/* =====================================================
   CEK KOSONG
===================================================== */

function cekDokumentasiKosong() {

    const cards =
        dokumentasiList.querySelectorAll(
            ".dokumentasi-admin-card"
        );


    const empty =
        dokumentasiList.querySelector(
            ".dokumentasi-empty"
        );


    if (cards.length === 0) {

        if (!empty) {

            dokumentasiList.innerHTML = `

                <div class="dokumentasi-empty">

                    <div>
                        📸
                    </div>

                    <h3>
                        Belum ada dokumentasi
                    </h3>

                    <p>
                        Klik tombol "Tambah Dokumentasi"
                        untuk menambahkan foto kegiatan.
                    </p>

                </div>

            `;

        }

    } else {

        if (empty) {
            empty.remove();
        }

    }

}


/* =====================================================
   LOAD DATA
===================================================== */

async function loadDokumentasiData() {

    dokumentasiStatus.style.color =
        "#94a3b8";

    dokumentasiStatus.textContent =
        "Memuat dokumentasi...";


    try {

        const snapshot =
            await dokumentasiDatabaseRef
                .once("value");


        const data =
            snapshot.val() || {};


        dokumentasiData = {};


        dokumentasiList.innerHTML =
            "";


        const entries =
            Object.entries(data)
                .sort(
                    function (a, b) {

                        return (
                            (a[1].urutan || 999999) -
                            (b[1].urutan || 999999)
                        );

                    }
                );


        entries.forEach(
            function ([id, item]) {

                dokumentasiData[id] = {
                    ...item,
                    _tersimpan: true
                };


                buatCardDokumentasi(
                    id,
                    item
                );

            }
        );


        cekDokumentasiKosong();


        dokumentasiStatus.style.color =
            "#4ade80";


        dokumentasiStatus.textContent =
            entries.length
                ? "Dokumentasi berhasil dimuat."
                : "Belum ada dokumentasi.";


    } catch (error) {

        console.error(
            "Gagal memuat dokumentasi:",
            error
        );


        dokumentasiStatus.style.color =
            "#f87171";

        dokumentasiStatus.textContent =
            "Gagal memuat dokumentasi.";

    }

}


/* =====================================================
   BUKA EDITOR
===================================================== */

if (
    dokumentasiCard &&
    dokumentasiEditor
) {

    dokumentasiCard.addEventListener(
        "click",
        function () {

            if (moduleMessage) {

                moduleMessage.classList.add(
                    "hidden"
                );

            }


            dokumentasiEditor.classList.remove(
                "hidden"
            );


            loadDokumentasiData();


            dokumentasiEditor.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );

}


/* =====================================================
   TUTUP EDITOR
===================================================== */

if (
    closeDokumentasiEditor &&
    dokumentasiEditor
) {

    closeDokumentasiEditor.addEventListener(
        "click",
        function () {

            dokumentasiEditor.classList.add(
                "hidden"
            );


            dokumentasiStatus.textContent =
                "";


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}


/* =====================================================
   TAMBAH DOKUMENTASI
===================================================== */

if (addDokumentasiButton) {

    addDokumentasiButton.addEventListener(
        "click",
        function () {

            const id =
                buatDokumentasiId();


            dokumentasiData[id] = {

                judul: "",
                deskripsi: "",
                foto: "",
                urutan:
                    Date.now(),

                _tersimpan: false

            };


            const empty =
                dokumentasiList.querySelector(
                    ".dokumentasi-empty"
                );


            if (empty) {
                empty.remove();
            }


            buatCardDokumentasi(
                id,
                dokumentasiData[id]
            );


            const card =
                document.querySelector(
                    `[data-id="${id}"]`
                );


            if (card) {

                card.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });


                card.querySelector(
                    ".dokumentasi-judul"
                ).focus();

            }

        }
    );

}


/* =====================================================
   SIMPAN SEMUA
===================================================== */

if (saveDokumentasiButton) {

    saveDokumentasiButton.addEventListener(
        "click",
        async function () {

            saveDokumentasiButton.disabled =
                true;


            saveDokumentasiButton.textContent =
                "Menyimpan...";


            dokumentasiStatus.style.color =
                "#fbbf24";


            dokumentasiStatus.textContent =
                "Menyiapkan data...";


            try {

                const cards =
                    Array.from(
                        dokumentasiList.querySelectorAll(
                            ".dokumentasi-admin-card"
                        )
                    );


                if (cards.length === 0) {

                    await dokumentasiDatabaseRef
                        .remove();


                    dokumentasiStatus.style.color =
                        "#4ade80";

                    dokumentasiStatus.textContent =
                        "✓ Semua dokumentasi telah dihapus.";


                    return;

                }


                const dataBaru = {};


                for (
                    let index = 0;
                    index < cards.length;
                    index++
                ) {

                    const card =
                        cards[index];


                    const id =
                        card.dataset.id;


                    const oldData =
                        dokumentasiData[id] ||
                        {};


                    const judul =
                        card.querySelector(
                            ".dokumentasi-judul"
                        ).value.trim();


                    const deskripsi =
                        card.querySelector(
                            ".dokumentasi-deskripsi"
                        ).value.trim();


                    const foto =
                        card._selectedPhoto ||
                        oldData.foto ||
                        "";


                    if (!judul) {

                        throw new Error(
                            "Judul dokumentasi tidak boleh kosong."
                        );

                    }


                    if (!foto) {

                        throw new Error(
                            "Setiap dokumentasi harus memiliki foto."
                        );

                    }


                    dokumentasiStatus.textContent =
                        `Menyimpan ${index + 1} dari ${cards.length}...`;


                    dataBaru[id] = {

                        judul:
                            judul,

                        deskripsi:
                            deskripsi,

                        foto:
                            foto,

                        urutan:
                            index + 1,

                        updatedAt:
                            Date.now()

                    };

                }


                await dokumentasiDatabaseRef
                    .set(dataBaru);


                dokumentasiData =
                    {};


                Object.entries(dataBaru)
                    .forEach(
                        function ([id, item]) {

                            dokumentasiData[id] = {

                                ...item,

                                _tersimpan: true

                            };

                        }
                    );


                /*
                   Bersihkan file sementara.
                */

                dokumentasiList
                    .querySelectorAll(
                        ".dokumentasi-admin-card"
                    )
                    .forEach(
                        function (card) {

                            card._selectedPhoto =
                                null;

                        }
                    );


                dokumentasiStatus.style.color =
                    "#4ade80";


                dokumentasiStatus.textContent =
                    "✓ Semua dokumentasi berhasil disimpan.";


            } catch (error) {

                console.error(
                    "Gagal menyimpan dokumentasi:",
                    error
                );


                dokumentasiStatus.style.color =
                    "#f87171";


                dokumentasiStatus.textContent =
                    "✕ " +
                    error.message;

            }


            saveDokumentasiButton.disabled =
                false;


            saveDokumentasiButton.textContent =
                "Simpan Semua Perubahan";

        }
    );

}