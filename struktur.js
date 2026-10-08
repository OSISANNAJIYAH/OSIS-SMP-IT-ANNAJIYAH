document.addEventListener("DOMContentLoaded", function () {
    const loading = document.getElementById("struktur-loading");
    const strukturRef = firebase.database().ref("struktur");

    const roles = ["ketua", "wakil", "sekretaris", "bendahara"];

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value || "";
    }

    function setPhoto(id, value) {
        const el = document.getElementById(id);
        if (!el || !value) return;
        el.src = value;
        el.onerror = function () {
            this.onerror = null;
            this.style.opacity = "0.55";
        };
    }

    strukturRef.once("value")
        .then(function (snapshot) {
            const data = snapshot.val() || {};

            roles.forEach(function (role) {
                const item = data[role];
                if (!item) return;

                setText(role + "-nama", item.nama);
                setText(role + "-jabatan", item.jabatan);
                setText(role + "-desc", item.deskripsi);
                setPhoto(role + "-foto", item.foto);
            });
        })
        .catch(function (error) {
            console.error("Gagal memuat struktur:", error);
        })
        .finally(function () {
            setTimeout(function () {
                if (loading) loading.classList.add("hide");
            }, 350);
        });

    })
