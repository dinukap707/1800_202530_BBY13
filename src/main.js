// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap';

function sayHello() {}
// document.addEventListener('DOMContentLoaded', sayHello);

function toProfilePage() {
  window.location.href = "./1800_202530_BBY13/profile.html";
}

function toSettingPage() {
  window.location.href = "./1800_202530_BBY13/settings.html";
}

const filterBtn = document.getElementById("filter-btn");
const filterPopup = document.getElementById("filter-popup");

filterBtn.addEventListener("click", () => {
  filterPopup.classList.toggle("hidden");
});

document.addEventListener("click", (e) => {
  if (!filterPopup.contains(e.target) && !filterBtn.contains(e.target)) {
    filterPopup.classList.add("hidden");
  }
});

filterPopup.querySelectorAll("button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const filterType = btn.getAttribute("data-filter");
    console.log("Filter selected:", filterType);

    switch (filterType) {
      case "recent":
        break;
      case "oldest":
        break;
      case "az":
        break;
      case "za":
        break;
    }

    filterPopup.classList.add("hidden");
  });
});
