/* Green Place — interações e animações sem dependências externas. */
(() => {
  "use strict";
  const one = (selector) => document.querySelector(selector);
  const all = (selector) => [...document.querySelectorAll(selector)];
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const number = (value, digits = 0) =>
    new Intl.NumberFormat("pt-BR", { maximumFractionDigits: digits }).format(
      value,
    );
  const liters = (value) => `${number(value, 1)} L`;
  const form = one("#sim-form");
  const fields = {
    area: one("#roof-area"),
    rainfall: one("#rainfall"),
    depth: one("#substrate-depth"),
    moisture: one("#initial-moisture"),
    temperature: one("#surface-temp"),
    difference: one("#temp-difference"),
  };
  let current = null;
  let announceTimer;
  function readInput() {
    return {
      area: fields.area.valueAsNumber,
      rainfall: fields.rainfall.valueAsNumber,
      depth: Number(fields.depth.value),
      moisture: fields.moisture.value,
      temperature: fields.temperature.valueAsNumber,
      difference: fields.difference.valueAsNumber,
    };
  }
  function setText(selector, text) {
    one(selector).textContent = text;
  }
  function update() {
    clearTimeout(announceTimer);
    const input = readInput();
    setText("#rainfall-label", `${number(input.rainfall)} mm`);
    setText("#surface-label", `${number(input.temperature)} °C`);
    setText("#difference-label", `${number(input.difference)} °C`);
    try {
      const result = window.GreenPlaceSimulator.calculateScenario(input);
      fields.area.removeAttribute("aria-invalid");
      setText("#sim-error", "");
      one("#download-scenario").disabled = false;
      current = { input, result };
      setText("#rain-volume", liters(result.received));
      setText("#retained-volume", liters(result.retained));
      setText("#retained-percent", `${number(result.percent, 1)}%`);
      setText("#conventional-runoff", liters(result.conventionalRunoff));
      setText("#green-runoff", liters(result.runoff));
      setText(
        "#conventional-temp",
        `${number(result.conventionalTemperature)} °C`,
      );
      setText("#green-temp", `${number(result.greenTemperature)} °C`);
      one("#bar-conventional-runoff").style.width = result.received
        ? "100%"
        : "0%";
      one("#bar-green-retained").style.width = `${result.percent}%`;
      one("#bar-green-runoff").style.width = result.received
        ? `${100 - result.percent}%`
        : "0%";
      one("#water-chart").setAttribute(
        "aria-label",
        `Chuva recebida: ${liters(result.received)}. Convencional: ${liters(result.received)} de escoamento. Verde: ${liters(result.retained)} retidos e ${liters(result.runoff)} de escoamento.`,
      );
      const summary =
        result.received === 0
          ? "Sem chuva neste evento: não há água recebida, retida ou escoada. O cenário térmico ao sol continua independente."
          : `Com ${number(input.area, 2)} m² e ${number(input.rainfall)} mm de chuva, este cenário retém ${liters(result.retained)} e escoa ${liters(result.runoff)}. Capacidade disponível: ${number(result.capacity, 2)} mm. Estimativa educativa, não uma previsão de desempenho.`;
      // Avoid announcing every intermediate step of a dragged range slider.
      announceTimer = setTimeout(() => setText("#sim-summary", summary), 220);
    } catch (error) {
      current = null;
      fields.area.setAttribute("aria-invalid", "true");
      setText(
        "#sim-error",
        "Informe uma área válida entre 1 e 10.000 m² para recalcular.",
      );
      one("#download-scenario").disabled = true;
      [
        "#rain-volume",
        "#retained-volume",
        "#retained-percent",
        "#conventional-runoff",
        "#green-runoff",
        "#conventional-temp",
        "#green-temp",
      ].forEach((selector) => setText(selector, "—"));
      [
        "#bar-conventional-runoff",
        "#bar-green-retained",
        "#bar-green-runoff",
      ].forEach((selector) => {
        one(selector).style.width = "0%";
      });
      one("#water-chart").setAttribute(
        "aria-label",
        "Resultado indisponível: informe uma área válida.",
      );
      setText(
        "#sim-summary",
        "Os resultados serão exibidos quando a área for válida.",
      );
    }
  }
  if (form) {
  form.addEventListener("input", update);
  form.addEventListener("change", update);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    update();
  });
  form.addEventListener("reset", () => setTimeout(update, 0));
  one("#download-scenario").addEventListener("click", () => {
    if (!current) return;
    const { input, result } = current;
    const moistureLabels = {
      dry: "seco",
      moist: "úmido",
      saturated: "saturado",
    };
    const report = [
      "GREEN PLACE — CENÁRIO EDUCATIVO",
      new Date().toLocaleString("pt-BR"),
      "",
      `Área: ${number(input.area, 2)} m²`,
      `Chuva no evento: ${input.rainfall} mm`,
      `Substrato: ${input.depth} cm`,
      `Umidade inicial: ${moistureLabels[input.moisture]}`,
      `Capacidade disponível: ${number(result.capacity, 2)} mm`,
      `Chuva recebida: ${liters(result.received)}`,
      `Retida no telhado verde: ${liters(result.retained)} (${number(result.percent, 1)}%)`,
      `Escoamento verde: ${liters(result.runoff)}`,
      `Escoamento convencional idealizado: ${liters(result.received)}`,
      "",
      "CENÁRIO TÉRMICO AO SOL (independente do evento de chuva)",
      `Superfície convencional: ${input.temperature} °C`,
      `Diferença escolhida: ${input.difference} °C`,
      `Superfície verde hipotética: ${result.greenTemperature} °C`,
      "",
      "FÓRMULAS",
      "Recebida = área × chuva.",
      "Capacidade (mm) = espessura (cm) × 10 × 0,25 × fração disponível (seco: 1; úmido: 0,5; saturado: 0).",
      "Retida = área × mínimo(chuva, capacidade). Escoamento = recebida − retida.",
      "Temperatura verde = temperatura convencional − diferença escolhida.",
      "",
      "As frações e o fator de armazenamento são aproximações educativas. O modelo não considera intensidade e duração da chuva, evapotranspiração durante o evento, detalhes da drenagem ou balanço térmico.",
      "Não prevê temperatura interna, economia de energia ou dimensionamento. Não garante desempenho real.",
      "",
      "REFERÊNCIAS",
      "https://extension.psu.edu/green-roofs-benefits-and-design-considerations",
      "https://plantscience.psu.edu/research/centers/green-roof/research/stormwater/stormwater-quantity",
      "https://www.epa.gov/green-infrastructure/lower-building-energy-demands",
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF", report], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "green-place-cenario.txt";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  update();
  }

  // Give the interactive SVG the same keyboard access as the layer list.
  all(".layer-hotspot").forEach((spot, index) => {
    spot.removeAttribute("aria-hidden");
    spot.setAttribute("role", "button");
    spot.setAttribute("tabindex", "0");
    spot.setAttribute(
      "aria-label",
      `Explorar camada ${index + 1}: ${all(".layer-button")[index].textContent.replace(/\s+/g, " ").trim()}`,
    );
    spot.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        spot.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }
    });
  });
  // The diagram remains described as an image; keyboard controls live in the adjacent list.
  const diagramSvg = one("#roof-diagram svg");
  diagramSvg.setAttribute("role", "group");
  const methodology = one(".methodology");
  if (methodology) methodology.addEventListener("toggle", () => {
    one(".method-toggle-label").textContent = methodology.open
      ? "Fechar fórmulas"
      : "Ver fórmulas";
  });
  // Open optional content when directly navigating to the original maintenance tool.
  const revealHash = () => {
    if (location.hash === "#cronograma") {
      one(".care-tool").open = true;
      requestAnimationFrame(() =>
        one("#cronograma").scrollIntoView({
          behavior: motion.matches ? "instant" : "smooth",
        }),
      );
    }
  };
  addEventListener("hashchange", revealHash);
  revealHash();
  // Reveals only activate when IntersectionObserver is supported. All content is visible without JS.
  if ("IntersectionObserver" in window && !motion.matches) {
    const reveal = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            reveal.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    all(
      ".section-heading, .intro, .benefit, .research-card, .case-card, .discipline-card, .source-list li",
    ).forEach((element) => {
      element.classList.add("reveal-pending");
      reveal.observe(element);
    });
    const counter = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target,
            target = Number(element.dataset.count),
            start = performance.now();
          const animate = (now) => {
            const progress = Math.min(1, (now - start) / 1000);
            element.textContent = String(
              Math.round(target * (1 - Math.pow(1 - progress, 3))),
            );
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          counter.unobserve(element);
        }),
      { threshold: 0.5 },
    );
    all("[data-count]").forEach((element) => counter.observe(element));
    const bars = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll("i").forEach((bar) => {
              bar.style.width = bar.style.getPropertyValue("--bar");
            });
            bars.unobserve(entry.target);
          }
        }),
      { threshold: 0.3 },
    );
    all(".evidence-bars").forEach((chart) => {
      chart.querySelectorAll("i").forEach((bar) => {
        bar.style.width = "0%";
      });
      bars.observe(chart);
    });
    motion.addEventListener("change", (event) => {
      if (event.matches) {
        all(".reveal-pending").forEach((element) =>
          element.classList.add("reveal-visible"),
        );
        reveal.disconnect();
      }
    });
  }
  let progressFrame = false;
  const progress = () => {
    const range = document.documentElement.scrollHeight - innerHeight;
    one(".scroll-progress").style.width =
      `${range > 0 ? (scrollY / range) * 100 : 0}%`;
    progressFrame = false;
  };
  addEventListener(
    "scroll",
    () => {
      if (!progressFrame) {
        progressFrame = true;
        requestAnimationFrame(progress);
      }
    },
    { passive: true },
  );
  addEventListener("resize", progress);
  progress();
})();
