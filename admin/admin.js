/* =========================================
   ADMIN PANEL - OSIS ANNAJIYAH
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const loginPage =
    document.getElementById("loginPage");

const dashboardPage =
    document.getElementById("dashboardPage");

const loginForm =
    document.getElementById("loginForm");

const loginButton =
    document.getElementById("loginButton");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginMessage =
    document.getElementById("loginMessage");

const logoutButton =
    document.getElementById("logoutButton");

const adminEmail =
    document.getElementById("adminEmail");

const moduleMessage =
    document.getElementById("moduleMessage");

const adminCards =
    document.querySelectorAll(".admin-card");


/* =========================================
   VISI & MISI ELEMENTS
========================================= */

const visiEditor =
    document.getElementById("visiEditor");

const visiInput =
    document.getElementById("visiInput");

const misiInput =
    document.getElementById("misiInput");

const saveVisiMisi =
    document.getElementById("saveVisiMisi");

const visiMisiStatus =
    document.getElementById("visiMisiStatus");

const closeVisiEditor =
    document.getElementById("closeVisiEditor");


/* =========================================
    FIREBASE
========================================= */

const auth =
    firebase.auth();


/*
    Firebase Storage TIDAK digunakan.
    Foto anggota akan diproses menjadi JPEG 300x300
    lalu disimpan sebagai Data URL di Realtime Database.
*/


/*
    IMPORTANT:

    Jangan membuat:

    const database = firebase.database();

    karena database sudah dibuat oleh
    firebase-config.js.
*/


/* =========================================
   LOGIN / DASHBOARD
========================================= */

function showLogin() {

    loginPage.classList.remove("hidden");

    dashboardPage.classList.add("hidden");

}


function showDashboard(user) {

    loginPage.classList.add("hidden");

    dashboardPage.classList.remove("hidden");


    if (user && user.email) {

        adminEmail.textContent =
            user.email;

    }

}


function showLoginError(message) {

    loginMessage.textContent =
        message;

}


function clearLoginError() {

    loginMessage.textContent = "";

}


/* =========================================
   CHECK ADMIN
========================================= */

async function checkAdmin(user) {

    try {

        const snapshot =
            await database
                .ref("admins/" + user.uid)
                .once("value");


        return snapshot.val() === true;

    } catch (error) {

        console.error(
            "Gagal memeriksa status admin:",
            error
        );

        return false;

    }

}


/* =========================================
   AUTH STATE
========================================= */

auth.onAuthStateChanged(
    async (user) => {

        if (!user) {

            showLogin();

            return;

        }


        const isAdmin =
            await checkAdmin(user);


        if (!isAdmin) {

            await auth.signOut();

            showLogin();

            showLoginError(
                "Akun ini bukan admin website."
            );

            return;

        }


        clearLoginError();

        showDashboard(user);

    }
);


/* =========================================
   LOGIN
========================================= */

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        clearLoginError();


        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        if (!email || !password) {

            showLoginError(
                "Email dan password wajib diisi."
            );

            return;

        }


        loginButton.disabled = true;

        loginButton.textContent =
            "Memeriksa...";


        try {

            const result =
                await auth
                    .signInWithEmailAndPassword(
                        email,
                        password
                    );


            console.log(
                "Login berhasil:",
                result.user.uid
            );

        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            let message =
                "Email atau password salah.";


            if (
                error.code ===
                "auth/invalid-email"
            ) {

                message =
                    "Format email tidak valid.";

            }

            else if (
                error.code ===
                "auth/user-not-found"
            ) {

                message =
                    "Akun admin tidak ditemukan.";

            }

            else if (
                error.code ===
                "auth/wrong-password"
            ) {

                message =
                    "Password salah.";

            }

            else if (
                error.code ===
                "auth/invalid-credential"
            ) {

                message =
                    "Email atau password salah.";

            }

            else if (
                error.code ===
                "auth/too-many-requests"
            ) {

                message =
                    "Terlalu banyak percobaan. Coba lagi nanti.";

            }

            else if (
                error.code ===
                "auth/network-request-failed"
            ) {

                message =
                    "Koneksi internet bermasalah.";

            }


            showLoginError(message);

        }


        loginButton.disabled = false;

        loginButton.textContent =
            "Masuk ke Admin";

    }
);


/* =========================================
   LOGOUT
========================================= */

logoutButton.addEventListener(
    "click",
    async function () {

        try {

            await auth.signOut();

        } catch (error) {

            console.error(
                "Gagal logout:",
                error
            );

        }

    }
);


/* =========================================
   OPEN VISI & MISI EDITOR
========================================= */

async function openVisiEditor() {

    visiEditor.classList.remove(
        "hidden"
    );


    visiMisiStatus.textContent =
        "Memuat data...";


    try {

        const snapshot =
            await database
                .ref("website/visiMisi")
                .once("value");


        const data =
            snapshot.val();


        if (!data) {

            visiInput.value = "";

            misiInput.value = "";

            visiMisiStatus.textContent =
                "Data belum tersedia.";

            return;

        }


        visiInput.value =
            data.visi || "";


        misiInput.value =
            data.misi || "";


        visiMisiStatus.textContent =
            "";

        visiEditor.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    } catch (error) {

        console.error(
            "Gagal mengambil Visi & Misi:",
            error
        );


        visiMisiStatus.textContent =
            "Gagal mengambil data.";

    }

}


/* =========================================
   CLOSE VISI & MISI EDITOR
========================================= */

closeVisiEditor.addEventListener(
    "click",
    function () {

        visiEditor.classList.add(
            "hidden"
        );


        visiMisiStatus.textContent =
            "";

    }
);


/* =========================================
            SAVE VISI & MISI
========================================= */

saveVisiMisi.addEventListener(
    "click",
    async function () {

        const visi =
            visiInput.value.trim();

        const misi =
            misiInput.value.trim();


        if (!visi) {

            visiMisiStatus.textContent =
                "Visi tidak boleh kosong.";

            visiMisiStatus.style.color =
                "#f87171";

            return;

        }


        if (!misi) {

            visiMisiStatus.textContent =
                "Misi tidak boleh kosong.";

            visiMisiStatus.style.color =
                "#f87171";

            return;

        }


        saveVisiMisi.disabled =
            true;

        saveVisiMisi.textContent =
            "Menyimpan...";

        visiMisiStatus.textContent =
            "";


        try {

            await database
                .ref("website/visiMisi")
                .set({

                    visi: visi,

                    misi: misi

                });


            visiMisiStatus.style.color =
                "#4ade80";


            visiMisiStatus.textContent =
                "✓ Perubahan berhasil disimpan.";

        } catch (error) {

            console.error(
                "Gagal menyimpan Visi & Misi:",
                error
            );


            visiMisiStatus.style.color =
                "#f87171";


            visiMisiStatus.textContent =
                "Gagal menyimpan perubahan.";

        }


        saveVisiMisi.disabled =
            false;

        saveVisiMisi.textContent =
            "Simpan Perubahan";

    }
);


