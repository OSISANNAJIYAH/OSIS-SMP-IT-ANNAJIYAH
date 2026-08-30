function openPopup(img, name, role, desc) {

    document.getElementById("popup").classList.add("show");

    document.getElementById("popup-img").src = img;

    document.getElementById("popup-name").innerText = name;

    document.getElementById("popup-role").innerText = role;

    document.getElementById("popup-desc").innerText = desc;
}

function closePopup() {

    document.getElementById("popup").classList.remove("show");

}

/* CLOSE SAAT KLIK LUAR */

window.onclick = function (e) {

    const popup = document.getElementById("popup");

    if (e.target == popup) {
        popup.classList.remove("show");
    }

}



/* =========================
    HAMBURGER MENU
========================= */

const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

if (menuBtn && navMenu) {

    menuBtn.addEventListener("click", () => {

        navMenu.classList.toggle("active");
        menuBtn.classList.toggle("active");

    });

}


/* =========================
    NAVBAR SCROLL EFFECT
========================= */

window.addEventListener("scroll", () => {

    const navbar = document.querySelector(".navbar");

    if (navbar) {
        navbar.classList.toggle("scrolled", window.scrollY > 50);
    }

});





const galleryCards = document.querySelectorAll(".gallery-card");

const lightbox = document.getElementById("lightbox");

const lightboxImg = document.getElementById("lightboxImg");

const closeBtn = document.getElementById("closeBtn");

/* OPEN LIGHTBOX */

if (galleryCards.length > 0) {

    galleryCards.forEach(card => {

        card.addEventListener("click", () => {

            const img = card.querySelector("img");

            lightbox.classList.add("show");

            lightboxImg.src = img.src;

        });

    });

}

/* CLOSE BUTTON */

if (lightbox) {

    lightbox.addEventListener("click", (e) => {

        if (
            e.target === lightbox ||
            e.target.id === "closeBtn"
        ) {

            lightbox.classList.remove("show");
        }

    });

}

/* CLOSE OUTSIDE */

if (lightbox) {

    lightbox.addEventListener("click", (e) => {

        if (e.target === lightbox) {

            lightbox.classList.remove("show");

        }

    });

}





// STAR RATING

const stars = document.querySelectorAll(".rating i");

stars.forEach((star, index) => {

    star.addEventListener("click", () => {

        stars.forEach((s, i) => {

            if (i <= index) {
                s.classList.add("active");
            } else {
                s.classList.remove("active");
            }

        });

    });

});





document.addEventListener("DOMContentLoaded", function () {

    const nameInput = document.getElementById("nameInput");
    const enterBtn = document.getElementById("enterBtn");
    const welcomeScreen = document.getElementById("welcomeScreen");
    const navbar = document.querySelector(".navbar");

    if (!nameInput || !enterBtn || !welcomeScreen || !navbar) {
        return;
    }

    /* SEMBUNYIKAN NAVBAR */
    navbar.style.display = "none";

    /* CEK SESSION */
    const sudahMasuk = sessionStorage.getItem("sudahMasuk");

    /* JIKA SUDAH MASUK */
    if (sudahMasuk === "true") {

        welcomeScreen.style.display = "none";
        navbar.style.display = "flex";

        return;
    }

    /* TOMBOL AWAL HILANG */
    enterBtn.style.display = "none";

    /* INPUT */
    nameInput.addEventListener("input", function () {

        if (nameInput.value.trim() !== "") {

            enterBtn.style.display = "block";

            setTimeout(() => {
                enterBtn.classList.add("show");
            }, 50);

        } else {

            enterBtn.classList.remove("show");

            setTimeout(() => {
                enterBtn.style.display = "none";
            }, 300);

        }

    });

    /* TOMBOL MASUK */
    enterBtn.addEventListener("click", function () {

        sessionStorage.setItem("sudahMasuk", "true");

        welcomeScreen.style.opacity = "0";
        welcomeScreen.style.transition = "1s";

        setTimeout(() => {

            welcomeScreen.style.display = "none";
            navbar.style.display = "flex";

        }, 1000);

    });

});


// Efek animasi saat card diklik

