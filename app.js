"use strict";
const $ = (s, scope = document) => scope.querySelector(s);
const $$ = (s, scope = document) => [...scope.querySelectorAll(s)];
const icon = (name) =>
  `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
// 1. Exploração das camadas: textos e desenho SVG.
const layers = [
  [
    "Vegetação",
    "Plantas selecionadas para o clima local. Elas sombreiam a cobertura e participam da evapotranspiração: a água evapora do substrato e é liberada pelas plantas.",
  ],
  [
    "Substrato",
    "Meio de cultivo que sustenta as raízes e disponibiliza água e nutrientes. Sua composição e espessura devem ser compatíveis com as espécies e com a carga prevista.",
  ],
  [
    "Manta filtrante",
    "Separa o substrato da drenagem, permitindo a passagem da água e reduzindo o transporte de partículas que poderiam obstruir o sistema.",
  ],
  [
    "Drenagem",
    "Conduz o excesso de água até os pontos de saída. Conforme o sistema, também pode conter espaços para armazenamento temporário de água.",
  ],
  [
    "Impermeabilização",
    "Impede que a água alcance o interior da edificação. A proteção contra raízes e outras camadas de proteção precisam ser previstas conforme o sistema adotado.",
  ],
  [
    "Estrutura",
    "É a base que suporta todo o conjunto. A avaliação profissional deve considerar o peso do sistema saturado de água e as demais cargas previstas.",
  ],
];
$("#layer-buttons").innerHTML = layers
  .map(
    (l, i) =>
      `<button class="layer-button" data-layer="${i}" aria-pressed="${i === 0}"><span class="number">0${i + 1}</span>${l[0]}<span class="chevron" aria-hidden="true">›</span></button>`,
  )
  .join("");

function roofDiagram() {
  const specs = [
    { y: 25, h: 20, top: "#88a34f", left: "#62813d", right: "#496837" },
    { y: 117, h: 34, top: "#9c7a51", left: "#806041", right: "#674c35" },
    { y: 215, h: 7, top: "#e1e0d1", left: "#bbbdb0", right: "#a2a797" },
    { y: 290, h: 19, top: "#3f5146", left: "#263b30", right: "#1f3329" },
    { y: 380, h: 8, top: "#596760", left: "#3a4c43", right: "#2e4238" },
    { y: 464, h: 36, top: "#d2d2c1", left: "#b5b7a6", right: "#9caa96" },
  ];
  const diamond = "270,0 510,113 285,225 45,112";
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  let plants = "",
    soil = "",
    drainage = "";
  for (let i = 0; i < 105; i++) {
    const u = 0.04 + rand() * 0.92,
      v = 0.04 + rand() * 0.92;
    const x = 270 + 240 * u - 225 * v,
      y = 113 * u + 112 * v;
    const c = ["#8cab50", "#5f803b", "#a2ba64", "#77964a", "#4c6b38"][i % 5];
    const h = 9 + rand() * 12;
    plants += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><path d="M0 0v-${h.toFixed(0)}" stroke="#4e7039" stroke-width="1.3"/><ellipse cx="-4" cy="-${h * 0.6}" rx="5" ry="2.7" transform="rotate(30 -4 -${h * 0.6})" fill="${c}"/><ellipse cx="4" cy="-${h * 0.85}" rx="5.2" ry="2.8" transform="rotate(-32 4 -${h * 0.85})" fill="${c}"/>${i % 8 === 0 ? `<circle cy="-${h}" r="2.6" fill="${i % 16 === 0 ? "#d4be70" : "#b0a7bb"}"/>` : ""}</g>`;
  }
  for (let i = 0; i < 120; i++) {
    const u = rand(),
      v = rand();
    soil += `<circle cx="${270 + 240 * u - 225 * v}" cy="${113 * u + 112 * v}" r="${0.7 + rand() * 1.6}" fill="${i % 2 ? "#b89970" : "#795b3a"}" opacity=".65"/>`;
  }
  for (let u = 0.08; u < 1; u += 0.12)
    for (let v = 0.08; v < 1; v += 0.12)
      drainage += `<ellipse cx="${270 + 240 * u - 225 * v}" cy="${113 * u + 112 * v}" rx="8" ry="3.5" fill="#1e3328" stroke="#6a7b6b" stroke-width="1.2"/>`;
  const rendered = specs
    .map(
      (s, i) =>
        `<g class="roof-layer${i === 0 ? " active" : ""}" data-roof-layer="${i}" transform="translate(0 ${s.y})"><polygon points="45,112 285,225 285,${225 + s.h} 45,${112 + s.h}" fill="${s.left}"/><polygon points="285,225 510,113 510,${113 + s.h} 285,${225 + s.h}" fill="${s.right}"/><polygon class="layer-face" points="${diamond}" fill="${s.top}" stroke="#ffffff66" stroke-width="1"/>${i === 0 ? plants : i === 1 ? soil : i === 3 ? drainage : ""}</g>`,
    )
    .reverse()
    .join("");
  const spots = specs
    .map(
      (s, i) =>
        `<g class="layer-hotspot" data-layer="${i}" transform="translate(0 ${s.y})" aria-hidden="true"><path d="M460 139h72" fill="none" stroke="#758957" stroke-width="1"/><circle cx="548" cy="139" r="15" fill="${i === 0 ? "#cbe68c" : "#f7f6ee"}" stroke="#7e935d"/><text x="548" y="143" text-anchor="middle" font-size="10" fill="#294532" font-family="Arial">${i + 1}</text></g>`,
    )
    .join("");
  return `<svg viewBox="0 0 590 756" role="img" aria-label="Vista esquemática das seis camadas de um telhado verde, da vegetação até a estrutura"><ellipse cx="285" cy="730" rx="205" ry="13" fill="#839575" opacity=".12"/>${rendered}${spots}</svg>`;
}
$("#roof-diagram").innerHTML = roofDiagram();
function selectLayer(index) {
  $$(".layer-button").forEach((b, i) =>
    b.setAttribute("aria-pressed", String(i === index)),
  );
  $$(".roof-layer").forEach((g, i) => {
    const active = +g.dataset.roofLayer === index;
    g.classList.toggle("active", active);
    g.style.opacity = active ? "1" : ".65";
  });
  $$(".layer-hotspot").forEach((g, i) =>
    $("circle", g).setAttribute("fill", i === index ? "#cbe68c" : "#f7f6ee"),
  );
  $("#layer-number").textContent = `0${index + 1}`;
  $("#layer-title").textContent = layers[index][0];
  $("#layer-description").textContent = layers[index][1];
}
$$("[data-layer]").forEach((b) =>
  b.addEventListener("click", () => selectLayer(+b.dataset.layer)),
);
selectLayer(0);

