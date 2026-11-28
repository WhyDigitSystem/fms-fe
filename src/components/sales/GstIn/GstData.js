// Shared constants, master data, helpers and sample data for the GST IN and Party Screening screens.
// Replace the sample data below with your API calls when you wire the backend.

export const uid = () => Math.random().toString(36).slice(2, 10);

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// "2026-11-05" -> "05-Nov-2026"
export const fmtDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-");
  if (!y || !m || !d) return iso;
  return `${d}-${MONTHS[Number(m) - 1]}-${y}`;
};

export const todayIso = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
};

/* ------------------------------------------------------------------ */
/* Text rules ("Do not use special characters like $ ! ' * % ...")     */
/* ------------------------------------------------------------------ */

// Free text (names, addresses): letters, digits, space and . , & ( ) / -
export const cleanText = (v) =>
  String(v || "")
    .replace(/[^A-Za-z0-9 .,&()/\-]/g, "")
    .replace(/\s{2,}/g, " ");

// Entity names: CAPITAL LETTERS only, no special characters, no double space
export const cleanEntityName = (v) =>
  String(v || "")
    .toUpperCase()
    .replace(/[^A-Z0-9 .&\-]/g, "")
    .replace(/\s{2,}/g, " ");

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[0-9]{10}$/;

/* ------------------------------------------------------------------ */
/* PAN / GSTIN                                                         */
/* ------------------------------------------------------------------ */

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const CS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Official GSTIN check digit (mod-36 weighted sum)
export const gstinChecksum = (base14) => {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const v = CS.indexOf(base14[i]);
    const p = v * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(p / 36) + (p % 36);
  }
  return CS[(36 - (sum % 36)) % 36];
};

export const makeGstin = (stateCode, pan, entityNo = "1") => {
  const base = `${stateCode}${pan}${entityNo}Z`;
  return base + gstinChecksum(base);
};

// Returns an error message, or "" when the GSTIN is fine
export const checkGstin = (gstin, { pan, stateCode }) => {
  const g = String(gstin || "").toUpperCase();
  if (!GSTIN_REGEX.test(g))
    return "GSTIN must be 15 characters in the valid format";
  if (gstinChecksum(g.slice(0, 14)) !== g[14])
    return "GSTIN check digit is invalid";
  if (stateCode && g.slice(0, 2) !== stateCode)
    return "GSTIN state code does not match the selected state";
  if (pan && g.slice(2, 12) !== pan)
    return "GSTIN does not contain the entered PAN";
  return "";
};

/* ------------------------------------------------------------------ */
/* Master data                                                         */
/* ------------------------------------------------------------------ */

export const STATES = [
  { name: "Andhra Pradesh", code: "37" },
  { name: "Delhi", code: "07" },
  { name: "Gujarat", code: "24" },
  { name: "Haryana", code: "06" },
  { name: "Karnataka", code: "29" },
  { name: "Kerala", code: "32" },
  { name: "Maharashtra", code: "27" },
  { name: "Odisha", code: "21" },
  { name: "Punjab", code: "03" },
  { name: "Rajasthan", code: "08" },
  { name: "Tamil Nadu", code: "33" },
  { name: "Telangana", code: "36" },
  { name: "Uttar Pradesh", code: "09" },
  { name: "West Bengal", code: "19" },
];

export const stateCodeOf = (name) =>
  STATES.find((s) => s.name === name)?.code || "";

// Business place options depend on the selected state
export const BUSINESS_PLACES = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada"],
  Delhi: ["New Delhi", "Okhla", "Narela"],
  Gujarat: ["Ahmedabad", "Mundra", "Surat"],
  Haryana: ["Gurugram", "Faridabad"],
  Karnataka: ["Bengaluru", "Mangaluru", "Kalaburagi"],
  Kerala: ["Kochi", "Thiruvananthapuram"],
  Maharashtra: ["Mumbai", "Nhava Sheva", "Pune"],
  Odisha: ["Bhubaneswar", "Paradip"],
  Punjab: ["Ludhiana", "Amritsar"],
  Rajasthan: ["Jaipur", "Jodhpur"],
  "Tamil Nadu": ["Chennai", "Tuticorin", "Coimbatore"],
  Telangana: ["Hyderabad", "Secunderabad"],
  "Uttar Pradesh": ["Noida", "Kanpur", "Lucknow"],
  "West Bengal": ["Kolkata", "Haldia"],
};

export const ACCOUNT_TYPES = [
  "Customer",
  "Supplier",
  "Agent",
  "Transporter",
  "Shipping Line",
];
export const BUSINESS_TYPES = [
  "Proprietorship",
  "Partnership",
  "LLP",
  "Private Limited",
  "Public Limited",
  "Trust / Society",
  "Government",
];
export const BUSINESS_CATEGORIES = [
  "Regular",
  "Composition",
  "SEZ Unit",
  "SEZ Developer",
  "Overseas / Non-resident",
  "Unregistered",
  "Others",
];

