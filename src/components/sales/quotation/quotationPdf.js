import { jsPDF } from "jspdf";
import {
  calcOriginCharge,
  calcQuotationTotals,
  num,
  VOLUMETRIC_FACTOR,
} from "./quotationUtils";
import { PLANE_ICON } from "./quotationAssets";

/* =====================================================================
 * Quotation PDF
 *
 * Branding is dynamic (nothing is hard-coded to one company):
 *   buildQuotationPdf(form, brand)
 *     brand.logo  – data-URL / URL of the logged-in user's company logo
 *     brand.name  – company name (shown as text when there is no logo)
 *   Falls back to form.logo / form.companyLogo and form.company.
 *
 * Tables are laid out from column definitions (x, width, alignment), so
 * text is padded, wrapped, vertically centred, and numbers are
 * right-aligned instead of being placed at hand-typed x positions.
 * ===================================================================== */

/* ---------- Colours ---------- */
const NAVY = [36, 46, 67];
const BAR = [98, 108, 126];
const ZEBRA = [235, 241, 245];
const BLACK = [0, 0, 0];
const RED = [255, 0, 0];
const LINK = [0, 0, 238];
const WHITE = [255, 255, 255];

/* ---------- Geometry ---------- */
const L = 28.5;
const R = 566.5;
const CW = R - L; // 538
const TX = 28.3;
const THICK = 1.75;
const THIN = 0.75;
const FOOTER_Y = 798;
const BASE_LIMIT = 770; // bottom limit in real page points

const PAD = 3; // horizontal cell padding
const LH = 8.4; // line height inside table cells

/* ---------- Number / text helpers ---------- */
const EU_NUMBER_FORMAT = false;
const CUR_SYMBOL = { EUR: "€" };

const fmt2 = (v) =>
  num(v).toLocaleString(EU_NUMBER_FORMAT ? "de-DE" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const curLabel = (cur) => CUR_SYMBOL[cur] || cur;
const money = (v, cur) => `${fmt2(v)} ${curLabel(cur)}`;

const rate4 = (v) =>
  num(v).toLocaleString(EU_NUMBER_FORMAT ? "de-DE" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });

const kg = (v, d = 2) => `${num(v).toFixed(d)} Kg`;
const kgs = (v, d = 2) => `${num(v).toFixed(d)} Kgs`;

const unitLabel = (u, fallback) => {
  const s = String(u || fallback || "").toLowerCase();
  if (s === "cm") return "cms";
  if (s === "kg") return "kgs";
  return s;
};

const fmtDisplayDate = (value) => {
  if (!value) return "-";
  const s = String(value).trim();
  let m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m) return `${m[1]}/${m[2]}/${m[3]}`;
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return s;
};

const portCode = (label) => {
  if (!label) return "---";
  const m = String(label).match(/\(([^)]+)\)\s*$/);
  return m ? m[1] : String(label).slice(0, 6);
};

const imgFormat = (src) =>
  /^data:image\/jpe?g/i.test(src || "") ? "JPEG" : "PNG";

