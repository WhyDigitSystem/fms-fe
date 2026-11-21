import { jsPDF } from "jspdf";

/* =====================================================================
 * Common PDF engine – "Delivery Order / letter" style, A4 portrait.
 *
 * buildPdfDoc(spec, brand) -> jsPDF
 *
 * Layout (same as SIDO_Professional_Redesign):
 *   centred logo  ->  centred bold title  ->  accent rule
 *   "To:" (left)  +  tinted meta table (right)
 *   flowing sections (text / detailTable / table / signoff / custom)
 *   footer on every page:  left text | "Pages x of y" centred | right text
 *
 * spec = {
 *   title, logo, companyName, theme, themeColor,
 *   party: { label, value },                 // "To:" block, left of meta
 *   meta:  [[label, value], ...],            // right tinted table
 *   sections: [...],
 *   footer: { left, center, right }          // center default "Pages {page} of {pages}"
 * }
 *
 * Sections (every one accepts gapBefore: number of pt to leave above it)
 *  { type:"text", lines:[ line ], size, lineHeight, color }
 *        line = [ {text,bold,gap,color} | "plain" ]  (inline segments, one line)
 *  { type:"detailTable", headers:[a,b], rows:[ {label,value,tall,extra:{label,value}} ] }
 *  { type:"table", cols:[{label,w,align,bold}], rows:[[cell]], footer:[cell], size }
 *  { type:"signoff", x, lineHeight, lines:[{text,bold,gap}] }
 *  { type:"custom", render(ctx, y) -> y }
 * ===================================================================== */

export const THEMES = {
  orange: {
    accent: [244, 121, 59],
    navy: [26, 54, 76],
    tint: [236, 242, 245],
    border: [200, 214, 224],
  },
  blue: {
    accent: [28, 63, 120],
    navy: [20, 32, 62],
    tint: [234, 240, 249],
    border: [200, 212, 230],
  },
  teal: {
    accent: [15, 98, 106],
    navy: [14, 42, 50],
    tint: [229, 243, 244],
    border: [190, 216, 220],
  },
  green: {
    accent: [28, 96, 70],
    navy: [16, 45, 36],
    tint: [231, 243, 237],
    border: [194, 218, 206],
  },
  charcoal: {
    accent: [52, 61, 76],
    navy: [30, 36, 46],
    tint: [238, 240, 243],
    border: [208, 213, 222],
  },
};

