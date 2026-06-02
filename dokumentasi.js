const pages = document.querySelectorAll(".page");

let currentPage = 0;

pages.forEach((page, index) => {
    page.style.zIndex = pages.length - index;
});

document
.getElementById("nextBtn")

.addEventListener("click", () => {

    if(currentPage < pages.length){

        pages[currentPage]
        .classList.add("flipped");

        currentPage++;
    }
});

document
.getElementById("prevBtn")

.addEventListener("click", () => {

    if(currentPage > 0){

        currentPage--;

        pages[currentPage]
        .classList.remove("flipped");
    }
});