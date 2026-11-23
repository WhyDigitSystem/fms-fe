import { createElement as h, useEffect, useState } from "react";
import { jsPDF } from "jspdf";

/* =====================================================================
 * PDF FORMAT 1 – Multimodal Transport Bill of Lading
 *
 *   buildPdfFormat1(data)    -> jsPDF document
 *   downloadPdfFormat1(data) -> saves "<BL no>_BL.pdf"
 *
 * Every field is optional. Anything you do not pass keeps the bracketed
 * placeholder shown on the template, e.g. "[Legal name, full address...]".
 * ===================================================================== */

/* ---------- Colours ---------- */
const DARK = [58, 58, 58];
const MID = [125, 125, 125];
const LABEL = [217, 217, 217];
const INK = [15, 15, 15];
const HEAD = [64, 64, 64];
const WHITE = [255, 255, 255];
const FOOT = [110, 110, 110];

/* ---------- Geometry (A4 portrait, pt) ---------- */
const L = 28;
const R = 567;
const CW = R - L; // 539

/* ---------- Default (placeholder) content ---------- */
export const DEFAULT_BL = {
  companyLine1: "WHY DIGIT  |  eFit",
  companyLine2: "[INSERT MTO LEGAL ENTITY NAME]",
  title1: "MULTIMODAL TRANSPORT",
  title2: "BILL OF LADING",
  blNo: "[MTO/2026/00001]",
  bookingRef: "[BOOKING NO.]",
  issueDate: "[DD-MMM-YYYY]",
  originals: "[ ]",

  // A. Parties
  shipper: "[Legal name, full address, contact, email, tax ID]",
  consignee: "[Legal name / TO ORDER, full address, contact, email, tax ID]",
  notifyParty: "[Legal name, full address, contact, email]",
  secondNotify: "[Legal name and full address]",

  // B. Transport and routing
  placeOfReceipt: "[City, Country]",
  portOfLoading: "[Port, Country]",
  portOfDischarge: "[Port, Country]",
  placeOfDelivery: "[City, Country]",
  placeOfAcceptance: "[Place, Country]",
  finalDestination: "[Place, Country]",
  preCarriage: "[Mode / carrier]",
  vessel: "[Vessel / Voyage]",
  onCarriage: "[Mode / carrier]",
  transshipment: "[If applicable]",
  route: "[Full intended route and modes]",
  movementType: "[Multimodal / Combined]",

  // C. Cargo particulars (3 rows are drawn; extra rows are added if given)
  cargo: [
    {
      marks: "[ ]",
      packages: "[ ]",
      description: "[ ]",
      hs: "[ ]",
      gross: "[ ]",
      cbm: "[ ]",
      container: "[ ]",
    },
    {
      marks: "[ ]",
      packages: "[ ]",
      description: "[ ]",
      hs: "[ ]",
      gross: "[ ]",
      cbm: "[ ]",
      container: "[ ]",
    },
    {
      marks: "[ ]",
      packages: "[ ]",
      description: "[ ]",
      hs: "[ ]",
      gross: "[ ]",
      cbm: "[ ]",
      container: "[ ]",
    },
  ],
  totalPackages: "[ ]",
  totalGross: "[ ]",
  totalMeasurement: "[ ]",

  // D. Freight and charges
  freightPayable: "[Prepaid / Collect]",
  payableAt: "[Place]",
  freightAmount: "[Amount / Currency / As agreed]",
  otherCharges: "[As agreed / Details]",
  declaredValue: "[Amount / Currency]",
  cargoInsurance: "[Shipper / separately agreed]",

  // E. Signature block (left blank on the template)
  placeOfIssue: "",
  dateOfIssue: "",
  signedAt: "",
  nameDesignation: "",

  footerPrefix: "Freight Forwarding",
  footerNote:
    "Editable template \u2013 complete all bracketed fields before issue",
};

