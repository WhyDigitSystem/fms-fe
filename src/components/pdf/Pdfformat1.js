import { createElement as h, useEffect, useState } from "react";
import { jsPDF } from "jspdf";

/* =====================================================================
 * PDF FORMAT 1 – Multimodal Transport Bill of Lading (simple, modern)
 *
 *   buildPdfFormat1(data)    -> jsPDF document
 *   downloadPdfFormat1(data) -> saves "<BL no>_BL.pdf"
 *   default export           -> React preview component
 *
 * Every field is optional; anything not passed keeps the bracketed
 * placeholder from the template.
 * ===================================================================== */

const TITLE_1 = "Multimodal Transport Bill of Lading";

/* ---------- Palette (one accent, everything else neutral) ---------- */
const NAVY = [15, 39, 71];
const ACCENT = [37, 99, 235];
const INK = [30, 41, 59];
const MUTED = [100, 116, 139];
const BORDER = [203, 213, 225];

/* ---------- Geometry (A4 portrait, pt) ---------- */
const L = 32;
const R = 563;
const CW = R - L; // 531

export const DEFAULT_BL = {
  companyLine1: "WHY DIGIT  |  eFit",
  companyLine2: "[INSERT MTO LEGAL ENTITY NAME]",
  title1: "MULTIMODAL TRANSPORT",
  title2: "BILL OF LADING",
  blNo: "[MTO/2026/00001]",
  bookingRef: "[BOOKING NO.]",
  issueDate: "[DD-MMM-YYYY]",
  originals: "[ ]",

  shipper: "[Legal name, full address, contact, email, tax ID]",
  consignee: "[Legal name / TO ORDER, full address, contact, email, tax ID]",
  notifyParty: "[Legal name, full address, contact, email]",
  secondNotify: "[Legal name and full address]",

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

  freightPayable: "[Prepaid / Collect]",
  payableAt: "[Place]",
  freightAmount: "[Amount / Currency / As agreed]",
  otherCharges: "[As agreed / Details]",
  declaredValue: "[Amount / Currency]",
  cargoInsurance: "[Shipper / separately agreed]",

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

  /* ---------- primitives (y = vertical centre of text) ---------- */
  const txt = (s, x, y, o = {}) => {
    const {
      size = 8.5,
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

  const fit = (s, x, y, maxW, o = {}) => {
    let size = o.size || 8.5;
    doc.setFont("helvetica", o.bold ? "bold" : "normal");
    doc.setFontSize(size);
    while (size > 5 && doc.getTextWidth(String(s ?? "")) > maxW) {
      size -= 0.2;
      doc.setFontSize(size);
    }
    txt(s, x, y, { ...o, size });
  };

  const stroke = (c = BORDER, w = 0.5) => {
    doc.setDrawColor(...c);
    doc.setLineWidth(w);
  };
  const line = (x1, y1, x2, y2, c, w) => {
    stroke(c, w);
    doc.line(x1, y1, x2, y2);
  };

  // section title with a navy rule under it
  const heading = (s, y) => {
    txt(s, L, y, { size: 9.5, bold: true, color: NAVY });
    line(L, y + 8, R, y + 8, NAVY, 1);
  };

  // label / value rows separated by hairlines (no boxes, no fills)
  const grid = (
    y,
    cols,
    rows,
    { rowH = 20, labelCols = [], size = 8.5 } = {},
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
        const pad = c === 0 ? 2 : 8;
        const mw = cols[c] - pad - 4;
        if (labelCols.includes(c)) {
          fit(String(cell).toUpperCase(), xs[c] + pad, top + rowH / 2, mw, {
            size: 6.6,
            bold: true,
            color: MUTED,
          });
        } else {
          fit(cell, xs[c] + pad, top + rowH / 2, mw, { size, color: INK });
        }
      });
      line(L, top + rowH, R, top + rowH, BORDER, 0.5);
    });
    return y + rows.length * rowH;
  };

  // small label above a bold value
  const stat = (x, y, w, label, value) => {
    txt(String(label).toUpperCase(), x, y + 6, {
      size: 6.2,
      bold: true,
      color: MUTED,
    });
    fit(value, x, y + 21, w - 8, { size: 9.5, bold: true, color: NAVY });
  };

  // underlined entry field with label above
  const field = (x, y, w, label, value = "") => {
    txt(String(label).toUpperCase(), x, y, {
      size: 6.2,
      bold: true,
      color: MUTED,
    });
    line(x, y + 19, x + w, y + 19, [148, 163, 184], 0.7);
    if (value) fit(value, x + 2, y + 13, w - 4, { size: 9 });
  };

  /* ================================================================
   * Header
   * ================================================================ */
  txt(d.companyLine1, L, 40, { size: 16, bold: true, color: NAVY });
  fit(d.companyLine2, L, 57, 270, { size: 9, color: MUTED });
  txt(d.title1, R, 39, { size: 12, bold: true, color: NAVY, align: "right" });
  txt(d.title2, R, 54, { size: 12, bold: true, color: ACCENT, align: "right" });
  line(L, 71, R, 71, NAVY, 2);

  const gap = 10;
  const sw = (CW - gap * 3) / 4;
  [
    ["MTO BL No.", d.blNo],
    ["Booking Ref.", d.bookingRef],
    ["Issue Date", d.issueDate],
    ["No. of Originals", d.originals],
  ].forEach(([k, v], i) => stat(L + i * (sw + gap), 80, sw, k, v));
  line(L, 114, R, 114, BORDER, 0.5);

  /* ================================================================
   * A. PARTIES
   * ================================================================ */
  heading("A.  PARTIES", 134);
  let y = grid(
    143,
    [190, 341],
    [
      ["Shipper / Consignor", d.shipper],
      ["Consignee", d.consignee],
      ["Notify party", d.notifyParty],
      ["Second notify party (if any)", d.secondNotify],
    ],
    { rowH: 20, labelCols: [0] },
  );

  /* ================================================================
   * B. TRANSPORT AND ROUTING
   * ================================================================ */
  heading("B.  TRANSPORT AND ROUTING DETAILS", y + 18);
  y = grid(
    y + 27,
    [118, 147, 118, 148],
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
    { rowH: 19, labelCols: [0, 2] },
  );

  /* ================================================================
   * C. CARGO PARTICULARS
   * ================================================================ */
  heading("C.  CARGO PARTICULARS", y + 18);
  y += 27;
  const cargoCols = [76, 70, 100, 62, 72, 72, 79];
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
    heads.forEach((t, i) => {
      txt(t.toUpperCase(), x + (i === 0 ? 2 : 8), y + 10, {
        size: 6.4,
        bold: true,
        color: NAVY,
      });
      x += cargoCols[i];
    });
  }
  line(L, y + 20, R, y + 20, NAVY, 0.8);
  y += 20;
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
  y = grid(y, cargoCols, cargoRows, { rowH: 18, size: 8 });

  const tw = (CW - 20) / 3;
  stat(L, y + 8, tw, "Total packages", d.totalPackages);
  stat(L + tw + 10, y + 8, tw, "Total gross weight", d.totalGross);
  stat(L + (tw + 10) * 2, y + 8, tw, "Total measurement", d.totalMeasurement);
  y += 44;

  /* ================================================================
   * D. FREIGHT AND CHARGES
   * ================================================================ */
  heading("D.  FREIGHT AND CHARGES", y + 12);
  y = grid(
    y + 21,
    [135, 135, 105, 156],
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
    { rowH: 20, labelCols: [0, 2] },
  );

  /* ================================================================
   * E. RECEIPT, ISSUE AND SIGNATURE
   * ================================================================ */
  heading("E.  RECEIPT, ISSUE AND SIGNATURE", y + 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const para = doc.splitTextToSize(
    "Received by the Multimodal Transport Operator (MTO) the goods described above, in apparent external good order and condition unless otherwise stated, for carriage subject to the terms and conditions of this Bill of Lading. The MTO undertakes the contractual responsibility stated herein for the agreed multimodal transport from the place of receipt to the place of delivery.",
    CW - 4,
  );
  para.forEach((ln, i) =>
    txt(ln, L + 2, y + 35 + i * 11, { size: 8, color: INK }),
  );
  y += 35 + para.length * 11 + 12;

  field(L, y, 165, "Place of issue", d.placeOfIssue);
  field(L + 185, y, 150, "Date of issue", d.dateOfIssue);
  field(L + 355, y, 176, "Signed at", d.signedAt);
  y += 40;

  // authorised signatory (left)
  line(L, y + 32, L + 230, y + 32, [148, 163, 184], 0.8);
  txt("AUTHORIZED SIGNATORY FOR THE MTO", L, y + 41, {
    size: 6.2,
    bold: true,
    color: MUTED,
  });
  field(L, y + 56, 230, "Name / designation", d.nameDesignation);

  // company stamp (right)
  stroke(BORDER, 0.8);
  doc.rect(L + 290, y, 241, 66, "S");
  txt("COMPANY STAMP / SEAL", L + 298, y + 9, {
    size: 6.2,
    bold: true,
    color: MUTED,
  });

  y += 84;
  line(L, y, R, y, BORDER, 0.5);
  txt(
    "SUBJECT TO THE TERMS AND CONDITIONS ON THE REVERSE / PAGE 2",
    L + CW / 2,
    y + 11,
    {
      size: 7.2,
      bold: true,
      color: NAVY,
      align: "center",
    },
  );

  /* ---------- footer ---------- */
  txt(`${d.footerPrefix}  \u2022  ${d.footerNote}`, L + CW / 2, 826, {
    size: 6.5,
    italic: true,
    color: MUTED,
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
 * Default export: ready-to-route React component (no JSX needed).
 *   <Route path="..." element={<PdfFormat1 />} />
 * Optional prop: data = {...} to fill the form.
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
            TITLE_1,
          ),
          h(
            "div",
            { style: { fontSize: 12.5, color: "#64748b" } },
            "Live preview",
          ),
        ),
        h(
          "button",
          { onClick: () => downloadPdfFormat1(data), style: btn },
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

export default PdfFormat1;
