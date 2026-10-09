/* KEYORA · Off-plan Calculator · (c) 2026 Hassan Abu El-Leil. See LICENSE.
   node check.js data/<name>.json  -> re-derives every figure a second way and prints the results. */
const fs = require("fs"), K = require("./calc.js");
const D = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
let bad = [];
const need = ["date", "handover", "project", "unit", "costs", "market", "plan", "sources"];
need.forEach(k => { if (D[k] == null) bad.push("missing field: " + k); });
const planSum = (D.plan || []).reduce((a, p) => a + p.pct, 0);
if (Math.abs(planSum - 100) > 0.01) bad.push("payment plan adds up to " + planSum + "%, not 100%");
if (!(D.sources || []).length) bad.push("no sources listed");
(D.sources || []).forEach((s, i) => { if (!s.pulled) bad.push("source " + (i + 1) + " has no 'pulled' date"); });
const near = (a, b) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b));
const rows = [];
if (!bad.length) for (const k of K.KEYS) {
  const r = K.calc(D, k);
  for (const [name, v] of Object.entries(r)) if (v !== null && !Number.isFinite(v)) bad.push(k + "." + name + " is not a number");
  /* second derivation, written out long-hand */
  const y = (Date.parse(D.handover) - Date.parse(D.date)) / 31557600000;
  const g = K.scenarios(D.market.priceGrowth12m)[k], rg = K.scenarios(D.market.rentGrowth12m)[k];
  const cost = D.unit.price * (1 + D.costs.dldPct / 100) + D.costs.adminFee;
  const sale = D.market.areaPsf * D.unit.size * (1 + g / 100) ** y;
  const fee = sale * D.costs.sellCommissionPct / 100 * (1 + D.costs.vatPct / 100);
  const rent = D.market.areaRent * (1 + rg / 100) ** y;
  const net = rent * (1 - (D.costs.vacancyPct + D.costs.managementPct) / 100) - D.costs.serviceChargePsf * D.unit.size;
  [["totalCost", cost], ["salePrice", sale], ["profit", sale - fee - cost], ["netRent", net], ["netYield", net / cost * 100]]
    .forEach(([n, v]) => { if (!near(r[n], v)) bad.push(k + "." + n + ": " + r[n] + " vs " + v); });
  rows.push({ scenario: k, "price growth %": r.priceGrowth, "sale price": Math.round(r.salePrice), profit: Math.round(r.profit),
    "ROI %": +r.roi.toFixed(2), "net rent": Math.round(r.netRent), "net yield %": +r.netYield.toFixed(2) });
}
console.table(rows);
console.log(bad.length ? "PROBLEMS " + bad.length + "\n- " + bad.join("\n- ") : "OK · all checks passed");
process.exit(bad.length ? 1 : 0);
