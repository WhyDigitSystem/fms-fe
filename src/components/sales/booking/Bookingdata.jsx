// Shared constants, master data, helpers and validation for the Booking screens.
// Replace the master data below with your API calls when you wire the backend.

export const uid = () => Math.random().toString(36).slice(2, 10);

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

export const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

export const fmtDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "-"
    : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

export const fmtSize = (bytes) => {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

export const CURRENT_USER = {
  id: "U04",
  name: "John Doe",
  role: "Booking Executive",
  branch: "SGP",
  authorizedBranches: ["SGP", "BLR"],
  canEditBookingDate: true,
};

// "Configurable" rules from the specification.
export const POLICY = {
  requireSalespersonOnSubmit: true,
  requireEtdOnSubmit: false,
  requireIncotermOnSubmit: true,
  requireFreightTermsOnSubmit: true,
  requireRatesOnSubmit: false,
  requireContactForDoorService: true,
  blockOnCreditHold: true,
};

export const AIR_VOLUMETRIC_DIVISOR = 6000; // cm3 per kg
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_EXT = ["pdf", "jpg", "jpeg", "png", "doc", "docx"];

/* ------------------------------------------------------------------ */
/* Master data                                                         */
/* ------------------------------------------------------------------ */

export const branches = [
  { value: "SGP", label: "Singapore (SGP)" },
  { value: "BLR", label: "Bengaluru (BLR)" },
  { value: "MAA", label: "Chennai (MAA)" },
  { value: "BOM", label: "Mumbai (BOM)" },
];

export const users = [
  { value: "U01", label: "Priya Nair" },
  { value: "U02", label: "Rahul Mehta" },
  { value: "U03", label: "Sarah Lim" },
  { value: "U04", label: "John Doe" },
];

export const customers = [
  {
    id: "CUST001",
    name: "ABC Trading Co.",
    active: true,
    branches: ["SGP", "BLR"],
    salesperson: "U02",
    paymentTerms: "Net 30",
    credit: "Approved",
  },
  {
    id: "CUST002",
    name: "Global Traders Pvt Ltd",
    active: true,
    branches: ["BLR", "SGP"],
    salesperson: "U03",
    paymentTerms: "Net 45",
    credit: "Warning",
  },
  {
    id: "CUST003",
    name: "Acme Industries",
    active: true,
    branches: ["BLR"],
    salesperson: "U01",
    paymentTerms: "Net 15",
    credit: "Approved",
  },
  {
    id: "CUST004",
    name: "Zenith Overseas",
    active: true,
    branches: ["SGP"],
    salesperson: "U02",
    paymentTerms: "Advance",
    credit: "On Hold",
  },
  {
    id: "CUST005",
    name: "Old Horizon Exports",
    active: false,
    branches: ["SGP", "BLR"],
    salesperson: "U01",
    paymentTerms: "Net 30",
    credit: "Approved",
  },
];

export const parties = [
  ...customers.filter((c) => c.active).map((c) => ({ id: c.id, name: c.name })),
  { id: "P101", name: "XYZ Logistics Ltd." },
  { id: "P102", name: "Pacific Consignees Inc." },
  { id: "P103", name: "Hamburg Import GmbH" },
  { id: "P104", name: "Mumbai Receivers LLP" },
];

export const addresses = [
  {
    id: "A01",
    partyId: "CUST001",
    label: "12 Tuas South Ave 4, Singapore 637610",
  },
  { id: "A02", partyId: "CUST001", label: "88 Pioneer Road, Singapore 628501" },
  {
    id: "A03",
    partyId: "CUST002",
    label: "Plot 14, Peenya Industrial Area, Bengaluru 560058",
  },
  {
    id: "A04",
    partyId: "CUST003",
    label: "Unit 7, Hosur Road Industrial Estate, Bengaluru 560068",
  },
  {
    id: "A05",
    partyId: "P101",
    label: "200 Harbor Blvd, Los Angeles, CA 90731",
  },
  {
    id: "A06",
    partyId: "P102",
    label: "1500 E Anaheim St, Wilmington, CA 90744",
  },
  { id: "A07", partyId: "P103", label: "Am Kaiserkai 10, 20457 Hamburg" },
  { id: "A08", partyId: "P104", label: "Andheri East MIDC, Mumbai 400093" },
];

export const carriers = [
  { id: "MAERSK", name: "Maersk Line", modes: ["Sea"], active: true },
  { id: "MSC", name: "MSC", modes: ["Sea"], active: true },
  { id: "CMACGM", name: "CMA CGM", modes: ["Sea"], active: true },
  { id: "HAPAG", name: "Hapag-Lloyd", modes: ["Sea"], active: true },
  {
    id: "OLDSEA",
    name: "Legacy Shipping (inactive)",
    modes: ["Sea"],
    active: false,
  },
  { id: "SQC", name: "Singapore Airlines Cargo", modes: ["Air"], active: true },
  { id: "LHC", name: "Lufthansa Cargo", modes: ["Air"], active: true },
  { id: "EKS", name: "Emirates SkyCargo", modes: ["Air"], active: true },
  { id: "VRL", name: "VRL Logistics", modes: ["Road"], active: true },
  { id: "TCI", name: "TCI Freight", modes: ["Road"], active: true },
];

// Typed location entities. role: gateway (port / airport / terminal),
// inland (depot, warehouse, door) or both.
export const locations = [
  {
    code: "SGSIN",
    name: "Singapore",
    type: "Seaport",
    modes: ["Sea"],
    role: "gateway",
  },
  {
    code: "USLAX",
    name: "Los Angeles",
    type: "Seaport",
    modes: ["Sea"],
    role: "gateway",
  },
  {
    code: "INMAA",
    name: "Chennai Port",
    type: "Seaport",
    modes: ["Sea"],
    role: "gateway",
  },
  {
    code: "INNSA",
    name: "Jawaharlal Nehru Port (JNPT)",
    type: "Seaport",
    modes: ["Sea"],
    role: "gateway",
  },
  {
    code: "DEHAM",
    name: "Hamburg",
    type: "Seaport",
    modes: ["Sea"],
    role: "gateway",
  },
  {
    code: "CNSHA",
    name: "Shanghai",
    type: "Seaport",
    modes: ["Sea"],
    role: "gateway",
  },
  {
    code: "INBLR-ICD",
    name: "Bengaluru ICD",
    type: "Inland Depot",
    modes: ["Sea", "Road"],
    role: "both",
  },
  {
    code: "SIN",
    name: "Singapore Changi",
    type: "Airport",
    modes: ["Air"],
    role: "gateway",
  },
  {
    code: "LAX",
    name: "Los Angeles Intl",
    type: "Airport",
    modes: ["Air"],
    role: "gateway",
  },
  {
    code: "BLR",
    name: "Kempegowda Intl",
    type: "Airport",
    modes: ["Air"],
    role: "gateway",
  },
  {
    code: "FRA",
    name: "Frankfurt",
    type: "Airport",
    modes: ["Air"],
    role: "gateway",
  },
  {
    code: "HAM",
    name: "Hamburg Airport",
    type: "Airport",
    modes: ["Air"],
    role: "gateway",
  },
  {
    code: "BOM",
    name: "Chhatrapati Shivaji Maharaj Intl",
    type: "Airport",
    modes: ["Air"],
    role: "gateway",
  },
  {
    code: "MAA",
    name: "Chennai Intl",
    type: "Airport",
    modes: ["Air"],
    role: "gateway",
  },
  {
    code: "BLR-RT",
    name: "Bengaluru Road Terminal",
    type: "Road Terminal",
    modes: ["Road"],
    role: "gateway",
  },
  {
    code: "BOM-RT",
    name: "Mumbai Road Freight Terminal",
    type: "Road Terminal",
    modes: ["Road"],
    role: "gateway",
  },
  {
    code: "MAA-RT",
    name: "Chennai Freight Terminal",
    type: "Road Terminal",
    modes: ["Road"],
    role: "gateway",
  },
  {
    code: "DEL-RT",
    name: "Delhi Road Terminal",
    type: "Road Terminal",
    modes: ["Road"],
    role: "gateway",
  },
  {
    code: "SG-WH01",
    name: "Tuas Warehouse, Singapore",
    type: "Warehouse",
    modes: ["Sea", "Air", "Road"],
    role: "inland",
  },
  {
    code: "US-LADC",
    name: "LA Distribution Center",
    type: "Warehouse",
    modes: ["Sea", "Air", "Road"],
    role: "inland",
  },
  {
    code: "DE-HAMWH",
    name: "Hamburg Warehouse",
    type: "Warehouse",
    modes: ["Sea", "Air", "Road"],
    role: "inland",
  },
  {
    code: "IN-BLRWH",
    name: "Peenya Warehouse, Bengaluru",
    type: "Warehouse",
    modes: ["Sea", "Air", "Road"],
    role: "inland",
  },
  {
    code: "IN-BOMWH",
    name: "Andheri Warehouse, Mumbai",
    type: "Warehouse",
    modes: ["Sea", "Air", "Road"],
    role: "inland",
  },
];

export const locationByCode = (code) => locations.find((l) => l.code === code);

export const locationLabel = (code) => {
  const l = locationByCode(code);
  return l ? `${l.name} (${l.code})` : code || "";
};

export const SERVICES = {
  Sea: [
    { value: "FCL", equipment: true, loadType: "FCL" },
    { value: "LCL", equipment: true, loadType: "LCL", needsVolume: true },
    { value: "Reefer FCL", equipment: true, loadType: "FCL", reefer: true },
    { value: "Break Bulk" },
  ],
  Air: [
    { value: "Air Freight - General", needsVolume: true },
    { value: "Air Express", needsVolume: true },
    { value: "Air Charter", needsVolume: true },
  ],
  Road: [
    { value: "FTL (Full Truck Load)", door: true },
    { value: "LTL (Part Load)", door: true },
    { value: "Container Haulage", equipment: true, door: true },
  ],
};

export const getService = (mode, value) =>
  (SERVICES[mode] || []).find((s) => s.value === value);

export const BOOKING_TYPES = ["Export", "Import", "Cross-trade"];

export const INCOTERMS = [
  { value: "EXW" },
  { value: "FCA" },
  { value: "FAS", seaOnly: true },
  { value: "FOB", seaOnly: true },
  { value: "CFR", seaOnly: true },
  { value: "CIF", seaOnly: true },
  { value: "CPT" },
  { value: "CIP" },
  { value: "DAP" },
  { value: "DPU" },
  { value: "DDP" },
];

export const PACKAGE_TYPES = [
  "Carton",
  "Pallet",
  "Crate",
  "Drum",
  "Bag",
  "Bundle",
  "Roll",
  "Case",
  "Piece",
];
export const WEIGHT_UOMS = ["kg", "lb"];
export const VOLUME_UOMS = ["CBM", "CFT"];
export const DIM_UOMS = ["cm", "in"];
export const HANDLING = [
  "Fragile",
  "Temperature Controlled",
  "Oversized",
  "Keep Upright",
  "Do Not Stack",
  "Hazmat Label",
];
export const CONTAINER_TYPES = [
  "20ft Standard",
  "40ft Standard",
  "40ft High Cube",
  "45ft High Cube",
  "20ft Reefer",
  "40ft Reefer HC",
  "20ft Open Top",
  "40ft Flat Rack",
];
export const EQUIPMENT_PREFS = [
  "Standard",
  "Special Equipment",
  "Open Top",
  "Flat Rack",
];
export const CONTAINER_ALLOCATIONS = [
  "Carrier-provided",
  "Customer-provided (SOC)",
  "Pending",
];
export const FREIGHT_TERMS = ["Prepaid", "Collect", "Third Party"];
export const PAYMENT_TERMS = [
  "Advance",
  "Net 15",
  "Net 30",
  "Net 45",
  "Net 60",
];
export const CURRENCIES = ["USD", "SGD", "INR", "EUR"];
export const DOC_CATEGORIES = [
  "Customer PO / Reference",
  "Packing List",
  "Commercial Invoice",
  "DG Documents",
  "Other",
];

export const quotations = [
  { id: "QT/26-27/0012", customerId: "CUST001", currency: "USD", sell: 2500 },
  { id: "QT/26-27/0019", customerId: "CUST001", currency: "USD", sell: 3100 },
  { id: "QT/26-27/0021", customerId: "CUST002", currency: "EUR", sell: 1850 },
  { id: "QT/26-27/0025", customerId: "CUST003", currency: "INR", sell: 64000 },
];

/* ------------------------------------------------------------------ */
/* Status workflow                                                     */
/* ------------------------------------------------------------------ */

export const STATUSES = [
  "Draft",
  "Submitted",
  "Pending Carrier Confirmation",
  "Carrier Confirmed",
  "Amendment Pending",
  "On Hold",
  "Rejected",
  "Cancelled",
];

export const EDITABLE_STATUSES = ["Draft", "Amendment Pending"];

export const WORKFLOW_STEPS = [
  { status: "Draft", label: "Draft", sub: "Current status / editable" },
  { status: "Submitted", label: "Submitted", sub: "Pending approval" },
  {
    status: "Pending Carrier Confirmation",
    label: "Pending Carrier Confirmation",
    sub: "Carrier reservation requested",
  },
  {
    status: "Carrier Confirmed",
    label: "Carrier Confirmed",
    sub: "Carrier reference and schedule recorded",
  },
];

export const statusStyles = {
  Draft:
    "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-gray-700/50 dark:text-gray-300 dark:ring-gray-500/30",
  Submitted:
    "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20",
  "Pending Carrier Confirmation":
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
  "Carrier Confirmed":
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  "Amendment Pending":
    "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20",
  "On Hold":
    "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-400/20",
  Rejected:
    "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20",
  Cancelled:
    "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20",
};

export const statusDots = {
  Draft: "bg-slate-400",
  Submitted: "bg-blue-500",
  "Pending Carrier Confirmation": "bg-amber-500",
  "Carrier Confirmed": "bg-emerald-500",
  "Amendment Pending": "bg-violet-500",
  "On Hold": "bg-orange-500",
  Rejected: "bg-red-500",
  Cancelled: "bg-red-500",
};

/* ------------------------------------------------------------------ */
/* Form shape                                                          */
/* ------------------------------------------------------------------ */

export const emptyLine = () => ({
  id: uid(),
  commodity: "",
  pkgType: "",
  qty: "",
  weight: "",
  weightUom: "kg",
  volume: "",
  volumeUom: "CBM",
  length: "",
  width: "",
  height: "",
  dimUom: "cm",
  hsCode: "",
  dg: "No",
  reefer: "No",
  handling: [],
  remarks: "",
});

export const emptyEquipment = () => ({
  loadType: "",
  containerType: "",
  containerQty: "",
  reeferTemp: "",
  tempUnit: "°C",
  equipPref: "Standard",
  containerAlloc: "Pending",
});

export const emptyForm = () => ({
  id: 0,
  bookingNo: "",
  bookingDate: today(),
  branch: CURRENT_USER.branch,
  status: "Draft",
  bookingType: "Export",
  mode: "Sea",
  serviceType: "",
  customer: "",
  customerRef: "",
  salesperson: CURRENT_USER.id,
  opsOwner: "",
  pickupRequired: false,
  deliveryRequired: false,
  placeOfReceipt: "",
  origin: "",
  destination: "",
  placeOfDelivery: "",
  etd: "",
  eta: "",
  carrier: "",
  routingPref: "",
  incoterm: "",
  incotermPlace: "",
  shipper: "",
  consignee: "",
  notifyParty: "SAME",
  billingCustomer: "",
  pickupAddress: "",
  deliveryAddress: "",
  contactPerson: "",
  email: "",
  phone: "",
  cargoLines: [emptyLine()],
  equipment: emptyEquipment(),
  commercial: {
    freightTerms: "",
    quotationRef: "",
    sellCurrency: "USD",
    sellRate: "",
    buyCurrency: "USD",
    buyRate: "",
    currency: "",
    paymentTerms: "",
    remarks: "",
  },
  docs: {
    files: [],
    pickupInstructions: "",
    deliveryInstructions: "",
    internalRemarks: "",
  },
  carrierConfirmation: null,
  audit: [],
});

export const hydrate = (d = {}) => {
  const b = emptyForm();
  return {
    ...b,
    ...d,
    equipment: { ...b.equipment, ...(d.equipment || {}) },
    commercial: { ...b.commercial, ...(d.commercial || {}) },
    docs: {
      ...b.docs,
      ...(d.docs || {}),
      files: [...(d.docs?.files || [])],
    },
    cargoLines: d.cargoLines?.length
      ? d.cargoLines.map((l) => ({
          ...emptyLine(),
          ...l,
          handling: [...(l.handling || [])],
        }))
      : [emptyLine()],
    audit: [...(d.audit || [])],
  };
};

// Stable string used for unsaved-change detection (File objects are ignored).
export const snapshot = (f) =>
  JSON.stringify(f, (key, value) => (key === "file" ? undefined : value));

/* ------------------------------------------------------------------ */
/* Calculations                                                        */
/* ------------------------------------------------------------------ */

export const toKg = (v, uom) => num(v) * (uom === "lb" ? 0.45359237 : 1);
export const toM3 = (v, uom) => num(v) * (uom === "CFT" ? 0.0283168466 : 1);

// Volume entered by the user, otherwise derived from L x W x H x qty.
export const effectiveVolume = (l) => {
  const v = toM3(l.volume, l.volumeUom);
  if (v > 0) return v;
  const f = l.dimUom === "in" ? 2.54 : 1;
  const q = num(l.qty) || 1;
  return (num(l.length) * num(l.width) * num(l.height) * f ** 3 * q) / 1e6;
};

export const computeTotals = (lines = []) => {
  let packages = 0;
  let weightKg = 0;
  let volumeM3 = 0;
  const byType = {};

  lines.forEach((l) => {
    const q = Math.max(0, num(l.qty));
    packages += q;
    if (q > 0)
      byType[l.pkgType || "Unspecified"] =
        (byType[l.pkgType || "Unspecified"] || 0) + q;
    weightKg += toKg(l.weight, l.weightUom);
    volumeM3 += effectiveVolume(l);
  });

  const volumetricKg = (volumeM3 * 1e6) / AIR_VOLUMETRIC_DIVISOR;
  const types = Object.entries(byType);

  return {
    packages,
    byType: types,
    // Different package types are shown as a breakdown, never one misleading total.
    packageText: types.length
      ? types.map(([t, q]) => `${q} ${t}`).join(", ")
      : "-",
    weightKg,
    volumeM3,
    volumetricKg,
    chargeableKg: Math.max(weightKg, volumetricKg),
  };
};

export const fmtNum = (n, d = 2) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: d,
  });

