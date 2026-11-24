import { createElement as h, useEffect, useState } from "react";
import { jsPDF } from "jspdf";

/* =====================================================================
 * PDF FORMAT 4 – Non-Negotiable Waybill (Maersk style, simple modern
 *                look)
 *
 *   buildPdfFormat4(data)    -> jsPDF document
 *   downloadPdfFormat4(data) -> saves "<B/L no>.pdf"
 *   default export           -> React preview component
 *
 * Layout is defined on a 0..1000 horizontal grid ("u") and on the
 * vertical grid of the reference form ("py"), so every line / label can
 * be moved by changing one number.
 * ===================================================================== */

const TITLE_4 = "Non-Negotiable Waybill";

/* ---------- Palette (one accent, rest neutral) ---------- */
const NAVY = [15, 39, 71];
const ACCENT = [37, 99, 235];
const INK = [30, 41, 59];
const MUTED = [100, 116, 139];
const LINE = [148, 163, 184];
const BG = [241, 245, 249];
const WHITE = [255, 255, 255];

const L = 28;
const W = 539;
const X = (u) => L + (u * W) / 1000;
const Y = (py) => 28 + (py - 97) * 0.39;

export const DEFAULT_WB = {
  brand: "MAERSK",
  logo: "", // optional data-URL; replaces the text wordmark
  docTitle: "NON-NEGOTIABLE WAYBILL",
  scac: "MAEU",
  blNo: "277488791",
  bookingNo: "277488791",
  exportRefs: "",
  svcContract: "",

  shipper: [
    "CARGOMIND (ROMANIA) S.R.L.",
    "NR 1A, STR DRUMUL GARII ODAI",
    "OTOPENI",
    "075100",
    "ROMANIA",
  ],
  consignee: [
    "UNIWORLD LOGISTICS PVT LTD",
    "225 ST BED EXTN",
    "BENGALURU",
    "560034",
    "INDIA",
  ],
  notify: [
    "UNIWORLD LOGISTICS PVT LTD",
    "225 ST BED EXTN",
    "BENGALURU",
    "560034",
    "INDIA",
  ],

  onwardRouting: "",
  vessel: "CHLOE D",
  voyage: "640S",
  placeOfReceipt: "",
  portOfLoading: "Constanta",
  portOfDischarge: "Ennore Chennai",
  placeOfDelivery: "Bengaluru",

  weight: "20368.880 KGS",
  measurement: "60.0000 CBM",
  goods: [
    "1 Container Said to Contain 1 PLATES",
    "25 Aluminium plates",
    "25 Aluminium plates",
    "GCXU6309406  ML-RO0057539  40 DRY 9'6  1 PLATES  20368.880 KGS  60.0000 CBM",
  ],
  sanctionsClause:
    "The Merchant(s) warrant and represent that this shipment and/or Goods will comply at all times with European Union, United States and United Nations sanctions and/or export control laws (Sanctions Laws), and that this shipment and/or Goods do not involve, whether directly or indirectly, any entity or person identified, or owned or controlled by any such entity or person identified, on the U.S. Treasury Departments Office of Foreign Asset Control (OFAC) list of Specially Designated Nationals and Blocked Persons, or any other similar list maintained by the European Union, or as promulgated by the United Nations Security Council (Designated Person).  If, in the Carriers reasonable opinion, this shipment and/or Goods are in violation of the Carriers policy on Russia [https://www.maersk.com/news/articles/2022/02/24/russia-ukraine-situation-update], Sanctions Laws or involves any Designated Person, the shipment and/or Goods will be",
  watermark: "COPY",

  // optional freight rows: [description, rate, unit, currency, prepaid, collect]
  freightRows: [],

  carriersReceipt: "1 container",
  placeOfIssue: "Bucharest",
  shippedOnBoard: "2026-10-07",
  dateOfIssue: "2026-10-08",
  declaredValue: "",
  agent: "MAERSK ROMANIA SRL",
  agentNote: "As Agent(s)",
  numberedPages: "This transport document has one or more numbered pages",
};

