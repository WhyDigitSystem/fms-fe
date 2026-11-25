import { createElement as h, useEffect, useState } from "react";
import { jsPDF } from "jspdf";

/* =====================================================================
 * PDF FORMAT 5 – House Air Waybill (HAWB)
 *
 * buildPdfFormat5(data)    -> jsPDF document
 * downloadPdfFormat5(data) -> saves "<HAWB number>.pdf"
 *
 * Recreates the supplied "New HAWB Template.pdf" as a two-page A4
 * landscape document. Layout, colours, table structure and wording follow
 * the supplied reference template. All displayed business details can be
 * overridden through the data prop.
 * ===================================================================== */

const TITLE_5 = "House Air Waybill";

const NAVY = [24, 57, 91];
const BLUE = [36, 83, 124];
const INK = [37, 48, 61];
const MUTED = [92, 105, 119];
const LINE = [173, 183, 192];
const PALE = [245, 248, 251];
const WHITE = [255, 255, 255];

export const DEFAULT_HAWB = {
  companyName: "COMPANY / FREIGHT FORWARDER NAME",
  companyAddress:
    "Company address | Telephone | Email | Website | Freight forwarder registration / license details (if applicable)",
  logoText: "[COMPANY LOGO]",
  hawbNumber: "[Forwarder-assigned HAWB number]",
  issueDate: "[DD-MMM-YYYY]",
  mawbNumber: "[Carrier / airline master AWB number]",
  bookingReference: "[Reference]",

  shipperName: "",
  shipperAddress: "",
  shipperCity: "",
  shipperContact: "",
  shipperTaxId: "",

  consigneeName: "",
  consigneeAddress: "",
  consigneeCity: "",
  consigneeContact: "",
  consigneeTaxId: "",

  notifyParty: "[Name, address, contact; or SAME AS CONSIGNEE]",
  alsoNotify: "[Name, address, contact]",

  originAirport: "[Code / City / Country]",
  destinationAirport: "[Code / City / Country]",
  routing: "[Routing]",
  requestedFlight: "[If known]",

  placeOfReceipt: "[If applicable]",
  placeOfDelivery: "[If applicable]",
  serviceMovement: "[Airport-to-airport / other agreed service]",
  currency: "[ISO currency code]",

  cargoRows: [
    {
      packages: "",
      packageType: "",
      marksNumbers: "",
      description: "",
      hsCode: "",
      countryOrigin: "",
      grossWeight: "",
      dimensions: "",
    },
    {
      packages: "",
      packageType: "",
      marksNumbers: "",
      description: "",
      hsCode: "",
      countryOrigin: "",
      grossWeight: "",
      dimensions: "",
    },
    {
      packages: "",
      packageType: "",
      marksNumbers: "",
      description: "",
      hsCode: "",
      countryOrigin: "",
      grossWeight: "",
      dimensions: "",
    },
  ],
  totalPackages: "[Total]",
  totalGrossWeight: "[Total]",
  totalVolume: "[Total]",
  chargeableWeight: "[As rated]",

  specialHandling:
    "[e.g., keep dry, temperature range, security instructions; use approved wording]",
  dangerousGoods:
    "[If applicable: attach required shipper's declaration and all required DG data; this HAWB is not a substitute]",

  freightCharges: "[Prepaid / Collect]",
  otherCharges: "[Prepaid / Collect]",
  declaredCarriage: "[Amount + currency / NVD]",
  declaredCustoms: "[Amount + currency / NCV]",

  insurance: "[Not insured / insured amount and currency]",
  paymentIncoterms: "[As agreed; Incoterms® rule + named place, if applicable]",
  customsReferences: "[Invoice, export declaration, permits, licenses]",
  attachedDocuments:
    "[Invoice, packing list, certificates, permits, DG declaration, etc.]",

  declaration:
    "The shipper certifies that the particulars on this document are accurate and that, where applicable, the goods are properly described, packed, marked and labelled, and comply with applicable export, import, security and transport requirements. Any dangerous goods must be separately declared and prepared in accordance with applicable regulations.",

  shipperSignatory: "Name / Signature / Date",
  issuedByAgent: "Name / Signature / Date",
  placeOfIssue: "[City / Country]",
  dateOfIssue: "[DD-MMM-YYYY]",
  notice:
    "NOTICE: Customizable HAWB template only; not an airline-issued MAWB and not a guarantee of acceptance. Confirm current requirements of the issuing forwarder, airline, origin/destination customs, security authorities and applicable IATA rules before use. Attach continuation sheets and supporting documents where required.",
};

