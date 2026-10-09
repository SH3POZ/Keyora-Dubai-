/* KEYORA · Off-plan Calculator · (c) 2026 Hassan Abu El-Leil. See LICENSE.
   All the maths of the report lives here. Used by the report page and by check.js. */
(function (root) {
  "use strict";
  var KEYS = ["stress", "flat", "base", "strong"], CASES = ["low", "mid", "high"];
  function yearsBetween(a, b) {
    var ms = new Date(b + "T00:00:00Z") - new Date(a + "T00:00:00Z");
    return Math.max(0, ms / (365.25 * 24 * 3600 * 1000));
  }
  /* g12 = change over the last 12 months (%), may be null.
     stress -5 · flat 0 · base = half of g12, between 0 and 6 · strong = g12, between 0 and 10 */
  function scenarios(g12) {
    var g = (typeof g12 === "number" && isFinite(g12)) ? g12 : 0;
    var clamp = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v)); };
    return { stress: -5, flat: 0, base: clamp(g / 2, 0, 6), strong: clamp(g, 0, 10) };
  }
  /* Premiums: sum of the confirmed factors, each total capped. P = config/premiums.json */
  function premiums(D, P) {
    var rent = 0, price = 0, list = [];
    (D.premiums || []).forEach(function (x) {
      var f = P.factors[x.key]; if (!f) return;
      rent += f.rent; price += f.price; list.push({ key: x.key, rent: f.rent, price: f.price, label: f.label, why: x.why });
    });
    return { rent: Math.min(rent, P.caps.rent), price: Math.min(price, P.caps.price), rawRent: rent, rawPrice: price, list: list };
  }
  function hasCases(s) { return typeof s.psfLow === "number" && typeof s.psfHigh === "number"; }
  function casePsf(s, c) {
    if (!hasCases(s)) return typeof s.psfHigh === "number" ? s.psfHigh : s.psfLow;
    return c === "low" ? s.psfLow : c === "high" ? s.psfHigh : (s.psfLow + s.psfHigh) / 2;
  }
  /* o = { src: index, c: "low|mid|high", g: price scenario key, r: rent scenario key } */
  function calc(D, P, o) {
    var c = D.costs, u = D.unit, m = D.market, s = m.sources[o.src];
    var years = yearsBetween(D.date, D.handover), pr = premiums(D, P);
    var pg = scenarios(m.priceGrowth12m)[o.g], rg = scenarios(m.rentGrowth12m)[o.r];
    var psf = casePsf(s, o.c);
    var dld = u.price * c.dldPct / 100, totalCost = u.price + dld + c.adminFee;
    var unitPsf = u.price / u.size, priceVsArea = (unitPsf - psf) / psf * 100, valueToday = psf * u.size;
    var grossRent = s.rent * Math.pow(1 + rg / 100, years) * (1 + pr.rent / 100) + (c.furnishedPremium || 0);
    var vacancy = grossRent * c.vacancyPct / 100, management = grossRent * c.managementPct / 100;
    var serviceCharge = c.serviceChargePsf * u.size, other = c.otherYearly || 0;
    var netRent = grossRent - vacancy - management - serviceCharge - other;
    var netYield = netRent / totalCost * 100, grossYield = grossRent / u.price * 100;
    var payback = netRent > 0 ? totalCost / netRent : null;
    var sellRate = c.sellCommissionPct / 100 * (1 + c.vatPct / 100);
    var salePrice = valueToday * Math.pow(1 + pg / 100, years) * (1 + pr.price / 100);
    var sellCost = salePrice * sellRate, profit = salePrice - sellCost - totalCost, roi = profit / totalCost * 100;
    var roiYear = years > 0 && roi > -100 ? (Math.pow(1 + roi / 100, 1 / Math.max(years, 1)) - 1) * 100 : roi;
    var paidPct = 0; (D.plan || []).forEach(function (p) { if (p.beforeHandover) paidPct += p.pct; });
    var cashIn = u.price * paidPct / 100 + dld + c.adminFee, cashReturn = profit / cashIn * 100;
    var breakEven = totalCost / (1 - sellRate), cushion = (valueToday - breakEven) / valueToday * 100;
    var priceForYield = (netRent / (P.targetYield / 100) - c.adminFee) / (1 + c.dldPct / 100);
    /* keep and rent for N years after handover, then sell */
    var N = P.holdYears, rents = 0, i;
    for (i = 0; i < N; i++) rents += netRent * Math.pow(1 + rg / 100, i);
    var holdValue = salePrice * Math.pow(1 + pg / 100, N);
    var holdProfit = holdValue * (1 - sellRate) + rents - totalCost;
    return { years: years, psf: psf, priceGrowth: pg, rentGrowth: rg, premRent: pr.rent, premPrice: pr.price,
      dld: dld, totalCost: totalCost, unitPsf: unitPsf, priceVsArea: priceVsArea, valueToday: valueToday,
      grossRent: grossRent, vacancy: vacancy, management: management, serviceCharge: serviceCharge, other: other,
      netRent: netRent, grossYield: grossYield, netYield: netYield, payback: payback,
      sellRate: sellRate, salePrice: salePrice, sellCost: sellCost, profit: profit, roi: roi, roiYear: roiYear,
      paidPct: paidPct, cashIn: cashIn, cashReturn: cashReturn, breakEven: breakEven, cushion: cushion,
      priceForYield: priceForYield, holdYears: N, holdRents: rents, holdValue: holdValue, holdProfit: holdProfit,
      holdRoi: holdProfit / totalCost * 100 };
  }
  function labels(r, P) {
    return {
      yield: r.netYield >= P.targetYield ? "high" : r.netYield >= P.targetYield - 1.5 ? "mid" : "low",
      price: r.priceVsArea <= -3 ? "below" : r.priceVsArea <= 3 ? "inline" : "above",
      cushion: r.cushion >= 5 ? "high" : r.cushion >= 0 ? "mid" : "low"
    };
  }
  function defaults(D) {
    var i = D.market.sources.findIndex(function (s) { return s.main; });
    return { src: Math.max(0, i), c: "mid", g: "base", r: "base" };
  }
  var api = { calc: calc, scenarios: scenarios, premiums: premiums, labels: labels, casePsf: casePsf, hasCases: hasCases,
    defaults: defaults, yearsBetween: yearsBetween, KEYS: KEYS, CASES: CASES };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.KEYORA = api;
})(typeof window !== "undefined" ? window : globalThis);
