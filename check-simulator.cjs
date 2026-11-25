// Execute: node check-simulator.cjs
const assert = require("node:assert/strict");
const { calculateScenario } = require("./simulator.js");
const base = {
  area: 100,
  rainfall: 30,
  depth: 10,
  moisture: "moist",
  temperature: 55,
  difference: 17,
};
const result = calculateScenario(base);
assert.equal(result.received, 3000);
assert.equal(result.retained, 1250);
assert.equal(result.runoff, 1750);
assert.equal(result.greenTemperature, 38);
assert.equal(calculateScenario({ ...base, rainfall: 0 }).percent, 0);
assert.equal(calculateScenario({ ...base, rainfall: 0 }).retained, 0);
assert.equal(calculateScenario({ ...base, moisture: "saturated" }).retained, 0);
assert.equal(
  calculateScenario({ ...base, moisture: "dry", rainfall: 5 }).retained,
  500,
);
assert.equal(
  calculateScenario({ ...base, area: 200 }).retained,
  result.retained * 2,
);
assert.equal(
  calculateScenario({ ...base, area: 200 }).greenTemperature,
  result.greenTemperature,
);
assert.equal(
  calculateScenario({ ...base, difference: 0 }).greenTemperature,
  55,
);
for (const area of [1, 1.25, 100, 10000]) {
  for (const rainfall of [0, 5, 30, 100]) {
    for (const depth of [8, 10, 15]) {
      for (const moisture of ["dry", "moist", "saturated"]) {
        const r = calculateScenario({
          ...base,
          area,
          rainfall,
          depth,
          moisture,
        });
        assert.ok(
          Math.abs(r.received - r.retained - r.runoff) < 1e-7,
          "Conservação do volume de água",
        );
        assert.ok(r.retained >= 0 && r.retained <= r.received);
        assert.ok(r.percent >= 0 && r.percent <= 100);
      }
    }
  }
}
for (const invalid of [
  { area: 0 },
  { area: -1 },
  { area: NaN },
  { area: Infinity },
  { area: 10001 },
  { rainfall: -1 },
  { depth: 0 },
  { moisture: "invalid" },
  { difference: 23 },
]) {
  assert.throws(() => calculateScenario({ ...base, ...invalid }), RangeError);
}
console.log(
  "Simulador: cenário de referência, limites, erros e conservação em 144 cenários aprovados.",
);
