/* KEYORA · Off-plan Calculator · (c) 2026 Hassan Abu El-Leil. See LICENSE.
   All the maths of the report lives here. Used by the report page and by check.js. */
(function (root) {
  "use strict";
  function yearsBetween(a, b) {
    var ms = new Date(b + "T00:00:00Z") - new Date(a + "T00:00:00Z");
    return Math.max(0, ms / (365.25 * 24 * 3600 * 1000));
  }
  /* Growth scenarios. g12 = change over the last 12 months (%), may be null.
     stress -5 · flat 0 · base = half of g12, between 0 and 6 · strong = g12, between 0 and 10 */
  function scenarios(g12) {
    var g = (typeof g12 === "number" && isFinite(g12)) ? g12 : 0;
    var clamp = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v)); };
    return { stress: -5, flat: 0, base: clamp(g / 2, 0, 6), strong: clamp(g, 0, 10) };
  }
  function calc(D, key) {
    var c = D.costs, u = D.unit, m = D.market;
    var years = yearsBetween(D.date, D.handover);
    var pg = scenarios(m.priceGrowth12m)[key], rg = scenarios(m.rentGrowth12m)[key];
    var dld = u.price * c.dldPct / 100;
    var totalCost = u.price + dld + c.adminFee;
    var unitPsf = u.price / u.size;
    var priceVsArea = (unitPsf - m.areaPsf) / m.areaPsf * 100;
    var valueToday = m.areaPsf * u.size;
    /* rent */
    var grossRent = m.areaRent * Math.pow(1 + rg / 100, years);
    var vacancy = grossRent * c.vacancyPct / 100;
    var management = grossRent * c.managementPct / 100;
    var serviceCharge = c.serviceChargePsf * u.size;
    var netRent = grossRent - vacancy - management - serviceCharge;
    var grossYield = grossRent / u.price * 100;
    var netYield = netRent / totalCost * 100;
    var payback = netRent > 0 ? totalCost / netRent : null;
    /* resale at handover */
    var sellRate = c.sellCommissionPct / 100 * (1 + c.vatPct / 100);
    var salePrice = valueToday * Math.pow(1 + pg / 100, years);
    var sellCost = salePrice * sellRate;
    var profit = salePrice - sellCost - totalCost;
    var roi = profit / totalCost * 100;
    var paidPct = 0;
    (D.plan || []).forEach(function (p) { if (p.beforeHandover) paidPct += p.pct; });
    var cashIn = u.price * paidPct / 100 + dld + c.adminFee;
    var cashReturn = profit / cashIn * 100;
    var breakEven = totalCost / (1 - sellRate);
    var cushion = (valueToday - breakEven) / valueToday * 100;
    return { years: years, priceGrowth: pg, rentGrowth: rg, dld: dld, totalCost: totalCost,
      unitPsf: unitPsf, priceVsArea: priceVsArea, valueToday: valueToday,
      grossRent: grossRent, vacancy: vacancy, management: management, serviceCharge: serviceCharge,
      netRent: netRent, grossYield: grossYield, netYield: netYield, payback: payback,
      sellRate: sellRate, salePrice: salePrice, sellCost: sellCost, profit: profit, roi: roi,
      paidPct: paidPct, cashIn: cashIn, cashReturn: cashReturn, breakEven: breakEven, cushion: cushion };
  }
  /* Plain labels. Thresholds are documented in references/formulas.md */
  function labels(r) {
    return {
      yield: r.netYield >= 6 ? "high" : r.netYield >= 4.5 ? "mid" : "low",
      price: r.priceVsArea <= -3 ? "below" : r.priceVsArea <= 3 ? "inline" : "above",
      cushion: r.cushion >= 5 ? "high" : r.cushion >= 0 ? "mid" : "low",
      profit: r.profit > 0 ? "high" : "low"
    };
  }
  var api = { calc: calc, scenarios: scenarios, labels: labels, yearsBetween: yearsBetween,
    KEYS: ["stress", "flat", "base", "strong"] };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.KEYORA = api;
})(typeof window !== "undefined" ? window : globalThis);