export const buildPdfFormat5 = (data = {}) => {
  const d = { ...DEFAULT_HAWB, ...data };
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const PW = 297;
  const PH = 210;
  const M = 4;
  const CW = PW - M * 2;

  const setText = (value, x, y, opts = {}) => {
    const {
      size = 6.3,
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
    if (maxH) {
      const lines = doc.splitTextToSize(str, maxW || 100);
      const lineH = fs * 0.3528 * lineHeight;
      const maxLines = Math.max(1, Math.floor(maxH / lineH));
      doc.text(lines.slice(0, maxLines), x, y, {
        align,
        lineHeightFactor: lineHeight,
      });
    } else {
      doc.text(str, x, y, { align });
    }
  };

  const line = (x1, y1, x2, y2, width = 0.22, color = LINE) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(width);
    doc.line(x1, y1, x2, y2);
  };

  const rect = (x, y, w, hgt, opts = {}) => {
    const { fill, stroke = LINE, width = 0.22 } = opts;
    doc.setLineWidth(width);
    doc.setDrawColor(...stroke);
    if (fill) {
      doc.setFillColor(...fill);
      doc.rect(x, y, w, hgt, "FD");
    } else {
      doc.rect(x, y, w, hgt, "S");
    }
  };

  const cell = (x, y, w, hgt, label, value, opts = {}) => {
    const { labelSize = 5.5, valueSize = 6.1, fill, valueBold = false } = opts;
    if (fill) rect(x, y, w, hgt, { fill });
    else rect(x, y, w, hgt);
    setText(label.toUpperCase(), x + 1.2, y + 3.2, {
      size: labelSize,
      bold: true,
      color: BLUE,
      maxW: w - 2.4,
    });
    if (value !== undefined && value !== null && value !== "") {
      setText(value, x + 1.2, y + 7.1, {
        size: valueSize,
        bold: valueBold,
        color: INK,
        maxW: w - 2.4,
        maxH: hgt - 8.1,
      });
    }
  };

  const sectionBar = (y, title) => {
    doc.setFillColor(...NAVY);
    doc.rect(M, y, CW, 6.2, "F");
    setText(title.toUpperCase(), M + 1.4, y + 4.25, {
      size: 7.1,
      bold: true,
      color: WHITE,
    });
  };

  const splitText = (value, x, y, w, hgt, size = 6.1) => {
    const str = String(value ?? "");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(...INK);
    const lines = doc.splitTextToSize(str, w - 2.4);
    const lineH = size * 0.3528 * 1.22;
    const maxLines = Math.max(1, Math.floor((hgt - 8) / lineH));
    doc.text(lines.slice(0, maxLines), x + 1.2, y + 7.1, {
      lineHeightFactor: 1.22,
    });
  };

  /* =============================== PAGE 1 =============================== */
  // Header band and company details
  doc.setFillColor(...NAVY);
  doc.rect(M, 4, 207, 16, "F");
  doc.setFillColor(...BLUE);
  doc.rect(211, 4, 82, 16, "F");
  setText(d.logoText, 6, 10.2, {
    size: 7.1,
    bold: true,
    color: WHITE,
    maxW: 28,
  });
  setText(d.companyName, 35, 10.2, {
    size: 8.1,
    bold: true,
    color: WHITE,
    maxW: 173,
  });
  setText(TITLE_5.toUpperCase(), 252, 13.5, {
    size: 10.2,
    bold: true,
    color: WHITE,
    align: "center",
    maxW: 78,
  });
  setText(d.companyAddress, 6, 25.1, { size: 5.2, color: MUTED, maxW: 285 });

  // Reference row
  const refY = 28;
  const refH = 14;
  const refWidths = [72, 47, 82, 88];
  const refLabels = [
    "HAWB Number",
    "Issue Date",
    "MAWB Number",
    "Booking / File Reference",
  ];
  const refValues = [
    d.hawbNumber,
    d.issueDate,
    d.mawbNumber,
    d.bookingReference,
  ];
  let rx = M;
  refWidths.forEach((w, i) => {
    cell(rx, refY, w, refH, refLabels[i], refValues[i], {
      labelSize: 5.3,
      valueSize: 5.8,
    });
    rx += w;
  });

  // Shipper / consignee
  const partyY = 43;
  const partyH = 33;
  const half = CW / 2;
  const party = (x, title, values) => {
    rect(x, partyY, half, partyH);
    setText(title, x + 1.3, partyY + 3.5, {
      size: 5.8,
      bold: true,
      color: BLUE,
    });
    const labels = [
      "Name:",
      "Address:",
      "City / Postal code / Country:",
      "Contact / Tel / Email:",
      "Tax / EORI / ID:",
    ];
    values.forEach((v, i) => {
      const yy = partyY + 7.2 + i * 4.7;
      setText(labels[i], x + 1.3, yy, { size: 5.1, bold: true, color: MUTED });
      setText(v, x + 29, yy, { size: 5.5, maxW: half - 31 });
    });
  };
  party(M, "SHIPPER / EXPORTER", [
    d.shipperName,
    d.shipperAddress,
    d.shipperCity,
    d.shipperContact,
    d.shipperTaxId,
  ]);
  party(M + half, "CONSIGNEE / IMPORTER", [
    d.consigneeName,
    d.consigneeAddress,
    d.consigneeCity,
    d.consigneeContact,
    d.consigneeTaxId,
  ]);

  // Notify party
  cell(M, 76, half, 15, "Notify Party", d.notifyParty, { valueSize: 5.7 });
  cell(M + half, 76, half, 15, "Also Notify / Broker", d.alsoNotify, {
    valueSize: 5.7,
  });

  // Airport and movement details
  const infoY1 = 91;
  const infoH = 13;
  const infoW = CW / 4;
  [
    ["Origin Airport (IATA)", d.originAirport],
    ["Destination Airport (IATA)", d.destinationAirport],
    ["Routing / Transit Airport(s)", d.routing],
    ["Requested Flight / Date", d.requestedFlight],
  ].forEach((item, i) =>
    cell(M + i * infoW, infoY1, infoW, infoH, item[0], item[1], {
      valueSize: 5.6,
    }),
  );
  [
    ["Place of Receipt", d.placeOfReceipt],
    ["Place of Delivery", d.placeOfDelivery],
    ["Service / Movement", d.serviceMovement],
    ["Currency", d.currency],
  ].forEach((item, i) =>
    cell(M + i * infoW, infoY1 + infoH, infoW, infoH, item[0], item[1], {
      valueSize: 5.5,
    }),
  );

  // Cargo particulars table
  const cargoY = 119;
  sectionBar(cargoY, "Cargo Particulars");
  const tableY = cargoY + 6.2;
  const headH = 10;
  const rowH = 9.5;
  const cols = [
    { key: "packages", label: "No. of Packages", w: 22 },
    { key: "packageType", label: "Package Type", w: 23 },
    { key: "marksNumbers", label: "Marks & Numbers", w: 34 },
    { key: "description", label: "Goods Description (specific)", w: 60 },
    { key: "hsCode", label: "HS Code / Commodity", w: 27 },
    { key: "countryOrigin", label: "Country of Origin", w: 27 },
    { key: "grossWeight", label: "Gross Weight (kg)", w: 34 },
    { key: "dimensions", label: "Dimensions / Volume", w: 62 },
  ];
  let cx = M;
  cols.forEach((c) => {
    doc.setFillColor(...BLUE);
    doc.rect(cx, tableY, c.w, headH, "F");
    rect(cx, tableY, c.w, headH, { stroke: WHITE, width: 0.12 });
    setText(c.label, cx + c.w / 2, tableY + 4.2, {
      size: 5.1,
      bold: true,
      color: WHITE,
      align: "center",
      maxW: c.w - 1.5,
    });
    cx += c.w;
  });

  const rows = Array.isArray(d.cargoRows) ? d.cargoRows : [];
  const displayRows = [...rows.slice(0, 3)];
  while (displayRows.length < 3) displayRows.push({});
  displayRows.forEach((row, ri) => {
    let x = M;
    const y = tableY + headH + ri * rowH;
    cols.forEach((c) => {
      rect(x, y, c.w, rowH);
      splitText(row[c.key] || "", x, y, c.w, rowH, 5.6);
      x += c.w;
    });
  });

  const totalsY = tableY + headH + 3 * rowH;
  [
    ["Total Packages", d.totalPackages],
    ["Total Gross Weight (kg)", d.totalGrossWeight],
    ["Total Volume (m³)", d.totalVolume],
    ["Chargeable Weight (kg)", d.chargeableWeight],
  ].forEach((item, i) =>
    cell(M + i * infoW, totalsY, infoW, 12.5, item[0], item[1], {
      labelSize: 5.1,
      valueSize: 5.8,
    }),
  );

  // Special handling and dangerous goods
  const handlingY = totalsY + 12.5;
  cell(
    M,
    handlingY,
    half,
    19,
    "Special Handling / Service Instructions",
    d.specialHandling,
    {
      labelSize: 5.3,
      valueSize: 5.3,
    },
  );
  cell(
    M + half,
    handlingY,
    half,
    19,
    "Dangerous Goods / Security Information",
    d.dangerousGoods,
    {
      labelSize: 5.3,
      valueSize: 5.1,
    },
  );

  // Charges
  const chargesY = handlingY + 19;
  [
    ["Freight Charges", d.freightCharges],
    ["Other Charges", d.otherCharges],
    ["Declared Value for Carriage", d.declaredCarriage],
    ["Declared Value for Customs", d.declaredCustoms],
  ].forEach((item, i) =>
    cell(M + i * infoW, chargesY, infoW, 13, item[0], item[1], {
      labelSize: 5.1,
      valueSize: 5.6,
    }),
  );

  /* =============================== PAGE 2 =============================== */
  doc.addPage("a4", "landscape");

  // Four information panels
  const p2Y = 8;
  [
    ["Insurance", d.insurance],
    ["Payment / Incoterms", d.paymentIncoterms],
    ["Customs / Export References", d.customsReferences],
    ["Attached Documents", d.attachedDocuments],
  ].forEach((item, i) =>
    cell(M + i * infoW, p2Y, infoW, 30, item[0], item[1], {
      labelSize: 6.2,
      valueSize: 6.0,
    }),
  );

  // Declaration title band and body
  sectionBar(43, "Shipper's Declaration & Forwarder's Certification");
  rect(M, 49.2, CW, 27);
  setText(d.declaration, M + 1.5, 56.5, {
    size: 6.5,
    color: INK,
    maxW: CW - 3,
    maxH: 17,
    lineHeight: 1.3,
  });

  // Signatory row
  const signY = 78;
  const signH = 31;
  [
    ["Shipper / Authorized Signatory", d.shipperSignatory],
    ["Issued By / Agent", d.issuedByAgent],
    ["Place of Issue", d.placeOfIssue],
    ["Date of Issue", d.dateOfIssue],
  ].forEach((item, i) =>
    cell(M + i * infoW, signY, infoW, signH, item[0], item[1], {
      labelSize: 6.1,
      valueSize: 6.5,
    }),
  );

  // Notice
  setText(d.notice, M + 1.2, 117, {
    size: 6.0,
    color: INK,
    maxW: CW - 2.4,
    maxH: 18,
    lineHeight: 1.3,
  });

  return doc;
};

