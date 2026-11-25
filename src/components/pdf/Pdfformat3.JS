import { createElement as h, useEffect, useState } from "react";
import { jsPDF } from "jspdf";

/* =====================================================================
 * PDF FORMAT 3 – Combined Transport Sea Waybill (CargoMind style,
 *                simple modern look)
 *
 *   buildPdfFormat3(data)    -> jsPDF document
 *   downloadPdfFormat3(data) -> saves "<HBL no>.pdf"
 *   default export           -> React preview component
 *
 * Layout is defined on a 0..1000 horizontal grid ("u") and on the
 * vertical grid of the reference form ("py"), so every line / label can
 * be moved by changing one number.
 * ===================================================================== */

const TITLE_3 = "Combined Transport Sea Waybill";

/* ---------- Palette (one accent, rest neutral) ---------- */
const NAVY = [15, 39, 71];
const ACCENT = [37, 99, 235];
const INK = [30, 41, 59];
const MUTED = [100, 116, 139];
const LINE = [148, 163, 184];
const BG = [241, 245, 249];

const L = 28;
const W = 539;
const X = (u) => L + (u * W) / 1000;
const Y = (py) => 95 + (py - 393) * 0.4;

export const DEFAULT_SWB = {
  brand: "",
  logo: "", // optional data-URL; replaces the text wordmark
  title1: "Non-Negotiable",
  title2: "Combined Transport Sea Waybill",
  rulesNote:
    "COMBICONWAYBILL  Subject to the CMI Uniform Rules for Sea Waybills",

  shipper: [
    "GILINOX SRL",
    "STREET MARAMURESULUI, NR 38",
    "075100 OTOPENI",
    "Romania",
  ],
  carrierRef: "563-2609-0014",
  hblNo: "CNDCM260069",

  consignee: [
    "Scope Metals Trading & Services India",
    "Hi-Tech Defense AerospacePark 179, 180",
    "Bengaluru Urban KA 562149",
    "India",
    "ashok_kumar@scope-metal.in",
  ],
  carrier: [
    "Cargomind (Austria) GmbH",
    "Freudenauer Hafenstra\u00dfe 20",
    "1020 Wien",
    "Austria",
  ],

  notify: [
    "Scope Metals Trading & Services India",
    "Hi-Tech Defense AerospacePark 179, 180",
    "Bengaluru Urban KA 562149",
    "India",
    "ashok_kumar@scope-metal.in",
  ],
  placeOfAcceptance: "Otopeni",

  portOfLoading: "Constanta",
  placeOfDelivery: "Bangalore",
  oceanVessel: "CHLOE D",
  voyage: "640S",
  portOfDischarge: "Ennore",

  marks: ["GCXU6309406", "Seal No.", "RO0057539"],
  packages: "1x  40FT HC",
  description: "said to contain:",
  weight: "20,368.88 kg",
  volume: "60.000 m3",
  qty: "25",
  goods: ["25 Aluminium Plates", "HS Code: 760612"],

  declaredValue: "",
  freightCharges: "Prepaid",
  releaseTo: "",

  placeAndDate: "Constanta, 2026-OCT-14",
  blType: "Express B/L",
  carrierSign: [
    "Cargomind (Romania) S.R.L.",
    "Str. Mircea cel Batran, Nr.152 bis",
    "900627 Constanta CT",
    "Romania",
  ],
};

const CLAUSE_1 =
  "The Merchant's attention is called to the fact that according to Clauses 10 to 12 and Clause 24 of this Sea Waybill, the liability of the Carrier is, in most cases, limited in respect to loss of or damage to the goods and delay.";
const CLAUSE_2 =
  "RECEIVED the goods in apparent good order and condition and, as far as ascertained by reasonable means of checking, as specified above unless otherwise stated. The Carrier, in accordance with and to the extent of the provisions contained in this Sea Waybill, and with liberty to sub-contract, undertakes to perform and/or in his own name to procure performance of the combined transport and the delivery of the goods, including all services related thereto, from the place and time of taking the goods in charge to the place and time of delivery and accepts responsibility for such transport and such services. The Shipper can transfer right of control of the cargo to the Consignee. Such option must be noted on this Sea Waybill and be made no late than the receipt of the cargo by the Carrier.";