export const buildPdfFormat1 = (data = {}) => {
  const d = { ...DEFAULT_BL, ...data };
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  /* ---------- primitives ---------- */
  // y = vertical CENTRE of the text line
  const txt = (s, x, y, o = {}) => {
    const {
      size = 8,
      bold = false,
      italic = false,
      color = INK,
      align = "left",
    } = o;
    doc.setFont("helvetica", italic ? "italic" : bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(String(s ?? ""), x, y + size * 0.35, { align });
  };

  // single line text that shrinks to fit a width
  const fit = (s, x, y, maxW, o = {}) => {
    let size = o.size || 8;
    doc.setFont("helvetica", o.bold ? "bold" : "normal");
    doc.setFontSize(size);
    while (size > 5 && doc.getTextWidth(String(s ?? "")) > maxW) {
      size -= 0.2;
      doc.setFontSize(size);
    }
    txt(s, x, y, { ...o, size });
  };

  const fillRect = (x, y, w, h, c) => {
    doc.setFillColor(...c);
    doc.rect(x, y, w, h, "F");
  };

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);

  const heading = (s, y) =>
    txt(s, L, y, { size: 11.5, bold: true, color: HEAD });

  /* Table of cells. cols = widths, rows = arrays of strings.
   * labelCols = column indexes drawn as grey bold label cells. */
  const grid = (
    y,
    cols,
    rows,
    { rowH = 17, labelCols = [], size = 8 } = {},
  ) => {
    const xs = [];
    let a = L;
    cols.forEach((w) => {
      xs.push(a);
      a += w;
    });
    rows.forEach((row, r) => {
      const top = y + r * rowH;
      row.forEach((cell, c) => {
        const isLabel = labelCols.includes(c);
        if (isLabel) fillRect(xs[c], top, cols[c], rowH, LABEL);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.8);
        doc.rect(xs[c], top, cols[c], rowH, "S");
        fit(cell, xs[c] + 4, top + rowH / 2, cols[c] - 8, {
          size,
          bold: isLabel,
        });
      });
    });
    return y + rows.length * rowH;
  };

  // "[ ______ ]" style entry field: underline with small end ticks
  const bracketField = (x1, x2, y, value = "") => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.7);
    doc.line(x1, y, x2, y);
    doc.line(x1, y - 7, x1, y);
    doc.line(x2, y - 7, x2, y);
    if (value) txt(value, x1 + 4, y - 4, { size: 8 });
  };

  /* ================================================================
   * Header bar
   * ================================================================ */
  fillRect(L, 28, 274, 39, DARK);
  fillRect(302, 30, R - 302, 37, MID);
  txt(d.companyLine1, L + 5, 38, { size: 13, bold: true, color: WHITE });
  txt(d.companyLine2, L + 5, 54, { size: 13, bold: true, color: WHITE });
  txt(d.title1, 311, 42, { size: 12.5, bold: true, color: WHITE });
  txt(d.title2, 311, 57, { size: 12.5, bold: true, color: WHITE });

  /* reference line */
  const refY = 76;
  let rx = L;
  [
    ["MTO BL No.: ", d.blNo],
    ["Booking Ref.: ", d.bookingRef],
    ["Issue Date: ", d.issueDate],
    ["No. of Originals: ", d.originals],
  ].forEach(([k, v]) => {
    const full = `${k}${v}`;
    txt(full, rx, refY, { size: 7.6, bold: true });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.6);
    rx += doc.getTextWidth(full) + 19;
  });

  /* ================================================================
   * A. PARTIES
   * ================================================================ */
  heading("A. PARTIES", 90);
  let y = grid(
    99,
    [280, 259],
    [
      ["SHIPPER / CONSIGNOR", d.shipper],
      ["CONSIGNEE", d.consignee],
      ["NOTIFY PARTY", d.notifyParty],
      ["SECOND NOTIFY PARTY (IF ANY)", d.secondNotify],
    ],
    { rowH: 18, labelCols: [0] },
  );

  /* ================================================================
   * B. TRANSPORT AND ROUTING DETAILS
   * ================================================================ */
  heading("B. TRANSPORT AND ROUTING DETAILS", y + 13);
  y = grid(
    y + 22,
    [146, 136, 128, 129],
    [
      [
        "Place of Receipt",
        d.placeOfReceipt,
        "Port of Loading",
        d.portOfLoading,
      ],
      [
        "Port of Discharge",
        d.portOfDischarge,
        "Place of Delivery",
        d.placeOfDelivery,
      ],
      [
        "Place of Acceptance",
        d.placeOfAcceptance,
        "Final Destination",
        d.finalDestination,
      ],
      ["Pre-carriage", d.preCarriage, "Ocean Vessel / Voyage", d.vessel],
      ["On-carriage", d.onCarriage, "Transshipment", d.transshipment],
      ["Route / Intended Journey", d.route, "Movement Type", d.movementType],
    ],
    { rowH: 17, labelCols: [0, 2] },
  );

  /* ================================================================
   * C. CARGO PARTICULARS
   * ================================================================ */
  heading("C. CARGO PARTICULARS", y + 14);
  y += 24;
  const cargoCols = [83, 84, 77, 75, 72, 72, 76];
  const heads = [
    "Marks & Nos.",
    "Packages",
    "Description of goods",
    "HS Code",
    "Gross weight",
    "Measurement",
    "Container / Seal",
  ];
  {
    let x = L;
    fillRect(L, y, CW, 17, DARK);
    heads.forEach((h, i) => {
      txt(h, x + 4, y + 8.5, { size: 6.6, bold: true, color: WHITE });
      x += cargoCols[i];
    });
    y += 17;
  }
  const cargoRows = (
    d.cargo && d.cargo.length ? d.cargo : DEFAULT_BL.cargo
  ).map((c) => [
    c.marks,
    c.packages,
    c.description,
    c.hs,
    `${c.gross} KG`,
    `${c.cbm} CBM`,
    c.container,
  ]);
  y = grid(y, cargoCols, cargoRows, { rowH: 16, size: 7.5 });
  txt(`Total packages: ${d.totalPackages}`, L + 4, y + 9, {
    size: 8,
    bold: true,
  });
  txt(`Total gross weight: ${d.totalGross}`, L + 105, y + 9, {
    size: 8,
    bold: true,
  });
  txt(`Total measurement: ${d.totalMeasurement}`, L + 232, y + 9, {
    size: 8,
    bold: true,
  });
  y += 20;

  /* ================================================================
   * D. FREIGHT AND CHARGES
   * ================================================================ */
  heading("D. FREIGHT AND CHARGES", y + 12);
  y = grid(
    y + 22,
    [147, 134, 126, 132],
    [
      ["Freight payable", d.freightPayable, "Payable at", d.payableAt],
      [
        "Freight amount / currency",
        d.freightAmount,
        "Other charges",
        d.otherCharges,
      ],
      [
        "Declared value (if accepted)",
        d.declaredValue,
        "Cargo insurance",
        d.cargoInsurance,
      ],
    ],
    { rowH: 18, labelCols: [0, 2] },
  );

  /* ================================================================
   * E. RECEIPT, ISSUE AND SIGNATURE
   * ================================================================ */
  heading("E. RECEIPT, ISSUE AND SIGNATURE", y + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const para = doc.splitTextToSize(
    "Received by the Multimodal Transport Operator (MTO) the goods described above, in apparent external good order and condition unless otherwise stated, for carriage subject to the terms and conditions of this Bill of Lading. The MTO undertakes the contractual responsibility stated herein for the agreed multimodal transport from the place of receipt to the place of delivery.",
    CW - 6,
  );
  para.forEach((ln, i) => txt(ln, L + 5, y + 31 + i * 11, { size: 8 }));
  y += 31 + para.length * 11 + 6;

  txt("Place of issue:", L + 8, y + 3, { size: 8.5 });
  bracketField(95, 205, y + 8, d.placeOfIssue);
  txt("Date of issue:", 217, y + 3, { size: 8.5 });
  bracketField(274, 372, y + 8, d.dateOfIssue);

  // authorised signatory (left)
  const sy = y + 40;
  doc.setLineWidth(0.7);
  doc.line(38, sy, 180, sy);
  txt("Authorized signatory for the MTO", L + 10, sy + 12, { size: 8.2 });
  txt("Name / designation:", L + 10, sy + 25, { size: 8 });
  bracketField(111, 180, sy + 29, d.nameDesignation);

  // company stamp (right)
  doc.line(318, sy - 14, 440, sy - 14);
  txt("Company stamp / seal", 318, sy - 2, { size: 8.2 });
  txt("Signed at:", 318, sy + 12, { size: 8 });
  bracketField(356, 440, sy + 16, d.signedAt);

  txt(
    "SUBJECT TO THE TERMS AND CONDITIONS ON THE REVERSE / PAGE 2",
    195,
    sy + 33,
    {
      size: 7.2,
      bold: true,
    },
  );

  /* ---------- footer note ---------- */
  txt(`${d.footerPrefix}  \u2022  ${d.footerNote}`, 297.6, 800, {
    size: 6.5,
    italic: true,
    color: FOOT,
    align: "center",
  });

  return doc;
};