// 2. Comparação didática entre um dia de sol e um dia de chuva.
function house(green, rain) {
  const roof = green ? "#7d9b4f" : "#8e9187";
  let vegetation = "";
  if (green)
    for (let x = 0; x < 8; x++)
      for (let y = 0; y < 5; y++) {
        const px = 200 + x * 20 - y * 23,
          py = 72 + x * 8 + y * 10;
        vegetation += `<path d="M${px} ${py}v-14m0 9q-11-12-10-5m10 2q9-14 9-7" stroke="${(x + y) % 2 ? "#bad081" : "#4d743b"}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      }
  const weather = rain
    ? `<g stroke="#84b6b5" stroke-width="2" stroke-linecap="round">${Array.from({ length: 18 }, (_, i) => `<path d="M${65 + (i % 9) * 34} ${15 + Math.floor(i / 9) * 28}l-6 12"/>`).join("")}</g><path d="M${green ? 300 : 325} 155v69" stroke="#74a9b2" stroke-width="${green ? 2 : 5}" fill="none" stroke-dasharray="${green ? "4 5" : "none"}"/>`
    : `<g stroke="#c7a04a" stroke-width="2" fill="none"><circle cx="348" cy="37" r="17"/>${Array.from({ length: 8 }, (_, i) => `<path d="M348 12v-7" transform="rotate(${i * 45} 348 37)"/>`).join("")}<path d="m${green ? 220 : 210} 14-22 32m22-11-22 11 2-23M280 45l-22 32m22-11-22 11 2-23" opacity="${green ? ".5" : "1"}"/></g>`;
  const evaporation =
    green && !rain
      ? '<g stroke="#739f8e" stroke-width="1.7" fill="none"><path d="M150 80q-10-13 0-24t0-24m-5 6 5-6 5 6M200 65q-10-13 0-24t0-24m-5 6 5-6 5 6"/></g>'
      : "";
  return `<svg viewBox="0 0 420 270"><ellipse cx="213" cy="239" rx="145" ry="13" fill="#bac5ac" opacity=".23"/><polygon points="91,124 230,185 230,241 91,180" fill="#d5d8c9"/><polygon points="230,185 341,128 341,186 230,241" fill="#b2bdab"/><polygon points="204,64 346,124 230,185 86,122" fill="${roof}"/><polygon points="86,122 230,185 230,196 86,133" fill="${green ? "#677d49" : "#757c71"}"/><polygon points="230,185 346,124 346,135 230,196" fill="${green ? "#526c3a" : "#667263"}"/><path d="M110 151v30l30 13v-30Zm49 22v29l29 13v-29Z" fill="#658475"/><path d="m251 191 24-12v31l-24 12Zm40-20 24-12v31l-24 12Z" fill="#526f60"/>${vegetation}${weather}${evaporation}</svg>`;
}
function setScenario(scenario) {
  const rain = scenario === "chuva";
  const selector = $(".segmented");
  const changed =
    selector.dataset.activeScenario &&
    selector.dataset.activeScenario !== scenario;
  selector.dataset.activeScenario = scenario;
  $$("[data-scenario]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.scenario === scenario)),
  );
  $("#conventional-house").innerHTML = house(false, rain);
  $("#green-house").innerHTML = house(true, rain);
  $("#conventional-title").textContent = rain
    ? "Escoamento mais direto"
    : "Superfície mais exposta";
  $("#green-title").textContent = rain
    ? "Parte da chuva fica no sistema"
    : "Vegetação que faz a diferença";
  $("#conventional-text").textContent = rain
    ? "Sem vegetação ou substrato para reter a chuva, a água tende a seguir mais rapidamente para os pontos de drenagem."
    : "Uma superfície escura e sem vegetação recebe radiação solar diretamente e pode transferir mais calor para as camadas abaixo.";
  $("#green-text").textContent = rain
    ? "O substrato e as plantas retêm parte da água. O excesso precisa escoar pela drenagem, mantendo os pontos de saída desobstruídos."
    : "As plantas sombreiam a cobertura. A evapotranspiração e as camadas do sistema podem contribuir para um melhor desempenho térmico.";
  $$(".house-scene").forEach((scene) => {
    scene.classList.toggle("rain", rain);
    scene.classList.toggle("sun", !rain);
    if (changed && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      scene.getAnimations().forEach((animation) => animation.cancel());
      scene.animate(
        [
          { opacity: 0.35, transform: "translateY(5px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 320, easing: "ease-out" },
      );
    }
  });
}
$$("[data-scenario]").forEach((b) =>
  b.addEventListener("click", () => setScenario(b.dataset.scenario)),
);
setScenario("sol");

// 3. Menu de navegação para celular.
const menuToggle = $(".menu-toggle"),
  nav = $("#main-nav");
function closeMenu() {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
}
menuToggle.addEventListener("click", () => {
  const open = !nav.classList.contains("open");
  nav.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
});
$$("a", nav).forEach((a) => a.addEventListener("click", closeMenu));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("open")) {
    closeMenu();
    menuToggle.focus();
  }
});
document.addEventListener("click", (e) => {
  if (!$(".header").contains(e.target)) closeMenu();
});
$$('a[href="#referencias"]').forEach((a) =>
  a.addEventListener("click", () => {
    $("#referencias").open = true;
  }),
);