const cards = document.querySelectorAll(".card");

cards.forEach(card => {

    card.addEventListener("click", () => {

        card.classList.add("active");

        setTimeout(() => {
            card.classList.remove("active");
        }, 200);

    });

});





document.addEventListener("DOMContentLoaded", () => {

    const ctx = document.getElementById("chart");

    if (!ctx) return;

    // =========================
    // CHART
    // =========================

    let votes = [0, 0, 0];

    const chart = new Chart(ctx, {

        type: "doughnut",

        data: {
            labels: [
                "Anonymous",
                "Anonymous",
                "Anonymous"
            ],

            datasets: [{
                data: votes,

                backgroundColor: [
                    "#3b82f6",
                    "#9333ea",
                    "#06b6d4"
                ],

                borderWidth: 0
            }]
        },

        options: {

            responsive: true,

            animation: {

                animateRotate: true,

                animateScale: true,

                duration: 1200

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

    // =========================
    // FIREBASE
    // =========================

    const voteRef = database.ref("votes");

    // =========================
    // WAKTU VOTING
    // =========================

    const endVoteDate =
        new Date(2026, 4, 1, 12, 0, 0);

    const now = new Date();

    const statusText =
        document.getElementById("vote-status");

    const isVoteClosed =
        now > endVoteDate;

    // format tanggal indonesia
    const tanggal =
        endVoteDate.toLocaleString("id-ID", {

            day: "numeric",
            month: "long",
            year: "numeric",

            hour: "2-digit",
            minute: "2-digit"

        });

    if (statusText) {

        if (isVoteClosed) {

            statusText.innerHTML =
                `🔒 Voting ditutup pada ${tanggal}`;

        } else {

            statusText.innerHTML =
                `🟢 Voting dibuka sampai ${tanggal}`;

        }

    }


    // =========================
    // BUTTON VOTE
    // =========================

    const buttons =
        document.querySelectorAll(".vote-btn");

    buttons.forEach(button => {

        // jika voting ditutup
        if (isVoteClosed) {

            button.disabled = true;

            button.innerText =
                "Voting Ditutup";

            button.style.opacity = "0.6";

            button.style.cursor =
                "not-allowed";

        }

        button.addEventListener("click", () => {

            // cek voting ditutup
            if (isVoteClosed) {

                alert("Voting sudah ditutup!");

                return;

            }

            // cek sudah voting
            if (localStorage.getItem("hasVoted")) {

                alert("Kamu sudah voting!");

                return;

            }

            const index =
                button.dataset.index;

            votes[index]++;

            voteRef.set(votes);

            localStorage.setItem(
                "hasVoted",
                "true"
            );

            alert("Voting berhasil!");

        });
    });

    // =========================
    // RESET KHUSUS ADMIN
    // =========================

    const adminResetBtn =
        document.getElementById("admin-reset-btn");

    if (adminResetBtn) {

        adminResetBtn.addEventListener("click", () => {

            const password =
                prompt("Masukkan password admin:");

            const adminPassword =
                "osis2026";

            if (password !== adminPassword) {

                alert("Password salah!");

                return;

            }

            const konfirmasi =
                confirm("Yakin ingin reset semua vote?");

            if (!konfirmasi) return;

            voteRef.set([0, 0, 0]);

            localStorage.removeItem("hasVoted");

            alert("Semua voting berhasil direset!");

        });

    }

    voteRef.on("value", (snapshot) => {

        const data = snapshot.val();

        if (data) {

            votes = [
                data[0] || 0,
                data[1] || 0,
                data[2] || 0
            ];

            chart.data.datasets[0].data = votes;

            chart.update();

            document.getElementById("vote1")
                .innerText = votes[0];

            document.getElementById("vote2")
                .innerText = votes[1];

            document.getElementById("vote3")
                .innerText = votes[2];

            // animasi realtime
            const resultBox =
                document.querySelector(".result-box");

            if (resultBox) {

                resultBox.classList.add("vote-pop");

                setTimeout(() => {

                    resultBox.classList.remove("vote-pop");

                }, 500);

            }

            setTimeout(() => {

                document.querySelector(".result-box")
                    .classList.remove("vote-pop");

            }, 500);

            // =========================
            // UPDATE PERSEN
            // =========================

            const total =
                votes[0] + votes[1] + votes[2];

            const percent1 =
                total ? (votes[0] / total) * 100 : 0;

            const percent2 =
                total ? (votes[1] / total) * 100 : 0;

            const percent3 =
                total ? (votes[2] / total) * 100 : 0;

            // width progress
            document.querySelector(".fill1")
                .style.width = percent1 + "%";

            document.querySelector(".fill2")
                .style.width = percent2 + "%";

            document.querySelector(".fill3")
                .style.width = percent3 + "%";

            // text persen
            document.getElementById("percent1")
                .innerText = percent1.toFixed(1) + "%";

            document.getElementById("percent2")
                .innerText = percent2.toFixed(1) + "%";

            document.getElementById("percent3")
                .innerText = percent3.toFixed(1) + "%";

            // =========================
            // KANDIDAT TERUNGGUL
            // =========================

            const cards =
                document.querySelectorAll(".candidate-card");

            // reset semua
            cards.forEach(card => {
                card.classList.remove("leading");
            });

            // cari vote terbesar
            const maxVote =
                Math.max(...votes);

            // jika ada vote
            if (maxVote > 0) {

                votes.forEach((vote, index) => {

                    if (vote === maxVote && cards[index]) {

                        cards[index].classList.add("leading");

                    }

                });

            }

        }

    });

});








// AOS ANIMATION
AOS.init({
    duration: 1200,
    once: true,
});

// PARTICLES
particlesJS("particles-js", {
    particles: {
        number: {
            value: 90,
            density: {
                enable: true,
                value_area: 800,
            },
        },

        color: {
            value: "#c59d5f",
        },

        shape: {
            type: "circle",
        },

        opacity: {
            value: 0.5,
            random: true,
        },

        size: {
            value: 4,
            random: true,
        },

        line_linked: {
            enable: true,
            distance: 150,
            color: "#c59d5f",
            opacity: 0.3,
            width: 1,
        },

        move: {
            enable: true,
            speed: 2,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            bounce: false,
        },
    },

    interactivity: {
        detect_on: "canvas",

        events: {
            onhover: {
                enable: true,
                mode: "grab",
            },

            onclick: {
                enable: true,
                mode: "push",
            },

            resize: true,
        },

        modes: {
            grab: {
                distance: 170,
                line_linked: {
                    opacity: 0.7,
                },
            },

            push: {
                particles_nb: 4,
            },
        },
    },

    retina_detect: true,
});







function generateCalendar() {
    const calendarDates = document.getElementById("calendar-dates");
    const monthYearLabel = document.getElementById("month-year");

    // Mengambil tanggal, bulan, dan tahun saat ini secara real-time
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    // Set nama bulan dan tahun di header kalender
    monthYearLabel.innerText = `${months[currentMonth]} ${currentYear}`;

    // Mendapatkan hari pertama pada bulan ini (0 = Minggu, 1 = Senin, dst)
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

    // Mendapatkan jumlah total hari di bulan ini
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Mengosongkan isi kalender sebelum diisi ulang
    calendarDates.innerHTML = "";

    // Membuat slot tanggal kosong untuk menyamakan hari di awal bulan
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement("div");
        emptyDiv.classList.add("empty");
        calendarDates.appendChild(emptyDiv);
    }

    // Memasukkan tanggal 1 sampai akhir bulan ke dalam grid
    for (let date = 1; date <= totalDays; date++) {
        const dateDiv = document.createElement("div");
        dateDiv.innerText = date;

        // Beri tanda/highlight khusus jika hari ini cocok dengan tanggal sistem komputer
        if (date === currentDate) {
            dateDiv.classList.add("today");
        }

        calendarDates.appendChild(dateDiv);
    }
}

// Menjalankan fungsi kalender secara otomatis saat seluruh halaman web selesai dimuat
window.onload = generateCalendar;













// =========================
// CURSOR GLOW
// =========================

const glow = document.querySelector(".cursor-glow");

document.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
});

// =========================
// SCROLL REVEAL
// =========================

const reveals = document.querySelectorAll(".reveal");

window.addEventListener("scroll", () => {

    reveals.forEach((el) => {

        const windowHeight = window.innerHeight;
        const revealTop = el.getBoundingClientRect().top;

        if (revealTop < windowHeight - 100) {
            el.classList.add("active");
        }

    });

});

// =========================
// FLOATING PARTICLES
// =========================

function createParticle() {

    const particle = document.createElement("div");

    particle.classList.add("floating-particle");

    particle.style.left = Math.random() * window.innerWidth + "px";

    particle.style.animationDuration =
        5 + Math.random() * 5 + "s";

    particle.style.width =
        particle.style.height =
        Math.random() * 6 + 2 + "px";

    document.body.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 10000);
}

