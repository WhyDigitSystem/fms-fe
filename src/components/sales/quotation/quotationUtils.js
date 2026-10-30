export const VOLUMETRIC_FACTOR = 167; // kg per CBM (air)

export const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const r = (v, d) => Number(num(v).toFixed(d));

// Convert any dimension to cm / any weight to kg
const toCm = (v, unit) => (unit === "in" ? v * 2.54 : unit === "m" ? v * 100 : v);
const toKg = (v, unit) => (unit === "lb" ? v * 0.45359237 : v);

export const calcPackageLine = (line) => {
  const qty = num(line.quantity);
  const dimUnit = line.dimensionUnit || "cm";
  const cbm =
    (qty *
      toCm(num(line.length), dimUnit) *
      toCm(num(line.width), dimUnit) *
      toCm(num(line.height), dimUnit)) /
    1_000_000;
  const gross = qty * toKg(num(line.weight), line.weightUnit || "kg");
  return { gross, cbm };
};

export const calcShipmentSummary = (lines = []) => {
  let gross = 0;
  let cbm = 0;
  let pieces = 0;

  lines.forEach((l) => {
    const c = calcPackageLine(l);
    gross += c.gross;
    cbm += c.cbm;
    pieces += num(l.quantity);
  });

  const volumetric = cbm * VOLUMETRIC_FACTOR;

  return {
    pieces,
    gross: r(gross, 3),
    cbm: r(cbm, 4),
    volumetric: r(volumetric, 3),
    chargeable: r(Math.max(gross, volumetric), 3),
  };
};

export const calcOriginCharge = (c) =>
  r(Math.max(num(c.rate) * num(c.quantity), num(c.minimumCharge)), 2);

export const calcOriginTotal = (charges = []) =>
  r(charges.reduce((s, c) => s + calcOriginCharge(c), 0), 2);

export const calcAirRate = (rate, chargeable) => {
  const cw = Math.max(num(chargeable), num(rate.minimumWeight));
  const freight = r(num(rate.ratePerKg) * cw, 2);
  const surcharges = r((num(rate.fuelRate) + num(rate.riskRate)) * cw, 2);
  return { freight, surcharges, total: r(freight + surcharges, 2) };
};

export const calcQuotationTotals = (form) => {
  const summary = calcShipmentSummary(form.packages);
  const originTotal = calcOriginTotal(form.originCharges);

  const airlines = (form.airRates || []).map((rate) => {
    const a = calcAirRate(rate, summary.chargeable);
    return {
      ...rate,
      ...a,
      quotationTotal: r(a.total + originTotal, 2),
    };
  });

  return { summary, originTotal, airlines };
};

export const bestTotal = (form) => {
  const { airlines, originTotal } = calcQuotationTotals(form);
  if (!airlines.length) return originTotal;
  return Math.min(...airlines.map((a) => a.quotationTotal));
};

export const formatMoney = (v, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "EUR",
      minimumFractionDigits: 2,
    }).format(num(v));
  } catch {
    return `${currency} ${num(v).toFixed(2)}`;
  }
};