export const downloadPdfFormat1 = (data = {}) => {
  const doc = buildPdfFormat1(data);
  const no = String(data.blNo || DEFAULT_BL.blNo).replace(
    /[\\/:*?"<>|[\]]/g,
    "-",
  );
  doc.save(`${no}_BL.pdf`);
};

/* ---------------------------------------------------------------------
 * Default export: ready-to-route React component (no JSX, so a plain
 * .js file works in Vite).  <Route path="..." element={<PdfFormat1 />} />
 * Optional prop:  data = {...} to fill the form.
 * ------------------------------------------------------------------- */
const PdfFormat1 = ({ data = {} }) => {
  const [url, setUrl] = useState("");
  const key = JSON.stringify(data);

  useEffect(() => {
    const u = URL.createObjectURL(buildPdfFormat1(data).output("blob"));
    setUrl(u);
    return () => URL.revokeObjectURL(u);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return h(
    "div",
    { style: { padding: 16 } },
    h(
      "div",
      {
        style: { display: "flex", justifyContent: "flex-end", marginBottom: 8 },
      },
      h(
        "button",
        {
          onClick: () => downloadPdfFormat1(data),
          style: {
            padding: "8px 16px",
            background: "#242e43",
            color: "#fff",
            border: 0,
            borderRadius: 6,
            cursor: "pointer",
          },
        },
        "Download PDF",
      ),
    ),
    url &&
      h("iframe", {
        src: url,
        title: "PDF preview",
        style: { width: "100%", height: "85vh", border: "1px solid #ccc" },
      }),
  );
};

export default PdfFormat1;