/* ------------------------------------------------------------------ */
/* Validation (different rules for Save Draft and Submit)              */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9][0-9\s\-()]{5,19}$/;
const badNum = (v) =>
  v !== "" && v != null && (!Number.isFinite(Number(v)) || Number(v) < 0);
const hsOk = (v) => {
  const d = String(v).replace(/[.\s]/g, "");
  return /^\d+$/.test(d) && [4, 6, 8, 10].includes(d.length);
};

export const validateBooking = (f, action = "draft") => {
  const list = [];
  const add = (key, message, section) => list.push({ key, message, section });
  const submit = action === "submit";

  const svc = getService(f.mode, f.serviceType);
  const cust = customers.find((c) => c.id === f.customer);
  const hasReefer =
    f.cargoLines.some((l) => l.reefer === "Yes") || !!svc?.reefer;
  const hasDG = f.cargoLines.some((l) => l.dg === "Yes");
  const door = f.pickupRequired || f.deliveryRequired;

  /* ---- Always (Save Draft and Submit) ---- */
  if (!f.bookingDate) add("bookingDate", "Booking date is required", "details");
  if (!f.branch) add("branch", "Branch is required", "details");
  if (!f.bookingType) add("bookingType", "Booking type is required", "details");
  if (!f.mode) add("mode", "Transport mode is required", "details");
  if (!f.customer) add("customer", "Customer is required", "details");
  else if (cust && (!cust.active || !cust.branches.includes(f.branch)))
    add(
      "customer",
      "Customer is inactive or not authorised for this branch",
      "details",
    );

  if (f.etd && f.eta && f.eta < f.etd)
    add("eta", "ETA must not be earlier than ETD", "routing");
  if (f.email && !EMAIL_RE.test(f.email.trim()))
    add("email", "Enter a valid email address", "parties");
  if (f.phone && !PHONE_RE.test(f.phone.trim()))
    add("phone", "Enter a valid phone number", "parties");

  if (
    badNum(f.equipment.containerQty) ||
    (f.equipment.containerQty !== "" && num(f.equipment.containerQty) <= 0)
  )
    add(
      "equipment.containerQty",
      "Container quantity must be greater than zero",
      "equipment",
    );
  if (
    f.equipment.reeferTemp !== "" &&
    !Number.isFinite(Number(f.equipment.reeferTemp))
  )
    add("equipment.reeferTemp", "Enter a valid temperature", "equipment");
  if (badNum(f.commercial.sellRate))
    add(
      "commercial.sellRate",
      "Sell rate must be a valid amount",
      "commercial",
    );
  if (badNum(f.commercial.buyRate))
    add("commercial.buyRate", "Buy rate must be a valid amount", "commercial");
  if (
    (f.commercial.sellRate !== "" || f.commercial.buyRate !== "") &&
    !f.commercial.currency
  )
    add(
      "commercial.currency",
      "Currency is required when a rate is entered",
      "commercial",
    );

  f.cargoLines.forEach((l, i) => {
    const n = i + 1;
    const k = (field) => `line.${l.id}.${field}`;
    if (l.commodity && !l.commodity.trim())
      add(
        k("commodity"),
        `Cargo line ${n}: commodity cannot be blank`,
        "cargo",
      );
    ["qty", "weight", "volume", "length", "width", "height"].forEach(
      (field) => {
        if (badNum(l[field]))
          add(
            k(field),
            `Cargo line ${n}: enter a valid ${field === "qty" ? "quantity" : field}`,
            "cargo",
          );
      },
    );
    if (l.qty !== "" && !badNum(l.qty) && !Number.isInteger(Number(l.qty)))
      add(
        k("qty"),
        `Cargo line ${n}: quantity must be a whole number`,
        "cargo",
      );
    if (l.hsCode && !hsOk(l.hsCode))
      add(
        k("hsCode"),
        `Cargo line ${n}: HS code must be 4, 6, 8 or 10 digits`,
        "cargo",
      );
  });

  if (!submit) return finish(list);

  /* ---- Submit Booking (full validation) ---- */
  if (!f.serviceType) add("serviceType", "Service type is required", "details");
  if (POLICY.requireSalespersonOnSubmit && !f.salesperson)
    add("salesperson", "Salesperson is required", "details");

  const origin = locationByCode(f.origin);
  const dest = locationByCode(f.destination);
  if (!f.origin) add("origin", "Origin is required", "routing");
  else if (!origin?.modes.includes(f.mode))
    add("origin", `Origin must be valid for ${f.mode} freight`, "routing");
  if (!f.destination) add("destination", "Destination is required", "routing");
  else if (!dest?.modes.includes(f.mode))
    add(
      "destination",
      `Destination must be valid for ${f.mode} freight`,
      "routing",
    );
  if (f.origin && f.origin === f.destination)
    add("destination", "Origin and destination cannot be the same", "routing");
  if (f.pickupRequired && !f.placeOfReceipt)
    add("placeOfReceipt", "Place of receipt is required for pickup", "routing");
  if (f.deliveryRequired && !f.placeOfDelivery)
    add(
      "placeOfDelivery",
      "Place of delivery is required for delivery",
      "routing",
    );
  if (POLICY.requireEtdOnSubmit && !f.etd)
    add("etd", "Requested ETD is required", "routing");
  if (POLICY.requireIncotermOnSubmit && !f.incoterm)
    add("incoterm", "Incoterm is required", "routing");
  if (f.incoterm && !f.incotermPlace.trim())
    add("incotermPlace", "Named place is required for the Incoterm", "routing");

  if (!f.shipper) add("shipper", "Shipper is required", "parties");
  if (!f.consignee) add("consignee", "Consignee is required", "parties");
  if (!f.billingCustomer)
    add("billingCustomer", "Billing customer is required", "parties");
  if (f.pickupRequired && !f.pickupAddress)
    add("pickupAddress", "Pickup address is required", "parties");
  if (f.deliveryRequired && !f.deliveryAddress)
    add("deliveryAddress", "Delivery address is required", "parties");
  if (POLICY.requireContactForDoorService && door && !f.contactPerson.trim())
    add(
      "contactPerson",
      "Contact person is required for pickup / delivery",
      "parties",
    );

  if (!f.cargoLines.length)
    add("cargoLines", "Add at least one cargo line", "cargo");
  f.cargoLines.forEach((l, i) => {
    const n = i + 1;
    const k = (field) => `line.${l.id}.${field}`;
    if (!l.commodity.trim())
      add(
        k("commodity"),
        `Cargo line ${n}: commodity description is required`,
        "cargo",
      );
    if (!l.pkgType)
      add(k("pkgType"), `Cargo line ${n}: package type is required`, "cargo");
    if (!(num(l.qty) > 0))
      add(
        k("qty"),
        `Cargo line ${n}: package quantity must be greater than zero`,
        "cargo",
      );
    if (!(num(l.weight) > 0))
      add(
        k("weight"),
        `Cargo line ${n}: gross weight must be greater than zero`,
        "cargo",
      );
    if (svc?.needsVolume && !(effectiveVolume(l) > 0))
      add(
        k("volume"),
        `Cargo line ${n}: volume (or dimensions) is required for ${f.serviceType}`,
        "cargo",
      );
  });

  if (svc?.equipment) {
    if (!f.equipment.loadType)
      add("equipment.loadType", "Load type is required", "equipment");
    if (f.equipment.loadType === "FCL" || svc.loadType === "FCL") {
      if (!f.equipment.containerType)
        add(
          "equipment.containerType",
          "Container type is required for FCL",
          "equipment",
        );
      if (!(num(f.equipment.containerQty) > 0))
        add(
          "equipment.containerQty",
          "Container quantity is required for FCL",
          "equipment",
        );
    }
  }
  if (hasReefer && f.equipment.reeferTemp === "")
    add(
      "equipment.reeferTemp",
      "Reefer temperature is required for reefer cargo",
      "equipment",
    );

  if (POLICY.requireFreightTermsOnSubmit && !f.commercial.freightTerms)
    add(
      "commercial.freightTerms",
      "Freight payment terms are required",
      "commercial",
    );
  if (POLICY.requireRatesOnSubmit && !(num(f.commercial.sellRate) > 0))
    add("commercial.sellRate", "Sell rate is required", "commercial");
  if (POLICY.blockOnCreditHold && cust?.credit === "On Hold")
    add(
      "credit",
      "Customer credit is On Hold - submission is blocked",
      "commercial",
    );

  if (hasDG && !f.docs.files.some((d) => d.category === "DG Documents"))
    add("docs.dg", "Upload DG documents for dangerous goods", "documents");

  return finish(list);
};