export const PARTY_TYPES = ["CUSTOMER", "SUPPLIER", "AGENT", "TRANSPORTER"];
export const SCREENING_STATUSES = ["Approved", "Pending", "Review", "Rejected"];

export const screeningStyles = {
  Approved:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  Pending:
    "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-gray-700/50 dark:text-gray-300 dark:ring-gray-500/30",
  Review:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
  Rejected:
    "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20",
};
export const screeningDots = {
  Approved: "bg-emerald-500",
  Pending: "bg-slate-400",
  Review: "bg-amber-500",
  Rejected: "bg-red-500",
};

/* ------------------------------------------------------------------ */
/* KYC / sanctions screening (dummy - swap with your KYC API)          */
/* ------------------------------------------------------------------ */

export const WATCHLIST = [
  { name: "BLOCKED TRADERS LTD", list: "OFAC SDN" },
  { name: "SHADOW SHIPPING CO", list: "UN Consolidated" },
  { name: "ZENITH ARMS TRADING", list: "EU Sanctions" },
];

const STOP_WORDS = new Set([
  "LTD",
  "LIMITED",
  "PVT",
  "PRIVATE",
  "CO",
  "COMPANY",
  "LLP",
  "INC",
  "THE",
  "AND",
  "&",
]);
const tokens = (s) =>
  String(s || "")
    .split(" ")
    .filter((t) => t && !STOP_WORDS.has(t));

// Returns { status, matches[] }.
// Full-name hit -> Rejected, two or more shared name words -> Review, else Approved.
export const screenParty = ({ entityName, altNames, refId, includeAlias }) => {
  const candidates = [
    ...new Set([entityName, altNames, refId, includeAlias].filter(Boolean)),
  ];
  const matches = [];
  candidates.forEach((cand) => {
    WATCHLIST.forEach((w) => {
      const exact = cand === w.name || cand.includes(w.name);
      const shared = tokens(cand).filter((t) => tokens(w.name).includes(t));
      if (exact)
        matches.push({
          candidate: cand,
          watch: w.name,
          list: w.list,
          level: "Exact",
        });
      else if (shared.length >= 2)
        matches.push({
          candidate: cand,
          watch: w.name,
          list: w.list,
          level: "Partial",
        });
    });
  });
  const status = matches.some((m) => m.level === "Exact")
    ? "Rejected"
    : matches.length > 0
      ? "Review"
      : "Approved";
  return { status, matches };
};

// Changing any screened value after KYC invalidates the result
export const screeningSignature = (f) =>
  [f.entityName, f.altNames, f.refId, f.includeAlias].join("|");

export const effectiveStatus = (p) =>
  p.screenedSig && p.screenedSig === screeningSignature(p)
    ? p.status
    : "Pending";

/* ------------------------------------------------------------------ */
/* Blank records                                                       */
/* ------------------------------------------------------------------ */

export const emptyStateRow = () => ({
  id: uid(),
  state: "",
  gstin: "",
  stateCode: "",
  contactPerson: "",
  phone: "",
  email: "",
});

export const emptyAddressRow = () => ({
  id: uid(),
  state: "",
  businessPlace: "",
  cityName: "",
  address1: "",
  address2: "",
  contactPerson: "",
  phone: "",
  email: "",
});

export const emptyGst = () => ({
  id: null,
  pan: "",
  partyName: "",
  accountsType: "",
  panName: "",
  businessType: "",
  businessCategory: "",
  otherCategory: "",
  approved: false,
  stateGst: [emptyStateRow()],
  addresses: [emptyAddressRow()],
});

export const emptyParty = () => ({
  id: null,
  partyType: "CUSTOMER",
  entityName: "",
  altNames: "",
  refId: "",
  includeAlias: "",
  status: "Pending",
  matches: [],
  screenedOn: "",
  screenedSig: "",
});

/* ------------------------------------------------------------------ */
/* Sample data                                                         */
/* ------------------------------------------------------------------ */

const sRow = (state, pan, entityNo, contactPerson, phone, email) => ({
  id: uid(),
  state,
  gstin: makeGstin(stateCodeOf(state), pan, entityNo),
  stateCode: stateCodeOf(state),
  contactPerson,
  phone,
  email,
});

const aRow = (
  state,
  businessPlace,
  cityName,
  address1,
  address2,
  contactPerson,
  phone,
  email,
) => ({
  id: uid(),
  state,
  businessPlace,
  cityName,
  address1,
  address2,
  contactPerson,
  phone,
  email,
});

