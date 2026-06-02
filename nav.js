const commonScript = document.createElement("script");
commonScript.src = "site-common.js";
document.head.appendChild(commonScript);

const NAV_ITEMS = [
  ["calculator_departure.html", "집결 계산기"],
  ["calculator_gg.html", "지고의 영주"],
  ["calculator_server_prep.html", "서버준비전"],
  ["calculator_alliance_duel.html", "연맹결투"],
  ["calculator_free.html", "자유계산기"],
];

const nav = document.querySelector(".top-nav");
nav.setAttribute("aria-label", "주요 메뉴");
nav.innerHTML = `
  <a class="brand" href="index.html" aria-label="Kingshot 홈">Kingshot<span>+</span></a>
  <button
    class="nav-toggle"
    type="button"
    aria-label="메뉴 열기"
    aria-expanded="false"
  >
    <span></span><span></span><span></span>
  </button>
  <div class="nav-links">
    ${NAV_ITEMS.map(([href, label]) => `<a href="${href}">${label}</a>`).join("")}
  </div>
`;

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