/* =========================================
   ADMIN MODULE BUTTONS
========================================= */

adminCards.forEach((card) => {

    card.addEventListener(
        "click",
        function () {

            const module =
                this.dataset.module;


            /*
                    Visi & Misi sekarang sudah aktif.
            */

            if (module === "visi") {

    openVisiEditor();

    return;

}

if (module === "struktur") {

    return;

}

if (module === "bidang") {

    return;

}

if (module === "dokumentasi") {

    openDokumentasiEditor();

    return;

}

            const moduleNames = {

                struktur:
                    "Modul Struktur Organisasi belum kita aktifkan.",

                dokumentasi:
                    "Modul Dokumentasi belum kita aktifkan.",

                voting:
                    "Modul Voting belum kita aktifkan."

            };


            moduleMessage
                .querySelector("strong")
                .textContent =
                moduleNames[module] ||
                "Modul belum tersedia.";


            moduleMessage
                .querySelector("p")
                .textContent =
                "Kita akan mengaktifkan modul ini pada tahap berikutnya.";


            moduleMessage.scrollIntoView({

                behavior: "smooth",

                block: "center"

            });

        }
    );

});




/* =====================================================
   STRUKTUR ORGANISASI ADMIN
===================================================== */

const strukturDatabaseRef = firebase.database().ref("struktur");

const strukturEditor = document.getElementById("strukturEditor");
const closeStrukturEditor = document.getElementById("closeStrukturEditor");
const saveStrukturButton = document.getElementById("saveStruktur");
const strukturStatus = document.getElementById("strukturStatus");


/* =====================================================
   BUKA EDITOR STRUKTUR
===================================================== */

const strukturAdminCard = document.querySelector(
    '.admin-card[data-module="struktur"]'
);