setInterval(createParticle, 300);

// =========================
// BACK TO TOP
// =========================

const backToTop =
    document.getElementById("backToTop");

window.addEventListener("scroll", () => {

    if (window.scrollY > 300) {
        backToTop.classList.add("show");
    } else {
        backToTop.classList.remove("show");
    }

});

backToTop.addEventListener("click", () => {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

// =========================
// LIVE CLOCK
// =========================

function updateClock() {

    const now = new Date();

    const time = now.toLocaleTimeString("id-ID");

    const date = now.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    document.getElementById("clock").innerHTML =
        `${time}<br>${date}`;
}

setInterval(updateClock, 1000);

updateClock();


// =========================
// MOUSE TRAIL EFFECT
// =========================

document.addEventListener("mousemove", (e) => {

    const trail = document.createElement("div");

    trail.className = "trail";

    trail.style.left = e.pageX + "px";
    trail.style.top = e.pageY + "px";

    document.body.appendChild(trail);

    setTimeout(() => {
        trail.remove();
    }, 700);

});






// =========================
// SMART AI CHAT
// =========================

document.addEventListener("DOMContentLoaded", () => {

    const chatToggle =
        document.getElementById("chatToggle");

    const chatBox =
        document.getElementById("chatBox");

    const sendBtn =
        document.getElementById("sendBtn");

    const userInput =
        document.getElementById("userInput");

    const chatBody =
        document.getElementById("chatBody");

    // =========================
    // MEMORY CHAT
    // =========================

    let memory =
        JSON.parse(
            localStorage.getItem("aiMemory")
        ) || [];

    // =========================
    // RESPONSE DATABASE
    // =========================

    const responses = [

        // =========================
        // SAPAAN
        // =========================

        {
            keywords: [
                "halo",
                "hai",
                "hi",
                "hello",
                "assalamualaikum"
            ],

            reply: "Halo juga 👋 Selamat datang di AI Assistant sekolah. Ada yang bisa saya bantu hari ini?"
        },
        {
            keywords: [
                "terimakasih",
                "terima kasih",
                "terima kasih banyak",
                "makasih",
                "makasih yaa",
                "makasih ya"
            ],

            reply: "sama sama, terima kasih telah menggunakan saya"
        },

        {
            keywords: [
                "apa kabar",
                "kamu gimana",
                "baik kah"
            ],

            reply: "Saya baik 😄 Terima kasih sudah bertanya. Semoga harimu juga menyenangkan dan penuh semangat ✨"
        },

        {
            keywords: [
                "siapa kamu",
                "kamu siapa",
                "siapa nama kamu"
            ],

            reply: "Saya adalah AI Assistant sekolah 🤖 Saya dibuat untuk membantu menjawab pertanyaan, menemani ngobrol, dan membantu informasi seputar sekolah maupun teknologi."
        },

        {
            keywords: [
                "siapa pembuatmu",
                "siapa yang membuat kamu"
            ],

            reply: "Saya dibuat oleh developer keren yang sedang belajar membuat AI modern menggunakan JavaScript 🔥"
        },

        {
            keywords: [
                "apa yang bisa kamu lakukan",
                "fitur kamu apa"
            ],

            reply: "Saya bisa menjawab pertanyaan, mengingat nama pengguna, membantu informasi sekolah, memberikan jawaban tentang teknologi, dan menemani ngobrol 😎"
        },
        {
            keywords: [
                "siapa orang paling ganteng",
                "siapa orang paling tampan",
                "siapa orang paling pintar",
                "siapa orang paling jenius",
                "siapa orang paling sigma",
                "siapa orang paling keren"
            ],

            reply: "Sudah pasti Muhammad Alrifatih Assalam😎"
        },

        // =========================
        // SEKOLAH
        // =========================

        {
            keywords: [
                "apa itu osis",
                "jelaskan osis",
                "fungsi osis"
            ],

            reply: "OSIS adalah Organisasi Siswa Intra Sekolah 🎓 OSIS berfungsi membantu sekolah dalam menjalankan kegiatan siswa seperti lomba, acara sekolah, kegiatan sosial, classmeeting, dan berbagai program lainnya."
        },

        {
            keywords: [
                "apa tugas ketua osis",
                "tugas ketua osis"
            ],

            reply: "Ketua OSIS bertugas memimpin organisasi siswa, mengatur jalannya program kerja, membantu koordinasi anggota OSIS, dan menjadi contoh yang baik bagi siswa lainnya 🗳️"
        },

        {
            keywords: [
                "kenapa osis penting",
                "fungsi osis di sekolah"
            ],

            reply: "OSIS penting karena membantu siswa belajar organisasi, kepemimpinan, tanggung jawab, kerja sama tim, dan komunikasi 💡"
        },

        {
            keywords: [
                "apa manfaat ikut osis",
                "manfaat osis"
            ],

            reply: "Mengikuti OSIS dapat melatih kepemimpinan, keberanian berbicara, kerja sama tim, rasa tanggung jawab, dan pengalaman organisasi yang berguna di masa depan ✨"
        },

        {
            keywords: [
                "apa itu classmeeting",
                "jelaskan classmeeting"
            ],

            reply: "Classmeeting adalah kegiatan perlombaan antar kelas yang biasanya dilakukan setelah ujian sekolah 🏆"
        },

        // =========================
        // TEKNOLOGI
        // =========================

        {
            keywords: [
                "apa itu html",
                "jelaskan html"
            ],

            reply: "HTML adalah bahasa dasar untuk membuat struktur website 🌐 HTML digunakan untuk membuat teks, gambar, tombol, tabel, dan elemen lainnya di halaman web."
        },

        {
            keywords: [
                "apa itu css",
                "jelaskan css"
            ],

            reply: "CSS digunakan untuk mempercantik tampilan website 🎨 Dengan CSS kamu bisa mengatur warna, ukuran, animasi, layout, font, dan efek visual lainnya."
        },

        {
            keywords: [
                "apa itu javascript",
                "jelaskan javascript",
                "fungsi javascript"
            ],

            reply: "JavaScript adalah bahasa pemrograman yang membuat website menjadi interaktif ⚡ Contohnya seperti popup, animasi, AI chat, dark mode, slider, game, dan fitur realtime."
        },

        {
            keywords: [
                "apa itu ai",
                "jelaskan ai",
                "kecerdasan buatan"
            ],

            reply: "AI atau Artificial Intelligence adalah teknologi yang membuat komputer dapat berpikir dan merespons seperti manusia 🤖 Contohnya seperti ChatGPT, voice assistant, dan chatbot otomatis."
        },

        {
            keywords: [
                "bagaimana cara belajar coding",
                "cara belajar programming"
            ],

            reply: "Cara terbaik belajar coding adalah mulai dari dasar seperti HTML, CSS, lalu JavaScript 💻 Setelah itu coba membuat project kecil seperti website sekolah, kalkulator, atau chatbot."
        },

        {
            keywords: [
                "bahasa pemrograman terbaik",
                "coding terbaik"
            ],

            reply: "Tidak ada bahasa pemrograman terbaik untuk semua hal 😄 Namun JavaScript sangat populer untuk website, Python bagus untuk AI, dan C++ bagus untuk performa tinggi."
        },

        // =========================
        // WEBSITE
        // =========================

        {
            keywords: [
                "website ini dibuat menggunakan apa",
                "website ini dibuat pakai apa",
                "dibuat menggunakan apa"
            ],

            reply: "Website ini dibuat menggunakan HTML, CSS, JavaScript, dan beberapa library modern ✨"
        },

        {
            keywords: [
                "kenapa website lag",
                "website berat"
            ],

            reply: "Website bisa lag karena terlalu banyak animasi, gambar besar, efek blur berlebihan, atau JavaScript yang terlalu berat ⚡"
        },

        {
            keywords: [
                "website",
                "cara membuat website keren",
                "cara membuat website",
                "website aesthetic"
            ],

            reply: "Website keren biasanya memiliki animasi smooth, warna yang cocok, efek glassmorphism, loading cepat, dan desain yang rapi ✨"
        },

        // =========================
        // BELAJAR
        // =========================

        {
            keywords: [
                "cara fokus belajar",
                "tips belajar"
            ],

            reply: "Tips belajar yang bagus 📚:\n\n1. Cari tempat tenang\n2. Kurangi distraksi HP\n3. Belajar sedikit demi sedikit\n4. Istirahat teratur\n5. Jangan begadang terlalu sering"
        },

        {
            keywords: [
                "aku malas belajar",
                "malas belajar"
            ],

            reply: "Rasa malas itu normal 😄 Coba mulai dari belajar 10 menit dulu. Biasanya setelah mulai, semangat akan muncul sendiri 💪"
        },

        {
            keywords: [
                "cara mendapatkan nilai bagus",
                "tips nilai bagus"
            ],

            reply: "Untuk mendapatkan nilai bagus 📖:\n\n- Rajin belajar\n- Perhatikan guru\n- Kerjakan tugas tepat waktu\n- Latihan soal\n- Jangan takut bertanya"
        },

        // =========================
        // GAME
        // =========================

        {
            keywords: [
                "apa game favorit kamu",
                "game favorit"
            ],

            reply: "Saya suka semua game 😆 Mulai dari Minecraft, Roblox, Mobile Legends, sampai game story mode 🎮"
        },

        {
            keywords: [
                "apa itu minecraft",
                "jelaskan minecraft"
            ],

            reply: "Minecraft adalah game sandbox yang memungkinkan pemain membangun dunia sendiri menggunakan block ⛏️"
        },

        {
            keywords: [
                "apa itu roblox",
                "jelaskan roblox"
            ],

            reply: "Roblox adalah platform game online yang berisi banyak game buatan komunitas 🎮"
        },

        {
            keywords: [
                "mobile legends",
                "ml"
            ],

            reply: "Mobile Legends adalah game MOBA populer yang dimainkan 5 lawan 5 ⚔️"
        },

        // =========================
        // HIBURAN
        // =========================

        {
            keywords: [
                "musik favorit",
                "kamu suka musik"
            ],

            reply: "Musik bisa membuat suasana hati jadi lebih baik 🎵"
        },

        {
            keywords: [
                "anime favorit",
                "kamu suka anime"
            ],

            reply: "Anime memang seru 🍿 Banyak anime dengan cerita keren dan penuh inspirasi."
        },

        // =========================
        // MOTIVASI
        // =========================

        {
            keywords: [
                "aku sedih",
                "aku kecewa"
            ],

            reply: "Jangan menyerah 💙 Semua orang pernah mengalami masa sulit. Tetap semangat dan percaya pada dirimu sendiri ✨"
        },

        {
            keywords: [
                "aku gagal",
                "gagal"
            ],

            reply: "Kegagalan bukan akhir 😄 Justru dari kegagalan kita belajar menjadi lebih kuat 💪"
        },

        {
            keywords: [
                "aku takut",
                "takut"
            ],

            reply: "Rasa takut itu normal 😊 Yang penting tetap mencoba dan jangan menyerah."
        },

        {
            keywords: [
                "aku capek",
                "capek"
            ],

            reply: "Kalau capek istirahat dulu ya 😴 Jangan terlalu memaksakan diri."
        },

        // =========================
        // RANDOM
        // =========================

        {
            keywords: [
                "berapa umur bumi"
            ],

            reply: "Umur bumi diperkirakan sekitar 4,5 miliar tahun 🌍"
        },

        {
            keywords: [
                "siapa presiden indonesia"
            ],

            reply: "Presiden Indonesia dapat berubah sesuai periode pemerintahan 🇮🇩"
        },

        {
            keywords: [
                "matahari itu apa"
            ],

            reply: "Matahari adalah bintang pusat tata surya ☀️ yang memberikan cahaya dan energi bagi bumi."
        },

        {
            keywords: [
                "bulan itu apa"
            ],

            reply: "Bulan adalah satelit alami bumi 🌕"
        },

        {
            keywords: [
                "kenapa langit biru"
            ],

            reply: "Langit terlihat biru karena cahaya matahari tersebar di atmosfer bumi 🌤️"
        }

    ];

    // =========================
    // TOGGLE CHAT
    // =========================

    chatToggle.addEventListener("click", () => {

        if (
            chatBox.style.display === "flex"
        ) {

            chatBox.style.display = "none";

        } else {

            chatBox.style.display = "flex";

        }

    });

    // =========================
    // SEND
    // =========================

    sendBtn.addEventListener("click", sendMessage);

    userInput.addEventListener("keypress", (e) => {

        if (e.key === "Enter") {
            sendMessage();
        }

    });

    // =========================
    // SEND MESSAGE
    // =========================

    async function sendMessage() {

        const text =
            userInput.value.trim();

        if (text === "") return;

        addMessage(text, "user-message");

        userInput.value = "";

        // simpan memory
        memory.push({
            role: "user",
            text: text
        });

        localStorage.setItem(
            "aiMemory",
            JSON.stringify(memory)
        );

        // loading
        const loading =
            addMessage(
                "AI sedang berpikir...",
                "bot-message"
            );

        // delay
        setTimeout(async () => {

            let reply =
                await generateReply(text);

            loading.remove();

            typeMessage(reply);

            // simpan jawaban AI
            memory.push({
                role: "ai",
                text: reply
            });

            localStorage.setItem(
                "aiMemory",
                JSON.stringify(memory)
            );

        }, 700);

    }

    // =========================
    // GENERATE REPLY
    // =========================

    async function generateReply(text) {

        const lower =
            text.toLowerCase();

        // =========================
        // CEK NAMA USER DULU
        // =========================

        if (
            lower.includes("siapa nama saya")
        ) {

            const savedName =
                localStorage.getItem("userName");

            if (savedName) {

                return `Nama kamu adalah ${savedName} 👋`;

            } else {

                return "Saya belum tahu nama kamu 😅";

            }

        }

        // =========================
        // SIMPAN NAMA
        // =========================

        if (
            lower.includes("nama saya")
        ) {

            const name =
                text.replace(/nama saya/i, "").trim();

            if (name === "") {

                return "Siapa nama kamu? 😊";

            }

            localStorage.setItem(
                "userName",
                name
            );

            return `Senang bertemu denganmu ${name} 😄`;

        }

        // =========================
        // RESPONSE DATABASE
        // =========================

        for (const item of responses) {

            for (const keyword of item.keywords) {

                if (
                    lower.includes(keyword)
                ) {

                    return item.reply;

                }

            }

        }

        return "Maaf saya belum mengerti 😅, karena saya masih versi 0.1,";


    }

    // =========================
    // ADD MESSAGE
    // =========================

    function addMessage(text, className) {

        const msg =
            document.createElement("div");

        msg.classList.add(className);

        msg.innerText = text;

        chatBody.appendChild(msg);

        chatBody.scrollTop =
            chatBody.scrollHeight;

        return msg;

    }

    // =========================
    // TYPING EFFECT
    // =========================

    function typeMessage(text) {

        const msg =
            document.createElement("div");

        msg.classList.add("bot-message");

        chatBody.appendChild(msg);

        let index = 0;

        const interval =
            setInterval(() => {

                msg.textContent +=
                    text.charAt(index);

                index++;

                chatBody.scrollTop =
                    chatBody.scrollHeight;

                if (index >= text.length) {

                    clearInterval(interval);

                }

            }, 20);

    }

});





