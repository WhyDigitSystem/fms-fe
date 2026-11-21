import { buildPdfDoc } from "./PdfEngine";
import { fmtDate, num, getStoredLogo } from "./pdfUtils";

/* =====================================================================
 * Common config-driven PDF  (Delivery-Order style)
 *
 *   generateCommonPDF({ config, data, brand }) -> { doc, blob, blobUrl, fileName }
 *   downloadCommonPDF({ config, data, brand })
 *   getCommonPdfBase64({ config, data, brand })
 *
 * Logo: pass brand.logo (base64 data URL). If omitted, it is read
 * automatically from localStorage "eFitLogo".
 *
 * ACCESSORS ("accessor", "sum")
 *    "customer.customerName"   nested path
 *    (row) => ...              function
 *    "$index"                  (table columns only) 1-based row number
 * Plain text props (title, label, text...) are literal strings or (data) => string.
 *
 * config = {
 *   title, fileName, theme, themeColor,
 *   layout: "split" | (default centred)   // split = logo+title left, meta table right
 *   brand: { name, logo } | (data)=>({...}),
 *   intro:  [ "Dear Sir,", (data)=>"..." ]   // lines in the same rows as the meta table, under "To:"
 *   party:  { label:"To:", accessor | value, format },
 *   meta:   [{ label, accessor | value, format }],          // right-hand tinted table
 *   sections: [...] | (data) => [...],
 *   footer: { left, center, right }   // strings or (data)=>string; {page}/{pages} tokens
 * }
 *
 * format: "text"|"date"|"number"|"money"|"upper"|"boolean"|"active"|"portCode"
 *         | (value, data)=>string | { type, decimals, prefix, suffix, yes, no }
 *
 * SECTIONS (all accept when:(data)=>bool and gapBefore:number)
 *  { type:"text", size, lineHeight, color, lines:[ line ] }
 *        line = "plain" | (data)=>"..." | [ "plain", { text|accessor, bold, gap, format } ]
 *  { type:"detailTable", headers:["SHIPMENT DETAILS","PARTICULARS"],
 *      rows:[ { label, accessor|value, format, tall, when,
 *               extra:{ label, accessor|value, format } } ] }
 *  { type:"table", rows:"items"|fn, hideIfEmpty, size,
 *      cols:[{ label, w:number|"*", align, bold, accessor, format, color, cell }],
 *      footer:[ "Total" | { accessor|sum|text, format } ] | (data,rows)=>[...] }
 *  { type:"signoff", x, lineHeight, lines:[ "text" | (data)=>"text" | { text, bold, gap } ] }
 *  { type:"custom", render(ctx, y) -> y }
 * ===================================================================== */

const isFn = (v) => typeof v === "function";
const isEmpty = (v) => v === undefined || v === null || v === "";

export const getValue = (obj, acc) => {
  if (isEmpty(acc)) return undefined;
  if (isFn(acc)) return acc(obj);
  if (typeof acc === "string") {
    return acc.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }
  return undefined;
};

const lit = (v, data) => (isFn(v) ? v(data) : v);

const portCodeOf = (label) => {
  if (isEmpty(label)) return "---";
  const m = String(label).match(/\(([^)]+)\)\s*$/);
  return m ? m[1] : String(label).slice(0, 6).toUpperCase();
};

const fixed = (v, d) =>
  num(v).toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

const formatValue = (value, item, ctx) => {
  if (isEmpty(value)) return "";
  const f = item.format;
  const opts = { ...item, ...(f && typeof f === "object" ? f : {}) };
  const type = f && typeof f === "object" ? f.type : f;
  let out;
  if (isFn(type)) out = type(value, ctx.data);
  else {
    switch (type) {
      case "date":
        out = fmtDate(value);
        break;
      case "number":
        out = fixed(value, opts.decimals ?? 2);
        break;
      case "money":
        out = `${fixed(value, opts.decimals ?? 2)} ${ctx.currency}`;
        break;
      case "upper":
        out = String(value).toUpperCase();
        break;
      case "boolean":
        out = value ? opts.yes || "Yes" : opts.no || "No";
        break;
      case "active":
        out = value === true || value === "Active" ? "Active" : "Inactive";
        break;
      case "portCode":
        out = portCodeOf(value);
        break;
      default:
        out = typeof value === "object" ? "" : String(value);
    }
  }
  return `${opts.prefix || ""}${out}${opts.suffix || ""}`;
};

// literal `value` wins over `accessor`
const pick = (item, data, ctx) => {
  const raw =
    "value" in item ? lit(item.value, data) : getValue(data, item.accessor);
  return formatValue(raw, item, ctx);
};

/* ---------- text lines / segments ---------- */
const toSegs = (line, data, ctx) => {
  const arr = Array.isArray(line) ? line : [line];
  return arr.map((sg) => {
    if (isFn(sg) || typeof sg !== "object" || sg === null)
      return { text: String(lit(sg, data) ?? "") };
    const text =
      "text" in sg ? String(lit(sg.text, data) ?? "") : pick(sg, data, ctx);
    return { text, bold: sg.bold, gap: sg.gap, color: sg.color };
  });
};

/* ---------- table helpers ---------- */
const resolveCell = (c, row, data, i, ctx) => {
  if (c.cell) return c.cell(row, data, i);
  const raw = c.accessor === "$index" ? i + 1 : getValue(row, c.accessor);
  let text = formatValue(raw, c, ctx);
  if (text === "") text = c.emptyText ?? "-";
  const color = isFn(c.color) ? c.color(row, data) : c.color;
  const bold = isFn(c.bold) ? c.bold(row, data) : false;
  if (color || bold) return { text, color, bold };
  return text;
};