// 4. Agenda local: cadastro, datas, calendário e exportação.
const KEY = "green-place-modules-v1",
  DAY = 86400000;
const now = new Date();
const today = new Date(
  Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
);
const dateKey = (d) => d.toISOString().slice(0, 10);
const parseDate = (s) => new Date(`${s}T00:00:00Z`);
const dateFormat = (d, short = false) =>
  new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: short ? "2-digit" : "long",
    ...(short ? {} : { year: "numeric" }),
  }).format(d);
const validDate = (s) =>
  typeof s === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  !Number.isNaN(parseDate(s).valueOf()) &&
  dateKey(parseDate(s)) === s &&
  s >= "1900-01-01" &&
  s <= "2100-12-31";
let modules = [],
  storage = true;
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
  if (Array.isArray(saved))
    modules = saved.filter(
      (m) =>
        m &&
        typeof m.id === "string" &&
        typeof m.code === "string" &&
        m.code.length <= 45 &&
        typeof m.location === "string" &&
        m.location.length <= 80 &&
        validDate(m.installed) &&
        [7, 15, 30, 60, 90].includes(m.interval),
    );
} catch {
  storage = false;
}
if (!storage)
  $(".device-note").textContent =
    "O armazenamento está indisponível. Sua agenda será temporária nesta sessão.";