const hexToRgb = (hex) => {
  const m = String(hex || "")
    .trim()
    .match(/^#?([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const resolveTheme = (brand = {}, spec = {}) => {
  const base = THEMES[brand.theme || spec.theme] || THEMES.orange;
  const custom = hexToRgb(brand.color || spec.themeColor);
  return custom ? { ...base, accent: custom } : base;
};

/* ---------- Constants (pt) ---------- */
const INK = [34, 44, 56];
const MUTED = [110, 125, 140];
const FOOT = [125, 135, 148];
const WHITE = [255, 255, 255];

const PW = 595.28;
const PH = 841.89;
const L = 54;
const R = PW - 54;
const CW = R - L;
const PAGE_LIMIT = 790; // content must end above the footer line
const TOP_NEXT = 48; // top of content on continuation pages
const FOOT_LINE = 811;
const PAD = 8;
const ASC = 0.89;

const TX = L + 6; // x of free text (Dear Sir, ...)
const META_W = 242;
const META_RH = 20;
const META_TOP = 132;

const HEADH = 23;
const ROW_H = 22.7;
const ROW_TALL = 43;
const CELL_SIZE = 8.5;
const CELL_LH = 10.5;

const isEmpty = (v) => v === undefined || v === null || v === "";

export const buildPdfDoc = (spec, brand = {}) => {
  const { accent, navy, tint, border } = resolveTheme(brand, spec);
  const colors = { ink: INK, muted: MUTED, navy, accent, white: WHITE };
  const tok = (c) => (typeof c === "string" ? colors[c] || INK : c || INK);

  const doc = new jsPDF({ unit: "pt", format: "a4" });

  /* ---------------- primitives ---------------- */
  const setF = (size, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
  };

  // `top` = top of the text line box (not the baseline)
  const T = (
    str,
    x,
    top,
    size = 9,
    bold = false,
    color = INK,
    align = "left",
  ) => {
    setF(size, bold);
    doc.setTextColor(...color);
    doc.text(String(str ?? ""), x, top + size * ASC, { align });
  };

  const wrap = (str, width, size, bold = false) => {
    setF(size, bold);
    const out = doc.splitTextToSize(String(str ?? ""), Math.max(10, width));
    return out.length ? out : [""];
  };

  const fitText = (
    str,
    x,
    top,
    maxW,
    size,
    bold,
    color,
    min = 6,
    align = "left",
  ) => {
    let s = String(str ?? "");
    let fs = size;
    setF(fs, bold);
    while (fs > min && doc.getTextWidth(s) > maxW) {
      fs -= 0.25;
      doc.setFontSize(fs);
    }
    if (doc.getTextWidth(s) > maxW) {
      while (s.length > 1 && doc.getTextWidth(`${s}...`) > maxW)
        s = s.slice(0, -1);
      s += "...";
    }
    T(s, x, top + (size - fs) / 2, fs, bold, color, align);
  };

  const rect = (x, y, w, h, color) => {
    doc.setFillColor(...color);
    doc.rect(x, y, w, h, "F");
  };

  const ln = (x1, y1, x2, y2, color = border, w = 0.7) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(w);
    doc.line(x1, y1, x2, y2);
  };

  const drawImageFit = (src, x, y, w, h, align = "center") => {
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
      doc.addImage(src, p.fileType || "PNG", ix, iy, iw, ih);
      return { x: ix, y: iy, w: iw, h: ih };
    } catch (e) {
      return null; // logo must be a base64 data URL; otherwise fall back to the name
    }
  };

  // returns y of a new block, adding a page when it won't fit
  const place = (y, gap, h) => {
    let top = y + (gap || 0);
    if (top + h > PAGE_LIMIT) {
      doc.addPage();
      top = TOP_NEXT;
    }
    return top;
  };

  const alignX = (align, x, w) =>
    align === "right" ? x + w - PAD : align === "center" ? x + w / 2 : x + PAD;

  /* cells: [{ x, w, lines, bold, fill, color, align, valign }] */
  const drawCells = (cells, y, h, size = CELL_SIZE, lh = CELL_LH) => {
    cells.forEach((c) => {
      doc.setFillColor(...c.fill);
      doc.setDrawColor(...border);
      doc.setLineWidth(0.6);
      doc.rect(c.x, y, c.w, h, "FD");
      const n = c.lines.length;
      const top = c.valign === "top" ? y + 7 : y + (h - n * lh) / 2;
      c.lines.forEach((l, k) =>
        T(
          l,
          alignX(c.align, c.x, c.w),
          top + k * lh + (lh - size) / 2,
          size,
          !!c.bold,
          c.color || INK,
          c.align || "left",
        ),
      );
    });
  };

  /* ================================================================
   * HEADER  (logo, title, rule)
   * ================================================================ */
  const drawHeader = () => {
    const logo = brand.logo || spec.logo;
    const box = logo ? drawImageFit(logo, L, 36, CW, 44, "center") : null;
    if (!box) {
      const name = brand.name || spec.companyName || "";
      if (name) T(name, PW / 2, 48, 20, true, navy, "center");
    }
    const title = String(spec.title || "");
    let fs = 17;
    setF(fs, true);
    while (fs > 10 && doc.getTextWidth(title) > CW) {
      fs -= 0.5;
      doc.setFontSize(fs);
    }
    T(title, PW / 2, 96 - fs * 0.53, fs, true, navy, "center");
    rect(L, 115, CW, 2.2, accent);
  };

  /* ================================================================
   * SPLIT HEADER (spec.layout === "split")
   * logo + title on the left, meta table on the right (same row),
   * accent rule below, then "To:" and the intro lines.
   * ================================================================ */
  const drawSplit = () => {
    const TOP = 30;
    const W = 215;
    const valX = 90;
    const x = R - W;
    const meta = (spec.meta || []).filter(Boolean);

    const logo = brand.logo || spec.logo;
    const box = logo ? drawImageFit(logo, L, TOP, 150, 40, "left") : null;
    if (!box) {
      const name = brand.name || spec.companyName || "";
      if (name) T(name, L, TOP + 8, 20, true, navy);
    }
    const title = String(spec.title || "");
    let fs = 17;
    setF(fs, true);
    while (fs > 10 && doc.getTextWidth(title) > x - L - 16) {
      fs -= 0.5;
      doc.setFontSize(fs);
    }
    T(title, L, TOP + 48, fs, true, navy);

    meta.forEach(([lab, val], i) => {
      const ry = TOP + i * META_RH;
      rect(x, ry, W, META_RH, tint);
      if (i < meta.length - 1)
        ln(x, ry + META_RH, R, ry + META_RH, border, 0.6);
      T(
        String(lab || "").toUpperCase(),
        x + 9,
        ry + (META_RH - 7.5) / 2,
        7.5,
        true,
        MUTED,
      );
      fitText(
        isEmpty(val) ? "-" : val,
        x + valX,
        ry + (META_RH - 8.5) / 2,
        W - valX - 8,
        8.5,
        true,
        INK,
        6,
      );
    });

    rect(L, 104, CW, 2.2, accent);

    const intro = (spec.intro || []).filter((t) => !isEmpty(t));
    let cy = 122;
    if (spec.party) {
      const label = spec.party.label || "To:";
      setF(9, true);
      const lw = doc.getTextWidth(label);
      T(label, TX, cy, 9, true, INK);
      fitText(
        spec.party.value || "",
        TX + lw + 6,
        cy,
        CW - lw - 24,
        9,
        false,
        INK,
        6,
      );
      cy += intro.length ? 22 : 14;
    }
    intro.forEach((t) => {
      fitText(t, TX, cy, CW - 12, 9, false, INK, 6);
      cy += 14;
    });
    return cy;
  };

  /* ================================================================
   * "To:" + meta table
   * ================================================================ */
  const drawMeta = () => {
    const meta = (spec.meta || []).filter(Boolean);
    const intro = (spec.intro || []).filter((t) => !isEmpty(t));
    const inline = intro.length > 0; // "To:" + intro lines sit in the same rows as the meta table
    const W = inline ? 190 : META_W;
    const valX = inline ? 80 : 128;
    const leftRows = (spec.party ? 1 : 0) + intro.length;
    const rows = Math.max(meta.length, leftRows, 1);
    const blockH = rows * META_RH;
    const x = R - W;

    meta.forEach(([lab, val], i) => {
      const ry = META_TOP + i * META_RH;
      rect(x, ry, W, META_RH, tint);
      if (i < meta.length - 1)
        ln(x, ry + META_RH, R, ry + META_RH, border, 0.6);
      T(
        String(lab || "").toUpperCase(),
        x + 9,
        ry + (META_RH - 7.5) / 2,
        7.5,
        true,
        MUTED,
      );
      fitText(
        isEmpty(val) ? "-" : val,
        x + valX,
        ry + (META_RH - 8.5) / 2,
        W - valX - 8,
        8.5,
        true,
        INK,
        6,
      );
    });

    const label = spec.party ? spec.party.label || "To:" : "";
    const px = TX; // same left edge as the body text and table text
    if (spec.party) {
      setF(9, true);
      const lw = doc.getTextWidth(label);
      if (inline) {
        const top = META_TOP + (META_RH - 9) / 2;
        T(label, px, top, 9, true, INK);
        fitText(
          spec.party.value || "",
          px + lw + 6,
          top,
          x - px - lw - 20,
          9,
          false,
          INK,
          6,
        );
      } else {
        const valLines = isEmpty(spec.party.value)
          ? []
          : wrap(spec.party.value, x - px - lw - 20, 9, false).slice(0, 4);
        const n = Math.max(1, valLines.length);
        const top = META_TOP + blockH / 2 - (n * 12) / 2;
        T(label, px, top + 1.5, 9, true, INK);
        valLines.forEach((l, k) =>
          T(l, px + lw + 6, top + 1.5 + k * 12, 9, false, INK),
        );
      }
    }
    const first = spec.party ? 1 : 0;
    intro.forEach((t, k) =>
      fitText(
        t,
        px,
        META_TOP + (first + k) * META_RH + (META_RH - 9) / 2,
        x - px - 14,
        9,
        false,
        INK,
        6,
      ),
    );
    return META_TOP + blockH;
  };

  /* ================================================================
   * SECTIONS
   * ================================================================ */
  const sections = {
    text(s, y) {
      const size = s.size || 9;
      const lh = s.lineHeight || 13;
      const color = tok(s.color);
      const lines = [];
      (s.lines || []).forEach((line) => {
        const segs = Array.isArray(line) ? line : [{ text: line }];
        if (segs.length === 1 && !segs[0].gap) {
          wrap(segs[0].text, CW - 12, size, !!segs[0].bold).forEach((t) =>
            lines.push([{ ...segs[0], text: t }]),
          );
        } else lines.push(segs);
      });
      const top = place(y, s.gapBefore, lines.length * lh);
      lines.forEach((segs, k) => {
        let cx = TX;
        segs.forEach((sg) => {
          cx += sg.gap || 0;
          T(
            sg.text,
            cx,
            top + k * lh + (lh - size) / 2,
            size,
            !!sg.bold,
            sg.color ? tok(sg.color) : color,
          );
          setF(size, !!sg.bold);
          cx += doc.getTextWidth(String(sg.text ?? ""));
        });
      });
      return top + lines.length * lh;
    },

    detailTable(s, y) {
      const c1 = CW * 0.2;
      const c2 = CW * 0.308;
      const c3 = CW * 0.177;
      const c4 = CW - c1 - c2 - c3;
      const [h1, h2] = s.headers || ["", ""];

      const head = (yy) => {
        rect(L, yy, CW, HEADH, navy);
        const l1 = wrap(h1, c1 - PAD * 2, CELL_SIZE, true);
        const t1 =
          yy + (HEADH - l1.length * CELL_LH) / 2 + (CELL_LH - CELL_SIZE) / 2;
        l1.forEach((l, k) =>
          T(l, L + PAD, t1 + k * CELL_LH, CELL_SIZE, true, WHITE),
        );
        T(
          h2,
          L + c1 + PAD,
          yy + (HEADH - CELL_SIZE) / 2,
          CELL_SIZE,
          true,
          WHITE,
        );
        return yy + HEADH;
      };

      let cy = place(y, s.gapBefore, HEADH + ROW_H * 2);
      cy = head(cy);

      (s.rows || []).forEach((r) => {
        const split = !!r.extra;
        const vw = split ? c2 : CW - c1;
        const labelLines = wrap(r.label, c1 - PAD * 2, CELL_SIZE, true);
        const valLines = wrap(r.value, vw - PAD * 2, CELL_SIZE);
        const exLabel = split
          ? wrap(r.extra.label, c3 - PAD * 2, CELL_SIZE, true)
          : [""];
        const exVal = split
          ? wrap(r.extra.value, c4 - PAD * 2, CELL_SIZE)
          : [""];
        const need =
          Math.max(
            labelLines.length,
            valLines.length,
            exLabel.length,
            exVal.length,
          ) *
            CELL_LH +
          10;
        const h = Math.max(r.tall ? ROW_TALL : ROW_H, need);

        if (cy + h > PAGE_LIMIT) {
          doc.addPage();
          cy = head(TOP_NEXT);
        }
        const vAlign = r.tall ? "top" : "center";
        const cells = [
          { x: L, w: c1, lines: labelLines, bold: true, fill: tint },
          { x: L + c1, w: vw, lines: valLines, fill: WHITE, valign: vAlign },
        ];
        if (split) {
          cells.push(
            { x: L + c1 + c2, w: c3, lines: exLabel, bold: true, fill: tint },
            { x: L + c1 + c2 + c3, w: c4, lines: exVal, fill: WHITE },
          );
        }
        drawCells(cells, cy, h);
        cy += h;
      });
      return cy;
    },

    table(s, y) {
      const size = s.size || 8;
      const lh = size + 2.5;
      const fixed = s.cols.reduce(
        (a, c) => a + (c.w === "*" || c.w == null ? 0 : c.w),
        0,
      );
      const stars = s.cols.filter((c) => c.w === "*" || c.w == null).length;
      const each = stars ? Math.max(20, (CW - fixed) / stars) : 0;
      const cols = s.cols.map((c) => ({
        ...c,
        w: c.w === "*" || c.w == null ? each : c.w,
      }));
      const xs = [];
      let acc = L;
      cols.forEach((c) => {
        xs.push(acc);
        acc += c.w;
      });

      const head = (yy) => {
        rect(L, yy, acc - L, HEADH, navy);
        cols.forEach((c, i) => {
          if (!c.label) return;
          T(
            c.label,
            alignX(c.align, xs[i], c.w),
            yy + (HEADH - size) / 2,
            size,
            true,
            WHITE,
            c.align || "left",
          );
        });
        return yy + HEADH;
      };

      const rowCells = (cells, fill, forceBold) =>
        cells.map((cell, i) => {
          const o = cell && typeof cell === "object" ? cell : { text: cell };
          const bold = forceBold || !!o.bold || !!cols[i].bold;
          return {
            x: xs[i],
            w: cols[i].w,
            lines: wrap(o.text ?? "", cols[i].w - PAD * 2, size, bold),
            bold,
            fill,
            color: o.color ? tok(o.color) : INK,
            align: cols[i].align,
          };
        });

      let cy = place(y, s.gapBefore, HEADH + 22);
      cy = head(cy);
      const all = [...(s.rows || []).map((r) => rowCells(r, WHITE, false))];
      if (s.footer) all.push(rowCells(s.footer, tint, true));
      all.forEach((cells) => {
        const h = Math.max(
          20,
          Math.max(...cells.map((c) => c.lines.length)) * lh + 8,
        );
        if (cy + h > PAGE_LIMIT) {
          doc.addPage();
          cy = head(TOP_NEXT);
        }
        drawCells(cells, cy, h, size, lh);
        cy += h;
      });
      return cy;
    },

    signoff(s, y) {
      // default: same left edge as the labels in the right-hand meta table
      let x = s.x ?? R - META_W + 9;
      // align:"right" -> block ends at the right margin (same edge as the table)
      if (s.align === "right") {
        const maxW = Math.max(
          ...(s.lines || []).map((l) => {
            setF(8.5, l.bold !== false);
            return doc.getTextWidth(String(l.text ?? ""));
          }),
          0,
        );
        x = R - maxW;
      }
      const lh = s.lineHeight || 17;
      const lines = s.lines || [];
      const total = lines.reduce((a, l) => a + (l.gap || 0) + lh, 0);
      let cy = place(y, s.gapBefore, total);
      // pinBottom: block sits at the bottom of the page, right above the footer
      if (s.pinBottom) cy = Math.max(cy, PAGE_LIMIT - total);
      lines.forEach((l) => {
        cy += l.gap || 0;
        if (s.textAlign === "right")
          T(
            l.text,
            R,
            cy + (lh - 8.5) / 2,
            8.5,
            l.bold !== false,
            INK,
            "right",
          );
        else T(l.text, x, cy + (lh - 8.5) / 2, 8.5, l.bold !== false, INK);
        cy += lh;
      });
      return cy;
    },

    custom(s, y) {
      const ctx = {
        doc,
        T,
        wrap,
        fitText,
        rect,
        ln,
        drawImageFit,
        colors,
        L,
        R,
        CW,
        PW,
        PH,
      };
      const end = s.render(ctx, y);
      return typeof end === "number" ? end : y;
    },
  };

  /* ================================================================
   * BUILD
   * ================================================================ */
  let y;
  if (spec.layout === "split") y = drawSplit();
  else {
    drawHeader();
    y = drawMeta();
  }
  (spec.sections || []).forEach((s) => {
    if (!s) return;
    const fn = sections[s.type];
    if (!fn) throw new Error(`PdfEngine: unknown section type "${s.type}"`);
    y = fn(s, y);
  });

  /* ================================================================
   * FOOTER on every page
   * ================================================================ */
  const pages = doc.getNumberOfPages();
  const f = spec.footer || {};
  const fill = (t, i) =>
    String(t ?? "")
      .replace("{page}", i)
      .replace("{pages}", pages);
  const centerTpl =
    f.center === undefined ? "Pages {page} of {pages}" : f.center;

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    ln(L, FOOT_LINE, R, FOOT_LINE, border, 0.7);
    const top = 818;
    if (f.left) T(fill(f.left, i), L, top, 7.5, true, FOOT);
    if (centerTpl)
      T(fill(centerTpl, i), PW / 2, top, 7.5, true, FOOT, "center");
    if (f.right) T(fill(f.right, i), R, top, 7.5, true, FOOT, "right");
  }

  return doc;
};
