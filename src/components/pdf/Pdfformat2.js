import { createElement as h, useEffect, useState } from "react";
import { jsPDF } from "jspdf";

/* =====================================================================
 * PDF FORMAT 2 – Air Waybill (MGL style, simple modern look)
 *
 *   buildPdfFormat2(data)    -> jsPDF document
 *   downloadPdfFormat2(data) -> saves "<AWB ref>.pdf"
 *
 * Layout is defined on a 0..1000 horizontal grid ("u") and on the
 * vertical grid of the reference form ("py"), so every line / label can
 * be moved by changing one number.
 * ===================================================================== */

const TITLE_2 = "Air Waybill";

/* ---------- Palette (one accent, rest neutral) ---------- */
const NAVY = [15, 39, 71];
const ACCENT = [37, 99, 235];
const INK = [30, 41, 59];
const MUTED = [100, 116, 139];
const LINE = [148, 163, 184];

const L = 28;
const W = 539;
const X = (u) => L + (u * W) / 1000;
const Y = (py) => 40 + (py - 235) * 0.405;

export const DEFAULT_AWB = {
  houseRef: "MGL   STR   0020 6371",
  mawb: "MAWB: 074-0644 9730",
  docNo: "MGL-0020 6371",

  shipperAccount: "0",
  shipper: [
    "SECURITON AG",
    "ALARM AND SECURITY SYSTEMS",
    "ALPENSTRASSE 20",
    "3052 ZOLLIKOFEN, CHINA",
  ],

  consigneeAccount: "0",
  consignee: [
    "DW AUTOMATION",
    "NO. 20/1 2ND CROSS, GURURAJA LAYOUT",
    "PADMANABHANAGAR, 3RD STAGE",
    "4TH PHASE, 7TH BLOCK",
    "560085 BANGALORE, KARNATAKA, INDIA",
  ],

  issuedByName: "MGL EUROPE GMBH",
  issuedByAddr1: "INDUSTRIESTRASSE 4",
  issuedByAddr2: "70565 STUTTGART",

  agent: ["MGL EUROPE GMBH", "70565 STUTTGART"],
  iataCode: "23-4-7507 7054",
  agentAccountNo: "",

  accountingInfo: "",
  referenceNumber: "26-11-370-0077",
  optionalShipping: "EXW",

  departure: "STUTTGART,GERMANY",
  routeTo1: "AMS",
  routeBy1: "KL",
  routeTo2: "BLR",
  routeBy2: "KL",
  routeTo3: "",
  routeBy3: "",

  currency: "EUR",
  chgCode: "C",
  wtValPP: "",
  wtValCC: "C",
  otherPP: "",
  otherCC: "X",
  declCarriage: "NVD",
  declCustoms: "NCV",

  destination: "BANGALORE",
  flight1: "KL8320/19",
  flight2: "KL0879/21",
  insuranceAmount: "NIL",

  handling: [
    "NOT SECURED CARGO // EBR OK",
    "13 PIECES MARKED LABEL ADDRESS SE261105703",
  ],
  ecStatus: "EC-STATUS: X",

  pieces: "13",
  grossWeight: "1234,6",
  weightUnit: "K",
  rateClass: "Q",
  chargeableWeight: "2532,0",
  asAgreed: "AS AGREED",
  nature: [
    "PARTS: SMOKE SENSOR,",
    "RELAY MODULE, DUST FILTER",
    "UNIT, ETC",
    "- NOT RESTRICTED",
  ],
  // [qty, length, width, height]
  dims: [
    [1, 55, 42, 43],
    [5, 120, 80, 159],
    [1, 120, 80, 105],
    [1, 120, 80, 144],
    [1, 80, 60, 137],
    [1, 62, 38, 51],
    [1, 120, 80, 158],
  ],
  totalCbm: "15,191",
  totalPieces: "13",
  totalGross: "1234,6",

  signShipper: "MGL EUROPE GMBH, KRISTALLIA MELISSAS",
  carrierName: "MGL EUROPE GMBH, AS CARRIER",
  executedDate: "18.NOV.2026",
  executedPlace: "STUTTGART",
};

