/* KEYORA · Off-plan Calculator · (c) 2026 Hassan Abu El-Leil. See LICENSE.
   node check.js data/<name>.json  -> runs every combination of source, case and scenario,
   re-derives the main figures a second way, and prints the recommended view. */
const fs = require("fs"), path = require("path"), K = require("./calc.js");
const D = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const P = JSON.parse(fs.readFileSync(path.join(__dirname, "config", "premiums.json"), "utf8"));
const bad = [];
["date", "handover", "project", "unit", "costs", "market", "plan", "sources"].forEach(k => { if (D[k] == null) bad.push("missing field: " + k); });
const srcs = (D.market && D.market.sources) || [];
if (!srcs.length) bad.push("market.sources is empty");
srcs.forEach((s, i) => {
  if (typeof s.rent !== "number") bad.push("market source " + (i + 1) + " has no rent");
  if (typeof s.psfHigh !== "number" && typeof s.psfLow !== "number") bad.push("market source " + (i + 1) + " has no price per sqft");
  if (K.hasCases(s) && s.psfLow > s.psfHigh) bad.push("market source " + (i + 1) + ": psfLow is above psfHigh");
});
const planSum = (D.plan || []).reduce((a, p) => a + p.pct, 0);
if (Math.abs(planSum - 100) > 0.01) bad.push("payment plan adds up to " + planSum + "%, not 100%");
(D.sources || []).forEach((s, i) => { if (!s.pulled) bad.push("source " + (i + 1) + " has no 'pulled' date"); });
(D.premiums || []).forEach(x => { if (!P.factors[x.key]) bad.push("unknown premium key: " + x.key); if (!x.why) bad.push("premium " + x.key + " has no reason"); });
(D.photos || []).forEach(p => { if (!fs.existsSync(path.join(path.dirname(process.argv[2]), path.basename(process.argv[2], ".json") + "-photos", p.file))) bad.push("photo file not found: " + p.file); });
const near = (a, b) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b));
let n = 0;
if (!bad.length) srcs.forEach((s, si) => K.CASES.forEach(c => K.KEYS.forEach(g => K.KEYS.forEach(rk => {
  n++; const r = K.calc(D, P, { src: si, c, g, r: rk }), id = [s.name, c, g, rk].join("/");
  for (const [name, v] of Object.entries(r)) if (v !== null && !Number.isFinite(v)) bad.push(id + " " + name + " is not a number");
  /* second derivation, written out long-hand */
  const y = (Date.parse(D.handover) - Date.parse(D.date)) / 31557600000;
  const pg = K.scenarios(D.market.priceGrowth12m)[g], rg = K.scenarios(D.market.rentGrowth12m)[rk];
  let pr = 0, pp = 0; (D.premiums || []).forEach(x => { pr += P.factors[x.key].rent; pp += P.factors[x.key].price; });
  pr = Math.min(pr, P.caps.rent); pp = Math.min(pp, P.caps.price);
  const psf = K.casePsf(s, c), cost = D.unit.price * (1 + D.costs.dldPct / 100) + D.costs.adminFee;
  const sale = psf * D.unit.size * (1 + pg / 100) ** y * (1 + pp / 100);
  const fee = sale * D.costs.sellCommissionPct / 100 * (1 + D.costs.vatPct / 100);
  const rent = s.rent * (1 + rg / 100) ** y * (1 + pr / 100) + (D.costs.furnishedPremium || 0);
  const net = rent * (1 - (D.costs.vacancyPct + D.costs.managementPct) / 100) - D.costs.serviceChargePsf * D.unit.size - (D.costs.otherYearly || 0);
  [["totalCost", cost], ["salePrice", sale], ["profit", sale - fee - cost], ["netRent", net], ["netYield", net / cost * 100]]
    .forEach(([k, v]) => { if (!near(r[k], v)) bad.push(id + " " + k + ": " + r[k] + " vs " + v); });
}))));
if (!bad.length) {
  const d = K.defaults(D);
  console.table(K.CASES.map(c => { const r = K.calc(D, P, { ...d, c }); return { case: c, "area psf": Math.round(r.psf), "sale price": Math.round(r.salePrice),
    profit: Math.round(r.profit), "ROI %": +r.roi.toFixed(2), "net rent": Math.round(r.netRent), "net yield %": +r.netYield.toFixed(2), ["hold " + r.holdYears + "y profit"]: Math.round(r.holdProfit) }; }));
}
console.log(bad.length ? "PROBLEMS " + bad.length + "\n- " + bad.slice(0, 20).join("\n- ") : "OK · " + n + " combinations checked");
process.exit(bad.length ? 1 : 0);
