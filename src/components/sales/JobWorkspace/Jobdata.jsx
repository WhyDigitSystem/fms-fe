// Shared constants, master data, helpers and sample data for the Job screens.
// Replace the sample data below with your API calls when you wire the backend.

export const uid = () => Math.random().toString(36).slice(2, 10);

export const fmtNum = (n, d = 2) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: d,
  });

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

export const CURRENT_USER = {
  id: "U01",
  name: "Senthil Kumar",
  role: "Operations Executive",
  branch: "DEL",
};

export const JOB_MODES = ["Sea", "Air", "Road"];
export const JOB_TYPES = ["Export", "Import"];
export const JOB_STATUSES = ["In Progress", "On Hold", "Closed"];

export const jobStatusStyles = {
  "In Progress":
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  "On Hold":
    "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-400/20",
  Closed:
    "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-gray-700/50 dark:text-gray-300 dark:ring-gray-500/30",
};

export const jobStatusDots = {
  "In Progress": "bg-emerald-500",
  "On Hold": "bg-orange-500",
  Closed: "bg-slate-400",
};

/* ------------------------------------------------------------------ */
/* Milestones                                                          */
/* ------------------------------------------------------------------ */

export const STEP_LABELS = [
  "Booking Received",
  "Job Opened",
  "Shipping Instructions",
  "Customs",
  "Cargo Received",
  "SI Submitted",
  "HBL/MBL Issued",
  "Vessel Departed",
  "Pre-alert",
  "Arrival",
  "Delivery",
  "Job Closed",
];

// stepIndex = index of the current step. Everything before it is done.
export const buildSteps = (job) =>
  STEP_LABELS.map((label, i) => ({
    label,
    date: job.stepDates?.[i] || "",
    state:
      i < job.stepIndex ? "done" : i === job.stepIndex ? "current" : "pending",
  }));

/* ------------------------------------------------------------------ */
/* Info sections (icons are attached in the screen)                    */
/* ------------------------------------------------------------------ */

