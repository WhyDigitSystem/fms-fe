import { createElement as h, useEffect, useState } from "react";
import { jsPDF } from "jspdf";

/* =====================================================================
 * PDF FORMAT 6 – UGS Logistics House Bill of Lading
 * buildPdfFormat6(data) -> jsPDF document
 * downloadPdfFormat6(data) -> saves "<HBL number>.pdf"
 * Based on the supplied UGS International HBL template.
 * ===================================================================== */

const TITLE_6 = "House Bill of Lading";
const NAVY = [25, 57, 91];
const BLUE = [37, 83, 123];
const PALE = [233, 239, 245];
const INK = [43, 52, 62];
const MUTED = [105, 115, 126];
const LINE = [190, 199, 208];
const WHITE = [255, 255, 255];

export const DEFAULT_HBL = {
  companyName: "UGS LOGISTICS",
  companySubtitle: "UNIWORLD GLOBAL SYSTEM | FREIGHT FORWARDING & LOGISTICS",
  hblNumber: "[Enter HBL number]",
  bookingReference: "[Enter reference]",
  shipperName: "[Company name]",
  shipperAddress: "[Full address]",
  shipperCountry: "[Country]",
  consigneeName: "[Company name / To order]",
  consigneeAddress: "[Full address]",
  consigneeCountry: "[Country]",
  notifyName: "[Company name]",
  notifyAddress: "[Full address]",
  notifyContact: "[Contact details]",
  issuingOffice: "[UGS branch / office]",
  issuingAddress: "[Full address]",
  issuingContact: "[Contact details]",
  preCarriage: "[Enter details]",
  placeOfReceipt: "[Enter details]",
  vesselVoyage: "[Enter details]",
  portOfLoading: "[Enter details]",
  portOfDischarge: "[Enter details]",
  placeOfDelivery: "[Enter details]",
  finalDestination: "[Enter details]",
  countryOfOrigin: "[Enter details]",
  movementService: "[Enter details]",
  cargoMarks: "[Marks / Nos.]",
  cargoPackages: "[Packages]",
  cargoDescription: "[Full cargo description]",
  cargoGrossWeight: "[KG]",
  cargoMeasurement: "[CBM]",
  containerNumber: "[Container number]",
  sealNumber: "[Seal number]",
  containerSizeType: "[e.g. 40' HC]",
  containerPackages: "[Qty]",
  containerGrossWeight: "[KG]",
  containerRemarks: "[FCL / LCL; additional container details may be attached]",
  oceanFreightTerm: "[PREPAID / COLLECT]",
  oceanFreightCurrency: "[Currency]",
  oceanFreightAmount: "[Amount / As agreed]",
  otherChargesTerm: "[PREPAID / COLLECT]",
  otherChargesCurrency: "[Currency]",
  otherChargesAmount: "[Amount]",
  freightPayableAt: "[Enter details]",
  placeOfIssue: "[Enter details]",
  dateOfIssue: "[Enter details]",
  originalHbls: "[e.g. THREE (3)]",
  shippedOnBoardDate: "[If applicable]",
  hblStatus: "[Original / Sea waybill / Surrendered]",
  declaredValue: "[Not declared / Currency and amount]",
  signatoryName: "[Enter details]",
  legalNotice:
    "SUBJECT TO THE TERMS, CONDITIONS, LIBERTIES AND EXCEPTIONS PRINTED OR INCORPORATED ON THE REVERSE SIDE. This document is a template; issue only after review and approval of the applicable contractual terms and legal wording.",
};

