/* Green Place — gerador de cronograma de manutenção. Sem dependências. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const form = $("mp-form");
  if (!form) return;

  const TYPES = {
    irr: { name: "Irrigação", color: "#2b7bbf" },
    insp: { name: "Inspeção", color: "#b9770e" },
    erv: { name: "Ervas daninhas", color: "#8e44ad" },
    adu: { name: "Adubação", color: "#386e3e" },
    rep: { name: "Reposição e poda", color: "#b03a2e" },
  };
  const WEEKS = ["D", "S", "T", "Q", "Q", "S", "S"];
  const pad = (n) => String(n).padStart(2, "0");
  const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const longDate = (d) =>
    d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const parseKey = (k) => {
    const [y, m, d] = k.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  let events = {}, done = {}, start = null, view = null, selected = null, cfg = null;

  function add(day, type, title, steps, mins) {
    const k = keyOf(addDays(start, day));
    (events[k] = events[k] || []).push({ id: `${k}|${type}|${title}`, type, title, steps, mins });
  }

  function build() {
    events = {}; done = {};
    const { qty, perimeter, sun } = cfg;
    const t = (base, per) => Math.round(base + qty * per);
    const gap = { full: 2, partial: 3, shade: 4 }[sun];
    for (let d = 1; d <= 56; d += gap)
      add(d, "irr", "Irrigação de estabelecimento", [
        "Molhe devagar e de forma uniforme, sem encharcar",
        "Prefira o início da manhã ou o fim da tarde",
        "Confira se a água escoa pelos drenos das placas",
      ], t(10, 0.4));
    const gap2 = { full: 14, partial: 21, shade: 30 }[sun];
    for (let d = 56 + gap2; d <= 365; d += gap2)
      add(d, "irr", "Irrigar se o substrato estiver seco", [
        "Teste o substrato com o dedo, a 3 cm de profundidade",
        "Se estiver seco, irrigue até umedecer toda a placa",
        "Em semanas de chuva, apenas observe",
      ], t(8, 0.3));
    [7, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360].forEach((d) =>
      add(d, "insp", "Inspeção de drenos e encaixes", [
        "Limpe ralos e calhas de folhas e sujeira",
        "Verifique se as placas estão firmes e bem encaixadas",
        "Procure acúmulo de água ou rachaduras",
      ], t(15, 0.5)));
    const edge = perimeter > 30 ? 60 : 90;
    for (let d = edge; d <= 365; d += edge)
      add(d, "insp", `Inspeção do perímetro (${perimeter} m)`, [
        "Percorra toda a borda da área vegetada",
        "Verifique rufos, muretas e vedações",
        "Remova detritos acumulados junto à borda",
      ], Math.round(10 + perimeter * 1.2));
    [14, 30, 45, 60, 90, 120, 150, 180, 240, 300, 360].forEach((d) =>
      add(d, "erv", "Remoção de ervas daninhas", [
        "Arranque manualmente, com a raiz",
        "Evite produtos químicos",
        "Descarte o material fora das placas",
      ], t(10, 0.6)));
    [60, 240].forEach((d) =>
      add(d, "adu", "Adubação leve", [
        "Use adubo de liberação lenta, em dose baixa",
        "Espalhe uniformemente sobre as plantas",
        "Irrigue levemente em seguida",
      ], t(10, 0.4)));
    for (let d = 45; d <= 365; d += 90)
      add(d, "rep", "Reposição de falhas e poda", [
        "Identifique áreas com falhas na vegetação",
        "Replante mudas nos espaços vazios",
        "Pode partes secas ou excessivas",
      ], t(15, 0.7));
    if (sun === "full")
      [100, 280].forEach((d) =>
        add(d, "insp", "Checagem de queimadura solar", [
          "Observe folhas amareladas ou ressecadas",
          "Reforce a irrigação nos pontos afetados",
          "Avalie sombreamento temporário em ondas de calor",
        ], t(8, 0.2)));
    if (sun === "shade")
      [75, 195, 315].forEach((d) =>
        add(d, "insp", "Checagem de musgo e fungos", [
          "Procure manchas escuras ou excesso de umidade",
          "Melhore a ventilação e reduza a irrigação",
          "Remova as partes afetadas",
        ], t(8, 0.3)));
  }

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };

  function counts() {
    let total = 0, ok = 0;
    Object.values(events).forEach((l) => l.forEach((e) => { total++; if (done[e.id]) ok++; }));
    return { total, ok };
  }

  function render() {
    const box = $("mp-result");
    box.replaceChildren();
    const sunTxt = { full: "sol pleno", partial: "meia-sombra", shade: "sombra" }[cfg.sun];
    const { total, ok } = counts();
    box.append(el("h4", "", "Cronograma do primeiro ano"));
    box.append(el("p", "mp-summary",
      `${cfg.qty} placas · perímetro de ${cfg.perimeter} m · ${sunTxt} · ${cfg.local} · instalado em ${start.toLocaleDateString("pt-BR")}`));
    box.append(el("p", "mp-summary", `${ok} de ${total} tarefas concluídas`));
    const bar = el("div", "mp-progress");
    const fill = el("i");
    fill.style.width = `${total ? (ok / total) * 100 : 0}%`;
    bar.append(fill);
    box.append(bar);

    const nav = el("div", "mp-nav");
    const prev = el("button", "", "‹"), next = el("button", "", "›");
    prev.type = next.type = "button";
    prev.setAttribute("aria-label", "Mês anterior");
    next.setAttribute("aria-label", "Próximo mês");
    prev.onclick = () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); render(); };
    next.onclick = () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render(); };
    const title = el("strong", "", view.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }));
    title.setAttribute("aria-live", "polite");
    nav.append(prev, title, next);
    box.append(nav);

    const grid = el("div", "mp-grid");
    WEEKS.forEach((w) => grid.append(el("div", "mp-dow", w)));
    const y = view.getFullYear(), m = view.getMonth();
    for (let i = 0; i < new Date(y, m, 1).getDay(); i++) grid.append(el("div"));
    const todayKey = keyOf(new Date());
    for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) {
      const k = keyOf(new Date(y, m, d)), list = events[k] || [];
      const cell = el(list.length ? "button" : "div", "mp-day");
      if (list.length) {
        cell.type = "button";
        cell.setAttribute("aria-label", `${d}: ${list.length} tarefa(s)`);
        cell.onclick = () => { selected = k; render(); };
      }
      if (k === selected) cell.classList.add("sel");
      if (k === todayKey) cell.classList.add("today");
      cell.append(el("span", "", String(d)));
      const dots = el("div", "mp-dots");
      list.forEach((e) => { const dot = el("i", "mp-dot"); dot.style.setProperty("--c", TYPES[e.type].color); dots.append(dot); });
      cell.append(dots);
      grid.append(cell);
    }
    box.append(grid);

    const legend = el("div", "mp-legend");
    Object.values(TYPES).forEach((t) => {
      const s = el("span"), dot = el("i", "mp-dot");
      dot.style.setProperty("--c", t.color);
      s.append(dot, document.createTextNode(t.name));
      legend.append(s);
    });
    box.append(legend);

    const detail = el("div", "mp-detail");
    detail.setAttribute("aria-live", "polite");
    if (selected && events[selected]) {
      detail.append(el("h5", "", longDate(parseKey(selected))));
      events[selected].forEach((e) => {
        const task = el("div", "mp-task" + (done[e.id] ? " done" : ""));
        task.style.setProperty("--c", TYPES[e.type].color);
        const lab = el("label"), cb = el("input");
        cb.type = "checkbox"; cb.checked = !!done[e.id];
        cb.onchange = () => { done[e.id] = cb.checked; render(); };
        lab.append(cb, el("span", "", e.title));
        task.append(lab, el("small", "", `${TYPES[e.type].name} · cerca de ${e.mins} min`));
        const ol = el("ol");
        e.steps.forEach((s) => ol.append(el("li", "", s)));
        task.append(ol);
        detail.append(task);
      });
    } else {
      detail.append(el("p", "mp-summary", "Toque em um dia com marcação para ver o passo a passo."));
    }
    box.append(detail);

    const actions = el("div", "mp-actions");
    const dl = el("button", "btn forest", "Baixar agenda (.ics) ↓");
    dl.type = "button";
    dl.onclick = exportIcs;
    actions.append(dl);
    box.append(actions);
    box.append(el("p", "mp-note",
      "As frequências são sugestões gerais e devem seguir as orientações do sistema instalado."));
  }

  function exportIcs() {
    const esc = (s) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Green Place//Manutencao//PT-BR", "CALSCALE:GREGORIAN"];
    Object.keys(events).sort().forEach((k) =>
      events[k].forEach((e, i) => {
        const d = parseKey(k), ymd = (x) => keyOf(x).replace(/-/g, "");
        lines.push(
          "BEGIN:VEVENT",
          `UID:${ymd(d)}-${e.type}-${i}@greenplace`,
          `DTSTAMP:${stamp}`,
          `DTSTART;VALUE=DATE:${ymd(d)}`,
          `DTEND;VALUE=DATE:${ymd(addDays(d, 1))}`,
          `SUMMARY:${esc("Green Place · " + e.title)}`,
          `DESCRIPTION:${esc(e.steps.map((s, n) => `${n + 1}. ${s}`).join("\n"))}`,
          "END:VEVENT",
        );
      }));
    lines.push("END:VCALENDAR");
    const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = "green-place-manutencao.ics";
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const date = $("mp-date").value, local = $("mp-local").value.trim();
    const qty = parseInt($("mp-qty").value, 10), perimeter = parseFloat($("mp-perimeter").value);
    const err = $("mp-error");
    if (!date || !local || !(qty >= 1 && qty <= 5000) || !(perimeter > 0 && perimeter <= 2000)) {
      err.textContent = "Preencha todos os campos: placas entre 1 e 5.000 e perímetro entre 0,1 e 2.000 m.";
      return;
    }
    err.textContent = "";
    start = parseKey(date);
    cfg = { local, qty, perimeter, sun: $("mp-sun").value };
    build();
    selected = Object.keys(events).sort()[0];
    const s = parseKey(selected);
    view = new Date(s.getFullYear(), s.getMonth(), 1);
    render();
  });
})();
