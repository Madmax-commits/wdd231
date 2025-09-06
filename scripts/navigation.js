const menuButton = document.getElementById("menu");
const nav = document.getElementById("navigation");

menuButton.addEventListener("click", () => {
  nav.classList.toggle("open");
});
