document.getElementById("menu").addEventListener("click", () => {
  document.getElementById("navigation").classList.toggle("open");
});

const menuButton = document.getElementById("menu");
const nav = document.getElementById("navigation");

menuButton.addEventListener("click", () => {
  nav.classList.toggle("open");
});
const menuButton = document.getElementById("menu");
const nav = document.getElementById("navigation");

menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", isOpen);
});
