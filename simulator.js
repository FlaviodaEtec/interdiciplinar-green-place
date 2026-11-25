/* Green Place — modelo educativo independente da interface.
 * Todas as unidades de armazenamento são mm; 1 mm × 1 m² = 1 L.
 * O coeficiente 0,25 aproxima 25,4 mm de água em 101,6 mm de substrato.
 * As frações de umidade são hipóteses didáticas, não calibração científica.
 */
(function (root) {
  "use strict";
  function calculateScenario({
    area,
    rainfall,
    depth,
    moisture,
    temperature,
    difference,
  }) {
    if (
      ![area, rainfall, depth, temperature, difference].every(Number.isFinite)
    )
      throw new RangeError("Informe números válidos.");
    if (
      area < 1 ||
      area > 10000 ||
      rainfall < 0 ||
      rainfall > 100 ||
      ![8, 10, 15].includes(depth) ||
      temperature < 40 ||
      temperature > 70 ||
      difference < 0 ||
      difference > 22
    )
      throw new RangeError("Valores fora dos limites do simulador.");
    const available = { dry: 1, moist: 0.5, saturated: 0 }[moisture];
    if (available === undefined)
      throw new RangeError("Selecione uma umidade válida.");
    const capacity = depth * 10 * 0.25 * available;
    const received = area * rainfall;
    const retained = area * Math.min(rainfall, capacity);
    const runoff = Math.max(0, received - retained);
    return {
      received,
      retained,
      runoff,
      conventionalRunoff: received,
      capacity,
      percent: received === 0 ? 0 : (retained / received) * 100,
      conventionalTemperature: temperature,
      greenTemperature: temperature - difference,
      difference,
    };
  }
  root.GreenPlaceSimulator = { calculateScenario };
  if (typeof module !== "undefined" && module.exports)
    module.exports = { calculateScenario };
})(typeof window === "undefined" ? globalThis : window);