export const buildPdfFormat3 = (data = {}) => {
  const d = { ...DEFAULT_SWB, ...data };
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.55);

  /* ---------- primitives ---------- */
  const ln = (u1, p1, u2, p2) => doc.line(X(u1), Y(p1), X(u2), Y(p2));
  const hl = (p, u1, u2) => ln(u1, p, u2, p);
  const vl = (u, p1, p2) => ln(u, p1, u, p2);
  const box = (u1, p1, u2, p2, c = BG) => {
    doc.setFillColor(...c);
    doc.rect(X(u1), Y(p1), X(u2) - X(u1), Y(p2) - Y(p1), "F");
  };

  // py = vertical centre of the text; maxW (pt) shrinks the font to fit
  const T = (s, u, py, o = {}) => {
    const { size = 6.3, bold = false, align = "left", maxW, color } = o;
    let fs = size;
    const str = String(s ?? "");
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(fs);
    doc.setTextColor(...(color || (size >= 8 ? INK : MUTED)));
    if (maxW) {
      while (fs > 4 && doc.getTextWidth(str) > maxW) {
        fs -= 0.2;
        doc.setFontSize(fs);
      }
    }
    doc.text(str, X(u), Y(py) + fs * 0.35, { align });
  };
  const C = (s, u, py, o = {}) => T(s, u, py, { ...o, align: "center" });
  const Rt = (s, u, py, o = {}) => T(s, u, py, { ...o, align: "right" });

  // wrapped paragraph; returns number of lines
  const P = (str, u, py, wU, o = {}) => {
    const { size = 5.6, lh = 6.2, color = INK } = o;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(str, X(u + wU) - X(u));
    lines.forEach((t, i) => doc.text(t, X(u), Y(py) + i * lh + size * 0.35));
    return lines.length;
  };

  const DATA = 8.5;
  const LAB = 6.3;
  const LU = 5; // left text inset (u)
  const RU = 510; // right column inset (u)

  /* ================================================================
   * Header : title + logo
   * ================================================================ */
  T(d.title1, LU, 303, { size: 13, bold: true, color: NAVY });
  T(d.title2, LU, 337, { size: 17, color: ACCENT });
  T(d.rulesNote, LU, 369, { size: 6.4, color: MUTED });

  /* ================================================================
   * Soft panels, then frame lines
   * ================================================================ */
  box(0, 950, 1000, 975);
  box(0, 1553, 500, 1566);

  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(1.2);
  hl(393, 0, 1000);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.55);

  vl(499, 393, 950);
  vl(499, 1553, 2005);
  hl(441, 500, 1000);
  hl(532, 0, 1000);
  hl(672, 0, 1000);
  hl(812, 0, 500);
  hl(815, 500, 1000);
  hl(856, 0, 500);
  hl(905, 0, 500);
  hl(950, 0, 1000);
  hl(975, 0, 1000);

  hl(1553, 0, 1000);
  hl(1610, 0, 500);
  hl(1608, 500, 1000);
  hl(1752, 500, 1000);
  hl(1802, 500, 1000);
  hl(1840, 0, 500);

  /* ================================================================
   * Shipper / references
   * ================================================================ */
  T("Shipper", LU, 402);
  d.shipper.forEach((s, i) => T(s, LU, 424 + i * 23, { size: DATA }));

  T("Carrier's Reference", RU, 403);
  T(d.carrierRef, RU, 426, { size: DATA });
  Rt("HBL Number", 995, 404, { size: LAB });
  Rt(d.hblNo, 995, 426, { size: DATA, bold: true });

  /* Consignee / Carrier */
  T("Consignee", LU, 543);
  d.consignee.forEach((s, i) =>
    T(s, LU, 566 + i * 23, { size: DATA, maxW: X(490) - X(LU) }),
  );
  T("Carrier", RU, 545);
  d.carrier.forEach((s, i) => T(s, RU, 567 + i * 23, { size: DATA }));

  /* Notify / place of acceptance */
  T("Notify Address", LU, 683);
  d.notify.forEach((s, i) =>
    T(s, LU, 706 + i * 23, { size: DATA, maxW: X(490) - X(LU) }),
  );
  T("Place of Acceptance", RU, 683);
  T(d.placeOfAcceptance, RU, 706, { size: DATA });

  T("Place of Delivery", RU, 826);
  T(d.placeOfDelivery, RU, 847, { size: DATA });

  /* Loading / vessel / discharge */
  T("Port of Loading", LU, 823);
  T(d.portOfLoading, LU, 843, { size: DATA });
  T("Ocean Vessel", LU, 866);
  T(d.oceanVessel, LU, 885, { size: DATA });
  Rt("Voyage Number", 490, 870, { size: LAB });
  Rt(d.voyage, 490, 889, { size: DATA, bold: true });
  T("Port of Discharge", LU, 914);
  T(d.portOfDischarge, LU, 933, { size: DATA });

  /* ================================================================
   * Cargo particulars
   * ================================================================ */
  T("Shipping Marks", LU, 962);
  T("Number and Types of Package", 167, 962);
  T("Description of Goods", 356, 962);
  Rt("Weight", 848, 962);
  Rt("Volume", 973, 962);

  d.marks.forEach((s, i) => T(s, LU, 992 + i * 22, { size: DATA }));
  T(d.packages, 214, 992, { size: DATA });
  T(d.description, 356, 992, { size: DATA });
  Rt(d.weight, 848, 992, { size: DATA });
  Rt(d.volume, 973, 992, { size: DATA });
  C(d.qty, 274, 1060, { size: DATA });
  d.goods.forEach((s, i) => T(s, 412, 1060 + i * 22, { size: DATA }));

  /* ================================================================
   * Lower block
   * ================================================================ */
  Rt("Particulars above declared by Shipper", 494, 1559, { size: LAB });

  T(
    "Shipper's Declared Value of Goods (Subject to Payment of an Extra Charge)",
    LU,
    1588,
    { size: LAB },
  );
  if (d.declaredValue) T(d.declaredValue, LU, 1600, { size: DATA });
  Rt("Collect", 490, 1622, { size: LAB });
  C("Prepaid", 330, 1626, { size: LAB });
  T("Freight and Charges", LU, 1648);
  T(d.freightCharges, LU, 1676, { size: 11, bold: true });

  T("For Release of Cargo apply to", LU, 1870);
  if (d.releaseTo) T(d.releaseTo, LU, 1892, { size: DATA });

  /* clauses */
  P(CLAUSE_1, RU, 1566, 485, { size: 5.5, lh: 6.2, color: MUTED });
  P(CLAUSE_2, RU, 1621, 485, { size: 5.5, lh: 6.2, color: MUTED });

  T("Place and Date of Issue", RU, 1763);
  T(d.placeAndDate, RU, 1785, { size: DATA });
  Rt(d.blType, 995, 1765, { size: DATA, bold: true, color: ACCENT });

  T("Signature of the Carrier or its Agent", RU, 1812);
  d.carrierSign.forEach((s, i) => T(s, RU, 1837 + i * 25, { size: DATA }));

  return doc;
};