const resolveFooterCell = (c, data, rows, ctx) => {
  if (c === undefined || c === null) return "";
  if (typeof c !== "object") return String(c);
  let raw;
  if ("sum" in c) raw = rows.reduce((s, r) => s + num(getValue(r, c.sum)), 0);
  else if ("text" in c) raw = lit(c.text, data);
  else raw = getValue(data, c.accessor);
  const text = formatValue(raw, c, ctx);
  return c.color || c.bold ? { text, color: c.color, bold: c.bold } : text;
};

const resolveSection = (s, data, ctx) => {
  if (!s || (s.when && !s.when(data))) return null;
  const base = { gapBefore: s.gapBefore };

  switch (s.type) {
    case "text":
      return {
        ...base,
        type: "text",
        size: s.size,
        lineHeight: s.lineHeight,
        color: s.color,
        lines: (s.lines || []).map((l) => toSegs(l, data, ctx)),
      };

    case "detailTable": {
      const rows = (s.rows || [])
        .filter((r) => r && (!r.when || r.when(data)))
        .map((r) => ({
          label: lit(r.label, data),
          value: pick(r, data, ctx),
          tall: r.tall,
          extra: r.extra
            ? {
                label: lit(r.extra.label, data),
                value: pick(r.extra, data, ctx),
              }
            : undefined,
        }));
      return { ...base, type: "detailTable", headers: s.headers, rows };
    }

    case "table": {
      const rows = (isFn(s.rows) ? s.rows(data) : getValue(data, s.rows)) || [];
      if (s.hideIfEmpty && !rows.length) return null;
      const cols = (s.cols || []).filter((c) => !c.when || c.when(data));
      const out = {
        ...base,
        type: "table",
        size: s.size,
        cols: cols.map((c) => ({
          label: lit(c.label, data),
          w: c.w ?? "*",
          align: c.align,
          bold: c.bold === true,
        })),
        rows: rows.map((row, i) =>
          cols.map((c) => resolveCell(c, row, data, i, ctx)),
        ),
      };
      if (s.footer) {
        const f = isFn(s.footer) ? s.footer(data, rows) : s.footer;
        out.footer = f.map((c) => resolveFooterCell(c, data, rows, ctx));
      }
      return out;
    }

    case "signoff":
      return {
        ...base,
        type: "signoff",
        x: s.x,
        pinBottom: s.pinBottom,
        align: s.align,
        textAlign: s.textAlign,
        lineHeight: s.lineHeight,
        lines: (s.lines || []).map((l) =>
          typeof l === "object" && l !== null && !isFn(l)
            ? {
                text: String(lit(l.text, data) ?? ""),
                bold: l.bold,
                gap: l.gap,
              }
            : { text: String(lit(l, data) ?? "") },
        ),
      };

    case "custom":
      return s;

    default:
      throw new Error(`CommonPDF: unknown section type "${s.type}"`);
  }
};

export const resolveConfig = (config, data, brand = {}) => {
  let currency = String(getValue(data, config.currency) || "INR");
  if (currency.length > 4) currency = "INR";
  const ctx = { data, currency };

  const cfgBrand =
    (isFn(config.brand) ? config.brand(data) : config.brand) || {};
  const clean = Object.fromEntries(
    Object.entries(brand || {}).filter(([, v]) => !isEmpty(v)),
  );
  const finalBrand = { ...cfgBrand, ...clean };
  if (isEmpty(finalBrand.logo)) finalBrand.logo = getStoredLogo("eFitLogo");

  const sectionList = isFn(config.sections)
    ? config.sections(data)
    : config.sections || [];
  const ft = config.footer || {};

  const spec = {
    title: lit(config.title, data) || "Document",
    layout: config.layout,
    logo: finalBrand.logo,
    companyName: finalBrand.name,
    theme: config.theme,
    themeColor: config.themeColor,
    party: config.party
      ? {
          label: lit(config.party.label, data) || "To:",
          value: pick(config.party, data, ctx),
        }
      : null,
    intro: (config.intro || []).map((t) => lit(t, data)).filter(Boolean),
    meta: (config.meta || [])
      .filter((m) => !m.when || m.when(data))
      .map((m) => [lit(m.label, data), pick(m, data, ctx)]),
    sections: sectionList
      .map((s) => resolveSection(s, data, ctx))
      .filter(Boolean),
    footer: {
      left: lit(ft.left, data),
      center: ft.center === undefined ? undefined : lit(ft.center, data),
      right: lit(ft.right, data),
    },
  };
  return { spec, brand: finalBrand };
};

const safeName = (n) => String(n || "Document").replace(/[\\/:*?"<>|]/g, "-");

export const generateCommonPDF = ({ config, data = {}, brand = {} }) => {
  const { spec, brand: finalBrand } = resolveConfig(config, data, brand);
  const doc = buildPdfDoc(spec, finalBrand);
  const base = safeName(lit(config.fileName, data) || spec.title);
  const blob = doc.output("blob");
  const blobUrl =
    typeof URL !== "undefined" && URL.createObjectURL
      ? URL.createObjectURL(blob)
      : null;
  return { doc, blob, blobUrl, fileName: `${base}.pdf` };
};

export const downloadCommonPDF = (args) => {
  const { spec, brand } = resolveConfig(
    args.config,
    args.data || {},
    args.brand,
  );
  const doc = buildPdfDoc(spec, brand);
  doc.save(
    `${safeName(lit(args.config.fileName, args.data) || spec.title)}.pdf`,
  );
  return doc;
};

export const getCommonPdfBase64 = (args) => {
  const { spec, brand } = resolveConfig(
    args.config,
    args.data || {},
    args.brand,
  );
  return buildPdfDoc(spec, brand).output("datauristring").split(",")[1];
};
