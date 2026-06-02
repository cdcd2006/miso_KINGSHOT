const ORDER_OPTIONS = [
  "랠리1",
  "랠리2",
  "랠리3",
  "랠리4",
  "캐슬",
  "동쪽",
  "서쪽",
  "남쪽",
  "북쪽",
];

const rallyRows = document.querySelector("#rallyRows");
const refuelRows = document.querySelector("#refuelRows");
const utcClock = document.querySelector("#utcClock");
const rallyArrivalTime = document.querySelector("#rallyArrivalTime");
const commonDelayMinutes = document.querySelector("#commonDelayMinutes");
const commonDelaySeconds = document.querySelector("#commonDelaySeconds");
const rallyWaitMinutes = document.querySelector("#rallyWaitMinutes");
let baseInternetTime;
let baseLocalTime;

async function initInternetTime() {
  try {
    const response = await fetch("https://worldtimeapi.org/api/timezone/Etc/UTC");
    if (!response.ok) throw new Error("인터넷 UTC 시간을 불러오지 못했습니다.");
    const data = await response.json();
    baseInternetTime = new Date(data.utc_datetime).getTime();
    baseLocalTime = Date.now();
    calculate();
  } catch {
    // 인터넷 시간 요청이 실패하면 기존 브라우저 시간을 사용합니다.
  }
}

function getCurrentTime() {
  if (baseInternetTime === undefined || baseLocalTime === undefined) {
    return new Date();
  }

  return new Date(baseInternetTime + (Date.now() - baseLocalTime));
}

function makeOrderOptions(selected = ORDER_OPTIONS[0]) {
  return ORDER_OPTIONS.map(
    (option) => `<option ${option === selected ? "selected" : ""}>${option}</option>`,
  ).join("");
}

function makeDurationInputs(prefix, minutes = 0, seconds = 0) {
  return `
    <div class="duration-inputs">
      <input class="duration-input" data-${prefix}-minutes type="number" min="0" step="1" value="${minutes}" aria-label="${prefix} 분">
      <span>분</span>
      <input class="duration-input" data-${prefix}-seconds type="number" min="0" max="59" step="1" value="${seconds}" aria-label="${prefix} 초">
      <span>초</span>
    </div>
  `;
}

function makeRallyRow() {
  return `
    <tr>
      <td><select class="order-select">${makeOrderOptions()}</select></td>
      <td><input class="nickname-input" type="text" placeholder="닉네임"></td>
      <td>${makeDurationInputs("march")}</td>
      <td class="time-result" data-rally-departure>--:--:--</td>
      <td><button class="remove-button" data-remove-row type="button">삭제</button></td>
    </tr>
  `;
}

function makeRefuelRow() {
  return `
    <tr>
      <td><select class="order-select">${makeOrderOptions()}</select></td>
      <td><input class="nickname-input" type="text" placeholder="닉네임"></td>
      <td>${makeDurationInputs("enemy-march")}</td>
      <td>${makeDurationInputs("remaining")}</td>
      <td>${makeDurationInputs("my-march")}</td>
      <td class="time-result" data-enemy-arrival>--:--:--</td>
      <td class="time-result" data-refuel-departure>--:--:--</td>
      <td><button class="pause-button" data-toggle-pause type="button">멈춤</button></td>
      <td><button class="remove-button" data-remove-row type="button">삭제</button></td>
    </tr>
  `;
}

function parseNumber(input) {
  return Math.max(0, Math.floor(Number(input.value) || 0));
}

function readDuration(row, prefix) {
  const minutes = parseNumber(row.querySelector(`[data-${prefix}-minutes]`));
  const seconds = parseNumber(row.querySelector(`[data-${prefix}-seconds]`));
  return minutes * 60 + seconds;
}

function formatUtc(date) {
  return date.toISOString().slice(11, 19);
}

function addSeconds(date, seconds) {
  return new Date(date.getTime() + seconds * 1000);
}

