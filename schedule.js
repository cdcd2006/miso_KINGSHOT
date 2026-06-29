(() => {
  if (!document.querySelector(".schedule-widget")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
        <aside class="schedule-widget">
          <section class="schedule-panel" id="schedulePanel" aria-label="킹샷 일정 달력" aria-hidden="true">
            <header class="schedule-header">
              <div>
                <p>KINGSHOT SCHEDULE</p>
                <h2 id="scheduleTitle">일정 달력</h2>
              </div>
              <button class="schedule-close" type="button" aria-label="달력 닫기">×</button>
            </header>
            <div class="schedule-toolbar">
              <button class="schedule-arrow" type="button" data-schedule-action="prev" aria-label="이전 기간">‹</button>
              <button class="schedule-today" type="button" data-schedule-action="today">현재 이벤트</button>
              <button class="schedule-arrow" type="button" data-schedule-action="next" aria-label="다음 기간">›</button>
              <button class="schedule-view-toggle" type="button" data-schedule-action="toggle">월 전체 보기</button>
            </div>
            <div class="schedule-grid" id="scheduleGrid"></div>
          </section>
          <button class="schedule-launcher" type="button" aria-label="일정 달력 열기" aria-expanded="false" aria-controls="schedulePanel">
            <img src="schedule.png" alt="" />
          </button>
        </aside>
      `,
    );
  }

  const panel = document.querySelector(".schedule-panel");
  const launcher = document.querySelector(".schedule-launcher");
  const closeButton = document.querySelector(".schedule-close");
  const grid = document.querySelector("#scheduleGrid");
  const title = document.querySelector("#scheduleTitle");
  const toggle = document.querySelector('[data-schedule-action="toggle"]');

  if (!panel || !launcher || !closeButton || !grid || !title || !toggle) return;

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const events = {
    "2026-06-01": [
      {
        title: "👑 지고의 영주",
        items: ["순금", "가속", "보석"],
      },
    ],
    "2026-06-02": [
      {
        title: "👑 지고의 영주",
        items: [
          "순금",
          "거장",
          "가속",
          "룰렛",
          "파편",
          "망치",
          "부속품",
          "미스릴",
        ],
      },
      { title: "🔪 야수 처치", items: [] },
      { title: "🚢 바이킹", items: [] },
      { title: "☠️ 사라진 유적", items: [] },
    ],
    "2026-06-03": [
      {
        title: "👑 지고의 영주",
        items: ["펫", "거장", "보석", "룰렛", "파편"],
      },
      { title: "🔪 야수 처치", items: [] },
    ],
    "2026-06-04": [
      {
        title: "👑 지고의 영주",
        items: ["보석", "망치", "부속품", "미스릴", "훈련"],
      },
      { title: "🚢 바이킹", items: [] },
    ],
    "2026-06-05": [
      {
        title: "👑 지고의 영주",
        items: ["망치", "부속품", "미스릴", "순금", "가속"],
      },
    ],
    "2026-06-06": [
      {
        title: "👑 지고의 영주",
        items: ["장비", "훈련"],
      },
      {
        title: "🏰 캐슬전투",
        items: [],
      },
    ],
    "2026-06-07": [
      {
        title: "👑 지고의 영주",
        items: ["펫", "순금", "가속", "장비", "채집", "파편"],
      },
    ],
    "2026-06-08": [
      {
        title: "🦸‍ 연맹총동원",
        items: [],
      },
      {
        title: "🦾 군비 경쟁 1",
        items: ["순금", "장비", "파편", "거장", "가속"],
      },
    ],
    "2026-06-09": [
      {
        title: "🦸‍ 연맹총동원",
        items: [],
      },

      {
        title: "🦾 군비 경쟁 1",
        items: ["순금", "장비", "파편", "거장", "가속"],
      },
    ],
    "2026-06-10": [
      {
        title: "🦸‍ 연맹총동원",
        items: [],
      },
      {
        title: "🎈 초대 이민",
        items: [],
      },
      {
        title: "📄 사관의 계획 1",
        items: ["보석", "망치", "부속품", "미스릴", "훈련"],
      },
    ],
    "2026-06-11": [
      {
        title: "🦸‍ 연맹총동원",
        items: [],
      },
      {
        title: "🎈 초대 이민",
        items: [],
      },
      {
        title: "📄 사관의 계획 1",
        items: ["보석", "망치", "부속품", "미스릴", "훈련"],
      },
    ],
    "2026-06-12": [
      {
        title: "🦸‍ 연맹총동원",
        items: [],
      },
      {
        title: "🎈 자유 이민",
        items: [],
      },
      {
        title: "🦾 군비 경쟁 2",
        items: ["순금", "미스릴", "장비", "망치", "부속품", "가속"],
      },
    ],
    "2026-06-13": [
      {
        title: "🦸‍ 연맹총동원",
        items: [],
      },
      {
        title: "👪 삼대 연맹전",
        items: [],
      },
      {
        title: "🦾 군비 경쟁 2",
        items: ["순금", "미스릴", "장비", "망치", "부속품", "가속"],
      },
    ],
    "2026-06-14": [
      {
        title: "⚔️ 성검 쟁탈",
        items: [],
      },
      {
        title: "📄 사관의 계획 2",
        items: ["장비", "파편", "망치", "부속품"],
      },
    ],
    "2026-06-15": [
      {
        title: "👑 최강 왕국",
        items: ["순금", "가속", "보석", "전망대"],
      },
      {
        title: "📄 사관의 계획 2",
        items: ["장비", "파편", "망치", "부속품"],
      },
    ],
    "2026-06-16": [
      {
        title: "👑 최강 왕국",
        items: ["순금", "거장", "가속", "룰렛", "파편", "채집"],
      },
      { title: "🔪 야수 처치", items: [] },
      { title: "🚢 바이킹", items: [] },
      { title: "☠️ 사라진 유적", items: [] },
    ],
    "2026-06-17": [
      {
        title: "👑 최강 왕국",
        items: ["펫", "거장", "보석", "룰렛", "파편", "전망대"],
      },
      { title: "🔪 야수 처치", items: [] },
    ],
    "2026-06-18": [
      {
        title: "👑 최강 왕국",
        items: ["보석", "망치", "부속품", "미스릴", "훈련", "채집"],
      },
      { title: "🚢 바이킹", items: [] },
    ],
    "2026-06-19": [
      {
        title: "👑 최강 왕국",
        items: [
          "펫",
          "장비",
          "망치",
          "부속품",
          "미스릴",
          "순금",
          "가속",
          "전망대",
          "채집",
        ],
      },
    ],
    "2026-06-20": [
      {
        title: "🏰 서버전",
        items: [],
      },
    ],
    "2026-06-22": [
      {
        title: "🐎 연맹결투",
        items: ["순금", "가속", "채집", "거장"],
      },
      {
        title: "🦾 군비 경쟁 1",
        items: ["순금", "장비", "파편", "거장", "가속"],
      },
    ],
    "2026-06-23": [
      {
        title: "🐎 연맹결투",
        items: ["파편", "순금", "가속", "전망대", "거장"],
      },
      {
        title: "🦾 군비 경쟁 1",
        items: ["순금", "장비", "파편", "거장", "가속"],
      },
      {
        title: "🎣 낚시",
        items: [],
      },
    ],
    "2026-06-24": [
      {
        title: "🐎 연맹결투",
        items: ["보석", "펫", "채집"],
      },
      {
        title: "📄 사관의 계획 1",
        items: ["보석", "망치", "부속품", "미스릴", "훈련"],
      },
      {
        title: "🎣 낚시",
        items: [],
      },
    ],
    "2026-06-25": [
      {
        title: "🐎 연맹결투",
        items: ["보석", "망치", "부속품", "미스릴", "훈련", "전망대"],
      },
      {
        title: "📄 사관의 계획 1",
        items: ["보석", "망치", "부속품", "미스릴", "훈련"],
      },
      {
        title: "🎣 낚시",
        items: [],
      },
    ],
    "2026-06-26": [
      {
        title: "🐎 연맹결투",
        items: ["장비", "순금", "가속", "고기"],
      },
      {
        title: "🦾 군비 경쟁 2",
        items: ["순금", "미스릴", "장비", "망치", "부속품", "가속"],
      },
      {
        title: "💎 해적의 보물 시작",
        items: [],
      },
    ],
    "2026-06-27": [
      {
        title: "🐎 연맹결투",
        items: [
          "장비",
          "보석",
          "망치",
          "부속품",
          "미스릴",
          "파편",
          "펫",
          "순금",
          "가속",
          "고기",
        ],
      },
      {
        title: "🦾 군비 경쟁 2",
        items: ["순금", "미스릴", "장비", "망치", "부속품", "가속"],
      },
      {
        title: "🎭 체사레 시작",
        items: [],
      },
    ],
    "2026-06-28": [
      {
        title: "🐎 연맹결투/21시종료",
        items: [
          "장비",
          "보석",
          "망치",
          "부속품",
          "미스릴",
          "파편",
          "펫",
          "순금",
          "가속",
          "고기",
        ],
      },
      {
        title: "📄 사관의 계획 2",
        items: ["장비", "파편", "망치", "부속품"],
      },
      {
        title: "⚔️ 성검 쟁탈",
        items: [],
      },
    ],
    "2026-06-29": [
      {
        title: "📄 사관의 계획 2",
        items: ["장비", "파편", "망치", "부속품"],
      },
      {
        title: "🎭 체사레 끝",
        items: [],
      },
    ],
    "2026-07-02": [
      {
        title: "💎 해적의 보물 끝",
        items: [],
      },
    ],
  };
  [
    ["2026-06-01", "2026-06-29"],
    ["2026-06-02", "2026-06-30"],
    ["2026-06-03", "2026-07-01"],
    ["2026-06-04", "2026-07-02"],
    ["2026-06-05", "2026-07-03"],
    ["2026-06-06", "2026-07-04"],
    ["2026-06-07", "2026-07-05"],
  ].forEach(([sourceDate, targetDate]) => {
    const copiedEvents = events[sourceDate].map((event) => ({
      ...event,
      items: [...event.items],
    }));
    events[targetDate] = [...copiedEvents, ...(events[targetDate] || [])];
  });

  let cursor = getGameDay();
  let view = "week";

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function getGameDay(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .reduce((result, part) => {
        result[part.type] = Number(part.value);
        return result;
      }, {});
    const gameDay = new Date(parts.year, parts.month - 1, parts.day);
    if (parts.hour < 9) gameDay.setDate(gameDay.getDate() - 1);
    return gameDay;
  }

  function addDays(date, amount) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
  }

  function startOfWeek(date) {
    return addDays(startOfDay(date), -date.getDay());
  }

  function toKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function isSameDay(left, right) {
    return toKey(left) === toKey(right);
  }

  function makeDay(date, outsideMonth = false) {
    const cell = document.createElement("article");
    cell.className = "schedule-day";
    if (outsideMonth) cell.classList.add("is-outside");
    if (isSameDay(date, getGameDay())) cell.classList.add("is-today");
    const dayEvents = events[toKey(date)] || [];
    const itemCounts = dayEvents.reduce((counts, event) => {
      new Set(event.items).forEach((item) => {
        counts.set(item, (counts.get(item) || 0) + 1);
      });
      return counts;
    }, new Map());

    const dateLabel = document.createElement("span");
    dateLabel.className = "schedule-date";
    dateLabel.textContent = `${date.getMonth() + 1}/${date.getDate()} (${dayNames[date.getDay()]})`;
    cell.append(dateLabel);

    dayEvents.forEach((event) => {
      const card = document.createElement("section");
      card.className = "schedule-event";

      const eventTitle = document.createElement("strong");
      eventTitle.className = "schedule-event-title";
      eventTitle.textContent = event.title;
      card.append(eventTitle);

      if (event.items.length) {
        const itemList = document.createElement("div");
        itemList.className = "schedule-event-items";
        event.items.forEach((eventItem) => {
          const item = document.createElement("span");
          item.textContent = eventItem;
          if ((itemCounts.get(eventItem) || 0) > 1) {
            item.classList.add("is-duplicate");
            item.title = "같은 날 다른 이벤트와 겹치는 항목";
          }
          itemList.append(item);
        });
        card.append(itemList);
      }
      cell.append(card);
    });

    return cell;
  }

  function render() {
    grid.replaceChildren();
    grid.classList.toggle("is-month", view === "month");

    dayNames.forEach((name) => {
      const header = document.createElement("div");
      header.className = "schedule-day-name";
      header.textContent = name;
      grid.append(header);
    });

    if (view === "week") {
      const first = startOfWeek(cursor);
      const last = addDays(first, 6);
      title.textContent = `${first.getFullYear()}년 ${first.getMonth() + 1}월 ${first.getDate()}일 - ${last.getMonth() + 1}월 ${last.getDate()}일`;
      for (let index = 0; index < 7; index += 1)
        grid.append(makeDay(addDays(first, index)));
      toggle.textContent = "월 전체 보기";
      return;
    }

    const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const calendarStart = startOfWeek(monthStart);
    title.textContent = `${cursor.getFullYear()}년 ${cursor.getMonth() + 1}월`;
    for (let index = 0; index < 42; index += 1) {
      const date = addDays(calendarStart, index);
      grid.append(makeDay(date, date.getMonth() !== cursor.getMonth()));
    }
    toggle.textContent = "주간 보기";
  }

  function setOpen(open) {
    panel.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", String(!open));
    launcher.setAttribute("aria-expanded", String(open));
    if (open) render();
  }

  launcher.addEventListener("click", () =>
    setOpen(!panel.classList.contains("is-open")),
  );
  closeButton.addEventListener("click", () => setOpen(false));
  document.addEventListener("click", (event) => {
    if (
      panel.classList.contains("is-open") &&
      !panel.contains(event.target) &&
      !launcher.contains(event.target)
    ) {
      setOpen(false);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });

  document.querySelectorAll("[data-schedule-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.scheduleAction;
      if (action === "today") cursor = getGameDay();
      if (action === "prev")
        cursor =
          view === "week"
            ? addDays(cursor, -7)
            : new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
      if (action === "next")
        cursor =
          view === "week"
            ? addDays(cursor, 7)
            : new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      if (action === "toggle") view = view === "week" ? "month" : "week";
      render();
    });
  });
})();