if (strukturAdminCard) {

    strukturAdminCard.addEventListener("click", function () {

        // Tampilkan editor
        strukturEditor.classList.remove("hidden");

        // Sembunyikan pesan informasi jika ada
        const moduleMessage = document.getElementById("moduleMessage");

        if (moduleMessage) {
            moduleMessage.classList.add("hidden");
        }

        // Ambil data dari Firebase
        loadStrukturData();

        // Scroll ke editor
        strukturEditor.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

}


/* =====================================================
   TUTUP EDITOR
===================================================== */

if (closeStrukturEditor) {

    closeStrukturEditor.addEventListener("click", function () {

        strukturEditor.classList.add("hidden");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

}


/* =====================================================
   AMBIL DATA STRUKTUR DARI FIREBASE
===================================================== */

function siapkanUploadFotoStruktur(prefix, fotoLama = "") {

    const fotoInputLama = document.getElementById(prefix + "Foto");

    if (!fotoInputLama) return;

    fotoInputLama.value = fotoLama || "";

    let wrapper = document.getElementById(prefix + "FotoUploadBox");

    if (!wrapper) {
        wrapper = document.createElement("div");
        wrapper.id = prefix + "FotoUploadBox";
        wrapper.style.cssText = `
            margin-top:8px;
            padding:15px;
            border-radius:12px;
            background:rgba(255,255,255,.04);
            border:1px solid rgba(255,255,255,.1);
        `;

        wrapper.innerHTML = `
            <img
                id="${prefix}FotoPreview"
                src=""
                alt="Preview foto"
                style="
                    width:120px;
                    height:120px;
                    object-fit:cover;
                    border-radius:12px;
                    display:none;
                    margin-bottom:12px;
                "
            >
            <input
                type="file"
                id="${prefix}FotoFile"
                accept="image/png,image/jpeg,image/webp"
            >
            <p style="margin:8px 0 0;font-size:13px;opacity:.8;line-height:1.6;">
                📷 Foto akan otomatis dipotong persegi, menjadi <strong>300 × 300 px</strong>, lalu dikompres.<br>
                Format: JPG, PNG, atau WebP. Maksimal 10 MB.
            </p>
            <p id="${prefix}FotoStatus" style="margin:8px 0 0;font-size:13px;"></p>
        `;

        fotoInputLama.insertAdjacentElement("afterend", wrapper);
        fotoInputLama.style.display = "none";

        const fileInput = wrapper.querySelector("input[type=file]");
        const preview = wrapper.querySelector("img");
        const status = wrapper.querySelector("p:last-child");

        fileInput.addEventListener("change", function () {
            const file = this.files[0];
            if (!file) return;

            try {
                validasiFoto(file);
            } catch (error) {
                status.style.color = "#f87171";
                status.textContent = error.message;
                this.value = "";
                return;
            }

            const reader = new FileReader();
            reader.onload = function (event) {
                preview.src = event.target.result;
                preview.style.display = "block";
            };
            reader.readAsDataURL(file);

            fotoInputLama._selectedPhoto = file;
            status.style.color = "#fbbf24";
            status.textContent = "✓ Foto dipilih. Klik Simpan Perubahan untuk memproses foto.";
        });
    }

    const preview = document.getElementById(prefix + "FotoPreview");
    const status = document.getElementById(prefix + "FotoStatus");

    if (preview) {
        if (fotoLama) {
            preview.src = fotoLama;
            preview.style.display = "block";
        } else {
            preview.removeAttribute("src");
            preview.style.display = "none";
        }
    }

    if (status) {
        status.textContent = fotoLama ? "Foto saat ini. Pilih file baru jika ingin mengganti." : "Belum ada foto.";
        status.style.color = "";
    }

    fotoInputLama._selectedPhoto = null;
}

function ambilFotoStruktur(prefix) {
    const input = document.getElementById(prefix + "Foto");
    if (!input) return "";
    return input.value.trim();
}

function loadStrukturData() {

    strukturStatus.textContent = "Memuat data...";

    strukturDatabaseRef.once("value")
        .then(function (snapshot) {

            const data = snapshot.val();

            if (!data) {

                strukturStatus.textContent =
                    "Data struktur belum tersedia.";

                return;
            }


            /* =========================
               KETUA
            ========================= */

            if (data.ketua) {

                document.getElementById("ketuaNama").value =
                    data.ketua.nama || "";

                document.getElementById("ketuaJabatan").value =
                    data.ketua.jabatan || "";

                document.getElementById("ketuaFoto").value =
                    data.ketua.foto || "";

                siapkanUploadFotoStruktur(
                    "ketua",
                    data.ketua.foto || ""
                );

                document.getElementById("ketuaDeskripsi").value =
                    data.ketua.deskripsi || "";

            }


            /* =========================
               WAKIL
            ========================= */

            if (data.wakil) {

                document.getElementById("wakilNama").value =
                    data.wakil.nama || "";

                document.getElementById("wakilJabatan").value =
                    data.wakil.jabatan || "";

                document.getElementById("wakilFoto").value =
                    data.wakil.foto || "";

                siapkanUploadFotoStruktur(
                    "wakil",
                    data.wakil.foto || ""
                );

                document.getElementById("wakilDeskripsi").value =
                    data.wakil.deskripsi || "";

            }


            /* =========================
               SEKRETARIS
            ========================= */

            if (data.sekretaris) {

                document.getElementById("sekretarisNama").value =
                    data.sekretaris.nama || "";

                document.getElementById("sekretarisJabatan").value =
                    data.sekretaris.jabatan || "";

                document.getElementById("sekretarisFoto").value =
                    data.sekretaris.foto || "";

                siapkanUploadFotoStruktur(
                    "sekretaris",
                    data.sekretaris.foto || ""
                );

                document.getElementById("sekretarisDeskripsi").value =
                    data.sekretaris.deskripsi || "";

            }


            /* =========================
               BENDAHARA
            ========================= */

            if (data.bendahara) {

                document.getElementById("bendaharaNama").value =
                    data.bendahara.nama || "";

                document.getElementById("bendaharaJabatan").value =
                    data.bendahara.jabatan || "";

                document.getElementById("bendaharaFoto").value =
                    data.bendahara.foto || "";

                siapkanUploadFotoStruktur(
                    "bendahara",
                    data.bendahara.foto || ""
                );

                document.getElementById("bendaharaDeskripsi").value =
                    data.bendahara.deskripsi || "";

            }


            strukturStatus.textContent =
                "Data berhasil dimuat.";

        })
        .catch(function (error) {

            console.error(
                "Gagal mengambil data struktur:",
                error
            );

            strukturStatus.textContent =
                "Gagal mengambil data.";

        });

}


/* =====================================================
   SIMPAN STRUKTUR
===================================================== */

if (saveStrukturButton) {

    saveStrukturButton.addEventListener("click", async function () {

        saveStrukturButton.disabled = true;
        strukturStatus.textContent = "Memproses foto dan menyimpan...";
        strukturStatus.style.color = "#fbbf24";

        try {
            const peran = ["ketua", "wakil", "sekretaris", "bendahara"];

            for (const prefix of peran) {
                const fotoInput = document.getElementById(prefix + "Foto");
                const fileBaru = fotoInput ? fotoInput._selectedPhoto : null;

                if (fileBaru) {
                    strukturStatus.textContent =
                        `Memproses foto ${prefix}...`;

                    fotoInput.value = await uploadFotoAnggota(
                        fileBaru,
                        "struktur",
                        prefix
                    );

                    fotoInput._selectedPhoto = null;
                }
            }

            const strukturData = {
                ketua: {
                    nama: document.getElementById("ketuaNama").value.trim(),
                    jabatan: document.getElementById("ketuaJabatan").value.trim(),
                    foto: ambilFotoStruktur("ketua"),
                    deskripsi: document.getElementById("ketuaDeskripsi").value.trim()
                },
                wakil: {
                    nama: document.getElementById("wakilNama").value.trim(),
                    jabatan: document.getElementById("wakilJabatan").value.trim(),
                    foto: ambilFotoStruktur("wakil"),
                    deskripsi: document.getElementById("wakilDeskripsi").value.trim()
                },
                sekretaris: {
                    nama: document.getElementById("sekretarisNama").value.trim(),
                    jabatan: document.getElementById("sekretarisJabatan").value.trim(),
                    foto: ambilFotoStruktur("sekretaris"),
                    deskripsi: document.getElementById("sekretarisDeskripsi").value.trim()
                },
                bendahara: {
                    nama: document.getElementById("bendaharaNama").value.trim(),
                    jabatan: document.getElementById("bendaharaJabatan").value.trim(),
                    foto: ambilFotoStruktur("bendahara"),
                    deskripsi: document.getElementById("bendaharaDeskripsi").value.trim()
                }
            };

            await strukturDatabaseRef.set(strukturData);

            peran.forEach(function (prefix) {
                siapkanUploadFotoStruktur(
                    prefix,
                    strukturData[prefix].foto || ""
                );
            });

            strukturStatus.style.color = "#4ade80";
            strukturStatus.textContent = "✓ Struktur berhasil disimpan!";

        } catch (error) {
            console.error("Gagal menyimpan struktur:", error);
            strukturStatus.style.color = "#f87171";
            strukturStatus.textContent =
                "✕ " + (error.message || "Gagal menyimpan struktur.");
        } finally {
            saveStrukturButton.disabled = false;
        }

    });

}


// =====================================================
// BIDANG OSIS ADMIN - SISTEM DINAMIS
// =====================================================

const bidangDatabaseRef =
    firebase.database().ref("website/bidang");

const bidangCard =
    document.querySelector('[data-module="bidang"]');

const bidangEditor =
    document.getElementById("bidangEditor");

const closeBidangEditor =
    document.getElementById("closeBidangEditor");

const saveBidangButton =
    document.getElementById("saveBidang");

const addBidangButton =
    document.getElementById("addBidang");

const bidangList =
    document.getElementById("bidangList");

const bidangStatus =
    document.getElementById("bidangStatus");


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeBidangHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;
}


// =====================================================
// MEMBUAT ID BIDANG BARU
// =====================================================

function buatBidangId() {

    return (
        "bidang_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


// =====================================================
// MEMBUAT ID ANGGOTA BARU
// =====================================================

function buatAnggotaId() {

    return (
        "anggota_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


// =====================================================
// TAMBAH ANGGOTA KE CARD BIDANG
// =====================================================

function tambahAnggotaKeBidang(
    bidangId,
    anggotaData = {}
) {

    const anggotaList =
        document.querySelector(
            `[data-anggota-list="${bidangId}"]`
        );

    if (!anggotaList) {
        return;
    }

    const anggotaId =
        anggotaData.id ||
        buatAnggotaId();

    const jumlah =
        anggotaList.children.length + 1;

    const anggotaCard =
        document.createElement("div");

    anggotaCard.className =
        "anggota-card";

    anggotaCard.dataset.anggotaId =
        anggotaId;

    // Simpan data foto lama
    anggotaCard.dataset.fotoLama =
        anggotaData.foto || "";

    anggotaCard.innerHTML = `

        <div class="anggota-header">

            <strong>
                Anggota ${jumlah}
            </strong>

            <button
                type="button"
                class="remove-anggota-button"
            >
                Hapus
            </button>

        </div>


        <label>
            Nama
        </label>

        <input
            type="text"
            class="anggota-nama"
            placeholder="Nama anggota"
            value="${escapeBidangHtml(
                anggotaData.nama || ""
            )}"
        >


        <label>
            Jabatan
        </label>

        <input
            type="text"
            class="anggota-jabatan"
            placeholder="Contoh: KETUA / ANGGOTA"
            value="${escapeBidangHtml(
                anggotaData.jabatan || ""
            )}"
        >


        <label>
            Foto Anggota
        </label>

        <div
            class="foto-upload-box"
            style="
                margin-top:8px;
                padding:15px;
                border-radius:12px;
                background:rgba(255,255,255,.04);
                border:1px solid rgba(255,255,255,.1);
            "
        >

            <img
                class="anggota-foto-preview"
                src="${escapeBidangHtml(
                    anggotaData.foto || ""
                )}"
                alt="Preview foto"
                style="
                    width:120px;
                    height:120px;
                    object-fit:cover;
                    border-radius:12px;
                    display:${anggotaData.foto ? "block" : "none"};
                    margin-bottom:12px;
                "
            >

            <input
                type="file"
                class="anggota-foto-file"
                accept="image/png,image/jpeg,image/webp"
            >

            <p
                style="
                    margin:8px 0 0;
                    font-size:13px;
                    opacity:.8;
                    line-height:1.6;
                "
            >
                📷 Ukuran yang disarankan:
                <strong>300 × 300 px</strong><br>
                Format: JPG, PNG, atau WebP
            </p>

            <p
                class="foto-upload-status"
                style="
                    margin:8px 0 0;
                    font-size:13px;
                "
            ></p>

        </div>


        <label style="margin-top:15px;">
            Deskripsi
        </label>

        <textarea
            class="anggota-deskripsi"
            rows="3"
            placeholder="Deskripsi anggota..."
        >${escapeBidangHtml(
            anggotaData.deskripsi || ""
        )}</textarea>

    `;

    anggotaList.appendChild(
        anggotaCard
    );


    // =================================================
    // PILIH FOTO
    // =================================================

    const fotoInput =
        anggotaCard.querySelector(
            ".anggota-foto-file"
        );

    const fotoPreview =
        anggotaCard.querySelector(
            ".anggota-foto-preview"
        );

    const fotoStatus =
        anggotaCard.querySelector(
            ".foto-upload-status"
        );


    fotoInput.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];

            if (!file) {
                return;
            }


            // Cek format
            if (
                ![
                    "image/jpeg",
                    "image/png",
                    "image/webp"
                ].includes(file.type)
            ) {

                fotoStatus.style.color =
                    "#f87171";

                fotoStatus.textContent =
                    "Format foto harus JPG, PNG, atau WebP.";

                this.value = "";

                return;
            }


            // Cek ukuran file asli maksimal 10 MB
            if (
                file.size >
                10 * 1024 * 1024
            ) {

                fotoStatus.style.color =
                    "#f87171";

                fotoStatus.textContent =
                    "Ukuran file maksimal 10 MB.";

                this.value = "";

                return;
            }


            // Preview
            const reader =
                new FileReader();

            reader.onload =
                function (event) {

                    fotoPreview.src =
                        event.target.result;

                    fotoPreview.style.display =
                        "block";

                };

            reader.readAsDataURL(file);


            // Simpan file sementara
            anggotaCard._selectedPhoto =
                file;


            fotoStatus.style.color =
                "#fbbf24";

            fotoStatus.textContent =
                "✓ Foto dipilih. Klik Simpan Semua Perubahan untuk mengupload.";

        }
    );


    // =================================================
    // HAPUS ANGGOTA
    // =================================================

    const hapusButton =
        anggotaCard.querySelector(
            ".remove-anggota-button"
        );


    hapusButton.addEventListener(
        "click",
        function () {

            anggotaCard.remove();

            refreshNomorAnggota(
                anggotaList
            );

        }
    );

}


// =====================================================
// REFRESH NOMOR ANGGOTA
// =====================================================

function refreshNomorAnggota(
    anggotaList
) {

    Array.from(
        anggotaList.children
    ).forEach(
        function (
            card,
            index
        ) {

            const title =
                card.querySelector(
                    ".anggota-header strong"
                );

            if (title) {

                title.textContent =
                    "Anggota " +
                    (index + 1);

            }

        }
    );

}


// =====================================================
// BUAT CARD BIDANG
// =====================================================

function buatCardBidang(
    bidangId,
    data = {}
) {

    const bidangCard =
        document.createElement("div");

    bidangCard.className =
        "editor-card bidang-editor-card";

    bidangCard.dataset.bidangId =
        bidangId;


    bidangCard.innerHTML = `

        <div
            style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:15px;
                margin-bottom:20px;
            "
        >

            <h3
                class="bidang-editor-title"
                style="margin:0;"
            >
                Bidang
            </h3>

            <button
                type="button"
                class="remove-bidang-button"
            >
                Hapus Bidang
            </button>

        </div>


        <label>
            Nama Bidang
        </label>

        <input
            type="text"
            class="bidang-nama"
            placeholder="Contoh: Keagamaan"
            value="${escapeBidangHtml(
                data.nama || ""
            )}"
        >


        <label>
            Gambar Bidang
        </label>

        <div class="bidang-foto-upload-box" style="margin-top:8px;padding:15px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);">
            <img
                class="bidang-foto-preview"
                src=""
                alt="Preview gambar bidang"
                style="width:160px;height:100px;object-fit:cover;border-radius:12px;display:none;margin-bottom:12px;"
            >
            <input
                type="file"
                class="bidang-foto-file"
                accept="image/png,image/jpeg,image/webp"
            >
            <p style="margin:8px 0 0;font-size:13px;opacity:.8;line-height:1.6;">
                🖼️ Gambar akan otomatis dipotong persegi, menjadi <strong>300 × 300 px</strong>, lalu dikompres.<br>
                Format: JPG, PNG, atau WebP. Maksimal 10 MB.
            </p>
            <p class="bidang-foto-status" style="margin:8px 0 0;font-size:13px;"></p>
        </div>


        <label>
            Deskripsi
        </label>

        <textarea
            class="bidang-deskripsi"
            rows="4"
            placeholder="Deskripsi bidang..."
        >${escapeBidangHtml(
            data.deskripsi || ""
        )}</textarea>


        <hr
            style="
                margin:30px 0;
                border:none;
                border-top:1px solid rgba(255,255,255,.12);
            "
        >


        <h3>
            Anggota Bidang
        </h3>

        <p class="editor-hint">
            Tambahkan anggota yang berada dalam bidang ini.
        </p>


        <div
            class="anggota-list"
            data-anggota-list="${bidangId}"
        ></div>


        <button
            type="button"
            class="add-anggota-button"
        >
            + Tambah Anggota
        </button>

    `;


    bidangList.appendChild(
        bidangCard
    );

    // =================================================
    // FOTO BIDANG
    // =================================================

    bidangCard.dataset.fotoLama =
        data.foto || data.gambar || "";

    bidangCard._selectedPhoto = null;
    bidangCard._selectedPhotoDataUrl = null;

    const bidangFotoInput =
        bidangCard.querySelector(".bidang-foto-file");

    const bidangFotoPreview =
        bidangCard.querySelector(".bidang-foto-preview");

    const bidangFotoStatus =
        bidangCard.querySelector(".bidang-foto-status");

    if (data.foto || data.gambar) {
        bidangFotoPreview.src = data.foto || data.gambar;
        bidangFotoPreview.style.display = "block";
        bidangFotoStatus.textContent =
            "Gambar saat ini. Pilih file baru jika ingin mengganti.";

        bidangFotoPreview.onerror = function () {
            this.style.display = "none";
            bidangFotoStatus.style.color = "#fbbf24";
            bidangFotoStatus.textContent =
                "Gambar lama tidak dapat ditampilkan. Pilih gambar baru.";
        };
    } else {
        bidangFotoStatus.textContent = "Belum ada gambar bidang.";
    }

    bidangFotoInput.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;

        try {
            validasiFoto(file);
        } catch (error) {
            bidangFotoStatus.style.color = "#f87171";
            bidangFotoStatus.textContent = error.message;
            this.value = "";
            return;
        }

        bidangFotoStatus.style.color = "#fbbf24";
        bidangFotoStatus.textContent =
            "⏳ Memproses gambar bidang...";

        // Proses gambar langsung saat dipilih.
        // Hasilnya disimpan sementara sebagai Data URL 300x300.
        // Dengan cara ini gambar bidang tidak bergantung pada
        // Firebase Storage dan tidak hilang saat proses simpan.
        resizeFotoAnggota(file)
            .then(function (dataUrl) {
                bidangCard._selectedPhoto = null;
                bidangCard._selectedPhotoDataUrl = dataUrl;

                bidangFotoPreview.src = dataUrl;
                bidangFotoPreview.style.display = "block";

                bidangFotoStatus.style.color = "#4ade80";
                bidangFotoStatus.textContent =
                    "✓ Gambar berhasil diproses. Klik Simpan Semua Perubahan.";
            })
            .catch(function (error) {
                console.error("Gagal memproses gambar bidang:", error);

                bidangCard._selectedPhoto = null;
                bidangCard._selectedPhotoDataUrl = null;
                bidangFotoInput.value = "";

                bidangFotoStatus.style.color = "#f87171";
                bidangFotoStatus.textContent =
                    error.message || "Gambar gagal diproses.";
            });
    });


    const anggotaList =
        bidangCard.querySelector(
            ".anggota-list"
        );


    const tambahAnggotaButton =
        bidangCard.querySelector(
            ".add-anggota-button"
        );


    const hapusBidangButton =
        bidangCard.querySelector(
            ".remove-bidang-button"
        );


    tambahAnggotaButton.addEventListener(
        "click",
        function () {

            tambahAnggotaKeBidang(
                bidangId
            );

        }
    );


    hapusBidangButton.addEventListener(
        "click",
        async function () {

            const nama =
                bidangCard.querySelector(
                    ".bidang-nama"
                ).value.trim();

            const yakin =
                confirm(
                    nama
                        ? `Hapus bidang "${nama}"?\n\nBidang akan dihapus dari Firebase dan tidak bisa dikembalikan melalui tombol ini.`
                        : "Hapus bidang ini?\n\nBidang akan dihapus dari Firebase."
                );

            if (!yakin) {
                return;
            }

            // Kunci tombol agar tidak terpencet dua kali.
            hapusBidangButton.disabled = true;
            const teksLama = hapusBidangButton.textContent;
            hapusBidangButton.textContent = "Menghapus...";

            try {
                // Hapus langsung node bidang dari Firebase.
                // Untuk bidang baru yang belum pernah disimpan, remove()
                // tetap aman karena node tersebut belum ada.
                await bidangDatabaseRef
                    .child(bidangId)
                    .remove();

                bidangCard.remove();
                refreshNomorBidang();

                if (bidangStatus) {
                    bidangStatus.style.color = "#4ade80";
                    bidangStatus.textContent =
                        `✓ ${nama || "Bidang"} berhasil dihapus.`;
                }

                console.log(
                    "Bidang berhasil dihapus:",
                    bidangId
                );

            } catch (error) {

                console.error(
                    "Gagal menghapus bidang:",
                    error
                );

                hapusBidangButton.disabled = false;
                hapusBidangButton.textContent = teksLama;

                if (bidangStatus) {
                    bidangStatus.style.color = "#f87171";
                    bidangStatus.textContent =
                        "✕ Gagal menghapus bidang. Cek koneksi Firebase.";
                }

                alert(
                    "Bidang gagal dihapus dari Firebase.\n\n" +
                    (error.message || "Terjadi kesalahan.")
                );
            }
        }
    );


    // =================================================
    // MUAT ANGGOTA YANG SUDAH ADA
    // =================================================

    if (
        data.anggota &&
        typeof data.anggota === "object"
    ) {

        Object.keys(
            data.anggota
        ).forEach(
            function (anggotaId) {

                tambahAnggotaKeBidang(
                    bidangId,
                    {
                        ...data.anggota[anggotaId],
                        id: anggotaId
                    }
                );

            }
        );

    }


    return bidangCard;

}


// =====================================================
// REFRESH NOMOR BIDANG
// =====================================================

function refreshNomorBidang() {

    const semuaBidang =
        document.querySelectorAll(
            ".bidang-editor-card"
        );


    semuaBidang.forEach(
        function (
            card,
            index
        ) {

            const title =
                card.querySelector(
                    ".bidang-editor-title"
                );

            if (title) {

                title.textContent =
                    "Bidang " +
                    (index + 1);

            }

        }
    );

}


// =====================================================
// AMBIL SEMUA DATA BIDANG
// SEKALIGUS UPLOAD FOTO BARU
// =====================================================

async function ambilSemuaDataBidang() {

    const data = {};

    const semuaBidang =
        document.querySelectorAll(
            ".bidang-editor-card"
        );


    for (
        let index = 0;
        index < semuaBidang.length;
        index++
    ) {

        const card =
            semuaBidang[index];


        const bidangId =
            card.dataset.bidangId;


        const nama =
            card.querySelector(
                ".bidang-nama"
            ).value.trim();


        const deskripsi =
            card.querySelector(
                ".bidang-deskripsi"
            ).value.trim();

        let foto =
            card.dataset.fotoLama || "";

        // Jika gambar baru sudah selesai diproses saat dipilih,
        // gunakan Data URL hasil proses tersebut.
        if (card._selectedPhotoDataUrl) {
            bidangStatus.style.color = "#fbbf24";
            bidangStatus.textContent =
                `Menyiapkan gambar bidang ${index + 1}...`;

            foto = card._selectedPhotoDataUrl;
        }
        // Fallback: jika proses langsung belum selesai tetapi file
        // masih tersimpan, proses sekali lagi saat penyimpanan.
        else if (card._selectedPhoto) {
            bidangStatus.style.color = "#fbbf24";
            bidangStatus.textContent =
                `Memproses gambar bidang ${index + 1}...`;

            foto = await resizeFotoAnggota(card._selectedPhoto);
        }


        const anggota = {};


        const anggotaCards =
            card.querySelectorAll(
                ".anggota-card"
            );


        for (
            let i = 0;
            i < anggotaCards.length;
            i++
        ) {

            const anggotaCard =
                anggotaCards[i];


            const anggotaId =
                anggotaCard.dataset.anggotaId;


            const namaAnggota =
                anggotaCard
                    .querySelector(
                        ".anggota-nama"
                    )
                    .value.trim();


            if (!namaAnggota) {
                continue;
            }


            const jabatan =
                anggotaCard
                    .querySelector(
                        ".anggota-jabatan"
                    )
                    .value.trim();


            const deskripsiAnggota =
                anggotaCard
                    .querySelector(
                        ".anggota-deskripsi"
                    )
                    .value.trim();


            // Foto lama
            let foto =
                anggotaCard.dataset.fotoLama || "";


            // Foto baru
            const fileBaru =
                anggotaCard._selectedPhoto;


            if (fileBaru) {

                bidangStatus.style.color =
                    "#fbbf24";

                bidangStatus.textContent =
                    `Mengupload foto ${namaAnggota}...`;


                try {

                    foto =
                        await uploadFotoAnggota(
                            fileBaru,
                            bidangId,
                            anggotaId
                        );

                } catch (error) {

                    console.error(
                        "Gagal upload foto:",
                        error
                    );

                    throw new Error(
                        `Gagal mengupload foto ${namaAnggota}.`
                    );

                }

            }


            anggota[anggotaId] = {

                nama:
                    namaAnggota,

                jabatan:
                    jabatan,

                foto:
                    foto,

                deskripsi:
                    deskripsiAnggota

            };

        }


        data[bidangId] = {

            urutan:
                index + 1,

            nama:
                nama,

            deskripsi:
                deskripsi,

            foto:
                foto,

            anggota:
                anggota

        };

    }


    return data;

}


// =====================================================
// LOAD BIDANG DARI FIREBASE
// =====================================================

function loadBidangData() {

    if (!bidangList) {
        return;
    }


    bidangList.innerHTML = "";


    bidangStatus.textContent =
        "Memuat data bidang...";


    bidangDatabaseRef
        .once("value")
        .then(
            function (snapshot) {

                const data =
                    snapshot.val() || {};


                const bidangArray =
                    Object.keys(data)
                        .map(
                            function (id) {

                                return {
                                    id: id,
                                    ...data[id]
                                };

                            }
                        )
                        .sort(
                            function (a, b) {

                                return (
                                    (a.urutan || 9999) -
                                    (b.urutan || 9999)
                                );

                            }
                        );


                bidangArray.forEach(
                    function (bidang) {

                        buatCardBidang(
                            bidang.id,
                            bidang
                        );

                    }
                );


                refreshNomorBidang();


                bidangStatus.style.color =
                    "#4ade80";

                bidangStatus.textContent =
                    bidangArray.length
                        ? "Data bidang berhasil dimuat."
                        : "Belum ada bidang. Silakan tambahkan bidang.";

            }
        )
        .catch(
            function (error) {

                console.error(
                    "Gagal mengambil data bidang:",
                    error
                );


                bidangStatus.style.color =
                    "#f87171";

                bidangStatus.textContent =
                    "Gagal mengambil data bidang.";

            }
        );

}


// =====================================================
// BUKA EDITOR BIDANG
// =====================================================

if (
    bidangCard &&
    bidangEditor
) {

    bidangCard.addEventListener(
        "click",
        function () {

            if (moduleMessage) {

                moduleMessage.classList.add(
                    "hidden"
                );

            }


            bidangEditor.classList.remove(
                "hidden"
            );


            loadBidangData();


            bidangEditor.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );

}


// =====================================================
// TUTUP EDITOR
// =====================================================

if (
    closeBidangEditor &&
    bidangEditor
) {

    closeBidangEditor.addEventListener(
        "click",
        function () {

            bidangEditor.classList.add(
                "hidden"
            );


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}


// =====================================================
// TAMBAH BIDANG
// =====================================================

if (addBidangButton) {

    addBidangButton.addEventListener(
        "click",
        function () {

            const bidangId =
                buatBidangId();


            buatCardBidang(
                bidangId,
                {
                    nama: "",
                    deskripsi: "",
                    foto: "",
                    anggota: {}
                }
            );


            refreshNomorBidang();


            const card =
                document.querySelector(
                    `[data-bidang-id="${bidangId}"]`
                );


            if (card) {

                card.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });


                card.querySelector(
                    ".bidang-nama"
                ).focus();

            }

        }
    );

}


// =====================================================
// SIMPAN SEMUA BIDANG
// =====================================================

if (saveBidangButton) {

    saveBidangButton.addEventListener(
        "click",
        async function () {

            saveBidangButton.disabled =
                true;

            saveBidangButton.textContent =
                "Menyimpan...";

            bidangStatus.style.color =
                "#fbbf24";

            bidangStatus.textContent =
                "Menyiapkan data...";


            try {

                const data =
                    await ambilSemuaDataBidang();


                bidangStatus.textContent =
                    "Menyimpan data ke Firebase...";


                await bidangDatabaseRef.set(
                    data
                );


                bidangStatus.style.color =
                    "#4ade80";

                bidangStatus.textContent =
                    "✓ Semua data bidang berhasil disimpan.";


                // Bersihkan file sementara anggota dan bidang.
                document
                    .querySelectorAll(".anggota-card")
                    .forEach(function (card) {
                        card._selectedPhoto = null;
                    });

                document
                    .querySelectorAll(".bidang-editor-card")
                    .forEach(function (card) {
                        card._selectedPhoto = null;
                        card._selectedPhotoDataUrl = null;
                    });


                // Muat ulang supaya URL foto terbaru terlihat
                setTimeout(
                    function () {

                        loadBidangData();

                    },
                    700
                );


            } catch (error) {

                console.error(
                    "Gagal menyimpan bidang:",
                    error
                );


                bidangStatus.style.color =
                    "#f87171";

                bidangStatus.textContent =
                    "✕ " +
                    (
                        error.message ||
                        "Gagal menyimpan data bidang."
                    );

            }


            saveBidangButton.disabled =
                false;

            saveBidangButton.textContent =
                "Simpan Semua Perubahan";

        }
    );

}



// =====================================================
// VALIDASI FOTO
// =====================================================

function validasiFoto(file) {

    if (!file) {
        throw new Error("Foto belum dipilih.");
    }

    const formatYangDidukung = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!formatYangDidukung.includes(file.type)) {
        throw new Error(
            "Format foto harus JPG, PNG, atau WebP."
        );
    }

    if (file.size > 10 * 1024 * 1024) {
        throw new Error(
            "Ukuran foto asli maksimal 10 MB."
        );
    }
}


// =====================================================
// RESIZE + KOMPRES FOTO ANGGOTA
// TANPA FIREBASE STORAGE
// =====================================================

function resizeFotoAnggota(file) {

    return new Promise((resolve, reject) => {

        if (!file) {

            reject(
                new Error("Foto belum dipilih.")
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

                        try {

                            // =====================================
                            // UKURAN HASIL AKHIR
                            // =====================================

                            const ukuran = 300;


                            const canvas =
                                document.createElement("canvas");


                            const ctx =
                                canvas.getContext("2d");


                            if (!ctx) {

                                reject(
                                    new Error(
                                        "Browser tidak mendukung pemrosesan foto."
                                    )
                                );

                                return;

                            }


                            canvas.width = ukuran;
                            canvas.height = ukuran;


                            // =====================================
                            // POTONG BAGIAN TENGAH MENJADI PERSEGI
                            // =====================================

                            const minSize =
                                Math.min(
                                    img.width,
                                    img.height
                                );


                            const cropX =
                                (img.width - minSize) / 2;


                            const cropY =
                                (img.height - minSize) / 2;


                            ctx.drawImage(

                                img,

                                cropX,
                                cropY,

                                minSize,
                                minSize,

                                0,
                                0,

                                ukuran,
                                ukuran

                            );


                            // =====================================
                            // UBAH MENJADI JPEG TERKOMPRES
                            // =====================================

                            const dataUrl =
                                canvas.toDataURL(
                                    "image/jpeg",
                                    0.78
                                );


                            // Perkiraan ukuran hasil
                            const ukuranPerkiraan =
                                Math.round(
                                    (dataUrl.length * 3) / 4 / 1024
                                );


                            console.log(
                                "Ukuran foto setelah diperkecil:",
                                ukuranPerkiraan,
                                "KB (perkiraan)"
                            );


                            resolve(dataUrl);

                        } catch (error) {

                            reject(error);

                        }

                    };


                img.onerror =
                    function () {

                        reject(
                            new Error(
                                "Foto tidak dapat dibaca."
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
                        "Gagal membaca foto."
                    )
                );

            };


        reader.readAsDataURL(file);

    });

}


// =====================================================
// PROSES FOTO ANGGOTA
// TANPA FIREBASE STORAGE
// =====================================================

async function uploadFotoAnggota(
    file,
    bidangId,
    anggotaId
) {

    if (!file) {

        return null;

    }


    // =====================================
    // CEK FORMAT
    // =====================================

    const formatYangDidukung = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (!formatYangDidukung.includes(file.type)) {

        throw new Error(
            "Format foto harus JPG, PNG, atau WebP."
        );

    }


    // =====================================
    // BATAS FOTO ASLI
    // =====================================

    if (
        file.size >
        10 * 1024 * 1024
    ) {

        throw new Error(
            "Ukuran foto asli maksimal 10 MB."
        );

    }


    console.log(
        "Ukuran foto asli:",
        (file.size / 1024).toFixed(1),
        "KB"
    );


    // =====================================
    // RESIZE + KOMPRES
    // =====================================

    const fotoDataUrl =
        await resizeFotoAnggota(file);


    console.log(
        "Foto berhasil diproses tanpa Storage.",
        "Bidang:",
        bidangId,
        "Anggota:",
        anggotaId
    );


    // Data URL inilah yang akan disimpan
    // langsung ke Realtime Database.

    return fotoDataUrl;

}


/* =====================================================
   DOKUMENTASI ADMIN
===================================================== */

const dokumentasiEditor =
    document.getElementById("dokumentasiEditor");

const dokumentasiAdminCard =
    document.querySelector(
        '.admin-card[data-module="dokumentasi"]'
    );

const closeDokumentasiEditor =
    document.getElementById(
        "closeDokumentasiEditor"
    );

const dokumentasiList =
    document.getElementById(
        "dokumentasiList"
    );

const addDokumentasi =
    document.getElementById(
        "addDokumentasi"
    );

const saveDokumentasi =
    document.getElementById(
        "saveDokumentasi"
    );

const dokumentasiStatus =
    document.getElementById(
        "dokumentasiStatus"
    );

const dokumentasiDatabaseRef =
    firebase.database().ref(
        "website/dokumentasi"
    );


/* =====================================================
   DATA SEMENTARA
===================================================== */

let dokumentasiData = {};


/* =====================================================
   BUKA EDITOR
===================================================== */

async function openDokumentasiEditor() {

    if (!dokumentasiEditor) {

        console.error(
            "dokumentasiEditor tidak ditemukan."
        );

        return;

    }

    dokumentasiEditor.classList.remove(
        "hidden"
    );

    if (moduleMessage) {

        moduleMessage.classList.add(
            "hidden"
        );

    }

    dokumentasiStatus.textContent =
        "Memuat dokumentasi...";

    dokumentasiStatus.style.color =
        "#fbbf24";


    dokumentasiEditor.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


    try {

        const snapshot =
            await dokumentasiDatabaseRef.once(
                "value"
            );

        dokumentasiData =
            snapshot.val() || {};


        renderDokumentasiAdmin();


    } catch (error) {

        console.error(
            "Gagal mengambil dokumentasi:",
            error
        );

        dokumentasiStatus.textContent =
            "Gagal mengambil dokumentasi.";

        dokumentasiStatus.style.color =
            "#f87171";

    }

}


/* =====================================================
   TUTUP EDITOR
===================================================== */

if (closeDokumentasiEditor) {

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
   RENDER DOKUMENTASI
===================================================== */

function renderDokumentasiAdmin() {

    if (!dokumentasiList) return;


    dokumentasiList.innerHTML = "";


    const ids =
        Object.keys(dokumentasiData);


    if (ids.length === 0) {

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

        dokumentasiStatus.textContent =
            "";

        return;

    }


    ids.forEach(function (id) {

        buatCardDokumentasi(
            id,
            dokumentasiData[id]
        );

    });


    dokumentasiStatus.textContent =
        `${ids.length} dokumentasi dimuat.`;

    dokumentasiStatus.style.color =
        "#94a3b8";

}


/* =====================================================
   BUAT CARD DOKUMENTASI
===================================================== */

function buatCardDokumentasi(
    id,
    data
) {

    const card =
        document.createElement(
            "div"
        );

    card.className =
        "editor-card dokumentasi-editor-card";


    card.dataset.id =
        id;


    card.innerHTML = `

        <div
            style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:15px;
                margin-bottom:20px;
            "
        >

            <h3>
                Dokumentasi
            </h3>

            <button
                type="button"
                class="delete-dokumentasi-button"
                style="
                    background:#ef4444;
                    color:white;
                    border:none;
                    border-radius:10px;
                    padding:9px 14px;
                    cursor:pointer;
                    font-weight:700;
                "
            >
                🗑️ Hapus
            </button>

        </div>


        <label>
            Foto Dokumentasi
        </label>

        <input
            type="file"
            class="dokumentasi-foto-input"
            accept="image/png,image/jpeg,image/webp"
        >


        <img
            class="dokumentasi-preview"
            src="${data.foto || ""}"
            alt="Preview dokumentasi"
            style="
                width:100%;
                max-width:500px;
                height:250px;
                object-fit:cover;
                border-radius:16px;
                margin-top:12px;
                display:${data.foto ? "block" : "none"};
            "
        >


        <p
            class="dokumentasi-foto-status"
            style="
                font-size:13px;
                margin-top:8px;
                opacity:.8;
            "
        >
            ${
                data.foto
                    ? "Foto saat ini. Pilih foto baru jika ingin mengganti."
                    : "Belum ada foto."
            }
        </p>


        <label>
            Judul Dokumentasi
        </label>

        <input
            type="text"
            class="dokumentasi-judul"
            value="${escapeHtml(
                data.judul || ""
            )}"
            placeholder="Contoh: Kegiatan Lomba 17 Agustus"
        >


        <label>
            Deskripsi
        </label>

        <textarea
            class="dokumentasi-deskripsi"
            rows="5"
            placeholder="Tuliskan deskripsi kegiatan..."
        >${escapeHtml(
            data.deskripsi || ""
        )}</textarea>

    `;


    const fileInput =
        card.querySelector(
            ".dokumentasi-foto-input"
        );

    const preview =
        card.querySelector(
            ".dokumentasi-preview"
        );

    const fotoStatus =
        card.querySelector(
            ".dokumentasi-foto-status"
        );


    fileInput.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];

            if (!file) return;


            try {

                validasiFoto(file);

            } catch (error) {

                fotoStatus.textContent =
                    error.message;

                fotoStatus.style.color =
                    "#f87171";

                this.value = "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    preview.src =
                        event.target.result;

                    preview.style.display =
                        "block";

                };


            reader.readAsDataURL(file);


            card._selectedPhoto =
                file;


            fotoStatus.textContent =
                "✓ Foto baru dipilih. Klik Simpan Semua Perubahan.";

            fotoStatus.style.color =
                "#fbbf24";

        }
    );


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

            if (!yakin) return;


            try {

                await dokumentasiDatabaseRef
                    .child(id)
                    .remove();


                delete dokumentasiData[id];


                card.remove();


                if (
                    Object.keys(
                        dokumentasiData
                    ).length === 0
                ) {

                    renderDokumentasiAdmin();

                }


                dokumentasiStatus.textContent =
                    "✓ Dokumentasi berhasil dihapus.";

                dokumentasiStatus.style.color =
                    "#4ade80";


            } catch (error) {

                console.error(
                    "Gagal menghapus dokumentasi:",
                    error
                );

                dokumentasiStatus.textContent =
                    "✕ Gagal menghapus dokumentasi.";

                dokumentasiStatus.style.color =
                    "#f87171";

            }

        }
    );


    dokumentasiList.appendChild(
        card
    );

}


