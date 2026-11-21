import { buildPdfDoc } from "./PdfEngine";

/* Shared formatters – import these when building a spec. */
const num = (v) => {
  const n = parseFloat(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};
export { num };

export const fmt2 = (v, locale = "en-US") =>
  num(v).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const fmt4 = (v, locale = "en-US") =>
  num(v).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });

const CUR_SYMBOL = { EUR: "€" };
export const curLabel = (cur) => CUR_SYMBOL[cur] || cur;
export const money = (v, cur) => `${fmt2(v)} ${curLabel(cur)}`;

export const fmtDate = (value) => {
  if (!value) return "-";
  const s = String(value).trim();
  let m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m) return `${m[1]}/${m[2]}/${m[3]}`;
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return s;
};

/* ---------- Logo ----------
 * Same source your <img src={localStorage.getItem("eFitLogo")} /> uses.
 * jsPDF needs a base64 data URL (data:image/png;base64,...). */
export const getStoredLogo = (key = "eFitLogo") => {
  try {
    return typeof localStorage !== "undefined"
      ? localStorage.getItem(key) || ""
      : "";
  } catch (e) {
    return "";
  }
};

/* Use this once if the stored logo is a normal URL (not base64):
 *   const logo = await urlToDataUrl(localStorage.getItem("eFitLogo"));
 *   pdf.preview(config, data, { logo });
 */
export const urlToDataUrl = async (url) => {
  if (!url || /^data:/i.test(url)) return url || "";
  const blob = await (await fetch(url)).blob();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
};

/* ---------- Output helpers: all take a spec + brand ---------- */
const safeName = (name) =>
  String(name || "Document").replace(/[\\/:*?"<>|]/g, "-");

export const generatePdf = (spec, brand = {}) => buildPdfDoc(spec, brand);

export const downloadPdf = (spec, brand = {}, fileName) => {
  const doc = buildPdfDoc(spec, brand);
  doc.save(
    `${safeName(fileName || brand.fileName || spec.fileName || spec.title)}.pdf`,
  );
  return doc;
};

export const getPdfBlob = (spec, brand = {}) =>
  buildPdfDoc(spec, brand).output("blob");

export const getPdfBlobUrl = (spec, brand = {}) =>
  URL.createObjectURL(getPdfBlob(spec, brand));

export const getPdfBase64 = (spec, brand = {}) =>
  buildPdfDoc(spec, brand).output("datauristring").split(",")[1];

export const openPdfInTab = (spec, brand = {}) => {
  const url = getPdfBlobUrl(spec, brand);
  window.open(url, "_blank");
  return url;
};

export const printPdf = (spec, brand = {}) => {
  const url = getPdfBlobUrl(spec, brand);
  const frame = document.createElement("iframe");
  frame.style.display = "none";
  frame.src = url;
  frame.onload = () => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(frame);
      URL.revokeObjectURL(url);
    }, 60000);
  };
  document.body.appendChild(frame);
};
