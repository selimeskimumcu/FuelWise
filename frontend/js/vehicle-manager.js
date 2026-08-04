const modal =
    document.getElementById("vehicle-modal");

const openButton =
    document.getElementById("add-vehicle-btn");

const closeButton =
    document.getElementById("close-modal");

openButton.addEventListener("click", () => {

    modal.classList.add("active");

});

closeButton.addEventListener("click", () => {

    modal.classList.remove("active");

});

modal.addEventListener("click", event => {

    if (event.target === modal) {

        modal.classList.remove("active");

    }

});

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        modal.classList.remove("active");

    }

});