export const buildPdfFormat6 = (data = {}) => {
  const d = { ...DEFAULT_HBL, ...data };
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PW = 210,
    M = 4.5,
    CW = PW - M * 2;

  const text = (value, x, y, opts = {}) => {
    const {
      size = 7,
      bold = false,
      color = INK,
      align = "left",
      maxW,
      maxH,
      lineHeight = 1.15,
    } = opts;
    const str = String(value ?? "");
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    let fs = size;
    if (maxW) {
      while (fs > 4.2 && doc.getTextWidth(str) > maxW) {
        fs -= 0.15;
        doc.setFontSize(fs);
      }
    }
    if (maxH && maxW) {
      const lines = doc.splitTextToSize(str, maxW);
      const lineH = fs * 0.3528 * lineHeight;
      const count = Math.max(1, Math.floor(maxH / lineH));
      doc.text(lines.slice(0, count), x, y, {
        align,
        lineHeightFactor: lineHeight,
      });
    } else doc.text(str, x, y, { align });
  };

  const rect = (x, y, w, ht, fill = null, stroke = LINE, width = 0.22) => {
    doc.setLineWidth(width);
    doc.setDrawColor(...stroke);
    if (fill) {
      doc.setFillColor(...fill);
      doc.rect(x, y, w, ht, "FD");
    } else doc.rect(x, y, w, ht, "S");
  };

  const section = (y, title) => {
    doc.setFillColor(...BLUE);
    doc.rect(M, y, CW, 6.3, "F");
    text(title.toUpperCase(), M + 2, y + 4.35, {
      size: 7.2,
      bold: true,
      color: WHITE,
    });
  };

  const field = (x, y, w, ht, label, value, opts = {}) => {
    const { labelSize = 6.1, valueSize = 6.5, fill = null } = opts;
    rect(x, y, w, ht, fill);
    text(label.toUpperCase(), x + 1.8, y + 3.4, {
      size: labelSize,
      bold: true,
      color: MUTED,
      maxW: w - 3.6,
    });
    if (value !== undefined && value !== null && value !== "") {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(valueSize);
      doc.setTextColor(...INK);
      const lines = doc.splitTextToSize(String(value), w - 3.6);
      const lineH = valueSize * 0.3528 * 1.2;
      const count = Math.max(1, Math.floor((ht - 7) / lineH));
      doc.text(lines.slice(0, count), x + 1.8, y + 7.1, {
        lineHeightFactor: 1.2,
      });
    }
  };

  const footer = (page) => {
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.18);
    doc.line(M, 286, PW - M, 286);
    text("UGS LOGISTICS  |  HOUSE BILL OF LADING", M, 290, {
      size: 5.5,
      color: MUTED,
    });
    text(`Page ${page}`, PW - M, 290, {
      size: 5.5,
      color: MUTED,
      align: "right",
    });
  };

  /* PAGE 1 */
  text(d.companyName, M, 13, { size: 14, bold: true, color: NAVY });
  text(TITLE_6.toUpperCase(), PW - M, 11.5, {
    size: 12.2,
    bold: true,
    color: NAVY,
    align: "right",
  });
  text("NON-NEGOTIABLE / ORIGINAL AS ISSUED", PW - M, 17, {
    size: 7.1,
    bold: true,
    color: NAVY,
    align: "right",
  });
  text(d.companySubtitle, M, 22, { size: 6.5, color: MUTED, maxW: 112 });
  text(`HBL No.: ${d.hblNumber}`, 112, 22, { size: 6.5, bold: true, maxW: 88 });
  text(`Booking / Job Ref.: ${d.bookingReference}`, 112, 26, {
    size: 6.5,
    bold: true,
    maxW: 88,
  });
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.7);
  doc.line(M, 29, PW - M, 29);

  section(31, "Parties");
  const half = CW / 2,
    pY = 37.3,
    pH = 27.2;
  const party = (x, title, name, address, country) => {
    rect(x, pY, half, pH);
    text(title.toUpperCase(), x + 2, pY + 4, {
      size: 6.1,
      bold: true,
      color: MUTED,
    });
    text(name, x + 2, pY + 8.5, { size: 7.2, maxW: half - 4 });
    text(address, x + 2, pY + 12.5, { size: 6.7, maxW: half - 4, maxH: 7 });
    text(country, x + 2, pY + 21, { size: 6.7, maxW: half - 4 });
  };
  party(
    M,
    "Shipper / Exporter",
    d.shipperName,
    d.shipperAddress,
    d.shipperCountry,
  );
  party(
    M + half,
    "Consignee",
    d.consigneeName,
    d.consigneeAddress,
    d.consigneeCountry,
  );

  const notify = (x, y, label, values) => {
    rect(x, y, half, 24.5);
    text(label.toUpperCase(), x + 2, y + 4, {
      size: 6.1,
      bold: true,
      color: MUTED,
    });
    values.forEach((v, i) =>
      text(v, x + 2, y + 8.5 + i * 4.2, { size: 6.7, maxW: half - 4 }),
    );
  };
  notify(M, pY + pH, "Notify Party", [
    d.notifyName,
    d.notifyAddress,
    d.notifyContact,
  ]);
  notify(M + half, pY + pH, "Forwarding Agent / Issuing Office", [
    d.issuingOffice,
    d.issuingAddress,
    d.issuingContact,
  ]);

  const transportY = 91.5;
  section(transportY, "Transport Details");
  const tY = transportY + 6.3,
    third = CW / 3;
  [
    ["Pre-Carriage By", d.preCarriage],
    ["Place of Receipt", d.placeOfReceipt],
    ["Ocean Vessel / Voyage", d.vesselVoyage],
    ["Port of Loading", d.portOfLoading],
    ["Port of Discharge", d.portOfDischarge],
    ["Place of Delivery", d.placeOfDelivery],
    ["Final Destination (if different)", d.finalDestination],
    ["Country of Origin", d.countryOfOrigin],
    ["Movement / Service", d.movementService],
  ].forEach((item, i) =>
    field(
      M + (i % 3) * third,
      tY + Math.floor(i / 3) * 14.5,
      third,
      14.5,
      item[0],
      item[1],
      { labelSize: 5.7, valueSize: 6.3 },
    ),
  );

  const cargoY = tY + 43.5;
  section(cargoY, "Cargo Particulars as Declared by Shipper");
  const cY = cargoY + 6.3;
  const cargoCols = [
    ["Marks & numbers", d.cargoMarks, 37],
    ["No. & kind of packages", d.cargoPackages, 38],
    ["Description of goods", d.cargoDescription, 68],
    ["Gross weight", d.cargoGrossWeight, 27],
    ["Measurement", d.cargoMeasurement, 26],
  ];
  let x = M;
  cargoCols.forEach(([label, value, w]) => {
    rect(x, cY, w, 9, PALE);
    text(label, x + 1.5, cY + 5.7, {
      size: 5.7,
      bold: true,
      color: MUTED,
      maxW: w - 3,
    });
    rect(x, cY + 9, w, 23);
    text(value, x + 1.5, cY + 14, { size: 6.4, maxW: w - 3, maxH: 16 });
    x += w;
  });

  const contY = cY + 32;
  section(contY, "Container / Seal Particulars");
  const conY = contY + 6.3;
  const conCols = [
    ["Container No.", d.containerNumber, 48],
    ["Seal No.", d.sealNumber, 38],
    ["Size / Type", d.containerSizeType, 38],
    ["Packages", d.containerPackages, 35],
    ["Gross Weight", d.containerGrossWeight, 37],
  ];
  x = M;
  conCols.forEach(([label, value, w]) => {
    rect(x, conY, w, 8.5, PALE);
    text(label.toUpperCase(), x + 1.5, conY + 5.5, {
      size: 5.6,
      bold: true,
      color: MUTED,
      maxW: w - 3,
    });
    rect(x, conY + 8.5, w, 10);
    text(value, x + 1.5, conY + 14.5, { size: 6.2, maxW: w - 3 });
    x += w;
  });
  field(
    M,
    conY + 18.5,
    CW,
    7,
    "Container Status / Remarks",
    d.containerRemarks,
    { labelSize: 5.6, valueSize: 5.9 },
  );

  const freightY = conY + 25.5;
  section(freightY, "Freight & Charges");
  const fY = freightY + 6.3,
    fWidths = [58, 50, 40, CW - 148];
  ["Freight / Charge", "Payment Term", "Currency", "Amount"].forEach(
    (label, i) => {
      const xx = M + fWidths.slice(0, i).reduce((a, b) => a + b, 0);
      rect(xx, fY, fWidths[i], 7, PALE);
      text(label.toUpperCase(), xx + 1.5, fY + 4.7, {
        size: 5.6,
        bold: true,
        color: MUTED,
      });
    },
  );
  [
    [
      "Ocean freight",
      d.oceanFreightTerm,
      d.oceanFreightCurrency,
      d.oceanFreightAmount,
    ],
    [
      "Other charges",
      d.otherChargesTerm,
      d.otherChargesCurrency,
      d.otherChargesAmount,
    ],
  ].forEach((row, ri) => {
    let xx = M;
    row.forEach((value, ci) => {
      rect(xx, fY + 7 + ri * 6.5, fWidths[ci], 6.5);
      text(value, xx + 1.5, fY + 11.5 + ri * 6.5, {
        size: 6.1,
        maxW: fWidths[ci] - 3,
      });
      xx += fWidths[ci];
    });
  });

  const issueY = fY + 20,
    issueW = CW / 3;
  [
    ["Freight Payable At", d.freightPayableAt],
    ["Place of Issue", d.placeOfIssue],
    ["Date of Issue", d.dateOfIssue],
  ].forEach((item, i) =>
    field(M + i * issueW, issueY, issueW, 15, item[0], item[1], {
      labelSize: 5.5,
      valueSize: 6.1,
    }),
  );
  footer(1);

  /* PAGE 2 */
  doc.addPage("a4", "portrait");
  const statusY = 8,
    statusW = CW / 3;
  [
    ["No. of Original HBLs", d.originalHbls],
    ["Shipped on Board Date", d.shippedOnBoardDate],
    ["HBL Status", d.hblStatus],
  ].forEach((item, i) =>
    field(M + i * statusW, statusY, statusW, 16, item[0], item[1], {
      labelSize: 5.8,
      valueSize: 6.4,
    }),
  );

  const signY = 26;
  rect(M, signY, CW, 30);
  text("DECLARED VALUE (IF ANY):", M + 2, signY + 5.5, {
    size: 6.2,
    bold: true,
  });
  text(d.declaredValue, M + 48, signY + 5.5, { size: 6.2, maxW: 55 });
  text("FOR UGS LOGISTICS", 108, signY + 5.5, { size: 6.2, bold: true });
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.35);
  doc.line(108, signY + 19, 154, signY + 19);
  text("Authorized signatory", 108, signY + 22, { size: 6.1 });
  text(`Name / Designation: ${d.signatoryName}`, 108, signY + 25.5, {
    size: 6.1,
    maxW: 80,
  });
  text(d.legalNotice, M + 2, 63, {
    size: 5.8,
    color: MUTED,
    maxW: CW - 4,
    maxH: 13,
    lineHeight: 1.25,
  });
  footer(2);

  return doc;
};