export const buildPdfFormat2 = (data = {}) => {
  const d = { ...DEFAULT_AWB, ...data };
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.55);

  /* ---------- primitives ---------- */
  const ln = (u1, p1, u2, p2) => doc.line(X(u1), Y(p1), X(u2), Y(p2));
  const hl = (p, u1, u2) => ln(u1, p, u2, p);
  const vl = (u, p1, p2) => ln(u, p1, u, p2);

  // py = vertical centre of the text; maxW (pt) shrinks the font to fit
  const T = (s, u, py, o = {}) => {
    const { size = 7.5, bold = false, align = "left", maxW, color } = o;
    let fs = size;
    const str = String(s ?? "");
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(fs);
    doc.setTextColor(...(color || (size >= 9 ? INK : MUTED)));
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

  const DATA = 9.5; // size of typed data
  const LAB = 7.5; // size of printed labels

  /* ================================================================
   * Top references
   * ================================================================ */
  T(d.houseRef, 15, 214, { size: 12, bold: true, color: NAVY });
  T(d.mawb, 383, 214, { size: 12, color: MUTED });
  Rt(d.docNo, 985, 214, { size: 12, bold: true, color: NAVY });

  /* ================================================================
   * Frame & grid lines
   * ================================================================ */
  // outer + main verticals
  hl(235, 0, 1000);
  vl(0, 235, 2085);
  vl(1000, 235, 1945);
  vl(500, 235, 992);

  // shipper / consignee blocks
  vl(276, 235, 305);
  hl(305, 276, 500);
  hl(445, 0, 500);
  vl(276, 445, 507);
  hl(507, 276, 500);
  hl(632, 0, 1000);

  // right: issued-by block
  hl(398, 500, 1000);
  hl(433, 500, 1000);

  // agent / iata
  hl(712, 0, 500);
  vl(276, 712, 793);
  hl(793, 0, 1000);

  // departure / reference
  hl(852, 0, 1000);

  // routing row
  [60, 300, 355, 400, 459].forEach((u) => vl(u, 852, 935));
  [562, 603, 661, 719, 857].forEach((u) => vl(u, 852, 935));
  hl(882, 603, 719);
  vl(632, 882, 935);
  vl(690, 882, 935);
  hl(935, 0, 1000);

  // destination row
  vl(246, 935, 992);
  hl(960, 246, 500);
  vl(374, 960, 992);
  vl(661, 935, 992);
  hl(992, 0, 1000);

  // handling info / goods table
  hl(1095, 0, 1000);
  hl(1162, 0, 1000);
  [83, 189, 225, 342, 447, 562, 680].forEach((u) => vl(u, 1095, 1475));
  vl(258, 1118, 1475);
  hl(1118, 225, 342);
  ln(452, 1148, 556, 1103); // diagonal in Rate / Charge header
  hl(1475, 0, 1000);

  /* ================================================================
   * Shipper
   * ================================================================ */
  T("Shipper's Name and Address", 11, 265, { size: LAB });
  T("Shipper's account Number", 290, 258, { size: LAB });
  C(d.shipperAccount, 388, 288, { size: DATA });
  d.shipper.forEach((s, i) =>
    T(s, 11, [330, 356, 382, 408][i] ?? 408 + (i - 3) * 26, { size: DATA }),
  );

  /* Issued by (right) */
  T("Not negotiable", 505, 287, { size: LAB });
  T(d.issuedByName, 665, 283, { size: 11.5 });
  T("Air Waybill", 505, 330, { size: 15, bold: true, color: ACCENT });
  T("Issued by", 505, 365, { size: LAB });
  T(d.issuedByAddr1, 665, 352, { size: 10.5 });
  T(d.issuedByAddr2, 665, 387, { size: 10.5 });
  T(
    "Copies 1, 2 and 3 of this Air Waybill are originals and have the same validity",
    506,
    421,
    {
      size: 7.5,
      maxW: X(995) - X(506),
    },
  );

  /* ================================================================
   * Consignee
   * ================================================================ */
  T("Consignee's Name and Address", 8, 458, { size: LAB });
  T("Consignee's account Number", 290, 461, { size: LAB });
  C(d.consigneeAccount, 388, 490, { size: DATA });
  d.consignee.forEach((s, i) =>
    T(s, 8, [515, 541, 567, 590, 612][i] ?? 612 + (i - 4) * 23, { size: DATA }),
  );

  /* Accounting info (right) */
  T("Accounting Information", 508, 656, { size: LAB });
  if (d.accountingInfo) T(d.accountingInfo, 508, 690, { size: DATA });
  T("Reference:", 508, 784, { size: LAB });

  /* ================================================================
   * Agent
   * ================================================================ */
  T("Issuing Carrier's Agent Name and City", 8, 645, { size: LAB });
  d.agent.forEach((s, i) => T(s, 8, 672 + i * 22, { size: DATA }));
  T("Agent's IATA Code", 8, 735, { size: 8.5 });
  T(d.iataCode, 8, 766, { size: DATA });
  T("Account No.", 285, 735, { size: 8.5 });
  if (d.agentAccountNo) T(d.agentAccountNo, 285, 765, { size: DATA });

  /* ================================================================
   * Departure / reference / routing
   * ================================================================ */
  T(
    "Airport of Departure (Addr. of first Carrier) and requested Routing",
    8,
    805,
    { size: LAB },
  );
  T(d.departure, 8, 829, { size: DATA });

  T("Reference Number", 508, 812, { size: LAB });
  T(d.referenceNumber, 508, 834, { size: DATA });
  T("Optional Shipping Inform.", 735, 812, { size: LAB });
  C(d.optionalShipping, 789, 834, { size: DATA });

  T("to", 12, 864, { size: LAB });
  T("By first Carrier", 66, 866, { size: LAB });
  T("to", 308, 870, { size: LAB });
  T("by", 363, 873, { size: LAB });
  T("to", 405, 873, { size: LAB });
  T("by", 465, 873, { size: LAB });
  T(d.routeTo1, 4, 905, { size: DATA });
  T(d.routeBy1, 66, 907, { size: DATA });
  T(d.routeTo2, 306, 917, { size: DATA });
  T(d.routeBy2, 362, 919, { size: DATA });
  T(d.routeTo3, 406, 919, { size: DATA });
  T(d.routeBy3, 465, 919, { size: DATA });

  /* currency / charges header */
  C("Currency", 531, 873, { size: 6.5 });
  C("CHG", 582, 873, { size: 6.5 });
  C("Code", 582, 887, { size: 6.5 });
  C("WT/VAL", 661 - 29, 873, { size: 6.5 });
  C("PP", 617, 895, { size: 6.5 });
  C("CC", 646, 895, { size: 6.5 });
  C("Other", 690, 873, { size: 6.5 });
  C("PP", 675, 895, { size: 6.5 });
  C("CC", 704, 895, { size: 6.5 });
  C("Decl. Value for Carriage", 788, 873, {
    size: 6.5,
    maxW: X(857) - X(719) - 4,
  });
  C("Decl. Value for Customs", 928, 873, {
    size: 6.5,
    maxW: X(1000) - X(857) - 4,
  });
  C(d.currency, 531, 920, { size: DATA });
  C(d.chgCode, 582, 920, { size: DATA });
  C(d.wtValPP, 617, 920, { size: DATA });
  C(d.wtValCC, 646, 920, { size: DATA });
  C(d.otherPP, 675, 920, { size: DATA });
  C(d.otherCC, 704, 920, { size: DATA });
  C(d.declCarriage, 788, 920, { size: DATA });
  C(d.declCustoms, 928, 920, { size: DATA });

  /* ================================================================
   * Destination row
   * ================================================================ */
  T("Airport of Destination", 11, 949, { size: LAB, bold: true });
  T(d.destination, 11, 974, { size: DATA });
  C("Requested Flight / Date", 372, 948, { size: LAB });
  T(d.flight1, 252, 978, { size: 9 });
  T(d.flight2, 380, 978, { size: 9 });

  T("Amount of Insurance", 504, 951, { size: LAB });
  C(d.insuranceAmount, 580, 980, { size: DATA });
  const insW = X(995) - X(665);
  T(
    "INSURANCE - If carrier offers insurance, and such insurance is",
    665,
    947,
    { size: 6.2, maxW: insW },
  );
  T(
    "requested in accordance with conditions thereof, indicate amount",
    665,
    963,
    { size: 6.2, maxW: insW },
  );
  T('to be in figures in box marked "Amount of Insurance".', 665, 979, {
    size: 6.2,
    maxW: insW,
  });

  /* ================================================================
   * Handling information
   * ================================================================ */
  T("Handling Information", 4, 1005, { size: LAB });
  d.handling.forEach((s, i) => T(s, 3, 1025 + i * 23, { size: DATA }));
  Rt(d.ecStatus, 990, 1083, { size: 8, bold: true, color: INK });

  /* ================================================================
   * Goods table header
   * ================================================================ */
  C("No. of", 41, 1105, { size: LAB });
  C("Pieces", 41, 1125, { size: LAB });
  C("RCP", 41, 1142, { size: LAB });
  C("Gross", 136, 1105, { size: LAB });
  C("Weight", 136, 1142, { size: LAB });
  C("kg", 207, 1106, { size: LAB });
  C("lb", 207, 1142, { size: LAB });
  T("Rate Class", 232, 1107, { size: LAB });
  C("Commodity", 300, 1128, { size: LAB });
  C("Item No.", 300, 1147, { size: LAB });
  C("Chargeable", 395, 1107, { size: LAB });
  C("Weight", 395, 1142, { size: LAB });
  T("Rate", 458, 1107, { size: LAB });
  Rt("Charge", 553, 1146, { size: LAB });
  C("Total", 621, 1108, { size: LAB });
  C("Nature and Quantity of Goods", 840, 1108, { size: LAB });
  C("(incl. Dimensions of Volume)", 840, 1131, { size: LAB });

  /* goods table body */
  Rt(d.pieces, 78, 1184, { size: DATA });
  Rt(d.grossWeight, 180, 1184, { size: DATA });
  C(d.weightUnit, 207, 1184, { size: DATA });
  C(d.rateClass, 242, 1184, { size: DATA });
  Rt(d.chargeableWeight, 438, 1182, { size: DATA });

  const rowY = (k) => 1181 + k * 23.3;
  const NX = 692;
  d.nature.forEach((s, k) => T(s, NX, rowY(k), { size: 9 }));
  d.dims.forEach(([q, l, w, h], i) => {
    const py = rowY(d.nature.length + i);
    Rt(q, 700, py, { size: 9 });
    C("X", 714, py, { size: 9 });
    Rt(l, 752, py, { size: 9 });
    C("X", 767, py, { size: 9 });
    Rt(w, 805, py, { size: 9 });
    C("X", 820, py, { size: 9 });
    Rt(h, 860, py, { size: 9 });
  });
  Rt(d.asAgreed, 676, 1441, { size: 8.5, bold: true, color: INK });
  T("TOTAL CBM:", NX, 1438, { size: 9 });
  Rt(d.totalCbm, 880, 1438, { size: 9, bold: true });
  Rt(d.totalPieces, 78, 1465, { size: DATA, bold: true });
  Rt(d.totalGross, 180, 1461, { size: DATA, bold: true });

  /* ================================================================
   * Lower-left charge block
   * ================================================================ */
  const GTOP = 1475;
  const GH = 80;
  const TH = 32;
  for (let i = 0; i < 6; i++) {
    const top = GTOP + GH * i;
    hl(top, 0, 440);
    hl(top + TH, 0, 440);
    vl(220, top + TH, top + GH);
  }
  hl(GTOP + GH * 6, 0, 440);

  const g = (i) => GTOP + GH * i + 16; // title row centre
  C("Prepaid", 110, g(0) + 2, { size: LAB + 0.5 });
  C("Weight Charge", 220, g(0) - 4, { size: LAB + 0.5 });
  C("Collect", 333, g(0) - 5, { size: LAB + 0.5 });
  C("Valuation Charge", 220, g(1), { size: LAB + 0.5 });
  Rt("Total other Charges", 214, g(2), { size: LAB + 0.5 });
  T("Due Agent", 226, g(2) - 4, { size: LAB + 0.5 });
  Rt("Total other Charges", 214, g(3), { size: LAB + 0.5 });
  T("Due Carrier", 226, g(3) - 4, { size: LAB + 0.5 });
  C("Total prepaid", 120, g(4), { size: LAB + 0.5 });
  C("Total collect", 340, g(4) - 4, { size: LAB + 0.5 });
  C("Currency Conversion Rates", 115, g(5), { size: LAB + 0.5 });
  C("CC Charges in Dest. Currency", 330, g(5) - 4, { size: LAB + 0.5 });

  // row 7: carrier's use only / charges at destination
  const G7 = GTOP + GH * 6; // 1955
  vl(220, G7, 2085);
  hl(2010, 220, 440);
  hl(2085, 0, 440);
  C("For Carrier's Use only", 110, 2024, { size: LAB + 0.5 });
  C("at Destination", 110, 2042, { size: LAB + 0.5 });
  C("Charges at Destination", 334, 1985, { size: LAB + 0.5 });

  /* ================================================================
   * Right-lower blocks
   * ================================================================ */
  vl(440, 1475, 2085);
  T("Other Charges", 452, 1485, { size: LAB + 0.5 });
  hl(1620, 440, 1000);

  const certW = X(992) - X(452);
  T(
    "Shipper certifies that the particulars on the face hereof are correct and that insofar as any part of the",
    452,
    1633,
    { size: 5.6, maxW: certW },
  );
  T(
    "consignment contains dangerous goods, such part is properly described by name and is in proper condition for",
    452,
    1649,
    { size: 5.6, maxW: certW },
  );
  T(
    "carriage by air according to the applicable Dangerous Goods Regulations.",
    452,
    1665,
    { size: 5.6, maxW: certW },
  );

  T(d.signShipper, 564, 1742, { size: DATA, maxW: X(995) - X(564) });
  C("Signature of Shipper or his Agent", 714, 1767, { size: LAB });
  hl(1795, 440, 1000);

  T(d.carrierName, 452, 1868, { size: DATA });
  T(d.executedDate, 452, 1897, { size: DATA });
  T(d.executedPlace, 579, 1897, { size: DATA });
  T("Executed on (Date)", 452, 1928, { size: LAB });
  T("at (Place)", 579, 1928, { size: LAB });
  T("Signature of Issuing Carrier or its Agent", 700, 1920, { size: LAB });
  hl(1945, 440, 1000);

  // Total Collect Charges box
  vl(648, 1945, 2040);
  hl(1992, 440, 648);
  hl(2040, 440, 648);
  C("Total Collect Charges", 545, 1970, { size: LAB });

  T(d.docNo, 850, 1962, { size: 12, bold: true, color: NAVY });

  return doc;
};

export const downloadPdfFormat2 = (data = {}) => {
  const doc = buildPdfFormat2(data);
  const name = String(data.docNo || DEFAULT_AWB.docNo).replace(
    /[\\/:*?"<>|]/g,
    "-",
  );
  doc.save(`${name}.pdf`);
};

/* ---------------------------------------------------------------------
 * Default export: ready-to-route React component (no JSX needed).
 *   <Route path="..." element={<PdfFormat2 />} />
 * Optional prop: data = {...} to fill the form.
 * ------------------------------------------------------------------- */
const PdfFormat2 = ({ data = {} }) => {
  const [url, setUrl] = useState("");
  const key = JSON.stringify(data);

  useEffect(() => {
    const u = URL.createObjectURL(buildPdfFormat2(data).output("blob"));
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
            TITLE_2,
          ),
          h(
            "div",
            { style: { fontSize: 12.5, color: "#64748b" } },
            "Live preview",
          ),
        ),
        h(
          "button",
          { onClick: () => downloadPdfFormat2(data), style: btn },
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

export default PdfFormat2;