const party = (o) => ({ refId: "", includeAlias: "", matches: [], ...o });

const mkScreened = (o, status, matches = []) => {
  const p = party(o);
  return {
    ...p,
    status,
    matches,
    screenedOn: "26-Nov-2026",
    screenedSig: screeningSignature(p),
  };
};

export const initialParties = [
  mkScreened(
    {
      id: 1,
      partyType: "CUSTOMER",
      entityName: "OM EXPORTS",
      altNames: "OM EXPORTS",
      refId: "OM EXPORTS",
      includeAlias: "OM EXPORTS",
    },
    "Approved",
  ),
  mkScreened(
    {
      id: 2,
      partyType: "CUSTOMER",
      entityName: "ABC EXPORTS PVT LTD",
      altNames: "ABC EXPORTS",
      refId: "ABC EXPORTS PVT LTD",
      includeAlias: "ABC EXPORTS",
    },
    "Approved",
  ),
  mkScreened(
    {
      id: 3,
      partyType: "SUPPLIER",
      entityName: "GLOBAL TRADERS LTD",
      altNames: "GLOBAL TRADERS",
      refId: "GLOBAL TRADERS LTD",
      includeAlias: "GLOBAL TRADERS",
    },
    "Approved",
  ),
  mkScreened(
    {
      id: 4,
      partyType: "AGENT",
      entityName: "SHADOW SHIPPING AGENCY",
      altNames: "SHADOW SHIPPING CO",
      refId: "SHADOW SHIPPING AGENCY",
      includeAlias: "",
    },
    "Rejected",
    [
      {
        candidate: "SHADOW SHIPPING CO",
        watch: "SHADOW SHIPPING CO",
        list: "UN Consolidated",
        level: "Exact",
      },
    ],
  ),
  party({
    id: 5,
    partyType: "CUSTOMER",
    entityName: "ACME INDUSTRIES",
    altNames: "ACME INDUSTRIES",
    refId: "ACME INDUSTRIES",
    includeAlias: "ACME INDUSTRIES",
    status: "Pending",
    screenedOn: "",
    screenedSig: "",
  }),
];

export const initialGstRecords = [
  {
    id: 1,
    pan: "AABCO4521K",
    partyName: "OM EXPORTS",
    accountsType: "Customer",
    panName: "OM EXPORTS PRIVATE LIMITED",
    businessType: "Private Limited",
    businessCategory: "Regular",
    otherCategory: "",
    approved: true,
    stateGst: [
      sRow(
        "Tamil Nadu",
        "AABCO4521K",
        "1",
        "Ramesh Kumar",
        "9840012345",
        "ramesh@omexports.in",
      ),
      sRow(
        "Delhi",
        "AABCO4521K",
        "2",
        "Anita Sharma",
        "9811122233",
        "anita@omexports.in",
      ),
    ],
    addresses: [
      aRow(
        "Tamil Nadu",
        "Chennai",
        "Chennai",
        "12 Anna Salai",
        "Teynampet",
        "Ramesh Kumar",
        "9840012345",
        "ramesh@omexports.in",
      ),
    ],
  },
  {
    id: 2,
    pan: "AAACG7788M",
    partyName: "GLOBAL TRADERS LTD",
    accountsType: "Supplier",
    panName: "GLOBAL TRADERS LIMITED",
    businessType: "Public Limited",
    businessCategory: "Regular",
    otherCategory: "",
    approved: true,
    stateGst: [
      sRow(
        "Karnataka",
        "AAACG7788M",
        "1",
        "Sarah Lim",
        "9900011122",
        "sarah@globaltraders.in",
      ),
    ],
    addresses: [
      aRow(
        "Karnataka",
        "Bengaluru",
        "Bengaluru",
        "45 MG Road",
        "",
        "Sarah Lim",
        "9900011122",
        "sarah@globaltraders.in",
      ),
    ],
  },
  {
    id: 3,
    pan: "AAFFA3310C",
    partyName: "ACME INDUSTRIES",
    accountsType: "Customer",
    panName: "ACME INDUSTRIES",
    businessType: "Partnership",
    businessCategory: "Composition",
    otherCategory: "",
    approved: false,
    stateGst: [
      sRow(
        "Karnataka",
        "AAFFA3310C",
        "1",
        "Priya Nair",
        "9886655443",
        "priya@acme.in",
      ),
    ],
    addresses: [
      aRow(
        "Karnataka",
        "Kalaburagi",
        "Kalaburagi",
        "7 Station Road",
        "",
        "Priya Nair",
        "9886655443",
        "priya@acme.in",
      ),
    ],
  },
];
