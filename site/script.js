(function () {
  "use strict";

  let checkingSession = false;
  const sessionNotice = document.createElement("p");
  sessionNotice.setAttribute("role", "status");
  sessionNotice.textContent = "Не удалось проверить сеанс. Ожидаем соединения с сервером.";
  sessionNotice.hidden = true;

  async function checkSession() {
    if (checkingSession || document.hidden) return;
    checkingSession = true;
    try {
      const response = await fetch("/session", {
        cache: "no-store",
        signal: AbortSignal.timeout(5000)
      });
      if (response.status === 401) {
        document.body.hidden = true;
        window.location.replace("/?session-ended");
        return;
      }
      if (response.status !== 204) throw new Error("Session check failed");
      document.querySelector("main").hidden = false;
      sessionNotice.hidden = true;
    } catch {
      document.querySelector("main").hidden = true;
      sessionNotice.hidden = false;
    } finally {
      checkingSession = false;
    }
  }

  if (location.protocol === "http:" || location.protocol === "https:") {
    document.querySelector("main").before(sessionNotice);
    window.addEventListener("pageshow", checkSession);
    document.addEventListener("visibilitychange", checkSession);
    window.setInterval(checkSession, 5000);
  }

  // Номера и диапазоны относятся к исходным номерам вопросов каждого теста.
  const TOPICS = {
    "400": [
      ["Тема 2.2 Топографическая анатомия надплечья",
        "7 14 21 23 26 30 34 36 47 50 62 63 69 77 79 86 93 97 106 129 133 137 140 147 153 161 181 189 190 196 203 204 207 215 225 245 249 253 265 273 274 285 287 293 297 314 321 334 339 352 363 379 381 382"],
      ["Тема 2.3 Топографическая анатомия плеча, локтевого сустава, предплечья",
        "12 29 39 40 64 66 84 109 121 124 127 169 184 208 214 218 223 233 248 266 270 294 306 310 323 329 336 373 374 384"],
      ["Тема 2.4 Топографическая анатомия кисти, гнойные заболевания кисти",
        "6 8 11 20 22 43 45 49 56 58 76 88 96 105 110 131 136 145 152 160 173 180 183 188 209 224 229 231 246 251 258 263 268 269 272 289 307 319 344 346 355 358 371 372 383"],
      ["Тема 2.5 Топографическая анатомия ягодичной области и бедра",
        "1 3 4 25 27 28 41 44 48 52 55 67 70 72 74 85 91 94 95 101 108 112 114 115 118 125 138 139 141 144 146 148 151 155 162 165 166 167 176 179 186 195 197 210 211 213 219 221 228 250 255 267 276 290 292 295 296 298 301 302 312 317 320 322 324 332 333 337 342 348 349 353 359 361 362 365 375 378 386 387"],
      ["Тема 2.6 Топографическая анатомия колена, голени, стопы",
        "32 37 38 42 46 51 53 59 61 68 71 73 75 78 81 83 90 92 107 111 116 119 122 134 135 149 150 157 168 171 177 178 182 194 199 202 206 216 217 220 230 232 235 236 239 243 244 254 259 264 275 277 278 280 283 284 286 300 303 304 305 308 311 316 326 327 330 335 338 345 347 356 357 364 366 367 368 369 376 377 380 385"],
      ["Тема 2.7 Операции на сосудах, нервах и сухожилиях конечностей",
        "19 24 60 65 80 87 89 99 102 103 113 128 132 156 158 159 164 170 172 185 191 193 205 212 227 237 240 242 247 261 262 271 282 291 299 325 331 350 370"],
      ["Тема 2.8 Операции на костях и суставах. Ампутации и экзартикуляции конечностей",
        "2 5 9 10 13 15 16 17 18 31 33 35 54 57 82 98 100 104 117 120 123 126 130 142 143 154 163 174 175 187 192 198 200 201 222 226 234 238 241 252 256 257 260 279 281 288 309 313 315 318 328 340 341 343 351 354 360"]
    ],
    "600": [
      ["Тема 2.10 Топографическая анатомия и оперативная хирургия мозгового отдела головы",
        "18-81"],
      ["Тема 2.11 Топографическая анатомия лицевого отдела головы",
        "1-17 82"],
      ["Тема 2.12 Топографическая анатомия шеи",
        "84-85 88-245"],
      ["Тема 2.13 Оперативная хирургия шеи",
        "83 86-87 246-270"],
      ["Тема 2.14 Топографическая анатомия и оперативная хирургия грудной стенки, плевры и легких",
        "271-573"]
    ],
    "800": [
      ["Тема 2.16 Топографическая анатомия передней брюшной стенки",
        "5 7 29-33 37-40 50"],
      ["Тема 2.17 Паховый канал. Грыжесечения",
        "1-4 6 8-28 34-36 41-49 51-73"],
      ["Тема 2.18 Топографическая анатомия брюшной полости",
        "147-150 159-174 179"],
      ["Тема 2.20 Топографическая анатомия желудка",
        "137-146 196-200"],
      ["Тема 2.21 Оперативная хирургия желудка",
        "74-75 109-112 213 243-253 260-266 277-297"],
      ["Тема 2.22 Топографическая анатомия тонкого кишечника",
        "129-134 189-195 201-205 216"],
      ["Тема 2.23 Топографическая анатомия толстого кишечника",
        "97-108 121-127 135-136 237-239"],
      ["Тема 2.24 Операции на тонком и толстом кишечнике",
        "76 78-82 87 93-96 113-120 217-231 254-257 267-276"],
      ["Тема 2.25 Топографическая анатомия печени, желчного пузыря и желчных путей",
        "151-158 175-178 180-186"],
      ["Тема 2.26 Операции на печени, желчном пузыре и желчных путях",
        "77 83-86 88-92 232-235 240-242 298-305"],
      ["Тема 2.27 Топографическая анатомия поджелудочной железы, селезенки. Операции на них",
        "187-188 206-212 214-215"],
      ["Тема 2.28 Топографическая анатомия и оперативная хирургия поясничного области и забрюшинного пространства",
        "128 236 306-316 321-332 343 353-500"],
      ["Тема 2.29 Топографическая анатомия малого таза и промежности",
        "318 335 337 340 342 344-345 348 350-352 501-737 739-742"],
      ["Тема 2.30 Операции на органах малого таза и промежности",
        "317 319-320 333-334 336 338-339 341 346-347 349 738 743-793"],
      ["Тема 2.31 Топографическая анатомия и оперативная хирургия позвоночника и спинного мозга.",
        ""]
    ]
  };

  const $ = (sel) => document.querySelector(sel);
  const HOME_TITLE = "Тесты по медицине";
  const LS_KEY = "tna_progress_v1";

  function getProgress() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; }
  }
  function saveProgress(p) { localStorage.setItem(LS_KEY, JSON.stringify(p)); }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---------- Темы ----------
  function classifyQuestions(testKey, questions) {
    const topics = TOPICS[testKey].map(([name]) => [name, []]);
    const questionsByNumber = new Map(questions.map(q => [q.number, q]));

    TOPICS[testKey].forEach(([, numbers], index) => {
      for (const range of numbers.split(" ").filter(Boolean)) {
        const [first, last = first] = range.split("-").map(Number);
        for (let number = first; number <= last; number++) {
          const question = questionsByNumber.get(number);
          if (question) topics[index][1].push(question);
        }
      }
    });

    return topics;
  }

  // ---------- Состояние ----------
  const state = {
    screen: "home",
    currentTest: null,
    currentTopic: null,
    questions: [],
    fullQuizQuestions: [],
    reviewingMistakes: false,
    completedCount: 0,
    index: 0,
    answers: [],
    userAnswers: [],
  };

  // ---------- Главное меню ----------
  function renderHome() {
    const menu = $("#testsMenu");
    menu.innerHTML = "";
    const data = window.DATA || {};

    const tests = [
      { key: "100", title: "Тест 100", count: data.test100?.questions?.length || 0 },
      { key: "400", title: data.test400?.title || "Тест 400", count: data.test400?.questions?.length || 0 },
      { key: "600", title: data.test600?.title || "Тест 600", count: data.test600?.questions?.length || 0 },
      { key: "800", title: data.test800?.title || "Тест 800", count: data.test800?.questions?.length || 0 },
    ];

    tests.forEach(t => {
      const card = document.createElement("button");
      card.className = "menu-card";
      card.innerHTML = `<span class="card-title">${t.title}</span><span class="meta">${t.count} вопросов</span>`;
      card.onclick = () => openTest(t.key);
      menu.appendChild(card);
    });

    const patfiz = data.testpatfiz;
    const patfizCount = patfiz.topics.reduce((sum, topic) => sum + topic.questions.length, 0);
    const patfizCard = document.createElement("button");
    patfizCard.className = "menu-card review";
    patfizCard.innerHTML = `<span class="card-title">Открыть темы</span><span class="meta">${patfiz.topics.length} тем · ${patfizCount} вопросов</span>`;
    patfizCard.onclick = () => openTest("patfiz");
    $("#patfizMenu").replaceChildren(patfizCard);

    const progress = getProgress();
    const done = Object.keys(progress).length;
    const total = tests.reduce((s, t) => s + t.count, patfizCount);
    $("#homeStats").innerHTML = `
      <div class="stat-box"><div class="num">${total}</div><div class="lbl">Всего вопросов</div></div>
      <div class="stat-box"><div class="num">${done}</div><div class="lbl">Пройдено тестов</div></div>
    `;
  }

  // ---------- Открытие теста ----------
  function openTest(testKey) {
    state.currentTest = testKey;
    const data = window.DATA || {};

    if (testKey === "100") {
      const qs = data.test100?.questions || [];
      if (!qs.length) return alert("Нет данных для теста 100");
      startQuiz(qs, "Тест 100");
      return;
    }

    if (testKey === "patfiz") {
      renderPatfizTopics(data.testpatfiz);
      return;
    }

    const test = data["test" + testKey];
    if (!test || !test.questions || !test.questions.length) {
      return alert("Нет данных для теста " + testKey);
    }

    const topics = classifyQuestions(testKey, test.questions);
    const review = { title: "Обзорное занятие", questions: test.questions };

    const menu = $("#topicsMenu");
    menu.innerHTML = "";
    menu.className = "menu-grid";
    $("#topicsSubtitle").textContent = "Выберите тему или пройдите все вопросы";

    // обзор
    const reviewCard = document.createElement("button");
    reviewCard.className = "menu-card review";
    reviewCard.innerHTML = `<span class="card-title">${review.title}</span><span class="meta">Все темы · ${review.questions.length} вопросов</span>`;
    reviewCard.onclick = () => startQuiz(review.questions, review.title);
    $("#topicsReview").replaceChildren(reviewCard);

    // темы
    topics.forEach(([name, qs]) => {
      const card = document.createElement("button");
      card.className = "menu-card";
      card.innerHTML = `<span class="card-title">${name}</span><span class="meta">${qs.length} вопросов</span>`;
      card.disabled = qs.length === 0;
      card.onclick = () => startQuiz(qs, name);
      menu.appendChild(card);
    });

    showScreen("topics");
    setTitle(test.title);
    showBack(true);
    showProgress(false);
  }

  function renderPatfizTopics(test) {
    const menu = $("#topicsMenu");
    menu.replaceChildren();
    menu.className = "";
    $("#topicsReview").replaceChildren();
    $("#topicsSubtitle").textContent = "Выберите тему";

    const filter = document.createElement("input");
    filter.type = "search";
    filter.className = "text-input topic-search";
    filter.placeholder = "Поиск по темам";
    filter.setAttribute("aria-label", filter.placeholder);
    const status = document.createElement("p");
    status.textContent = "Темы не найдены.";
    status.setAttribute("role", "status");
    status.hidden = true;
    menu.append(filter, status);

    const groups = new Map();
    for (const topic of test.topics) {
      if (!groups.has(topic.group)) {
        const section = document.createElement("section");
        section.className = "topic-group";
        const heading = document.createElement("h2");
        heading.className = "subtitle";
        heading.textContent = topic.group;
        const grid = document.createElement("div");
        grid.className = "menu-grid";
        section.append(heading, grid);
        menu.append(section);
        groups.set(topic.group, { section, grid });
      }
      const card = document.createElement("button");
      card.className = "menu-card";
      const title = document.createElement("span");
      title.className = "card-title";
      title.textContent = topic.title;
      const meta = document.createElement("span");
      meta.className = "meta";
      meta.textContent = `${topic.questions.length} вопросов`;
      card.append(title, meta);
      card.onclick = () => startQuiz(topic.questions, topic.title);
      groups.get(topic.group).grid.append(card);
    }
    const source = document.createElement("p");
    source.className = "subtitle topic-source";
    source.textContent = "Источник: М. В. Осиков и соавторы. Тестовые задания к практическим занятиям по патофизиологии. ЮУГМУ, 2021.";
    menu.append(source);

    filter.oninput = () => {
      const query = filter.value.trim().toLocaleLowerCase("ru").replaceAll("ё", "е");
      for (const { section, grid } of groups.values()) {
        for (const card of grid.children) {
          const title = card.querySelector(".card-title").textContent.toLocaleLowerCase("ru").replaceAll("ё", "е");
          card.hidden = !title.includes(query);
        }
        section.hidden = !grid.querySelector("button:not([hidden])");
      }
      status.hidden = [...groups.values()].some(({ section }) => !section.hidden);
    };

    showScreen("topics");
    setTitle(test.title);
    showBack(true);
    showProgress(false);
  }

  // ---------- Запуск квиза ----------
  function startQuiz(questions, topicName, reviewingMistakes = false) {
    if (!reviewingMistakes) state.fullQuizQuestions = questions;
    state.reviewingMistakes = reviewingMistakes;
    state.currentTopic = topicName;
    // перемешиваем вопросы
    let qs = shuffle(questions).map(q => ({ ...q }));
    // перемешиваем варианты для одиночных/множественных, но НЕ для ordering
    qs = qs.map(q => {
      if (q.type === "ordering" || q.type === "fill" || q.type === "practice") return q;
      const positions = shuffle(q.options.map((_, index) => index + 1));
      return {
        ...q,
        type: q.type ?? (q.answer_numbers.length > 1 ? "multiple" : "single"),
        options: positions.map(position => q.options[position - 1]),
        answer_numbers: q.answer_numbers.map(number => positions.indexOf(number) + 1)
      };
    });
    state.questions = qs;
    state.index = 0;
    state.completedCount = 0;
    state.answers = [];
    state.userAnswers = [];
    showScreen("quiz");
    setTitle(reviewingMistakes ? "Работа над ошибками" : topicName);
    showBack(true);
    showProgress(true);
    renderQuestion();
  }

  // ---------- Рендер вопроса ----------
  function renderQuestion() {
    const q = state.questions[state.index];
    if (!q) return finishQuiz();

    $("#qNumber").textContent = `Вопрос ${state.index + 1} из ${state.questions.length} · №${q.number}`;
    $("#qText").textContent = q.question;
    const hints = {
      ordering: "Расположите варианты по порядку",
      multiple: "Выберите все верные варианты",
      fill: "Заполните пропуски",
      practice: "Задание для самопроверки. Оно не входит в итоговый балл.",
      single: "Выберите один вариант"
    };
    $("#qHint").textContent = hints[q.type];
    const images = $("#qImages");
    images.replaceChildren();
    (q.images || []).forEach((src, i) => {
      const figure = document.createElement("img");
      figure.src = src;
      figure.alt = `Иллюстрация ${i + 1} к заданию, страница ${q.page}`;
      images.append(figure);
    });
    images.hidden = !images.childElementCount;
    $("#prevQuestionBtn").classList.toggle("hidden", state.index === 0);
    $("#nextBtn").textContent = state.index === state.questions.length - 1
      ? "Завершить тест" : "Далее →";
    $("#qFeedback").className = "q-feedback hidden";
    $("#qFeedback").textContent = "";
    $("#answerBtn").classList.remove("hidden");
    $("#answerBtn").disabled = false;
    $("#nextBtn").classList.add("hidden");

    const box = $("#qOptions");
    box.innerHTML = "";

    if (q.type === "practice") {
      const list = document.createElement("ol");
      for (const option of q.options || []) {
        const item = document.createElement("li");
        item.textContent = option;
        list.append(item);
      }
      if (list.childElementCount) box.append(list);
      $("#answerBtn").classList.add("hidden");
      $("#nextBtn").classList.remove("hidden");
    } else if (q.type === "fill") renderFill(q, box);
    else if (q.type === "ordering") renderOrdering(q, box);
    else if (q.type === "multiple") renderMultiple(q, box);
    else renderSingle(q, box);

    const submitted = state.answers[state.index];
    if (typeof submitted === "boolean") showFeedback(q, submitted);
    updateProgressBar();
  }

  function renderFill(q, box) {
    const text = $("#qText");
    text.replaceChildren();
    const parts = q.question.split("____");
    const fields = q.answers.map((_, i) => {
      const label = document.createElement("label");
      const count = q.answers.length;
      const labelText = count === 1 ? "Ответ" : `Пропуск ${i + 1}`;
      label.textContent = labelText;
      const field = document.createElement("input");
      field.type = "text";
      field.className = "text-input";
      field.autocomplete = "off";
      field.spellcheck = false;
      field.required = true;
      label.append(field);
      box.append(label);
      return field;
    });
    parts.forEach((part, i) => {
      text.append(part);
      if (i < fields.length) {
        const blank = document.createElement("span");
        blank.className = "blank";
        blank.textContent = `[${i + 1}]`;
        text.append(blank);
      }
    });
    const draft = state.userAnswers[state.index] || [];
    fields.forEach((field, i) => {
      field.value = draft[i] ?? "";
      field.oninput = () => {
        state.userAnswers[state.index] = fields.map(input => input.value);
      };
      field.onkeydown = event => {
        if (event.key !== "Enter" || event.isComposing) return;
        event.preventDefault();
        if (i + 1 < fields.length) fields[i + 1].focus();
        else answerQuestion();
      };
    });
  }

  function normalizeAnswer(text) {
    return text.normalize("NFKC").toLocaleLowerCase("ru").replaceAll("ё", "е")
      .replace(/[‐‑−–—]/g, "-").replace(/(\d)\.(?=\d)/g, "$1,")
      .replace(/\s*([.,()<>+%-])\s*/g, "$1").replace(/\s+/g, " ")
      .trim().replace(/[.,;]+$/, "");
  }

  function answerFill(q) {
    const fields = [...$("#qOptions").querySelectorAll("input")];
    const empty = fields.find(field => !field.value.trim());
    if (empty) {
      empty.reportValidity();
      empty.focus();
      return;
    }
    const user = fields.map(field => field.value);
    state.userAnswers[state.index] = user;
    submitAnswer(q, user.every((value, i) => matchesFillAnswer(value, q.answers[i])));
  }

  function matchesFillAnswer(value, expected) {
    return expected.split("|").map(normalizeAnswer).includes(normalizeAnswer(value));
  }

  function renderSingle(q, box) {
    q.options.forEach((opt, i) => {
      const el = document.createElement("button");
      el.className = "option";
      el.dataset.idx = i;
      el.innerHTML = `<span class="marker">${i + 1}</span><span class="text"></span>`;
      el.querySelector(".text").textContent = opt;
      el.classList.toggle("selected", state.userAnswers[state.index]?.includes(i + 1) ?? false);
      el.onclick = () => {
        if (el.classList.contains("disabled")) return;
        box.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
        el.classList.add("selected");
        state.userAnswers[state.index] = [i + 1];
      };
      box.appendChild(el);
    });
  }

  function renderMultiple(q, box) {
    q.options.forEach((opt, i) => {
      const el = document.createElement("button");
      el.className = "option";
      el.dataset.idx = i;
      el.innerHTML = `<span class="marker">${i + 1}</span><span class="text"></span>`;
      el.querySelector(".text").textContent = opt;
      el.classList.toggle("selected", state.userAnswers[state.index]?.includes(i + 1) ?? false);
      el.onclick = () => {
        if (el.classList.contains("disabled")) return;
        el.classList.toggle("selected");
        const selected = [...box.querySelectorAll(".option.selected")].map(o => +o.dataset.idx + 1);
        state.userAnswers[state.index] = selected;
      };
      box.appendChild(el);
    });
  }

  function renderOrdering(q, box) {
    const items = q.options.map((opt, i) => ({ opt, orig: i + 1 }));
    const savedOrder = state.userAnswers[state.index];
    const current = savedOrder ? savedOrder.map(number => items[number - 1]) : items;

    const list = document.createElement("div");
    list.className = "ordering-list";
    box.appendChild(list);

    function renderList() {
      list.innerHTML = "";
      current.forEach((item, idx) => {
        const row = document.createElement("div");
        row.className = "order-item";
        row.innerHTML = `
          <div class="pos">${idx + 1}</div>
          <div class="text">${item.opt}</div>
          <div class="order-controls">
            <button data-dir="up" ${idx === 0 ? "disabled" : ""}>↑</button>
            <button data-dir="down" ${idx === current.length - 1 ? "disabled" : ""}>↓</button>
          </div>`;
        row.querySelector('[data-dir="up"]').onclick = () => {
          if (idx === 0) return;
          [current[idx - 1], current[idx]] = [current[idx], current[idx - 1]];
          renderList();
        };
        row.querySelector('[data-dir="down"]').onclick = () => {
          if (idx === current.length - 1) return;
          [current[idx + 1], current[idx]] = [current[idx], current[idx + 1]];
          renderList();
        };
        list.appendChild(row);
      });
      state.userAnswers[state.index] = current.map(it => it.orig);
    }
    renderList();
  }

  // ---------- Ответ ----------
  function answerQuestion() {
    const q = state.questions[state.index];
    const user = state.userAnswers[state.index] || [];

    if (state.answers[state.index] !== undefined || q.type === "practice") return;
    if (q.type === "fill") return answerFill(q);

    if (q.type === "ordering") {
      if (!user.length) return alert("Расставьте все элементы по порядку");
    } else {
      if (!user.length) return alert("Выберите вариант(ы) ответа");
    }

    const correct = q.correct_order || q.answer_numbers || [];
    let isCorrect = false;

    if (q.type === "ordering") {
      isCorrect = user.length === correct.length && user.every((v, i) => v === correct[i]);
    } else if (q.type === "multiple") {
      const a = user.slice().sort();
      const b = correct.slice().sort();
      isCorrect = a.length === b.length && a.every((v, i) => v === b[i]);
    } else {
      isCorrect = user.length === 1 && correct.includes(user[0]);
    }

    submitAnswer(q, isCorrect);
  }

  function submitAnswer(q, isCorrect) {
    state.answers[state.index] = isCorrect;
    state.completedCount++;
    showFeedback(q, isCorrect);
    updateProgressBar();
  }

  function showFeedback(q, isCorrect) {
    const box = $("#qOptions");
    const user = state.userAnswers[state.index];
    const correct = q.correct_order || q.answer_numbers || [];
    let expectedText = correct.map(n => `№${n}`).join(", ");

    if (q.type === "fill") {
      box.querySelectorAll("input").forEach((field, i) => {
        field.disabled = true;
        field.classList.add(matchesFillAnswer(user[i], q.answers[i]) ? "correct" : "wrong");
      });
      expectedText = q.answers.map(answer => answer.split("|")[0]).join(" · ");
    } else if (q.type === "ordering") {
      const rows = box.querySelectorAll(".order-item");
      rows.forEach((row, i) => {
        row.querySelectorAll("button").forEach(button => { button.disabled = true; });
        const isRight = user[i] === correct[i];
        row.classList.add(isRight ? "correct" : "wrong");
      });
    } else {
      box.querySelectorAll(".option").forEach(el => {
        const num = +el.dataset.idx + 1;
        el.disabled = true;
        el.classList.add("disabled");
        const wasSelected = user.includes(num);
        const isRight = correct.includes(num);
        if (isRight) el.classList.add("correct");
        else if (wasSelected) el.classList.add("wrong");
      });
    }

    const fb = $("#qFeedback");
    if (isCorrect) {
      fb.className = "q-feedback ok";
      fb.textContent = "✅ Верно!";
    } else {
      fb.className = "q-feedback bad";
      fb.textContent = `❌ Неверно. Правильный ответ: ${expectedText}`;
    }
    fb.classList.remove("hidden");

    $("#answerBtn").classList.add("hidden");
    $("#nextBtn").classList.remove("hidden");
  }

  function nextQuestion() {
    const q = state.questions[state.index];
    if (state.answers[state.index] === undefined) {
      if (q.type !== "practice") return;
      state.answers[state.index] = null;
      state.completedCount++;
    }

    state.index++;
    if (state.index >= state.questions.length) finishQuiz();
    else renderQuestion();
  }

  // ---------- Прогресс ----------
  function updateProgressBar() {
    const total = state.questions.length;
    const done = state.completedCount;
    const pct = total ? Math.round((done / total) * 100) : 0;
    $("#progressFill").style.width = pct + "%";
    $("#progressText").textContent = `${done} / ${total}`;
  }

  // ---------- Завершение ----------
  function finishQuiz() {
    const total = state.questions.filter(q => q.type !== "practice").length;
    const correct = state.answers.filter(x => x === true).length;
    const pct = total ? Math.round((correct / total) * 100) : 0;

    const scoreEl = $("#resultScore");
    scoreEl.textContent = total ? `${correct} / ${total} (${pct}%)` : "Пройдено";
    scoreEl.className = "result-score " + (pct >= 70 ? "good" : pct >= 40 ? "mid" : "bad");
    $("#resultDetail").textContent = state.reviewingMistakes
      ? `Работа над ошибками · ${state.currentTopic}` : state.currentTopic;

    const mistakes = state.questions.filter((_, index) => state.answers[index] === false);
    const retryMistakes = $("#retryMistakesBtn");
    retryMistakes.classList.toggle("hidden", mistakes.length === 0);
    retryMistakes.textContent = `Повторить ошибки (${mistakes.length})`;
    retryMistakes.onclick = () => startQuiz(mistakes, state.currentTopic, true);

    if (!state.reviewingMistakes) {
      const p = getProgress();
      const key = `${state.currentTest}::${state.currentTopic}`;
      p[key] = { correct, total, pct, date: Date.now() };
      saveProgress(p);
    }

    showScreen("result");
    showBack(true);
    showProgress(false);
    setTitle("Результат");
  }

  // ---------- Навигация ----------
  function showScreen(name) {
    state.screen = name;
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const el = document.getElementById("screen-" + name);
    if (el) el.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setTitle(text) { $("#pageTitle").textContent = text; }
  function showBack(v) { $("#backBtn").classList.toggle("hidden", !v); }
  function showProgress(v) { $("#progressWrap").classList.toggle("hidden", !v); }

  function goBack() {
    if (state.screen === "quiz" || state.screen === "result") {
      if (state.currentTest === "100") {
        renderHome(); showScreen("home"); setTitle(HOME_TITLE); showBack(false); showProgress(false);
      } else {
        openTest(state.currentTest);
      }
    } else {
      renderHome(); showScreen("home"); setTitle(HOME_TITLE); showBack(false); showProgress(false);
    }
  }

  // ---------- Инициализация ----------
  function init() {
    renderHome();
    showScreen("home");
    showBack(false);
    showProgress(false);

    $("#backBtn").onclick = goBack;
    $("#answerBtn").onclick = answerQuestion;
    $("#nextBtn").onclick = nextQuestion;
    $("#prevQuestionBtn").onclick = () => {
      if (state.index === 0) return;
      state.index--;
      renderQuestion();
    };
    $("#retryBtn").onclick = () => startQuiz(state.fullQuizQuestions, state.currentTopic);
    $("#toHomeBtn").onclick = () => {
      renderHome(); showScreen("home"); setTitle(HOME_TITLE); showBack(false); showProgress(false);
    };
    $("#resetProgress").onclick = () => {
      if (confirm("Сбросить весь прогресс?")) {
        localStorage.removeItem(LS_KEY);
        renderHome();
      }
    };
  }

  document.addEventListener("DOMContentLoaded", init);
})();