export const downloadPdfFormat3 = (data = {}) => {
  const doc = buildPdfFormat3(data);
  const name = String(data.hblNo || DEFAULT_SWB.hblNo).replace(
    /[\\/:*?"<>|]/g,
    "-",
  );
  doc.save(`${name}.pdf`);
};

/* ---------------------------------------------------------------------
 * Default export: ready-to-route React component (no JSX needed).
 *   <Route path="..." element={<PdfFormat3 />} />
 * Optional prop: data = {...} to fill the form.
 * ------------------------------------------------------------------- */
const PdfFormat3 = ({ data = {} }) => {
  const [url, setUrl] = useState("");
  const key = JSON.stringify(data);

  useEffect(() => {
    const u = URL.createObjectURL(buildPdfFormat3(data).output("blob"));
    setUrl(u);
    return () => URL.revokeObjectURL(u);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const btn = {
    padding: "9px 18px",
    borderRadius: 8,
    border: 0,
    background: "linear-gradient(135deg,#1d4ed8,#2563eb)",
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(37,99,235,.35)",
  };

  return h(
    "div",
    {
      style: {
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: 24,
        fontFamily: "Inter, system-ui, sans-serif",
      },
    },
    h(
      "div",
      { style: { maxWidth: 900, margin: "0 auto" } },
      h(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          },
        },
        h(
          "div",
          null,
          h(
            "div",
            { style: { fontSize: 18, fontWeight: 700, color: "#0f2747" } },
            TITLE_3,
          ),
          h(
            "div",
            { style: { fontSize: 12.5, color: "#64748b" } },
            "Live preview",
          ),
        ),
        h(
          "button",
          { onClick: () => downloadPdfFormat3(data), style: btn },
          "Download PDF",
        ),
      ),
      h(
        "div",
        {
          style: {
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 8px 30px rgba(15,39,71,.12)",
            overflow: "hidden",
          },
        },
        url &&
          h("iframe", {
            src: url,
            title: "PDF preview",
            style: {
              width: "100%",
              height: "86vh",
              border: 0,
              display: "block",
            },
          }),
      ),
    ),
  );
};

export default PdfFormat3;
