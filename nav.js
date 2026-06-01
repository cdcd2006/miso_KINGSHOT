const commonScript = document.createElement("script");
commonScript.src = "site-common.js";
document.head.appendChild(commonScript);

const nav = document.querySelector(".top-nav");
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
let lastScrollY = window.scrollY;

function closeMenu() {
  nav.classList.remove("menu-open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "메뉴 열기");
}

toggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("menu-open");
  toggle.setAttribute("aria-expanded", String(isOpen));
  toggle.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
});

links.addEventListener("click", (event) => {
  if (event.target.matches("a")) closeMenu();
});

window.addEventListener(
  "scroll",
  () => {
    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY > lastScrollY;

    if (currentScrollY < 24 || !scrollingDown) {
      nav.classList.remove("nav-hidden");
    } else if (!nav.classList.contains("menu-open")) {
      nav.classList.add("nav-hidden");
    }

    lastScrollY = currentScrollY;
  },
  { passive: true },
);