let month = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
let selectedDay = null;
$("#module-date").value = dateKey(today);
function nextInspection(m) {
  const base = parseDate(m.installed);
  const n = Math.max(1, Math.ceil((today - base) / (DAY * m.interval)));
  return new Date(+base + n * m.interval * DAY);
}
function dueOn(m, d) {
  const days = Math.round((d - parseDate(m.installed)) / DAY);
  return days >= m.interval && days % m.interval === 0;
}
function persist() {
  if (storage)
    try {
      localStorage.setItem(KEY, JSON.stringify(modules));
    } catch {
      storage = false;
      $(".device-note").textContent =
        "Não foi possível salvar no navegador. Sua agenda será temporária nesta sessão.";
    }
}
function message(text, error = false) {
  $("#form-message").textContent = text;
  $("#form-message").classList.toggle("error", error);
}
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function calendarDetail() {
  const detail = $("#calendar-detail");
  detail.replaceChildren();
  if (!modules.length) {
    detail.textContent = "Cadastre um módulo para ver as datas de inspeção.";
    return;
  }
  if (selectedDay) {
    const date = parseDate(selectedDay),
      matches = modules.filter((m) => dueOn(m, date));
    detail.append(element("b", "", `${dateFormat(date)} · `));
    detail.append(
      document.createTextNode(
        matches.length
          ? matches.map((m) => `${m.code} — ${m.location}`).join("; ")
          : "Nenhuma inspeção agendada para este dia.",
      ),
    );
  } else {
    const count = [
      ...Array(
        new Date(
          Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0),
        ).getUTCDate(),
      ),
    ].reduce(
      (acc, _, i) =>
        acc +
        modules.filter((m) => dueOn(m, new Date(+month + i * DAY))).length,
      0,
    );
    detail.textContent = count
      ? `${count} ${count === 1 ? "inspeção neste mês" : "inspeções neste mês"}. Selecione um dia destacado para ver os módulos.`
      : "Nenhuma inspeção neste mês. Navegue para a próxima data do seu módulo.";
  }
}
function renderCalendar() {
  $("#calendar-month").textContent = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(month);
  const grid = $("#calendar-grid");
  grid.replaceChildren();
  for (let i = 0; i < month.getUTCDay(); i++) {
    const empty = element("span", "empty-day");
    empty.setAttribute("aria-hidden", "true");
    grid.append(empty);
  }
  const days = new Date(
    Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0),
  ).getUTCDate();
  for (let i = 1; i <= days; i++) {
    const d = new Date(
        Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), i),
      ),
      key = dateKey(d),
      matches = modules.filter((m) => dueOn(m, d));
    const b = element("button", "", String(i));
    b.type = "button";
    b.classList.toggle("today", key === dateKey(today));
    b.classList.toggle("scheduled", !!matches.length);
    b.classList.toggle("selected", key === selectedDay);
    b.setAttribute("aria-pressed", String(key === selectedDay));
    b.setAttribute(
      "aria-label",
      `${dateFormat(d)}${key === dateKey(today) ? ", hoje" : ""}${matches.length ? `, inspeção: ${matches.map((m) => m.code).join(", ")}` : ", sem inspeção"}`,
    );
    b.addEventListener("click", () => {
      selectedDay = key;
      $$(".calendar-grid button").forEach((btn) => {
        const active = btn === b;
        btn.classList.toggle("selected", active);
        btn.setAttribute("aria-pressed", String(active));
      });
      calendarDetail();
    });
    grid.append(b);
  }
  calendarDetail();
}
function renderModules() {
  $("#module-count").textContent = String(modules.length);
  $("#export-calendar").disabled = !modules.length;
  const list = $("#module-list");
  list.replaceChildren();
  if (!modules.length) {
    const empty = element("div", "empty-state");
    empty.innerHTML = icon("grid");
    empty.append(
      element(
        "p",
        "",
        "Seu jardim no topo começa com um módulo. Cadastre o primeiro para organizar as inspeções.",
      ),
    );
    list.append(empty);
    return;
  }
  [...modules]
    .sort((a, b) => nextInspection(a) - nextInspection(b))
    .forEach((m) => {
      const card = element("article", "module-item");
      const top = element("span", "mini-label", `A CADA ${m.interval} DIAS`);
      const remove = element("button", "remove-module");
      remove.type = "button";
      remove.setAttribute("aria-label", `Remover módulo ${m.code}`);
      remove.innerHTML = icon("close");
      remove.addEventListener("click", () => {
        modules = modules.filter((v) => v.id !== m.id);
        persist();
        renderModules();
        renderCalendar();
        message(`Módulo ${m.code} removido.`);
      });
      const next = element("p", "next-date");
      next.append(
        element("span", "", "Próxima inspeção"),
        element("b", "", dateFormat(nextInspection(m), true)),
      );
      card.append(
        top,
        remove,
        element("h4", "", m.code),
        element("p", "", m.location),
        next,
      );
      list.append(card);
    });
}
$("#module-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const code = $("#module-code").value.trim(),
    location = $("#module-location").value.trim(),
    installed = $("#module-date").value,
    interval = +$("#module-interval").value;
  if (
    !code ||
    !location ||
    !validDate(installed) ||
    ![7, 15, 30, 60, 90].includes(interval)
  ) {
    message("Preencha os campos com uma data válida.", true);
    return;
  }
  if (
    modules.some(
      (m) =>
        m.code.toLocaleLowerCase("pt-BR") === code.toLocaleLowerCase("pt-BR"),
    )
  ) {
    message("Já existe um módulo com esse nome. Escolha outro código.", true);
    $("#module-code").focus();
    return;
  }
  const id =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `gp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  const m = { id, code, location, installed, interval };
  modules.push(m);
  persist();
  const next = nextInspection(m);
  month = new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth(), 1));
  selectedDay = dateKey(next);
  renderModules();
  renderCalendar();
  message(
    `Módulo cadastrado. Próxima inspeção: ${dateFormat(next)}.${storage ? "" : " Agenda temporária."}`,
  );
  $("#module-code").value = "";
  $("#module-location").value = "";
});
$("#prev-month").addEventListener("click", () => {
  month = new Date(
    Date.UTC(month.getUTCFullYear(), month.getUTCMonth() - 1, 1),
  );
  selectedDay = null;
  renderCalendar();
});
$("#next-month").addEventListener("click", () => {
  month = new Date(
    Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1),
  );
  selectedDay = null;
  renderCalendar();
});
$("#today-month").addEventListener("click", () => {
  month = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  selectedDay = dateKey(today);
  renderCalendar();
});
$("#export-calendar").addEventListener("click", () => {
  if (!modules.length) return;
  const escapeICS = (v) =>
    v
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/[,;]/g, (c) => `\\${c}`);
  const compact = (d) => dateKey(d).replaceAll("-", "");
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const events = modules.map((m) => {
    const first = nextInspection(m);
    return [
      "BEGIN:VEVENT",
      `UID:${m.id}@greenplace`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(first)}`,
      `DTEND;VALUE=DATE:${compact(new Date(+first + DAY))}`,
      `RRULE:FREQ=DAILY;INTERVAL=${m.interval};COUNT=12`,
      `SUMMARY:${escapeICS(`Inspeção — ${m.code}`)}`,
      `LOCATION:${escapeICS(m.location)}`,
      "DESCRIPTION:Inspeção planejada da cobertura verde. Verifique as orientações do sistema instalado.",
      "END:VEVENT",
    ].join("\r\n");
  });
  const foldLine = (line) => {
    let current = "",
      length = 0,
      result = "";
    for (const char of line) {
      const bytes = new TextEncoder().encode(char).length;
      if (length + bytes > 75) {
        result += `${current}\r\n`;
        current = " ";
        length = 1;
      }
      current += char;
      length += bytes;
    }
    return result + current;
  };
  const text = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Green Place//Cronograma//PT-BR",
    "CALSCALE:GREGORIAN",
    ...events,
    "END:VCALENDAR",
    "",
  ]
    .join("\r\n")
    .split("\r\n")
    .map(foldLine)
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/calendar;charset=utf-8" }),
  );
  const a = element("a");
  a.href = url;
  a.download = "green-place-cronograma.ics";
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  message("Agenda baixada com as próximas 12 inspeções de cada módulo.");
});
renderModules();
renderCalendar();