export const downloadPdfFormat6 = (data = {}) => {
  const doc = buildPdfFormat6(data);
  const name =
    String(data.hblNumber || DEFAULT_HBL.hblNumber)
      .replace(/[\\/:*?"<>|]/g, "-")
      .replace(/^\[|\]$/g, "") || "HBL";
  doc.save(`${name}.pdf`);
};

/* Route: <Route path="/Pdfformat6" element={<PdfFormat6 />} /> */
const PdfFormat6 = ({ data = {} }) => {
  const [url, setUrl] = useState("");
  const key = JSON.stringify(data);

  useEffect(() => {
    const nextUrl = URL.createObjectURL(buildPdfFormat6(data).output("blob"));
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const buttonStyle = {
    padding: "9px 18px",
    borderRadius: 8,
    border: 0,
    background: "linear-gradient(135deg,#19395b,#25537b)",
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(25,57,91,.28)",
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
            gap: 12,
            marginBottom: 14,
          },
        },
        h(
          "div",
          null,
          h(
            "div",
            { style: { fontSize: 18, fontWeight: 700, color: "#19395b" } },
            TITLE_6,
          ),
          h(
            "div",
            { style: { fontSize: 12.5, color: "#64748b" } },
            "Live preview",
          ),
        ),
        h(
          "button",
          { onClick: () => downloadPdfFormat6(data), style: buttonStyle },
          "Download PDF",
        ),
      ),
      h(
        "div",
        {
          style: {
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 8px 30px rgba(25,57,91,.12)",
            overflow: "hidden",
          },
        },
        url &&
          h("iframe", {
            src: url,
            title: "House Bill of Lading PDF preview",
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

export default PdfFormat6;
