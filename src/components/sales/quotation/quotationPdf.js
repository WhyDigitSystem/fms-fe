import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  calcOriginCharge,
  calcQuotationTotals,
  num,
  VOLUMETRIC_FACTOR,
} from "./quotationUtils";

const NAVY = [38, 50, 72];
const LIGHT = [238, 242, 247];
const LINE = [205, 212, 222];
const BLUE = [37, 99, 235];
const TEXT = [30, 41, 59];
const MUTED = [100, 116, 139];

const SYMBOLS = { EUR: "€", USD: "$", GBP: "£" };

const money = (v, cur) => {
  const n = num(v).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return SYMBOLS[cur] ? `${n} ${SYMBOLS[cur]}` : `${n} ${cur || ""}`.trim();
};

const rate4 = (v) => {
  const n = num(v);
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
};

const fmtDate = (iso) => {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
};

const kg = (v, d = 2) => `${num(v).toFixed(d)} Kg`;


const R = (content) => ({ content, styles: { halign: "right" } });

const alignHead = (d) => {
  if (d.section === "head" || d.section === "foot") {
    const col = d.table.columns[d.column.index];
    const cs = d.table.settings.columnStyles?.[d.column.index];
    if (cs?.halign) d.cell.styles.halign = cs.halign;
  }
};