/* =====================================================
   TAMBAH DOKUMENTASI
===================================================== */

if (addDokumentasi) {

    addDokumentasi.addEventListener(
        "click",
        function () {

            const id =
                "dokumentasi_" +
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .substring(2, 8);


            dokumentasiData[id] = {

                foto: "",

                judul:
                    "Dokumentasi Baru",

                deskripsi:
                    ""

            };


            buatCardDokumentasi(
                id,
                dokumentasiData[id]
            );


            dokumentasiStatus.textContent =
                "Dokumentasi baru ditambahkan. Isi datanya lalu simpan.";

            dokumentasiStatus.style.color =
                "#fbbf24";


            const empty =
                dokumentasiList.querySelector(
                    ".dokumentasi-empty"
                );

            if (empty) {

                empty.remove();

            }

        }
    );

}


/* =====================================================
   SIMPAN SEMUA DOKUMENTASI
===================================================== */

if (saveDokumentasi) {

    saveDokumentasi.addEventListener(
        "click",
        async function () {

            saveDokumentasi.disabled =
                true;

            saveDokumentasi.textContent =
                "Menyimpan...";

            dokumentasiStatus.textContent =
                "Memproses dokumentasi...";

            dokumentasiStatus.style.color =
                "#fbbf24";


            try {

                const cards =
                    dokumentasiList.querySelectorAll(
                        ".dokumentasi-editor-card"
                    );


                const hasil = {};


                let nomor = 0;


                for (const card of cards) {

                    nomor++;


                    const id =
                        card.dataset.id;


                    const oldData =
                        dokumentasiData[id] ||
                        {};


                    const fileInput =
                        card.querySelector(
                            ".dokumentasi-foto-input"
                        );


                    const fileBaru =
                        card._selectedPhoto;


                    let foto =
                        oldData.foto ||
                        "";


                    if (fileBaru) {

                        dokumentasiStatus.textContent =
                            `Memproses foto dokumentasi ${nomor}...`;


                        foto =
                            await uploadFotoAnggota(
                                fileBaru,
                                "dokumentasi",
                                id
                            );

                    }


                    const judul =
                        card.querySelector(
                            ".dokumentasi-judul"
                        ).value.trim();


                    const deskripsi =
                        card.querySelector(
                            ".dokumentasi-deskripsi"
                        ).value.trim();


                    hasil[id] = {

                        foto:
                            foto,

                        judul:
                            judul,

                        deskripsi:
                            deskripsi,

                        urutan:
                            nomor

                    };

                }


                dokumentasiStatus.textContent =
                    "Menyimpan ke Firebase...";


                await dokumentasiDatabaseRef.set(
                    hasil
                );


                dokumentasiData =
                    hasil;


                dokumentasiStatus.textContent =
                    "✓ Semua dokumentasi berhasil disimpan.";

                dokumentasiStatus.style.color =
                    "#4ade80";


                renderDokumentasiAdmin();


            } catch (error) {

                console.error(
                    "Gagal menyimpan dokumentasi:",
                    error
                );

                dokumentasiStatus.textContent =
                    "✕ " +
                    (
                        error.message ||
                        "Gagal menyimpan dokumentasi."
                    );

                dokumentasiStatus.style.color =
                    "#f87171";

            }


            saveDokumentasi.disabled =
                false;

            saveDokumentasi.textContent =
                "Simpan Semua Perubahan";

        }
    );

}
