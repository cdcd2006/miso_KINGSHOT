const STORAGE_KEY = "kingshot-free-score-v1";
const numberFormat = new Intl.NumberFormat("ko-KR");
const rows = document.querySelector("#scoreRows");
const currentScore = document.querySelector("#currentScore");
const competitorScore = document.querySelector("#competitorScore");
const totalScore = document.querySelector("#totalScore");
const comparison = document.querySelector("#comparison");
const showAllButton = document.querySelector("#showAllButton");
const showSelectedButton = document.querySelector("#showSelectedButton");
let showSelectedOnly = false;
let nextRowId = 1;

function parseNumeric(value) {
  return Math.max(0, Math.floor(Number(String(value).replace(/[^0-9]/g, "")) || 0));
}

function formatNumeric(value) {
  return numberFormat.format(parseNumeric(value));
}

function makeRow(item = {}) {
  const id = item.id || `free-${nextRowId++}`;
  const numericId = Number(id.replace("free-", ""));
  if (Number.isFinite(numericId)) nextRowId = Math.max(nextRowId, numericId + 1);

  return `
    <tr data-row-id="${id}">
      <td class="item-name">
        <div class="free-item-editor">
          <label class="item-pin">
            <input data-pin-item type="checkbox" ${item.pinned ? "checked" : ""}>
          </label>
          <input class="free-item-name" data-item-name type="text" value="${escapeHtml(item.name || "")}" placeholder="아이템 이름">
          <button class="free-remove-button" data-remove-row type="button">삭제</button>
        </div>
      </td>
      <td><input class="custom-point-input" data-point type="text" inputmode="numeric" value="${formatNumeric(item.point || 0)}"></td>
      <td><input class="qty-input" data-quantity type="text" inputmode="numeric" value="${formatNumeric(item.quantity || 0)}"></td>
      <td class="subtotal" data-subtotal>0</td>
      <td class="subtotal" data-running>0</td>
    </tr>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function addRow(item) {
  rows.insertAdjacentHTML("beforeend", makeRow(item));
  enhanceNumericControls();
  updateRemoveButtons();
}

function enhanceNumericControls() {
  rows.querySelectorAll(".qty-input").forEach((input) => {
    if (input.parentElement.classList.contains("numeric-control")) return;
    const wrapper = document.createElement("span");
    wrapper.className = "numeric-control";
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    wrapper.insertAdjacentHTML(
      "beforeend",
      '<span class="stepper-buttons"><button data-step="1" type="button" aria-label="1 증가">▲</button><button data-step="-1" type="button" aria-label="1 감소">▼</button></span>',
    );
  });
}

function getState() {
  return {
    currentScore: parseNumeric(currentScore.value),
    competitorScore: parseNumeric(competitorScore.value),
    items: Array.from(rows.querySelectorAll("tr")).map((row) => ({
      id: row.dataset.rowId,
      name: row.querySelector("[data-item-name]").value,
      point: parseNumeric(row.querySelector("[data-point]").value),
      quantity: parseNumeric(row.querySelector("[data-quantity]").value),
      pinned: row.querySelector("[data-pin-item]").checked,
    })),
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getState()));
}

function updateRemoveButtons() {
  const buttons = rows.querySelectorAll("[data-remove-row]");
  buttons.forEach((button) => {
    button.disabled = buttons.length === 1;
  });
}

function calculate() {
  let running = parseNumeric(currentScore.value);
  Array.from(rows.querySelectorAll("tr")).forEach((row) => {
    const subtotal =
      parseNumeric(row.querySelector("[data-point]").value) *
      parseNumeric(row.querySelector("[data-quantity]").value);
    running += subtotal;
    row.querySelector("[data-subtotal]").textContent = numberFormat.format(subtotal);
    row.querySelector("[data-running]").textContent = numberFormat.format(running);
    row.hidden = showSelectedOnly && !row.querySelector("[data-pin-item]").checked;
  });

  const competitor = parseNumeric(competitorScore.value);
  totalScore.textContent = numberFormat.format(running);
  totalScore.classList.toggle("behind", running < competitor);
  comparison.classList.toggle("ahead", running > competitor);
  comparison.classList.toggle("behind", running < competitor);
  comparison.textContent =
    running === competitor
      ? "경쟁자와 동점입니다."
      : running > competitor
        ? `경쟁자보다 ${numberFormat.format(running - competitor)}점 앞서고 있습니다.`
        : `경쟁자보다 ${numberFormat.format(competitor - running)}점 부족합니다.`;
  saveState();
}

function resetRows() {
  rows.innerHTML = "";
  Array.from({ length: 3 }, () => addRow());
  calculate();
}

function initialize() {
  let state = {};
  try {
    state = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    state = {};
  }
  currentScore.value = formatNumeric(state.currentScore || 0);
  competitorScore.value = formatNumeric(state.competitorScore || 0);
  const items = Array.isArray(state.items) && state.items.length ? state.items : [{}, {}, {}];
  items.forEach(addRow);
  calculate();
}

document.querySelector("#addRowButton").addEventListener("click", () => {
  addRow();
  calculate();
});

document.querySelector("#resetButton").addEventListener("click", resetRows);

showAllButton.addEventListener("click", () => {
  showSelectedOnly = false;
  showAllButton.classList.add("active");
  showSelectedButton.classList.remove("active");
  calculate();
});

showSelectedButton.addEventListener("click", () => {
  showSelectedOnly = true;
  showSelectedButton.classList.add("active");
  showAllButton.classList.remove("active");
  calculate();
});

document.addEventListener("click", (event) => {
  if (event.target.matches("[data-step]")) {
    const input = event.target.closest(".numeric-control").querySelector(".qty-input");
    input.value = formatNumeric(
      Math.max(0, parseNumeric(input.value) + Number(event.target.dataset.step)),
    );
    calculate();
    return;
  }

  if (!event.target.matches("[data-remove-row]")) return;
  event.target.closest("tr").remove();
  updateRemoveButtons();
  calculate();
});

document.addEventListener("keydown", (event) => {
  if (!event.target.matches("[data-quantity]")) return;
  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;

  event.preventDefault();
  const step = event.key === "ArrowUp" ? 1 : -1;
  event.target.value = formatNumeric(Math.max(0, parseNumeric(event.target.value) + step));
  calculate();
});

document.addEventListener("focusin", (event) => {
  if (
    event.target.matches(".current-score, [data-point], [data-quantity]") &&
    parseNumeric(event.target.value) === 0
  ) {
    event.target.value = "";
  }
});

document.addEventListener("focusout", (event) => {
  if (event.target.matches(".current-score, [data-point], [data-quantity]")) {
    event.target.value = formatNumeric(event.target.value);
    calculate();
  }
});

document.addEventListener("input", calculate);
document.addEventListener("change", calculate);

initialize();