export const downloadPdfFormat5 = (data = {}) => {
  const doc = buildPdfFormat5(data);
  const name =
    String(data.hawbNumber || DEFAULT_HAWB.hawbNumber)
      .replace(/[\\/:*?"<>|]/g, "-")
      .replace(/^\[|\]$/g, "") || "HAWB";
  doc.save(`${name}.pdf`);
};

/* ---------------------------------------------------------------------
 * Default export: ready-to-route React component.
 * <Route path="/Pdfformat5" element={<PdfFormat5 />} />
 * Optional prop: data = {...} to fill the HAWB.
 * ------------------------------------------------------------------- */
const PdfFormat5 = ({ data = {} }) => {
  const [url, setUrl] = useState("");
  const key = JSON.stringify(data);

  useEffect(() => {
    const blob = buildPdfFormat5(data).output("blob");
    const nextUrl = URL.createObjectURL(blob);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const buttonStyle = {
    padding: "9px 18px",
    borderRadius: 8,
    border: 0,
    background: "linear-gradient(135deg,#18395b,#24537c)",
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(24,57,91,.28)",
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
      { style: { maxWidth: 1100, margin: "0 auto" } },
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
            { style: { fontSize: 18, fontWeight: 700, color: "#18395b" } },
            TITLE_5,
          ),
          h(
            "div",
            { style: { fontSize: 12.5, color: "#64748b" } },
            "Live preview",
          ),
        ),
        h(
          "button",
          { onClick: () => downloadPdfFormat5(data), style: buttonStyle },
          "Download PDF",
        ),
      ),
      h(
        "div",
        {
          style: {
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 8px 30px rgba(24,57,91,.12)",
            overflow: "hidden",
          },
        },
        url &&
          h("iframe", {
            src: url,
            title: "HAWB PDF preview",
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

export default PdfFormat5;