export const buildInfoSections = (j) => [
  {
    id: "shipment",
    title: "1. Shipment & Parties",
    columns: [
      [
        ["Shipper", j.shipper || "-"],
        ["Consignee", j.consignee || "-"],
        ["Notify Party", j.notifyParty || "-"],
      ],
      [
        ["Customer Reference", j.customerRef || "-"],
        ["Sales Person", j.salesPerson || "-"],
        ["Agent", j.agent || "-"],
      ],
    ],
  },
  {
    id: "routing",
    title: "2. Routing & Schedule",
    columns: [
      [
        ["Origin", j.origin || "-"],
        ["POL", j.pol || "-"],
      ],
      [
        ["Destination", j.destination || "-"],
        ["POD", j.pod || "-"],
      ],
      [
        ["ETD", j.etd || "-", "date"],
        ["ETA", j.eta || "-", "date"],
      ],
    ],
  },
  {
    id: "cargo",
    title: "3. Cargo & Containers",
    columns: [
      [
        ["Commodity", j.commodity || "-"],
        ["Packages", j.packages || "-"],
      ],
      [
        [
          "Gross Weight",
          j.grossWeight ? `${fmtNum(j.grossWeight, 3)} KG` : "-",
        ],
        ["Volume", j.volume ? `${fmtNum(j.volume, 3)} CBM` : "-"],
      ],
      [["Containers", j.containers || "-", "container"]],
    ],
  },
  {
    id: "commercial",
    title: "4. Commercial & References",
    columns: [
      [
        ["Freight Term", j.freightTerm || "-"],
        ["Payment Term", j.paymentTerm || "-"],
      ],
      [
        ["Quotation No.", j.quotationNo || "-"],
        ["Invoice Currency", j.currency || "-"],
      ],
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Documents, activity, tasks                                          */
/* ------------------------------------------------------------------ */

export const DOC_STATUSES = ["Generated", "Ready", "Pending"];

const doc = (name, status) => ({ id: uid(), name, status });

export const defaultDocuments = () => [
  doc("Shipping Instructions", "Generated"),
  doc("House Bill of Lading (HBL)", "Generated"),
  doc("Master Bill of Lading (MBL)", "Generated"),
  doc("Manifest", "Ready"),
  doc("Pre-alert (for Import)", "Pending"),
  doc("CAN (for Import)", "Pending"),
  doc("Arrival Notice", "Pending"),
  doc("Delivery Order (DO)", "Pending"),
  doc("Proof of Delivery (POD)", "Pending"),
];

export const defaultActivities = () => [
  {
    id: uid(),
    at: "06-Nov-2026 10:45",
    by: "Senthil Kumar",
    text: "Shipping Instructions uploaded.",
    attachment: true,
    tone: "done",
  },
  {
    id: uid(),
    at: "05-Nov-2026 16:20",
    by: "System",
    text: "Job opened successfully. Job No. DEL/EXP/SEA/2026/00125",
    tone: "current",
  },
  {
    id: uid(),
    at: "05-Nov-2026 15:50",
    by: "Ramesh Kumar",
    text: "Booking confirmed by customer.",
    tone: "pending",
  },
];

export const defaultTasks = () => [
  { id: uid(), title: "Submit Shipping Instructions", due: "06-Nov-2026" },
  { id: uid(), title: "Confirm Cargo Receipt", due: "07-Nov-2026" },
];

/* ------------------------------------------------------------------ */
/* Sample data                                                         */
/* ------------------------------------------------------------------ */

const job = (o) => ({
  documents: defaultDocuments(),
  activities: defaultActivities(),
  tasks: defaultTasks(),
  ...o,
});

export const initialJobs = [
  job({
    id: 1,
    jobNo: "DEL/EXP/SEA/2026/00125",
    jobDate: "05-Nov-2026",
    mode: "Sea",
    modeLabel: "Sea Freight",
    type: "Export",
    customer: "ABC Exports Pvt Ltd",
    branch: "DEL – Delhi",
    status: "In Progress",
    stepIndex: 2,
    stepDates: ["05-Nov-2026", "05-Nov-2026", "06-Nov-2026"],
    shipper: "Global Traders Ltd.",
    consignee: "XYZ GmbH, Germany",
    notifyParty: "ABC Logistics GmbH",
    customerRef: "CUST-REF-2026-118",
    salesPerson: "Ramesh Kumar",
    agent: "",
    origin: "Chennai (MAA)",
    pol: "MAA",
    destination: "Hamburg (HAM)",
    pod: "HAM",
    etd: "10-Nov-2026",
    eta: "25-Nov-2026",
    commodity: "Engineering Goods",
    packages: "25",
    grossWeight: 1250,
    volume: 5.5,
    containers: "1 x 40' HC",
    freightTerm: "CIF",
    paymentTerm: "TT 30 Days",
    quotationNo: "QT-2026-045",
    currency: "USD",
  }),
  job({
    id: 2,
    jobNo: "BLR/IMP/AIR/2026/00088",
    jobDate: "03-Nov-2026",
    mode: "Air",
    modeLabel: "Air Freight",
    type: "Import",
    customer: "Global Traders Pvt Ltd",
    branch: "BLR – Bengaluru",
    status: "In Progress",
    stepIndex: 4,
    stepDates: ["03-Nov-2026", "03-Nov-2026", "04-Nov-2026", "05-Nov-2026"],
    shipper: "Frankfurt Machinery GmbH",
    consignee: "Global Traders Pvt Ltd",
    notifyParty: "Global Traders Pvt Ltd",
    customerRef: "PO-77812",
    salesPerson: "Sarah Lim",
    agent: "FRA Cargo Agents",
    origin: "Frankfurt (FRA)",
    pol: "FRA",
    destination: "Bengaluru (BLR)",
    pod: "BLR",
    etd: "08-Nov-2026",
    eta: "10-Nov-2026",
    commodity: "Industrial Machinery Parts",
    packages: "5",
    grossWeight: 450,
    volume: 2.4,
    containers: "-",
    freightTerm: "EXW",
    paymentTerm: "Net 45",
    quotationNo: "QT-2026-039",
    currency: "EUR",
  }),
  job({
    id: 3,
    jobNo: "BLR/EXP/ROD/2026/00041",
    jobDate: "01-Nov-2026",
    mode: "Road",
    modeLabel: "Road Transport",
    type: "Export",
    customer: "Acme Industries",
    branch: "BLR – Bengaluru",
    status: "Closed",
    stepIndex: 11,
    stepDates: ["01-Nov-2026", "01-Nov-2026", "02-Nov-2026"],
    shipper: "Acme Industries",
    consignee: "Mumbai Receivers LLP",
    notifyParty: "Mumbai Receivers LLP",
    customerRef: "ACM-2026-310",
    salesPerson: "Priya Nair",
    agent: "",
    origin: "Bengaluru (BLR-RT)",
    pol: "BLR-RT",
    destination: "Mumbai (BOM-RT)",
    pod: "BOM-RT",
    etd: "04-Nov-2026",
    eta: "06-Nov-2026",
    commodity: "Automotive Components",
    packages: "24",
    grossWeight: 1200,
    volume: 14,
    containers: "-",
    freightTerm: "Prepaid",
    paymentTerm: "Net 15",
    quotationNo: "QT-2026-031",
    currency: "INR",
  }),
  job({
    id: 4,
    jobNo: "SGP/IMP/SEA/2026/00019",
    jobDate: "30-Oct-2026",
    mode: "Sea",
    modeLabel: "Sea Freight",
    type: "Import",
    customer: "Zenith Overseas",
    branch: "SGP – Singapore",
    status: "On Hold",
    stepIndex: 3,
    stepDates: ["30-Oct-2026", "30-Oct-2026", "31-Oct-2026"],
    shipper: "Hamburg Import GmbH",
    consignee: "Zenith Overseas",
    notifyParty: "Zenith Overseas",
    customerRef: "ZO-5521",
    salesPerson: "Rahul Mehta",
    agent: "",
    origin: "Hamburg (HAM)",
    pol: "DEHAM",
    destination: "Singapore (SIN)",
    pod: "SGSIN",
    etd: "12-Nov-2026",
    eta: "05-Dec-2026",
    commodity: "Industrial Valves",
    packages: "12",
    grossWeight: 3400,
    volume: 9.8,
    containers: "LCL",
    freightTerm: "CIF",
    paymentTerm: "Advance",
    quotationNo: "QT-2026-027",
    currency: "EUR",
  }),
];