const finish = (list) => ({
  list,
  map: Object.fromEntries(list.map((e) => [e.key, e.message])),
});

/* ------------------------------------------------------------------ */
/* Sample data                                                         */
/* ------------------------------------------------------------------ */

const audit = (
  action,
  note = "",
  at = "2026-10-12T10:30:00.000Z",
  by = "John Doe",
) => ({
  id: uid(),
  at,
  by,
  action,
  note,
});

const line = (o) => ({ ...emptyLine(), ...o });

const sample = (o) => hydrate({ ...o });

export const initialBookings = [
  sample({
    id: 1,
    bookingNo: "BKG/26-27/0001",
    bookingDate: "2026-10-12",
    branch: "SGP",
    status: "Pending Carrier Confirmation",
    bookingType: "Export",
    mode: "Sea",
    serviceType: "FCL",
    customer: "CUST001",
    customerRef: "PO12345",
    salesperson: "U02",
    origin: "SGSIN",
    destination: "USLAX",
    etd: "2026-10-25",
    eta: "2026-11-10",
    carrier: "MAERSK",
    incoterm: "FOB",
    incotermPlace: "Singapore",
    shipper: "CUST001",
    consignee: "P102",
    notifyParty: "SAME",
    billingCustomer: "CUST001",
    cargoLines: [
      line({
        commodity: "Electronics (TV)",
        pkgType: "Carton",
        qty: "100",
        weight: "1200",
        volume: "6.5",
        hsCode: "8528",
      }),
    ],
    equipment: {
      loadType: "FCL",
      containerType: "40ft Standard",
      containerQty: "2",
      equipPref: "Standard",
      containerAlloc: "Carrier-provided",
    },
    commercial: {
      freightTerms: "Prepaid",
      quotationRef: "QT/26-27/0012",
      sellCurrency: "USD",
      sellRate: "2500",
      buyCurrency: "USD",
      buyRate: "1800",
      currency: "USD",
      paymentTerms: "Net 30",
    },
    audit: [
      audit("Draft saved", "", "2026-10-12T10:30:00.000Z"),
      audit("Submitted for approval", "", "2026-10-12T11:05:00.000Z"),
      audit("Carrier confirmation requested", "", "2026-10-12T14:20:00.000Z"),
    ],
  }),
  sample({
    id: 2,
    bookingNo: "BKG/26-27/0002",
    bookingDate: "2026-10-11",
    branch: "BLR",
    status: "Draft",
    bookingType: "Import",
    mode: "Air",
    serviceType: "Air Freight - General",
    customer: "CUST002",
    salesperson: "U03",
    origin: "FRA",
    destination: "BLR",
    etd: "2026-10-20",
    cargoLines: [
      line({
        commodity: "Industrial Machinery Parts",
        pkgType: "Crate",
        qty: "5",
        weight: "450",
        length: "100",
        width: "80",
        height: "60",
      }),
    ],
    audit: [audit("Draft saved", "", "2026-10-11T09:10:00.000Z")],
  }),
  sample({
    id: 3,
    bookingNo: "BKG/26-27/0003",
    bookingDate: "2026-10-10",
    branch: "BLR",
    status: "Carrier Confirmed",
    bookingType: "Export",
    mode: "Road",
    serviceType: "FTL (Full Truck Load)",
    customer: "CUST003",
    salesperson: "U01",
    pickupRequired: true,
    deliveryRequired: true,
    placeOfReceipt: "IN-BLRWH",
    placeOfDelivery: "IN-BOMWH",
    origin: "BLR-RT",
    destination: "BOM-RT",
    etd: "2026-10-15",
    eta: "2026-10-17",
    carrier: "VRL",
    incoterm: "EXW",
    incotermPlace: "Bengaluru",
    shipper: "CUST003",
    consignee: "P104",
    billingCustomer: "CUST003",
    pickupAddress: "A04",
    deliveryAddress: "A08",
    contactPerson: "Anil Kumar",
    email: "anil@acme.in",
    phone: "+91 98765 43210",
    cargoLines: [
      line({
        commodity: "Automotive Components",
        pkgType: "Pallet",
        qty: "24",
        weight: "1200",
        volume: "14",
      }),
    ],
    commercial: {
      freightTerms: "Prepaid",
      currency: "INR",
      sellCurrency: "INR",
      sellRate: "64000",
      buyCurrency: "INR",
      buyRate: "52000",
      paymentTerms: "Net 15",
    },
    carrierConfirmation: {
      carrier: "VRL",
      reference: "VRL-88231",
      etd: "2026-10-15",
      eta: "2026-10-17",
      evidence: "vrl-confirmation.pdf",
      at: "2026-10-11T12:00:00.000Z",
      by: "Priya Nair",
    },
    audit: [
      audit("Draft saved", "", "2026-10-10T08:45:00.000Z"),
      audit("Submitted for approval", "", "2026-10-10T09:30:00.000Z"),
      audit("Carrier confirmation requested", "", "2026-10-10T15:00:00.000Z"),
      audit(
        "Carrier confirmed",
        "Reference VRL-88231",
        "2026-10-11T12:00:00.000Z",
        "Priya Nair",
      ),
    ],
  }),
  sample({
    id: 4,
    bookingNo: "BKG/26-27/0004",
    bookingDate: "2026-10-09",
    branch: "SGP",
    status: "On Hold",
    bookingType: "Import",
    mode: "Sea",
    serviceType: "LCL",
    customer: "CUST004",
    salesperson: "U02",
    origin: "DEHAM",
    destination: "SGSIN",
    etd: "2026-10-30",
    shipper: "P103",
    consignee: "CUST004",
    billingCustomer: "CUST004",
    incoterm: "CIF",
    incotermPlace: "Singapore",
    cargoLines: [
      line({
        commodity: "Industrial Valves",
        pkgType: "Crate",
        qty: "12",
        weight: "3400",
        volume: "9.8",
      }),
    ],
    equipment: { loadType: "LCL" },
    commercial: {
      freightTerms: "Collect",
      currency: "EUR",
      paymentTerms: "Advance",
    },
    audit: [
      audit("Draft saved", "", "2026-10-09T10:00:00.000Z"),
      audit("Submitted for approval", "", "2026-10-09T10:20:00.000Z"),
      audit(
        "Booking put on hold",
        "Customer credit review pending",
        "2026-10-09T13:00:00.000Z",
        "Sarah Lim",
      ),
    ],
  }),
];