function calculate() {
  const now = getCurrentTime();
  utcClock.textContent = formatUtc(now);
  const rallyItems = Array.from(rallyRows.querySelectorAll("tr"));
  const delay = parseNumber(commonDelayMinutes) * 60 + parseNumber(commonDelaySeconds);
  const rallyWait = parseNumber(rallyWaitMinutes) * 60;
  const marchDurations = rallyItems.map((row) => readDuration(row, "march"));
  const maxDuration = Math.max(0, ...marchDurations);
  const displayedArrival = addSeconds(now, delay + rallyWait + maxDuration);
  rallyArrivalTime.textContent = formatUtc(displayedArrival);

  rallyItems.forEach((row, index) => {
    row.querySelector("[data-rally-departure]").textContent = formatUtc(
      addSeconds(displayedArrival, -rallyWait - marchDurations[index]),
    );
  });

  Array.from(refuelRows.querySelectorAll("tr")).forEach((row) => {
    if (row.dataset.paused === "true") return;
    const enemyArrival = addSeconds(
      now,
      readDuration(row, "remaining") + readDuration(row, "enemy-march"),
    );
    const myDeparture = addSeconds(enemyArrival, -readDuration(row, "my-march"));
    row.querySelector("[data-enemy-arrival]").textContent = formatUtc(enemyArrival);
    row.querySelector("[data-refuel-departure]").textContent = formatUtc(myDeparture);
  });
}

function addRows(container, template, count = 1) {
  container.insertAdjacentHTML("beforeend", Array.from({ length: count }, template).join(""));
  calculate();
}

function resetRows(container, template) {
  container.innerHTML = "";
  addRows(container, template, 3);
}

document.querySelector("#addRallyButton").addEventListener("click", () => {
  addRows(rallyRows, makeRallyRow);
});

document.querySelector("#addRefuelButton").addEventListener("click", () => {
  addRows(refuelRows, makeRefuelRow);
});

document.querySelector("#resetRallyButton").addEventListener("click", () => {
  commonDelayMinutes.value = "0";
  commonDelaySeconds.value = "0";
  rallyWaitMinutes.value = "0";
  resetRows(rallyRows, makeRallyRow);
});

document.querySelector("#resetRefuelButton").addEventListener("click", () => {
  resetRows(refuelRows, makeRefuelRow);
});

document.addEventListener("click", (event) => {
  if (event.target.matches("[data-toggle-pause]")) {
    const row = event.target.closest("tr");
    const isPaused = row.dataset.paused === "true";
    if (!isPaused) calculate();
    row.dataset.paused = String(!isPaused);
    row.classList.toggle("is-paused", !isPaused);
    event.target.textContent = isPaused ? "멈춤" : "재개";
    if (isPaused) calculate();
    return;
  }

  if (event.target.matches("[data-remove-row]")) {
    const tbody = event.target.closest("tbody");
    if (tbody.querySelectorAll("tr").length > 1) {
      event.target.closest("tr").remove();
      calculate();
    }
  }
});

document.addEventListener("focusin", (event) => {
  if (event.target.matches('input[type="number"]') && event.target.value === "0") {
    event.target.value = "";
  }
});

document.addEventListener("input", calculate);
document.addEventListener("change", calculate);

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Local files may not receive clipboard permission.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

document.querySelector("#copyRallyButton").addEventListener("click", async () => {
  calculate();
  const text = Array.from(rallyRows.querySelectorAll("tr"))
    .map((row) => {
      const nickname = row.querySelector(".nickname-input").value.trim() || "닉네임 없음";
      const departure = row.querySelector("[data-rally-departure]").textContent;
      return `${nickname} 👉 UTC ${departure} 출발`;
    })
    .join("\n");

  await copyText(text);
  const button = document.querySelector("#copyRallyButton");
  button.textContent = "복사 완료";
  setTimeout(() => {
    button.textContent = "출발 시간 복사";
  }, 1200);
});

addRows(rallyRows, makeRallyRow, 3);
addRows(refuelRows, makeRefuelRow, 3);
initInternetTime();
setInterval(calculate, 1000);
