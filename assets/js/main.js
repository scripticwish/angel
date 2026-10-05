/* ============================================================
   ANGEL TEAM — Interactions
   ============================================================ */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let snowRGB = "245, 248, 250"; // цвет снежинок: белый (тёмная) / голубой (светлая)

  /* ---------- 1. Navbar: transparent → glass on scroll ---------- */
  const nav = document.querySelector(".nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- 2. Mobile burger ---------- */
  const burger = document.querySelector(".burger");
  const menu = document.querySelector(".nav__menu");
  if (burger && menu) {
    burger.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        menu.classList.remove("is-open");
        burger.classList.remove("is-open");
        document.body.style.overflow = "";
      })
    );
  }

  /* ---------- 3. Reveal on scroll (Intersection Observer) ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- 4. Animated counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && !prefersReduced) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const target = parseFloat(el.dataset.count);
          const suffix = el.dataset.suffix || "";
          const dur = 1600;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          cio.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => cio.observe(el));
  }

  /* ---------- 5. Snowfall + frost particles (canvas) ---------- */
  const canvas = document.getElementById("snow");
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d");
    let W, H, flakes = [];
    const COUNT = () => Math.min(90, Math.floor(window.innerWidth / 16));

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    class Flake {
      constructor() {
        this.reset(true);
      }
      reset(init) {
        this.x = Math.random() * W;
        this.y = init ? Math.random() * H : -10;
        this.r = Math.random() * 1.8 + 0.4;
        this.vy = Math.random() * 0.5 + 0.2;
        this.vx = Math.random() * 0.3 - 0.15;
        this.a = Math.random() * 0.5 + 0.15;
        this.tw = Math.random() * Math.PI * 2;
      }
      step() {
        this.y += this.vy;
        this.x += this.vx + Math.sin(this.tw) * 0.2;
        this.tw += 0.01;
        if (this.y > H + 10 || this.x < -20 || this.x > W + 20) this.reset(false);
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + snowRGB + ", " + this.a + ")";
        ctx.fill();
      }
    }

    flakes = Array.from({ length: COUNT() }, () => new Flake());

    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      flakes.forEach((f) => {
        f.step();
        f.draw();
      });
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ============================================================
     UNIQUE ELEMENT 1 — Jump Lab (интерактивная схема прыжков)
     ============================================================ */
  const jumps = {
    toe: { name: "Тулуп", rev: "1 оборот", diff: 1, desc: "Базовый зубцовый прыжок: отталкивание зубцом свободной ноги. С него начинается путь почти каждого фигуриста — именно он учит «собирать» корпус перед вращением." },
    sal: { name: "Сальхов", rev: "1 оборот", diff: 2, desc: "Рёберный прыжок с заходом по дуге назад-внутрь. Первый прыжок, где появляется ощущение «вылета» с дуги и чистой группировки." },
    loop: { name: "Риттбергер", rev: "1 оборот", diff: 3, desc: "Сложный рёберный прыжок без зубца — отталкивание только с ребра. Дисциплинирует стойкость на ребре и контроль оси вращения." },
    flip: { name: "Флип", rev: "2–3 оборота", diff: 4, desc: "Зубцовый прыжок с захода назад-внутрь. Требует точной работы зубца и сильной группировки — маркер перехода на спортивный уровень." },
    lutz: { name: "Лутц", rev: "2–3 оборота", diff: 5, desc: "Прыжок с внешнего ребра — самый «дорогой» по базе. Внешнее ребро на отталкивании — визитная карточка техничной школы." },
    axel: { name: "Аксель", rev: "1,5 оборота", diff: 6, desc: "Единственный прыжок с захода вперёд. Полтора оборота в воздухе — рубеж, отделяющий любителя от спортсмена." },
  };

  const jumpLab = document.querySelector("[data-jump-lab]");
  if (jumpLab) {
    const tabs = jumpLab.querySelectorAll(".jump-tab");
    const name = jumpLab.querySelector("[data-j-name]");
    const rev = jumpLab.querySelector("[data-j-rev]");
    const desc = jumpLab.querySelector("[data-j-desc]");
    const meter = jumpLab.querySelector(".jump-meter__fill");
    const spin = jumpLab.querySelector(".jump-skater .spin");
    const skater = jumpLab.querySelector(".jump-skater svg");

    const render = (key) => {
      const j = jumps[key];
      if (!j) return;
      if (name) name.textContent = j.name;
      if (rev) rev.textContent = j.rev;
      if (desc) desc.textContent = j.desc;
      if (meter) meter.style.width = (j.diff / 6) * 100 + "%";
      if (spin) {
        spin.classList.remove("is-jumping");
        void spin.offsetWidth; // restart animation
        spin.classList.add("is-jumping");
      }
      tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.jump === key));
    };

    tabs.forEach((t) => t.addEventListener("click", () => render(t.dataset.jump)));
    render("axel");
  }

  /* ============================================================
     UNIQUE ELEMENT 2 — Program Finder (подбор программы)
     ============================================================ */
  const finder = document.querySelector("[data-finder]");
  if (finder) {
    const ageRange = finder.querySelector("[data-age]");
    const ageVal = finder.querySelector("[data-age-val]");
    const chips = finder.querySelectorAll(".chip");
    const goalChips = finder.querySelectorAll(".chip[data-goal]");
    const result = finder.querySelector("[data-result]");

    const state = { age: 8, exp: "none", goal: "skill" };

    const paintRange = () => {
      if (!ageRange) return;
      const p = ((ageRange.value - ageRange.min) / (ageRange.max - ageRange.min)) * 100;
      ageRange.style.setProperty("--val", p + "%");
      if (ageVal) ageVal.textContent = ageRange.value + " лет";
    };

    const recommend = () => {
      const { age, exp, goal } = state;
      let out;

      if (age <= 5) {
        out = { tag: "Рекомендуем", title: "Малыши 3–5 лет", desc: "Игровой лёд, первые шаги на коньках и знакомство со скольжением. Занятия 2 раза в неделю в малых группах с ассистентом на льду." };
      } else if (age <= 12) {
        if (exp === "sport" || goal === "sport") {
          out = { tag: "Спортивный трек", title: "Спортивные группы", desc: "Подготовка к разрядам (юношеские, III–II), отработка прыжков и дорожек. Индивидуальный план и сопровождение на соревнованиях." };
        } else {
          out = { tag: "Рекомендуем", title: "Юниоры 6–12 лет", desc: "Системная база: скольжение, вращения, первые прыжки. Переход в спортивную группу — по готовности и рекомендации тренера." };
        }
      } else if (age <= 17) {
        if (goal === "sport" || exp === "sport") {
          out = { tag: "Спортивный трек", title: "Пре-бронза / разряды", desc: "Старшая группа с целью соревновательной карьеры. Отработка технического контента, ОФП и хореография." };
        } else {
          out = { tag: "Рекомендуем", title: "Юниоры / любители", desc: "Продолжение базы с акцентом на технику, выразительность и удовольствие от катания. Гибкий график." };
        }
      } else {
        if (exp === "none") {
          out = { tag: "Рекомендуем", title: "Взрослые с нуля", desc: "Мягкий старт для взрослых: равновесие, скольжение, уверенность на льду. Группы по уровню, без давления." };
        } else {
          out = { tag: "Рекомендуем", title: "Взрослые-любители", desc: "Для тех, кто уже катается: техника, вращения, первые прыжки. Вечерние слоты и комьюнити любителей." };
        }
      }

      if (result) {
        result.classList.remove("is-empty");
        result.innerHTML =
          `<div class="result-card__tag">${out.tag}</div>` +
          `<div class="result-card__title">${out.title}</div>` +
          `<p class="result-card__desc">${out.desc}</p>` +
          `<a href="programs.html" class="btn btn-primary btn-sm mt-2">К программам</a>`;
      }
    };

    if (ageRange) {
      ageRange.addEventListener("input", () => {
        state.age = +ageRange.value;
        paintRange();
        recommend();
      });
    }
    chips.forEach((c) => {
      c.addEventListener("click", () => {
        const group = c.dataset.exp ? "exp" : "goal";
        const siblings = finder.querySelectorAll(`.chip[data-${group}]`);
        siblings.forEach((s) => s.classList.remove("is-active"));
        c.classList.add("is-active");
        state[group] = c.dataset.exp || c.dataset.goal;
        recommend();
      });
    });

    paintRange();
    recommend();
  }

  /* ============================================================
     Theme toggle (тёмная ⇄ светлая)
     ============================================================ */
  const themeToggles = document.querySelectorAll("[data-theme-toggle]");
  const THEME_KEY = "at_theme";

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
    themeToggles.forEach((btn) => btn.setAttribute("aria-pressed", String(theme === "light")));
    snowRGB = theme === "light" ? "150, 185, 230" : "245, 248, 250";
  }

  let currentTheme = "dark";
  try { currentTheme = localStorage.getItem(THEME_KEY) || "dark"; } catch (e) {}
  applyTheme(currentTheme);

  themeToggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentTheme = (document.documentElement.getAttribute("data-theme") === "light") ? "dark" : "light";
      applyTheme(currentTheme);
      try { localStorage.setItem(THEME_KEY, currentTheme); } catch (e) {}
    });
  });

  /* ---------- 6. Accordion / FAQ (event delegation) ---------- */
  document.addEventListener("click", (e) => {
    const q = e.target.closest(".acc-item__q");
    if (!q) return;
    const item = q.closest(".acc-item");
    const a = item.querySelector(".acc-item__a");
    const open = item.classList.toggle("is-open");
    q.setAttribute("aria-expanded", open);
    a.style.maxHeight = open ? a.scrollHeight + "px" : "0";
  });

  /* ---------- 7. Client-side form validation ---------- */
  document.querySelectorAll("form[data-validate]").forEach((form) => {
    const status = form.querySelector(".form-status");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll("[required]").forEach((f) => {
        const field = f.closest(".field") || f.parentElement;
        const invalid = f.type === "email"
          ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim())
          : !f.value.trim();
        field.classList.toggle("has-error", invalid);
        if (invalid) ok = false;
      });

      // Consent checkbox (if present)
      const consent = form.querySelector("[data-consent]");
      if (consent && !consent.checked) {
        consent.closest(".field")?.classList.add("has-error");
        ok = false;
      }

      if (!ok) {
        if (status) {
          status.className = "form-status is-visible bad";
          status.textContent = "Проверьте выделенные поля и отметьте согласие на обработку данных.";
        }
        return;
      }

      // Simulate submit → loading → success
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.dataset.orig = btn.textContent;
        btn.textContent = "Отправляем…";
      }
      if (status) {
        status.className = "form-status is-visible";
        status.textContent = "Отправка…";
      }

      setTimeout(() => {
        if (btn) { btn.textContent = "Заявка отправлена ✓"; btn.disabled = false; }
        if (status) {
          status.className = "form-status is-visible ok";
          status.textContent = "Спасибо! Мы получили заявку и перезвоним в течение рабочего дня.";
        }
        form.reset();
        form.querySelectorAll(".field").forEach((f) => f.classList.remove("has-error"));
        setTimeout(() => {
          if (btn) btn.textContent = btn.dataset.orig;
        }, 4000);
      }, 1100);
    });
  });

  /* ============================================================
     Data store (localStorage) — расписание + блог
     ============================================================ */
  window.AT_STORE = (function () {
    const LS_SCHEDULE = "at_schedule";
    const LS_BLOG = "at_blog";

    const defaultSchedule = [
      { id: 1, day: 1, time: "17:00", name: "Малыши 3–5 лет", level: "kids", venue: "okeanis" },
      { id: 2, day: 1, time: "16:00", name: "Спортивные группы", level: "sport", venue: "okeanis" },
      { id: 3, day: 1, time: "20:00", name: "Взрослые с нуля", level: "adult", venue: "rio" },
      { id: 4, day: 2, time: "17:00", name: "Юниоры 6–12 лет", level: "kids", venue: "okeanis" },
      { id: 5, day: 2, time: "20:00", name: "Взрослые-любители", level: "adult", venue: "rio" },
      { id: 6, day: 3, time: "17:00", name: "Малыши 3–5 лет", level: "kids", venue: "okeanis" },
      { id: 7, day: 3, time: "16:00", name: "Спортивные группы", level: "sport", venue: "okeanis" },
      { id: 8, day: 3, time: "20:00", name: "Взрослые с нуля", level: "adult", venue: "rio" },
      { id: 9, day: 4, time: "17:00", name: "Юниоры 6–12 лет", level: "kids", venue: "okeanis" },
      { id: 10, day: 5, time: "16:00", name: "Спортивные группы", level: "sport", venue: "okeanis" },
      { id: 11, day: 6, time: "09:00", name: "Юниоры / спорт", level: "kids", venue: "okeanis" },
      { id: 12, day: 6, time: "10:00", name: "Малыши 3–5 лет", level: "kids", venue: "rio" },
      { id: 13, day: 6, time: "12:00", name: "Взрослые с нуля", level: "adult", venue: "rio" },
      { id: 14, day: 7, time: "11:00", name: "Взрослые-любители", level: "adult", venue: "okeanis" }
    ];

    const defaultBlog = [
      { id: 1, title: "Внутренний турнир Angel Cup — регистрация открыта", date: "12 мая 2025", category: "Анонс", body: "Приглашаем всех учеников на весенний турнир. Прокаты, награждение и праздничная атмосфера." },
      { id: 2, title: "Как выбрать первые коньки: разбор от тренера", date: "2 мая 2025", category: "Статья тренера", body: "Анна Волкова объясняет, чем отличаются модели и почему нельзя брать коньки «на вырост»." },
      { id: 3, title: "Летние сборы 2025: открываем запись", date: "28 апреля 2025", category: "Анонс", body: "Две смены интенсива — лёд, ОФП, хореография и мастер-классы. Места в группах ограничены." },
      { id: 4, title: "Что делать, если ребёнок боится льда", date: "15 апреля 2025", category: "Совет", body: "Практические советы от детского тренера: как поддержать и не спугнуть желание кататься." },
      { id: 5, title: "Аксель: почему он сложнее, чем кажется", date: "8 апреля 2025", category: "Разбор", body: "Дмитрий Соколов разбирает механику полуторного прыжка и типичные ошибки новичков." },
      { id: 6, title: "Наши ученики — призёры первенства области", date: "1 апреля 2025", category: "Новость", body: "Поздравляем команду Angel Team с медалями! Подводим итоги выездного старта." }
    ];

    function clone(x) { return JSON.parse(JSON.stringify(x)); }
    function read(key, def) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return clone(def);
        const d = JSON.parse(raw);
        return Array.isArray(d) ? d : clone(def);
      } catch (e) { return clone(def); }
    }
    function write(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; } }

    return {
      defaultSchedule: defaultSchedule,
      defaultBlog: defaultBlog,
      getSchedule: function () { return read(LS_SCHEDULE, defaultSchedule); },
      saveSchedule: function (a) { return write(LS_SCHEDULE, a); },
      resetSchedule: function () { write(LS_SCHEDULE, defaultSchedule); return clone(defaultSchedule); },
      getBlog: function () { return read(LS_BLOG, defaultBlog); },
      saveBlog: function (a) { return write(LS_BLOG, a); },
      resetBlog: function () { write(LS_BLOG, defaultBlog); return clone(defaultBlog); },
      nextId: function (a) { return a.reduce(function (m, it) { return Math.max(m, +it.id || 0); }, 0) + 1; }
    };
  })();
})();