const CONTRACT_1 =
  "This contract is subject to the terms, conditions and exceptions, including the law & jurisdiction clause and limitation of liability & declared value clauses, of the current Maersk Bill of Lading (available from the Carrier, its agents and at terms.maersk.com/carriage), which are applicable with logical amendments (mutatis mutandis). To the extent necessary to enable the Consignee to sue and to be sued under this contract, the Shipper on entering into this contract does so on its own behalf and as agent for and on behalf of the Consignee and warrants that he has the authority to do so. The shipper shall be entitled to change the Consignee at any time before delivery of the goods provided he gives the Carrier reasonable notice in writing.";
const CONTRACT_2 =
  "Delivery will be made to the Consignee or his authorised agent on production of reasonable proof of identity (and, in the case of an agent, reasonable proof of authority) without production of this waybill. The Carrier shall be under no liability whatsoever for misdelivery unless caused by the Carrier's negligence.";
const SHIPPED_TEXT =
  "Shipped, as far as ascertained by reasonable means of checking, in apparent good order and condition unless otherwise stated herein the total number or quantity of Containers or other packages or units indicated in the box opposite entitled \u201cCarrier\u2019s Receipt\u201d";

export const buildPdfFormat4 = (data = {}) => {
  const d = { ...DEFAULT_WB, ...data };
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
  const frame = (p1, p2, r = 5) =>
    doc.roundedRect(X(0), Y(p1), W, Y(p2) - Y(p1), r, r, "S");

  const T = (s, u, py, o = {}) => {
    const { size = 6, bold = false, align = "left", maxW, color } = o;
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

  const P = (str, u, py, wU, o = {}) => {
    const { size = 6.4, lh = 7.4, color = INK } = o;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(str, X(u + wU) - X(u));
    lines.forEach((t, i) => doc.text(t, X(u), Y(py) + i * lh + size * 0.35));
    return lines.length;
  };

  const DATA = 9.5;
  const LAB = 6;
  const LU = 6;
  const RU = 512;

  /* ================================================================
   * Soft panels (drawn first), watermark, then frames
   * ================================================================ */
  box(2, 907, 998, 930);
  box(2, 1448, 998, 1474);
  box(870, 98, 998, 159);

  if (d.watermark) {
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.07 }));
    doc.setFont("helvetica", "bold");
    doc.setFontSize(100);
    doc.setTextColor(...NAVY);
    doc.text(d.watermark, X(350), Y(1130) + 30, { align: "center" });
    doc.restoreGraphicsState();
  }

  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.7);
  frame(97, 878);
  frame(907, 1442);
  frame(1447, 2060);
  doc.setLineWidth(0.55);

  /* ================================================================
   * Header : logo + title + SCAC / B/L
   * ================================================================ */
  {
    let drawn = false;
    if (d.logo) {
      try {
        const p = doc.getImageProperties(d.logo);
        const hh = 28;
        const ww = (p.width / p.height) * hh;
        doc.addImage(
          d.logo,
          p.fileType || "PNG",
          X(30),
          Y(146) - hh / 2,
          ww,
          hh,
        );
        drawn = true;
      } catch (e) {
        drawn = false;
      }
    }
    if (!drawn) {
      // simple star badge + wordmark
      const cx = X(48);
      const cy = Y(142);
      doc.setFillColor(...ACCENT);
      doc.roundedRect(cx - 14, cy - 14, 28, 28, 3, 3, "F");
      doc.setFillColor(...WHITE);
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const px = (r, da = 0) => cx + r * Math.cos(a + da);
        const py = (r, da = 0) => cy + r * Math.sin(a + da);
        doc.triangle(
          px(11),
          py(11),
          px(2.6, 0.55),
          py(2.6, 0.55),
          px(2.6, -0.55),
          py(2.6, -0.55),
          "F",
        );
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(21);
      doc.setTextColor(...NAVY);
      doc.text(String(d.brand || ""), X(112), cy + 7.5);
    }
  }
  T(d.docTitle, 526, 133, { size: 12, bold: true, color: NAVY });
  T("SCAC", 878, 124, { size: 6 });
  Rt(d.scac, 994, 143, { size: 10.5, bold: true });
  T("B/L No.", 878, 172, { size: 6 });
  Rt(d.blNo, 994, 193, { size: 10.5, bold: true, color: ACCENT });

  /* ================================================================
   * Block 1 lines
   * ================================================================ */
  vl(504, 97, 878);
  vl(870, 97, 208);
  hl(159, 870, 1000);
  hl(195, 0, 504);
  hl(208, 504, 1000);
  hl(272, 504, 1000);
  hl(455, 504, 1000);
  hl(392, 0, 504);
  hl(580, 0, 504);
  hl(708, 504, 1000);
  hl(765, 0, 1000);
  hl(830, 0, 1000);
  vl(239, 765, 878);

  /* Shipper */
  T(
    "Shipper (As principal, where \u201ccare of\u201d, \u201cc/o\u201d, or other variants used.)",
    LU,
    205,
  );
  d.shipper.forEach((s, i) => T(s, LU, 227 + i * 28, { size: DATA + 1 }));

  /* Booking / export refs */
  T("Booking No.", 515, 214);
  T(d.bookingNo, 515, 237, { size: DATA + 1 });
  T("Export references", 509, 281);
  if (d.exportRefs) T(d.exportRefs, 509, 305, { size: DATA });
  Rt("Svc Contract", 990, 284);
  if (d.svcContract) Rt(d.svcContract, 990, 305, { size: DATA });

  /* Consignee */
  T(
    "Consignee (Negotiable only if consigned \u201cto order\u201d, \u201cto order of\u201d a named Person or \u201cto order of bearer\u201d.",
    LU,
    397,
    {
      size: 5.4,
      maxW: X(500) - X(LU),
    },
  );
  T(
    "As principal, where \u201ccare of\u201d, \u201cc/o\u201d, or other variants used.)",
    LU,
    413,
    { size: 5.4 },
  );
  d.consignee.forEach((s, i) => T(s, LU, 438 + i * 27, { size: DATA + 1 }));

  /* Notify */
  T("Notify Party (see clause 22)", LU, 588);
  d.notify.forEach((s, i) => T(s, LU, 611 + i * 27, { size: DATA + 1 }));

  /* Contract paragraph */
  {
    const n = P(CONTRACT_1, RU - 4, 466, 488, { size: 6.2, lh: 7.4 });
    P(CONTRACT_2, RU - 4, 466 + n * 19, 488, { size: 6.2, lh: 7.4 });
  }

  T(
    "Onward inland routing (Not part of Carriage as defined in clause 1. For account and risk of Merchant)",
    515,
    716,
    {
      size: 5.6,
      bold: true,
      maxW: X(995) - X(515),
    },
  );
  if (d.onwardRouting) T(d.onwardRouting, 515, 740, { size: DATA });

  /* Vessel / voyage / ports */
  T("Vessel", LU, 774);
  T(d.vessel, LU, 795, { size: DATA });
  T("Voyage No.", 245, 776);
  T(d.voyage, 245, 797, { size: DATA });
  T("Port of Loading", LU, 840);
  T(d.portOfLoading, LU, 861, { size: DATA });
  T("Port of Discharge", 245, 838);
  T(d.portOfDischarge, 245, 859, { size: DATA });

  T(
    "Place of Receipt. Applicable only when document used as Multimodal Waybill",
    515,
    776,
    {
      size: 5.6,
      bold: true,
      maxW: X(995) - X(515),
    },
  );
  if (d.placeOfReceipt) T(d.placeOfReceipt, 515, 798, { size: DATA });
  T(
    "Place of Delivery. Applicable only when document used as Multimodal Transport B/L. (see clause 1)",
    509,
    840,
    {
      size: 5.6,
      bold: true,
      maxW: X(995) - X(509),
    },
  );
  T(d.placeOfDelivery, 509, 861, { size: DATA });

  /* ================================================================
   * Particulars furnished by shipper
   * ================================================================ */
  C("PARTICULARS FURNISHED BY SHIPPER", 500, 892, {
    size: 9.5,
    bold: true,
    color: NAVY,
  });
  vl(693, 907, 1442);
  vl(840, 907, 1442);
  T(
    "Kind of Packages; Description of goods; Marks and Numbers;  Container No./Seal No.",
    16,
    918,
    { size: 5.8 },
  );
  T("Weight", 712, 917);
  T("Measurement", 858, 917);
  T(d.weight, 712, 941, { size: DATA + 1, maxW: X(836) - X(712) });
  T(d.measurement, 858, 941, { size: DATA + 1, maxW: X(996) - X(858) });

  d.goods.forEach((s, i) =>
    T(s, 18, 968 + i * 50, { size: DATA, maxW: X(688) - X(18) }),
  );
  P(d.sanctionsClause, 18, 1145, 668, { size: 8, lh: 9.8 });
  T(
    "Above particulars as declared by Shipper, but without responsibility of or representation by Carrier.",
    12,
    1436,
    {
      size: 5.4,
      bold: true,
    },
  );

  /* ================================================================
   * Freight & charges block
   * ================================================================ */
  [374, 504, 677, 728, 855].forEach((u) => vl(u, 1447, 1685));
  hl(1685, 0, 1000);
  T("Freight & Charges", 26, 1465);
  T("Rate", 382, 1458);
  T("Unit", 512, 1457);
  T("Currency", 681, 1455);
  T("Prepaid", 733, 1455);
  T("Collect", 862, 1455);
  d.freightRows.forEach((r, i) => {
    const py = 1500 + i * 26;
    T(r[0], 8, py, { size: 8.5, maxW: X(366) - X(8) });
    T(r[1], 382, py, { size: 8.5 });
    T(r[2], 512, py, { size: 8.5 });
    T(r[3], 681, py, { size: 8.5 });
    T(r[4], 733, py, { size: 8.5 });
    T(r[5], 862, py, { size: 8.5 });
  });

  /* carrier's receipt table */
  vl(504, 1685, 1875);
  vl(245, 1695, 1815);
  hl(1695, 0, 504);
  hl(1760, 0, 504);
  hl(1812, 0, 504);
  hl(1875, 0, 504);
  hl(1752, 245, 504);
  T("Carrier's Receipt. Total number of containers or", 24, 1709, {
    size: 5.4,
  });
  T("packages received by Carrier.", 24, 1725, { size: 5.4 });
  T(d.carriersReceipt, 24, 1745, { size: DATA });
  T("Place of Issue of Waybill", 252, 1710);
  T(d.placeOfIssue, 252, 1732, { size: DATA });
  T("Shipped on Board Date ( Local Time )", 24, 1774);
  T(d.shippedOnBoard, 24, 1795, { size: DATA });
  T("Date Issue of Waybill", 252, 1770);
  T(d.dateOfIssue, 252, 1792, { size: DATA });
  T("Declared Value Charges (see clause 7.3 of the Maersk Bill of", 24, 1840, {
    size: 5.4,
  });
  T("Lading) for Declared Value of US$", 24, 1857, { size: 5.4 });
  if (d.declaredValue) T(d.declaredValue, 330, 1857, { size: DATA });

  /* shipped statement + signature */
  P(SHIPPED_TEXT, 512, 1705, 482, { size: 6.4, lh: 7.4 });
  C("Signed for the Carrier Maersk A/S", 760, 1864, { size: 5.8, bold: true });
  hl(1997, 540, 975);
  T(d.agent, 600, 2015, { size: 10.5, color: NAVY });
  T(d.agentNote, 700, 2038, { size: 5.6 });

  T(d.numberedPages, 8, 2080, { size: 7.5, color: MUTED });

  return doc;
};

export const downloadPdfFormat4 = (data = {}) => {
  const doc = buildPdfFormat4(data);
  const name = String(data.blNo || DEFAULT_WB.blNo).replace(
    /[\\/:*?"<>|]/g,
    "-",
  );
  doc.save(`${name}.pdf`);
};

/* ---------------------------------------------------------------------
 * Default export: ready-to-route React component (no JSX needed).
 *   <Route path="..." element={<PdfFormat4 />} />
 * Optional prop: data = {...} to fill the form.
 * ------------------------------------------------------------------- */
const PdfFormat4 = ({ data = {} }) => {
  const [url, setUrl] = useState("");
  const key = JSON.stringify(data);

  useEffect(() => {
    const u = URL.createObjectURL(buildPdfFormat4(data).output("blob"));
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
            TITLE_4,
          ),
          h(
            "div",
            { style: { fontSize: 12.5, color: "#64748b" } },
            "Live preview",
          ),
        ),
        h(
          "button",
          { onClick: () => downloadPdfFormat4(data), style: btn },
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

export default PdfFormat4;