const buildAtScale = (form, brand, scale) => {
  const PAGE_LIMIT = BASE_LIMIT / scale; // content coordinates are scaled
  let cur = form.currencyCode || form.currency || "INR";
  if (String(cur).length > 4) cur = "INR";

  /* ---------- Dynamic branding ---------- */
  const brandLogo = brand.logo || form.logo || form.companyLogo || null;
  const brandName = brand.name || form.company || form.companyName || "";

  const { summary, originTotal, airlines } = calcQuotationTotals(form);

  const doc = new jsPDF({ unit: "pt", format: "a4" });

  // Global scale: shrinks everything (text, rules, logos) towards the top
  // centre of the page so the whole quotation fits on one page.
  const PW = 595.28;
  const PH = 841.89;
  const openScale = () => {
    if (scale < 1)
      doc.internal.write(
        `q ${scale} 0 0 ${scale} ${((PW * (1 - scale)) / 2).toFixed(3)} ${(PH * (1 - scale)).toFixed(3)} cm`,
      );
  };
  const closeScale = () => {
    if (scale < 1) doc.internal.write("Q");
  };
  openScale();

  /* ------------------------------------------------------------------
   * Drawing primitives (text positioned by TOP of its line box)
   * ------------------------------------------------------------------ */
  const ASC = 0.89;

  const T = (str, x, top, size = 9, bold = false, color = NAVY, opts = {}) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(String(str ?? ""), x, top + size * ASC, opts);
  };

  const wrap = (str, width, size, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const out = doc.splitTextToSize(String(str ?? ""), width);
    return out.length ? out : [""];
  };

  // Single-line text that shrinks (then truncates) to fit maxW
  const fitText = (
    str,
    x,
    top,
    maxW,
    size = 9,
    bold = false,
    color = NAVY,
    min = 6,
  ) => {
    let s = String(str ?? "");
    let fs = size;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(fs);
    while (fs > min && doc.getTextWidth(s) > maxW) {
      fs -= 0.25;
      doc.setFontSize(fs);
    }
    if (doc.getTextWidth(s) > maxW) {
      while (s.length > 1 && doc.getTextWidth(`${s}...`) > maxW)
        s = s.slice(0, -1);
      s += "...";
    }
    T(s, x, top + (size - fs) / 2, fs, bold, color);
  };

  const rect = (x, y, w, h, color) => {
    doc.setFillColor(...color);
    doc.rect(x, y, w, h, "F");
  };

  const hr = (y, x1 = L, x2 = R, w = THIN, color = NAVY) =>
    rect(x1, y, x2 - x1, w, color);

  // Draw an image scaled to fit the box, keeping its aspect ratio
  const drawImageFit = (src, x, y, w, h, align = "left") => {
    try {
      const p = doc.getImageProperties(src);
      const s = Math.min(w / p.width, h / p.height);
      const iw = p.width * s;
      const ih = p.height * s;
      const ix =
        align === "right"
          ? x + w - iw
          : align === "center"
            ? x + (w - iw) / 2
            : x;
      const iy = y + (h - ih) / 2;
      doc.addImage(src, p.fileType || imgFormat(src), ix, iy, iw, ih);
      return { x: ix, y: iy, w: iw, h: ih };
    } catch (e) {
      return null;
    }
  };

  const newPage = () => {
    closeScale();
    doc.addPage();
    openScale();
    return 28.25;
  };

  const ensure = (y, needed) => (y + needed > PAGE_LIMIT ? newPage() : y);

  const section = (
    y,
    title,
    { thin = true, rule = true, pageTop = false, split, thinW = THIN } = {},
  ) => {
    if (rule) hr(y, L, R, THICK);
    T(title, TX, y + (pageTop ? 13.85 : 7.65), 15.75, true);
    const thinY = y + (pageTop ? 38.75 : 32.6);
    if (thin) {
      if (split) {
        hr(thinY, L, split[0], thinW);
        hr(thinY, split[1], R, thinW);
      } else {
        hr(thinY, L, R, thinW);
      }
    }
    return thinY;
  };

  // Start a section, moving to a new page first if `need` pt don't fit
  const startSection = (y, need, title, opts = {}) => {
    const np = y + need > PAGE_LIMIT;
    const sy = np ? newPage() : y;
    const thinY = section(sy, title, { ...opts, pageTop: np });
    return { thinY, sectionY: sy };
  };

  /* ------------------------------------------------------------------
   * Generic table.
   * cols: [{ label, w, align: 'left'|'right'|'center', bold }]
   * rows: array of arrays; a cell is a string, { text, bold } or
   *       { h, draw(x, top, w, h) } for custom content (e.g. logos).
   * Row height = tallest cell; text is wrapped to the column width and
   * vertically centred; header repeats on page breaks.
   * ------------------------------------------------------------------ */
  const drawTable = ({
    y,
    x0 = L,
    cols,
    rows,
    footer,
    size = 6.75,
    minH = 14.2,
    headH = 18,
    shadeOdd = false,
  }) => {
    const width = cols.reduce((s, c) => s + c.w, 0);
    const colX = [];
    let acc = x0;
    cols.forEach((c) => {
      colX.push(acc);
      acc += c.w;
    });
    const alignOpts = (c) => (c.align ? { align: c.align } : {});
    const textX = (c, i) =>
      c.align === "right"
        ? colX[i] + c.w - PAD
        : c.align === "center"
          ? colX[i] + c.w / 2
          : colX[i] + PAD;

    const drawHead = (top) => {
      cols.forEach((c, i) => {
        if (!c.label) return;
        T(
          c.label,
          textX(c, i),
          top + (headH - size) / 2,
          size,
          true,
          NAVY,
          alignOpts(c),
        );
      });
      return top + headH;
    };

    let cy = drawHead(y);

    const drawRow = (cells, shade, forceBold = false) => {
      const prepared = cells.map((cell, i) => {
        const c = cols[i];
        if (cell && typeof cell === "object" && cell.draw)
          return { custom: cell };
        const obj = cell && typeof cell === "object" ? cell : { text: cell };
        const bold = forceBold || !!obj.bold || !!c.bold;
        return { lines: wrap(obj.text ?? "", c.w - PAD * 2, size, bold), bold };
      });
      const h = Math.max(
        minH,
        ...prepared.map((p) =>
          p.custom ? p.custom.h : p.lines.length * LH + 6,
        ),
      );
      if (cy + h > PAGE_LIMIT) {
        const ny = newPage();
        cy = drawHead(ny);
      }
      if (shade) rect(x0, cy, width, h, shade);
      prepared.forEach((p, i) => {
        if (p.custom) {
          p.custom.draw(colX[i] + PAD, cy, cols[i].w - PAD * 2, h);
          return;
        }
        const top = cy + (h - p.lines.length * LH) / 2 + (LH - size) / 2;
        p.lines.forEach((ln, k) =>
          T(
            ln,
            textX(cols[i], i),
            top + k * LH,
            size,
            p.bold,
            NAVY,
            alignOpts(cols[i]),
          ),
        );
      });
      cy += h;
    };

    rows.forEach((r, i) => {
      const shaded = shadeOdd ? i % 2 === 1 : i % 2 === 0;
      drawRow(r, shaded ? ZEBRA : null);
    });
    if (footer) drawRow(footer, ZEBRA, true);
    return cy;
  };

  /* ================================================================
   * PAGE 1 – header bar with dynamic logo / company name
   * ================================================================ */
  doc.setFillColor(...BAR);
  doc.roundedRect(L, 28.3, CW, 35.2, 4, 4, "F");
  T("Quotation", 37.2, 38.2, 12, true, WHITE);

  let logoDrawn = false;
  if (brandLogo) {
    try {
      const p = doc.getImageProperties(brandLogo);
      const boxW = 130;
      const boxH = 31;
      const s = Math.min(boxW / p.width, boxH / p.height);
      const iw = p.width * s;
      const ih = p.height * s;
      const ix = 540 - iw;
      // white notch sized to the actual logo so any logo shape looks right
      rect(ix - 10, 28.3, 548.7 - (ix - 10), 35.2, WHITE);
      doc.addImage(
        brandLogo,
        p.fileType || imgFormat(brandLogo),
        ix,
        28.3 + (35.2 - ih) / 2,
        iw,
        ih,
      );
      logoDrawn = true;
    } catch (e) {
      logoDrawn = false;
    }
  }
  if (!logoDrawn && brandName) {
    // no logo: show the company name, right-aligned and shrunk to fit
    let fs = 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fs);
    while (fs > 8 && doc.getTextWidth(brandName) > 190) {
      fs -= 0.5;
      doc.setFontSize(fs);
    }
    T(brandName, R - 10, 38.2 + (12 - fs) / 2, fs, true, WHITE, {
      align: "right",
    });
    /* (T args: text, x, top, size, bold, color, opts) */
  }

  /* ---------- Row 1 : quotation no / date  |  company / agent ---------- */
  hr(78.5, L, 281.2, THICK);
  hr(78.5, 313.8, R, THICK);
  hr(101.5, L, 281.2, 1);
  hr(101.5, 313.8, R, 1);
  hr(124, 313.8, R);
  hr(146.25, 313.8, R);

  T("QUOTATION", TX, 85.4);
  fitText(form.quotationNo || "Draft", 87.9, 85.4, 76, 9, true);
  T("DATE", 169.8, 85.4);
  fitText(fmtDisplayDate(form.quotationDate), 199.9, 85.4, 80, 9, true);

  T("FROM", TX, 107.3);
  T("TO", 169.8, 107.3);
  fitText(portCode(form.originPort), TX, 112.3, 100, 33, true, NAVY, 18);
  fitText(
    portCode(form.destinationPort),
    169.8,
    112.3,
    108,
    33,
    true,
    NAVY,
    18,
  );
  try {
    doc.addImage(PLANE_ICON, "PNG", 134.5, 116.25, 23.57, 20.96);
  } catch (e) {
    /* icon optional */
  }
  fitText(form.originCity || "", 34.3, 158.9, 125, 10.5, true);
  fitText(form.destinationCity || "", 175.8, 158.9, 103, 10.5, true);

  const rowsR1 = [
    ["COMPANY", form.company || brandName],
    ["AGENT", form.agentName],
    ["PHONE", form.agentPhone],
    ["EMAIL", form.agentEmail],
  ];
  const r1Tops = [85.4, 107.5, 129.6, 151.9];
  rowsR1.forEach(([label, val], i) => {
    T(label, 313.7, r1Tops[i] - 0.1, 9, true);
    const isMail = label === "EMAIL";
    fitText(
      val || "-",
      395.6,
      r1Tops[i] + (isMail ? 0.9 : 0),
      R - 395.6 - 3,
      isMail ? 7.5 : 9,
    );
  });

  /* ---------- Row 2 : terms  |  customer ---------- */
  hr(189, L, 281.2, THICK);
  hr(189, 313.8, R, THICK);
  [212.25, 234.5, 256.75, 278.75].forEach((y) => hr(y, L, 281.2));
  [212.25, 234.5, 256.75, 289.75].forEach((y) => hr(y, 313.8, R));

  const weightLine = `${kg(summary.gross)} / ${num(summary.cbm).toFixed(2)} m3 (CW ${kg(summary.chargeable)})`;
  const leftRows = [
    ["EXPIRATION DATE", fmtDisplayDate(form.expirationDate)],
    ["WEIGHT", weightLine],
    ["PAYMENT TERMS", form.paymentTerms || "-"],
    ["INCOTERM", form.incoterm || "-"],
    ["SERVICE", form.service || "-"],
  ];
  leftRows.forEach(([label, val], i) => {
    const top = 195.6 + i * 22.175;
    T(label, TX, top, 9, true);
    fitText(val, 120.1, top + 0.1, 281.2 - 120.1 - 2, 9);
  });

  T("CUSTOMER", 313.7, 195.6, 9, true);
  fitText(form.customerName || "-", 367.8, 195.7, R - 367.8 - 3, 9);
  T("PHONE", 313.7, 217.7, 9, true);
  fitText(form.customerPhone || "-", 367.8, 217.9, R - 367.8 - 3, 9);
  T("EMAIL:", 313.7, 239.9, 9, true);
  fitText(form.customerEmail || "-", 367.8, 240.9, R - 367.8 - 3, 7.5);
  T("ADDRESS", 313.7, 267.5, 9, true);

  const addrLines = wrap(form.customerAddress || "-", R - 367.8 - 3, 9);
  T(addrLines[0] || "", 367.8, 262.0, 9);
  T(addrLines[1] || "", 367.8, 273.3, 9);
  const extra = addrLines.slice(2);
  extra.forEach((ln, i) => T(ln, 367.8, 295.2 + i * 11.3, 9));
  const extraH = Math.max(0, (extra.length - 1) * 11.3);

  /* ---------- Shipment details ---------- */
  let y = 320.5 + extraH;
  let thinY = section(y, "Shipment details", { split: [367.2, 405.2] });

  const pkgs = form.packages || [];
  const PKG_HEAD = 18;
  const pkgCols = [
    { label: "Quantity", w: 67.74 },
    { label: "Weight", w: 67.74 },
    { label: "Length", w: 67.74 },
    { label: "Width", w: 67.74 },
    { label: "Height", w: 67.74 },
  ];
  const pkgRows = pkgs.map((p) => {
    const du = unitLabel(p.dimensionUnit, "cm");
    return [
      String(p.quantity || "-"),
      `${p.weight ? p.weight + " " : ""}${unitLabel(p.weightUnit, "kg")}`,
      `${p.length || "-"} ${du}`,
      `${p.width || "-"} ${du}`,
      `${p.height || "-"} ${du}`,
    ];
  });

  const sumRows = [
    ["Gross Weight", kgs(summary.gross)],
    ["Volumetric Weight", kgs(summary.volumetric)],
    ["Chargeable weight", kgs(summary.chargeable)],
    ["Volume", `${num(summary.cbm).toFixed(2)} cbms`],
    ["Pieces", String(summary.pieces)],
  ];

  const pg0 = doc.getNumberOfPages();
  // summary first (fixed 5 rows, always on this page), rows line up with package rows
  const sumEnd = drawTable({
    y: thinY + 3 + PKG_HEAD,
    x0: 405.2,
    cols: [
      { w: 90, bold: true },
      { w: R - 405.2 - 90, align: "right" },
    ],
    rows: sumRows,
    headH: 0,
    shadeOdd: true,
  });
  const pkgEnd = drawTable({
    y: thinY + 3,
    cols: pkgCols,
    rows: pkgRows,
    headH: PKG_HEAD,
  });
  y = (doc.getNumberOfPages() > pg0 ? pkgEnd : Math.max(pkgEnd, sumEnd)) + 16;

  /* ---------- Charges in <origin> ---------- */
  const charges = form.originCharges || [];
  if (charges.length) {
    const s = startSection(
      y,
      120,
      `Charges in ${form.originCity || "Origin"}`,
      {
        thinW: 0.5,
      },
    );
    thinY = s.thinY;

    const chargeRows = charges.map((c) => {
      const rateStr = `${money(c.rate, cur)} / ${c.rateUnit || ""}${
        num(c.minimumCharge) ? ` | Min: ${money(c.minimumCharge, cur)}` : ""
      }`;
      const isKg = /kg/i.test(c.rateUnit || "");
      const units = isKg
        ? `${num(c.quantity).toFixed(2)} Kg`
        : `${num(c.quantity)} ${c.rateUnit || ""}`;
      return [
        c.description || "",
        rateStr,
        units,
        money(calcOriginCharge(c), cur),
        c.notes || "",
      ];
    });

    const end = drawTable({
      y: thinY + 3,
      cols: [
        { label: "Service", w: 150 },
        { label: "Rate", w: 122 },
        { label: "Units", w: 54, align: "right" },
        { label: "Total", w: 72, align: "right" },
        { label: "Notes", w: CW - 150 - 122 - 54 - 72 },
      ],
      rows: chargeRows,
      footer: ["Total", "", "", money(originTotal, cur), ""],
    });
    y = end + 14.7;
  }

  /* ================================================================
   * Airfreight rates
   * ================================================================ */
  const allin = (a) =>
    String(a.remarks || "")
      .toLowerCase()
      .includes("all");

  {
    const s = startSection(y, 150, "Airfreight rates");
    thinY = s.thinY;

    const airlineCell = (a) => ({
      h: 26,
      draw: (x, top, w, h) => {
        const logo = a.airlineLogo || a.logo;
        const box = logo ? drawImageFit(logo, x, top + 3, w, 12, "left") : null;
        if (box) {
          if (a.airlineCode) T(a.airlineCode, x, top + 16, 6.75);
        } else {
          const lines = wrap(
            a.airlineName || a.airlineCode || "-",
            w,
            6.75,
          ).slice(0, 2);
          const t0 = top + (h - lines.length * LH) / 2 + (LH - 6.75) / 2;
          lines.forEach((ln, k) => T(ln, x, t0 + k * LH, 6.75));
        }
      },
    });

    const airRows = airlines.map((a) => [
      airlineCell(a),
      a.productName || "",
      a.destinationCode || "",
      a.transitVia || "-",
      a.rateType || "-",
      rate4(a.ratePerKg),
      num(a.fuelRate) ? rate4(a.fuelRate) : allin(a) ? "Allin" : "-",
      num(a.riskRate) ? rate4(a.riskRate) : allin(a) ? "Allin" : "-",
      fmt2(a.freight),
      num(a.surcharges) ? fmt2(a.surcharges) : allin(a) ? "Allin" : "-",
      { text: `${fmt2(a.total)} ${curLabel(cur)}`, bold: true },
    ]);

    const end = drawTable({
      y: thinY + 3,
      minH: 26,
      cols: [
        { label: "Airline", w: 54 },
        { label: "Product", w: 86 },
        { label: "To", w: 30 },
        { label: "Via", w: 34 },
        { label: "Type", w: 36 },
        { label: "Rate", w: 42, align: "right" },
        { label: "Fuel", w: 36, align: "right" },
        { label: "Risk", w: 36, align: "right" },
        { label: "Freight", w: 54, align: "right" },
        { label: "Surcharges", w: 50, align: "right" },
        { label: "Total", w: 80, align: "right" },
      ],
      rows: airRows,
    });
    y = end + 17.6;
  }

  /* ---------- Quotation Total ---------- */
  {
    const s = startSection(y, 110, "Quotation Total", { thinW: 0.5 });
    thinY = s.thinY;
    const end = drawTable({
      y: thinY + 3,
      cols: [
        { label: "Company", w: 150 },
        { label: "Product", w: 210 },
        { label: "To", w: 70 },
        { label: "Total", w: CW - 150 - 210 - 70, align: "right" },
      ],
      rows: airlines.map((a) => [
        a.airlineName || a.airlineCode || "",
        a.productName || "",
        a.destinationCode || "",
        { text: `${fmt2(a.quotationTotal)} ${curLabel(cur)}`, bold: true },
      ]),
    });
    y = end + 27.7;
  }

  /* ---------- Optional closing block (website + legal text) ---------- */
  if (form.website || form.legalText) {
    const fy = ensure(y, 60);
    hr(fy, L, R, THICK);
    let by = fy + 7.05;
    if (form.website) {
      doc.setFont("helvetica", "normal").setFontSize(7.8);
      doc.setTextColor(...LINK);
      const ly = by + 7.8 * ASC;
      doc.textWithLink(form.website, TX, ly, {
        url: /^https?:/i.test(form.website)
          ? form.website
          : `http://${form.website}`,
      });
      const w = doc.getTextWidth(form.website);
      doc.setDrawColor(...LINK).setLineWidth(0.5);
      doc.line(TX, ly + 1.2, TX + w, ly + 1.2);
      by += 17.6;
    }
    if (form.legalText) {
      wrap(form.legalText, CW, 7.8).forEach((ln, k) =>
        T(ln, TX, by + k * 9.8, 7.8, false, BLACK),
      );
    }
  }

  /* ================================================================
   * Footer on every page
   * ================================================================ */
  closeScale();
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    rect(28.2, FOOTER_Y, 538.6, 0.5, BLACK);
    T(`Page ${i} of ${pages}`, 564.1, 784.3, 9.5, false, BLACK, {
      align: "right",
    });
  }

  return doc;
};

// Builds at full size; if it spills onto a 2nd page, shrinks everything
// step by step until the quotation fits on a single page.
export const buildQuotationPdf = (form, brand = {}) => {
  let scale = 1;
  let doc = buildAtScale(form, brand, scale);
  while (doc.getNumberOfPages() > 1 && scale > 0.4) {
    scale = Math.round((scale - 0.03) * 100) / 100;
    doc = buildAtScale(form, brand, scale);
  }
  return doc;
};

export const downloadQuotationPdf = (form, brand = {}) => {
  const doc = buildQuotationPdf(form, brand);
  const name = (brand.fileName || form.quotationNo || "Quotation").replace(
    /[\\/:*?"<>|]/g,
    "-",
  );
  const origin = portCode(form.originPort);
  const dest = portCode(form.destinationPort);
  doc.save(`${name}_${origin}_${dest}.pdf`);
};