export const buildQuotationPdf = (form) => {
  const cur = form.currency || "EUR";
  const { summary, originTotal, airlines } = calcQuotationTotals(form);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 14; // page margin
  const CW = W - M * 2;

  const setText = (rgb = TEXT) => doc.setTextColor(...rgb);

  const ensureSpace = (y, needed) => {
    if (y + needed > H - 18) {
      doc.addPage();
      return 16;
    }
    return y;
  };

  const sectionTitle = (title, y) => {
    y = ensureSpace(y, 30);
    doc.setFont("helvetica", "bold").setFontSize(13);
    setText(NAVY);
    doc.text(title, M, y);
    return y + 3;
  };

  /* ---------- Header bar ---------- */
  doc.setFillColor(...NAVY);
  doc.roundedRect(M, 10, CW, 10, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold").setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("Quotation", M + 4, 16.6);
  doc.setFontSize(10);
  doc.text((form.company || "").toUpperCase(), W - M - 4, 16.6, { align: "right" });

  /* ---------- Top-left: number / date / route ---------- */
  let y = 29;
  doc.setFont("helvetica", "normal").setFontSize(8);
  setText(MUTED);
  doc.text("QUOTATION", M, y);
  doc.text("DATE", M + 46, y);
  doc.setFont("helvetica", "bold");
  setText(TEXT);
  doc.text(form.quotationNo || "Draft", M + 19, y);
  doc.text(fmtDate(form.quotationDate), M + 55, y);

  doc.setFont("helvetica", "normal").setFontSize(7);
  setText(MUTED);
  doc.text("FROM", M, y + 7);
  doc.text("TO", M + 42, y + 7);

  doc.setFont("helvetica", "bold").setFontSize(26);
  setText(NAVY);
  doc.text(form.originCode || "---", M, y + 17);
  doc.text(form.destinationCode || "---", M + 42, y + 17);

  // simple plane glyph between codes
  doc.setDrawColor(...BLUE).setLineWidth(0.5);
  const px = M + 30;
  const py = y + 12.5;
  doc.line(px - 3, py + 2, px + 3, py - 2);
  doc.line(px + 3, py - 2, px + 1, py - 2);
  doc.line(px - 1, py, px - 1, py + 3);
  doc.line(px - 1, py + 3, px + 1, py + 1);

  doc.setFont("helvetica", "bold").setFontSize(9);
  doc.text(form.originCity || "", M, y + 24);
  doc.text(form.destinationCity || "", M + 42, y + 24);

  /* ---------- Top-right: company / agent ---------- */
  const rx = M + CW / 2 + 4;
  const rw = CW / 2 - 4;
  autoTable(doc, {
    startY: y - 4,
    margin: { left: rx, right: M },
    tableWidth: rw,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 1.8, lineColor: LINE, lineWidth: 0.2, textColor: TEXT },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 24, fillColor: LIGHT },
    },
    body: [
      ["COMPANY", form.company || "-"],
      ["AGENT", form.agentName || "-"],
      ["PHONE", form.agentPhone || "-"],
      ["EMAIL", form.agentEmail || "-"],
    ],
  });

  /* ---------- Second row: terms / customer ---------- */
  y = Math.max(y + 31, doc.lastAutoTable.finalY + 5);

  const weightLine = `${kg(summary.gross)} / ${summary.cbm.toFixed(2)} m3 (CW ${kg(summary.chargeable)})`;

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M + CW / 2 + 4 },
    tableWidth: CW / 2 - 4,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 1.8, lineColor: LINE, lineWidth: 0.2, textColor: TEXT },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 30, fillColor: LIGHT } },
    body: [
      ["EXPIRATION DATE", fmtDate(form.expirationDate)],
      ["WEIGHT", weightLine],
      ["PAYMENT TERMS", form.paymentTerms || "-"],
      ["INCOTERM", `${form.incoterm || ""} ${form.originCode || ""}`.trim()],
      ["SERVICE", form.service || "-"],
    ],
  });
  const leftEnd = doc.lastAutoTable.finalY;

  autoTable(doc, {
    startY: y,
    margin: { left: rx, right: M },
    tableWidth: rw,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 1.8, lineColor: LINE, lineWidth: 0.2, textColor: TEXT },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 24, fillColor: LIGHT } },
    body: [
      ["CUSTOMER", form.customerName || "-"],
      ["PHONE", form.customerPhone || "-"],
      ["EMAIL", form.customerEmail || "-"],
      ["ADDRESS", form.customerAddress || "-"],
    ],
  });

  y = Math.max(leftEnd, doc.lastAutoTable.finalY) + 9;

  /* ---------- Shipment details ---------- */
  y = sectionTitle("Shipment details", y);
  const tableTop = y;
  const pkgW = CW * 0.64;

  autoTable(doc, {
    startY: tableTop,
    margin: { left: M, right: W - M - pkgW },
    tableWidth: pkgW,
    theme: "striped",
    headStyles: { fillColor: [255, 255, 255], textColor: TEXT, fontSize: 7.5, fontStyle: "bold" },
    styles: { fontSize: 7.5, cellPadding: 1.5, textColor: TEXT },
    alternateRowStyles: { fillColor: LIGHT },
    head: [["Quantity", "Weight", "Length", "Width", "Height", "Cargo"]],
    body: form.packages.map((p) => [
      p.quantity || "-",
      p.weight ? `${p.weight} ${p.weightUnit || "kg"}` : "-",
      `${p.length || "-"} ${p.dimensionUnit || "cm"}`,
      `${p.width || "-"} ${p.dimensionUnit || "cm"}`,
      `${p.height || "-"} ${p.dimensionUnit || "cm"}`,
      [p.cargoType, p.cargoDescription].filter(Boolean).join(" / ") || "-",
    ]),
  });
  const pkgEnd = doc.lastAutoTable.finalY;

  autoTable(doc, {
    startY: tableTop,
    margin: { left: M + pkgW + 5, right: M },
    tableWidth: CW - pkgW - 5,
    theme: "plain",
    styles: { fontSize: 7.5, cellPadding: 1.6, textColor: TEXT },
    columnStyles: { 0: { fontStyle: "bold" }, 1: { halign: "right" } },
    didParseCell: (d) => {
      d.cell.styles.fillColor = LIGHT;
    },
    body: [
      ["Gross Weight", kg(summary.gross)],
      ["Volumetric Weight", kg(summary.volumetric)],
      ["Chargeable Weight", kg(summary.chargeable)],
      ["Volume", `${summary.cbm.toFixed(2)} cbm`],
      ["Pieces", String(summary.pieces)],
    ],
  });

  y = Math.max(pkgEnd, doc.lastAutoTable.finalY) + 9;

  /* ---------- Origin charges ---------- */
  if (form.originCharges.length) {
    y = sectionTitle(`Charges in ${form.originCity || "Origin"}`, y);

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      theme: "striped",
      headStyles: { fillColor: [255, 255, 255], textColor: TEXT, fontSize: 7.5, fontStyle: "bold" },
      styles: { fontSize: 7.5, cellPadding: 1.6, textColor: TEXT },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: { 4: { halign: "right" } },
      didParseCell: alignHead,
      head: [["Service", "Rate", "Units", "Notes", R("Total")]],
      body: form.originCharges.map((c) => [
        c.description,
        `${money(c.rate, cur)} / ${c.rateUnit}${
          num(c.minimumCharge) ? ` | Min: ${money(c.minimumCharge, cur)}` : ""
        }`,
        `${num(c.quantity)} ${c.rateUnit}`,
        c.notes || "",
        money(calcOriginCharge(c), cur),
      ]),
      foot: [["Total", "", "", "", money(originTotal, cur)]],
      footStyles: { fillColor: LIGHT, textColor: TEXT, fontStyle: "bold" },
      showFoot: "lastPage",
    });

    y = doc.lastAutoTable.finalY + 9;
  }

  /* ---------- Remarks ---------- */
  const remarks = [];
  if (num(form.freeStorageDays) > 0 || num(form.storageRate) > 0) {
    remarks.push("Warehouse charges:");
    if (num(form.freeStorageDays) > 0)
      remarks.push(`${form.freeStorageDays} day(s) free of charge.`);
    if (num(form.storageRate) > 0)
      remarks.push(
        `After free period ${money(form.storageRate, cur)} each 100 kg or fraction per day${
          num(form.storageMinimumCharge)
            ? `, minimum ${money(form.storageMinimumCharge, cur)}`
            : ""
        }.`,
      );
  }
  if (form.rateValidityRemarks) remarks.push(form.rateValidityRemarks);
  if (form.remarks) remarks.push(...form.remarks.split("\n"));

  if (remarks.length) {
    y = sectionTitle("Remarks", y);
    doc.setFont("helvetica", "normal").setFontSize(8);
    setText(TEXT);
    remarks.forEach((line) => {
      const parts = doc.splitTextToSize(line, CW);
      y = ensureSpace(y, parts.length * 4 + 2);
      doc.text(parts, M, y + 4);
      y += parts.length * 4 + 1;
    });
    y += 6;
  }

  /* ---------- Airfreight rates (new page, like the sample) ---------- */
  doc.addPage();
  y = 16;
  y = sectionTitle("Airfreight rates", y);

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: "striped",
    headStyles: { fillColor: [255, 255, 255], textColor: TEXT, fontSize: 7, fontStyle: "bold" },
    styles: { fontSize: 7, cellPadding: 1.5, textColor: TEXT },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      8: { halign: "right" },
      9: { halign: "right" },
      10: { halign: "right" },
    },
    didParseCell: alignHead,
    head: [["Airline", "Product", "To", "Via", "Type", "Rate", "Fuel", "Risk", R("Freight"), R("Surch."), R("Total")]],
    body: airlines.map((a) => [
      [a.airlineCode, a.airlineName].filter(Boolean).join(" - "),
      a.productName,
      a.destinationCode,
      a.transitVia || "-",
      a.rateType || "-",
      rate4(a.ratePerKg),
      num(a.fuelRate) ? rate4(a.fuelRate) : a.remarks?.toLowerCase().includes("all") ? "Allin" : "-",
      num(a.riskRate) ? rate4(a.riskRate) : a.remarks?.toLowerCase().includes("all") ? "Allin" : "-",
      money(a.freight, cur),
      num(a.surcharges) ? money(a.surcharges, cur) : "-",
      money(a.total, cur),
    ]),
  });
  y = doc.lastAutoTable.finalY + 9;

  /* ---------- Quotation total ---------- */
  y = sectionTitle("Quotation Total", y);
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: "striped",
    headStyles: { fillColor: [255, 255, 255], textColor: TEXT, fontSize: 8, fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 1.8, textColor: TEXT },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: { 3: { halign: "right", fontStyle: "bold" } },
    didParseCell: alignHead,
    head: [["Company", "Product", "To", R("Total")]],
    body: airlines.map((a) => [
      a.airlineName,
      a.productName,
      a.destinationCode,
      money(a.quotationTotal, cur),
    ]),
  });
  y = doc.lastAutoTable.finalY + 9;

  /* ---------- Terms and conditions ---------- */
  const terms = [];
  if (num(form.insurancePercentage) > 0)
    terms.push(
      `Insurance premium and paperwork ${num(form.insurancePercentage)}% over 110% of cargo value${
        num(form.cargoValue) ? ` (declared cargo value ${money(form.cargoValue, cur)})` : ""
      }.`,
    );
  if (num(form.profitSharingPercentage) > 0)
    terms.push(`Net rate only. Profit sharing ${num(form.profitSharingPercentage)}% for both offices.`);
  if (num(form.bankExchangePercentage) > 0)
    terms.push(`${num(form.bankExchangePercentage)}% bank currency exchange (on any currency except ${cur}).`);
  terms.push(`1 CBM = ${VOLUMETRIC_FACTOR} KG.`);
  if (form.terms) terms.push(...form.terms.split("\n").filter((l) => l.trim()));

  y = sectionTitle("Terms and Conditions", y);
  doc.setFont("helvetica", "normal").setFontSize(8);
  setText(TEXT);
  terms.forEach((line) => {
    const parts = doc.splitTextToSize(`•  ${line}`, CW);
    y = ensureSpace(y, parts.length * 4 + 2);
    doc.text(parts, M, y + 4);
    y += parts.length * 4 + 1.5;
  });

  /* ---------- Footer on every page ---------- */
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...LINE).setLineWidth(0.2);
    doc.line(M, H - 12, W - M, H - 12);
    doc.setFont("helvetica", "normal").setFontSize(8);
    setText(MUTED);
    doc.text(`${form.quotationNo || "Draft quotation"}  ·  Valid until ${fmtDate(form.expirationDate)}`, M, H - 7);
    doc.setFont("helvetica", "bold");
    setText(TEXT);
    doc.text(`Page ${i} of ${pages}`, W - M, H - 7, { align: "right" });
  }

  return doc;
};

export const downloadQuotationPdf = (form) => {
  const doc = buildQuotationPdf(form);
  const name = (form.quotationNo || "Quotation").replace(/[\\/:*?"<>|]/g, "-");
  doc.save(`${name}_${form.originCode || "ORG"}_${form.destinationCode || "DST"}.pdf`);
};
