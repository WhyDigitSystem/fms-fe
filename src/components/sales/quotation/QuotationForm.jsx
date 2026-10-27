import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Building2,
  Check,
  ChevronDown,
  Download,
  FileText,
  ListChecks,
  MapPin,
  Package,
  Plane,
  Plus,
  Receipt,
  Save,
  ScrollText,
  Trash2,
  User,
  Wallet,
  X,
} from "lucide-react";
import {
  calcOriginCharge,
  calcQuotationTotals,
  formatMoney,
  num,
} from "./quotationUtils";
import { downloadQuotationPdf } from "./quotationPdf";
import QuotationAPI from "../../../api/sales/quotationAPI";
import currencyAPI from "../../../api/currencyAPI";

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

let uid = 1000;
const nextUid = () => ++uid;

const emptyPackage = () => ({
  id: nextUid(),
  quantity: "",
  weight: "",
  weightUnit: "kg",
  length: "",
  width: "",
  height: "",
  dimensionUnit: "cm",
  cargoType: "",
  cargoDescription: "",
});

const emptyCharge = () => ({
  id: nextUid(),
  description: "",
  rate: "",
  rateUnit: "Shipment",
  minimumCharge: "",
  quantity: "1",
  basis: "",
  notes: "",
});

const emptyAirRate = () => ({
  id: nextUid(),
  airlineName: "",
  airlineCode: "",
  productName: "",
  destinationCode: "",
  transitVia: "",
  rateType: "",
  minimumWeight: "",
  ratePerKg: "",
  fuelRate: "",
  riskRate: "",
  remarks: "",
});

const initialForm = {
  id: 0,
  quotationNo: "",
  quotationDate: today(),
  expirationDate: addDays(15),
  company: "",
  service: "Door to Airport",
  currency: "",
  paymentTerms: "",
  incoterm: "EXW",
  originCode: "",
  originCity: "",
  destinationCode: "",
  destinationCity: "",
  status: "Draft",
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  customerAddress: "",
  agentName: "",
  agentPhone: "",
  agentEmail: "",
  packages: [emptyPackage()],
  originCharges: [],
  airRates: [emptyAirRate()],
  insurancePercentage: "",
  cargoValue: "",
  profitSharingPercentage: "",
  bankExchangePercentage: "",
  freeStorageDays: "",
  storageRate: "",
  storageMinimumCharge: "",
  rateValidityRemarks: "",
  terms: "",
  remarks: "",
};

const serviceTypes = [
  "Door to Airport",
  "Door to Door",
  "Airport to Airport",
  "Airport to Door",
];
const incoterms = [
  "EXW",
  "FCA",
  "FOB",
  "CIF",
  "CIP",
  "CPT",
  "DAP",
  "DDP",
  "DPU",
];
const statuses = ["Draft", "Sent", "Accepted", "Expired"];
const rateUnits = [
  "Shipment",
  "Inspection",
  "Ch. Kg",
  "Kg Actual",
  "CBM",
  "Piece",
  "AWB",
];
const bases = ["Per Shipment", "Chargeable Weight", "Gross Weight", "Volume"];

const numOrZero = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/* ------------------------------------------------------------------ */
/* Compact primitives                                                   */
/* ------------------------------------------------------------------ */

const inputClass =
  "mt-0.5 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/30 dark:disabled:bg-gray-800";

const cellClass = `${inputClass} !h-7 !px-1.5 !text-[11px]`;

const Section = ({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
  className = "",
}) => (
  <section
    className={`overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-800/60 ${className}`}
  >
    <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-2 py-1 dark:border-gray-700">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <Icon size={13} />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-[11px] font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="truncate text-[10px] text-slate-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
    <div className="space-y-1 p-2">{children}</div>
  </section>
);

const Field = ({ label, required, error, children, className = "" }) => (
  <div className={`min-w-0 ${className}`}>
    <label className="block text-[10px] font-medium leading-3 text-slate-600 dark:text-gray-300">
      {label}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="mt-0.5 text-[10px] leading-3 text-rose-500">{error}</p>
    )}
  </div>
);

const TextField = ({
  label,
  required,
  error,
  onChange,
  value,
  type = "text",
  className = "",
  ...rest
}) => (
  <Field label={label} required={required} error={error} className={className}>
    <input
      type={type}
      min={type === "number" ? 0 : undefined}
      step={type === "number" ? "any" : undefined}
      inputMode={type === "number" ? "decimal" : undefined}
      value={value ?? ""}
      aria-invalid={!!error}
      aria-required={required || undefined}
      onChange={(e) => onChange?.(e.target.value)}
      className={`${inputClass} ${
        error ? "!border-rose-500 focus:!ring-rose-500/10" : ""
      }`}
      {...rest}
    />
  </Field>
);

const SelectField = ({
  label,
  required,
  error,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  disabled,
  className = "",
}) => (
  <Field label={label} required={required} error={error} className={className}>
    <div className="relative">
      <select
        value={value ?? ""}
        disabled={disabled}
        aria-invalid={!!error}
        aria-required={required || undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} appearance-none pr-7 ${
          error ? "!border-rose-500 focus:!ring-rose-500/10" : ""
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const item =
            typeof option === "string"
              ? { value: option, label: option }
              : option;
          return (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          );
        })}
      </select>
      <ChevronDown
        size={11}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  </Field>
);

const TextArea = ({ label, value, onChange, rows = 3, placeholder }) => (
  <Field label={label}>
    <textarea
      rows={rows}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} !h-auto resize-y py-1.5`}
    />
  </Field>
);

const Cell = ({ value, onChange, type = "text", error, ...rest }) => (
  <input
    type={type}
    min={type === "number" ? 0 : undefined}
    step={type === "number" ? "any" : undefined}
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    className={`${cellClass} ${error ? "!border-rose-500" : ""}`}
    {...rest}
  />
);

const CellSelect = ({ value, onChange, options, placeholder = "" }) => (
  <div className="relative">
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={`${cellClass} appearance-none pr-5`}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    <ChevronDown
      size={10}
      className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400"
    />
  </div>
);

const AddRowButton = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex h-6 items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 text-[10px] font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
  >
    <Plus size={11} />
    {children}
  </button>
);

const RemoveRowButton = ({ onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label="Remove row"
    className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:border-red-500/40 dark:hover:bg-red-500/10"
  >
    <Trash2 size={11} />
  </button>
);

const Th = ({ children, className = "" }) => (
  <th className={`whitespace-nowrap px-2 py-1 font-semibold ${className}`}>
    {children}
  </th>
);

const theadClass =
  "bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-gray-900/60 dark:text-gray-400";

const Stat = ({ label, value, strong }) => (
  <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 dark:border-gray-700 dark:bg-gray-900/50">
    <p className="text-[10px] text-slate-500 dark:text-gray-400">{label}</p>
    <p
      className={`mt-0.5 text-[12px] ${
        strong
          ? "font-bold text-blue-700 dark:text-blue-300"
          : "font-semibold text-slate-800 dark:text-gray-100"
      }`}
    >
      {value}
    </p>
  </div>
);

const StepHeader = ({ step, title, subtitle }) => (
  <div className="mb-1.5">
    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
      Step {step} of 3
    </p>
    <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
      {title}
    </h2>
    {subtitle && (
      <p className="text-[10px] leading-3.5 text-slate-500 dark:text-gray-400">
        {subtitle}
      </p>
    )}
  </div>
);

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

const QuotationForm = ({ onBack = () => {}, onSave, editData }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => ({
    ...initialForm,
    ...editData,
    quotationDate: editData?.quotationDate || today(),
    expirationDate: editData?.expirationDate || addDays(15),
    packages: editData?.packages?.length
      ? editData.packages.map((p) => ({ ...p }))
      : [emptyPackage()],
    originCharges: editData?.originCharges?.map((c) => ({ ...c })) || [],
    airRates: editData?.airRates?.length
      ? editData.airRates.map((r) => ({ ...r }))
      : [emptyAirRate()],
  }));

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");
  const [recordLoading, setRecordLoading] = useState(false);
  const [loadingDocId, setLoadingDocId] = useState(false);

  const [currencyList, setCurrencyList] = useState([]);

  const orgId = parseInt(localStorage.getItem("orgId")) || 1000000001;
  const branch = parseInt(localStorage.getItem("branchId")) || orgId;
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";

  const totals = useMemo(() => calcQuotationTotals(form), [form]);
  const { summary, originTotal, airlines } = totals;

  const cur = useMemo(() => {
    const found = currencyList.find(
      (c) => String(c.id) === String(form.currency),
    );
    return found ? found.currency : "INR";
  }, [currencyList, form.currency]);

  // --------------------------------------------------------------
  // Fetch auto-generated quotation number (create mode only)
  // --------------------------------------------------------------
  const fetchQuotationDocId = useCallback(async () => {
    try {
      setLoadingDocId(true);
      const docId = await QuotationAPI.getQuotationDocId(orgId);
      setForm((p) => ({ ...p, quotationNo: docId || "" }));
    } catch (error) {
      console.error("Failed to load quotation DocId:", error);
      setErrors((p) => ({
        ...p,
        quotationNo: "Unable to fetch quotation number.",
      }));
    } finally {
      setLoadingDocId(false);
    }
  }, [orgId]);

  // --------------------------------------------------------------
  // ✅ Fetch full record by id and map to form state
  // --------------------------------------------------------------
  const fetchQuotationById = useCallback(async (id) => {
    try {
      setRecordLoading(true);
      const record = await QuotationAPI.getQuotationById(id);
      if (!record) return;

      const ci = record.customerInformation?.[0] || {};
      const ct = record.commercialTerms?.[0] || {};

      setForm({
        id: record.id || id,
        quotationNo: record.docId || "",
        quotationDate: record.docDate || today(),
        expirationDate: record.expirationDate || addDays(15),
        company: record.companyName || "",
        service: record.serviceType || "Door to Airport",
        currency: record.currency?.id ? String(record.currency.id) : "",
        paymentTerms: record.paymentTerms || "",
        incoterm: record.incoterm || "EXW",
        originCode: record.originCode || "",
        originCity: record.originCity || "",
        destinationCode: record.destinationCode || "",
        destinationCity: record.destinationCity || "",
        status: "Draft", // API doesn't return status yet
        customerName: ci.customerName || "",
        customerPhone: ci.customerPhone || "",
        customerEmail: ci.customerEmail || "",
        customerAddress: ci.customerAddress || "",
        agentName: ci.agentName || record.agentName || "",
        agentPhone: ci.agentPhone || "",
        agentEmail: ci.agentEmail || "",
        packages: record.shippingDetails?.length
          ? record.shippingDetails.map((p) => ({
              id: p.id || nextUid(),
              quantity: p.quantity != null ? String(p.quantity) : "",
              weight: p.packageWeight != null ? String(p.packageWeight) : "",
              weightUnit: p.weightUnit || "kg",
              length: p.length != null ? String(p.length) : "",
              width: p.width != null ? String(p.width) : "",
              height: p.height != null ? String(p.height) : "",
              dimensionUnit: p.dimensionUnit || "cm",
              cargoType: p.cargoType || "",
              cargoDescription: p.cargoDescription || "",
            }))
          : [emptyPackage()],
        originCharges: record.originCharges?.length
          ? record.originCharges.map((c) => ({
              id: c.id || nextUid(),
              description: c.chargeDescription || "",
              rate: c.rate != null ? String(c.rate) : "",
              rateUnit: c.rateUnit || "Shipment",
              minimumCharge:
                c.minimumCharge != null ? String(c.minimumCharge) : "",
              quantity: c.quantityUnits != null ? String(c.quantityUnits) : "1",
              basis: c.chargeableBasis || "",
              notes: c.chargeNotes || "",
            }))
          : [],
        airRates: record.airFreightRates?.length
          ? record.airFreightRates.map((a) => ({
              id: a.id || nextUid(),
              airlineName: a.airlineName || "",
              airlineCode: a.airlineCode || "",
              productName: a.productName || "",
              destinationCode: a.destinationCode || "",
              transitVia: a.transitVia || "",
              rateType: a.freightRateType || "",
              minimumWeight:
                a.minimumWeight != null ? String(a.minimumWeight) : "",
              ratePerKg: a.ratePerKg != null ? String(a.ratePerKg) : "",
              fuelRate: a.fuelRate != null ? String(a.fuelRate) : "",
              riskRate: a.riskRate != null ? String(a.riskRate) : "",
              remarks: a.rateRemarks || "",
            }))
          : [emptyAirRate()],
        insurancePercentage:
          ct.insurancePercentage != null ? String(ct.insurancePercentage) : "",
        cargoValue: ct.cargoValue != null ? String(ct.cargoValue) : "",
        profitSharingPercentage:
          ct.profitSharingPercentage != null
            ? String(ct.profitSharingPercentage)
            : "",
        bankExchangePercentage:
          ct.bankExchangePercentage != null
            ? String(ct.bankExchangePercentage)
            : "",
        freeStorageDays:
          ct.freeStorageDays != null ? String(ct.freeStorageDays) : "",
        storageRate: ct.storageRate != null ? String(ct.storageRate) : "",
        storageMinimumCharge:
          ct.storageMinimumCharge != null
            ? String(ct.storageMinimumCharge)
            : "",
        rateValidityRemarks: ct.rateValidityRemarks || "",
        terms: ct.termsAndConditions || "",
        remarks: ct.generalRemarks || record.remarks || "",
      });
    } catch (error) {
      console.error("Failed to load quotation by ID:", error);
      setErrors((p) => ({ ...p, submit: "Failed to load record details." }));
    } finally {
      setRecordLoading(false);
    }
  }, []);

  // Fetch Currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const data = await currencyAPI.getAllCurrencies(orgId);
        setCurrencyList(data);
      } catch (err) {
        console.error("Failed to fetch currencies:", err);
      }
    };
    fetchCurrencies();
  }, [orgId]);

  useEffect(() => {
    if (editData?.id) {
      fetchQuotationById(editData.id);
      setStep(1);
    } else {
      fetchQuotationDocId();
      setStep(1);
    }
    setErrors({});
    setToast("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id]);

  const setField = (name, value, extra = {}) => {
    setForm((p) => ({ ...p, [name]: value, ...extra }));
    setErrors((p) => ({ ...p, [name]: "", submit: "" }));
  };

  const updateRow = (key, id, name, value) => {
    setForm((p) => ({
      ...p,
      [key]: p[key].map((row) =>
        row.id === id ? { ...row, [name]: value } : row,
      ),
    }));
    setErrors((p) => ({ ...p, [key]: "", submit: "" }));
  };

  const addRow = (key, factory) =>
    setForm((p) => ({ ...p, [key]: [...p[key], factory()] }));

  const removeRow = (key, id) =>
    setForm((p) => ({ ...p, [key]: p[key].filter((row) => row.id !== id) }));

  const validate = () => {
    const e = {};
    const req = (name, label) => {
      if (!String(form[name] ?? "").trim()) e[name] = `${label} is required`;
    };

    req("quotationDate", "Date");
    req("expirationDate", "Expiration date");
    req("company", "Company");
    req("service", "Service type");
    req("currency", "Currency");
    req("paymentTerms", "Payment terms");
    req("incoterm", "Incoterm");
    req("originCode", "Origin code");
    req("originCity", "Origin city");
    req("destinationCode", "Destination code");
    req("destinationCity", "Destination city");
    req("customerName", "Customer name");

    if (
      form.quotationDate &&
      form.expirationDate &&
      form.expirationDate < form.quotationDate
    ) {
      e.expirationDate = "Must be on or after quotation date";
    }

    if (form.originCode.length > 5) e.originCode = "Max 5 characters";
    if (form.destinationCode.length > 5) e.destinationCode = "Max 5 characters";

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.customerEmail && !emailRe.test(form.customerEmail))
      e.customerEmail = "Enter a valid email";
    if (form.agentEmail && !emailRe.test(form.agentEmail))
      e.agentEmail = "Enter a valid email";

    const pct = (name) => {
      const v = form[name];
      if (v !== "" && (num(v) < 0 || num(v) > 100)) e[name] = "0 – 100";
    };
    [
      "insurancePercentage",
      "profitSharingPercentage",
      "bankExchangePercentage",
    ].forEach(pct);

    const badPkg = form.packages.some(
      (p) =>
        !(num(p.quantity) > 0) ||
        !(num(p.weight) > 0) ||
        !(num(p.length) > 0) ||
        !(num(p.width) > 0) ||
        !(num(p.height) > 0),
    );
    if (!form.packages.length || badPkg)
      e.packages =
        "Each package line needs quantity, weight, length, width and height";

    const badCharge = form.originCharges.some(
      (c) =>
        !c.description.trim() ||
        c.rate === "" ||
        !c.rateUnit ||
        c.quantity === "",
    );
    if (badCharge)
      e.originCharges =
        "Each charge needs description, rate, unit and quantity";

    const badRate = form.airRates.some(
      (r) =>
        !r.airlineName.trim() ||
        !r.productName.trim() ||
        !r.destinationCode.trim() ||
        !(num(r.ratePerKg) > 0),
    );
    if (!form.airRates.length || badRate)
      e.airRates =
        "Each airline rate needs airline, product, destination and rate per KG";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validate()) {
      const stepErrors =
        {
          1: [
            "quotationDate",
            "expirationDate",
            "company",
            "service",
            "currency",
            "paymentTerms",
            "incoterm",
            "customerName",
          ],
          2: ["originCode", "originCity", "destinationCode", "destinationCity"],
          3: [],
        }[step] || [];
      if (stepErrors.some((f) => errors[f])) return;
    }
    setErrors({});
    setStep((s) => Math.min(3, s + 1));
  };

  const goPrevious = () => {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
  };

  const goToStep = (target) => {
    if (target >= step) return;
    setErrors({});
    setStep(target);
  };

  const buildPayload = () => {
    const shippingDetails = form.packages.map((p) => {
      const qty = numOrZero(p.quantity);
      const weight = numOrZero(p.weight);
      const L = numOrZero(p.length);
      const W = numOrZero(p.width);
      const H = numOrZero(p.height);

      let volM3 = 0;
      if (L > 0 && W > 0 && H > 0) {
        if (p.dimensionUnit === "in") volM3 = L * W * H * 0.0000163871;
        else if (p.dimensionUnit === "m") volM3 = L * W * H;
        else volM3 = (L * W * H) / 1000000; // cm
      }
      const volumetricKg = volM3 * 167;
      const grossKg = p.weightUnit === "lb" ? weight * 0.45359237 : weight;

      // ✅ Removed `id: p.id` to prevent 400 errors on update
      return {
        cargoDescription: p.cargoDescription || "",
        cargoType: p.cargoType || "",
        quantity: qty,
        packageWeight: weight,
        weightUnit: p.weightUnit || "kg",
        length: L,
        width: W,
        height: H,
        dimensionUnit: p.dimensionUnit || "cm",
        grossWeight: grossKg,
        volumetricWeight: volumetricKg,
        chargeableWeight: Math.max(grossKg, volumetricKg),
        totalVolumeCbm: volM3,
      };
    });

    // ✅ Removed `id: c.id` to prevent 400 errors on update
    const originCharges = form.originCharges.map((c) => ({
      chargeDescription: c.description || "",
      rate: numOrZero(c.rate),
      rateUnit: c.rateUnit || "",
      minimumCharge: numOrZero(c.minimumCharge),
      quantityUnits: numOrZero(c.quantity),
      chargeableBasis: c.basis || "",
      chargeAmount: numOrZero(calcOriginCharge(c)),
      chargeNotes: c.notes || "",
      currency: cur,
    }));

    // ✅ Removed `id: a.id` to prevent 400 errors on update
    const airFreightRates = airlines.map((a) => ({
      airlineName: a.airlineName || "",
      airlineCode: a.airlineCode || "",
      productName: a.productName || "",
      destinationCode: a.destinationCode || "",
      transitVia: a.transitVia || "",
      freightRateType: a.rateType || "",
      minimumWeight: numOrZero(a.minimumWeight),
      ratePerKg: numOrZero(a.ratePerKg),
      fuelRate: numOrZero(a.fuelRate),
      riskRate: numOrZero(a.riskRate),
      freightAmount: numOrZero(a.freight),
      surcharges: numOrZero(a.surcharges),
      airfreightTotal: numOrZero(a.total),
      rateRemarks: a.remarks || "",
    }));

    const commercialTerms = [
      {
        insurancePercentage: numOrZero(form.insurancePercentage),
        cargoValue: numOrZero(form.cargoValue),
        profitSharingPercentage: numOrZero(form.profitSharingPercentage),
        bankExchangePercentage: numOrZero(form.bankExchangePercentage),
        freeStorageDays: numOrZero(form.freeStorageDays),
        storageRate: numOrZero(form.storageRate),
        storageMinimumCharge: numOrZero(form.storageMinimumCharge),
        rateValidityRemarks: form.rateValidityRemarks || "",
        termsAndConditions: form.terms || "",
        generalRemarks: form.remarks || "",
        originChargeTotal: numOrZero(originTotal),
        airlineQuotationTotal: airlines.length
          ? Math.min(...airlines.map((a) => a.quotationTotal))
          : 0,
      },
    ];

    const customerInformation = [
      {
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone || "",
        customerEmail: form.customerEmail || "",
        customerAddress: form.customerAddress || "",
        agentName: form.agentName || "",
        agentPhone: form.agentPhone || "",
        agentEmail: form.agentEmail || "",
      },
    ];

    const isUpdate = Boolean(form.id && form.id > 0);

    const payload = {
      orgId,
      branch,
      createdBy: loginUserName,
      cancelRemarks: "",

      companyName: form.company.trim(),
      serviceType: form.service || "",
      incoterm: form.incoterm || "",
      currency: Number(form.currency) || 0,
      paymentTerms: form.paymentTerms || "",
      originCode: form.originCode.trim().toUpperCase(),
      originCity: form.originCity || "",
      destinationCode: form.destinationCode.trim().toUpperCase(),
      destinationCity: form.destinationCity || "",
      expirationDate: form.expirationDate,
      remarks: form.remarks || "",
      agentName: form.agentName || "",

      shippingDetails,
      originCharges,
      airFreightRates,
      commercialTerms,
      customerInformation,
    };

    // ✅ Only include root `id` when updating
    if (isUpdate) payload.id = form.id;

    return payload;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (typeof onSave !== "function") {
      setErrors((p) => ({
        ...p,
        submit: "Save handler is missing. Pass an onSave function.",
      }));
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload();
      const result = await QuotationAPI.createUpdateQuotation(payload);

      await onSave({
        ...form,
        company: form.company.trim(),
        customerName: form.customerName.trim(),
        originCode: form.originCode.trim().toUpperCase(),
        destinationCode: form.destinationCode.trim().toUpperCase(),
        total: airlines.length
          ? Math.min(...airlines.map((a) => a.quotationTotal))
          : originTotal,
        payload,
        result,
      });

      setToast(
        editData?.id
          ? "Quotation updated successfully"
          : "Quotation saved successfully",
      );
      window.setTimeout(() => setToast(""), 3500);
    } catch (error) {
      console.error("Unable to save quotation:", error);
      setErrors((p) => ({
        ...p,
        submit:
          error?.response?.data?.paramObjectsMap?.message ||
          error?.response?.data?.message ||
          "Unable to save quotation. Please try again.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!validate()) return;
    downloadQuotationPdf({
      ...form,
      originCode: form.originCode.trim().toUpperCase(),
      destinationCode: form.destinationCode.trim().toUpperCase(),
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (submitting) return;
    if (step < 3) goNext();
    else handleSave();
  };

  const fmt = (v) => formatMoney(v, cur);

  const steps = ["Quotation & Customer", "Route & Shipment", "Charges & Terms"];

  if (recordLoading || loadingDocId) {
    return (
      <div className="flex h-[90dvh] w-full items-center justify-center bg-slate-100 dark:bg-gray-950">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-300">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Loading quotation...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[90dvh] w-full items-center justify-center overflow-hidden bg-slate-100 p-2 dark:bg-gray-950 sm:p-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        aria-busy={submitting}
        className="flex h-full max-h-[calc(100dvh-1rem)] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900"
      >
        {toast && (
          <div
            role="status"
            aria-live="polite"
            className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 shadow-xl dark:border-emerald-900 dark:bg-gray-900 dark:text-emerald-300"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              <Check size={14} />
            </span>
            {toast}
          </div>
        )}

        {/* Header */}
        <header className="shrink-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-3 py-2 text-white">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              disabled={submitting}
              aria-label="Go back"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/15 bg-white/10 transition hover:bg-white/15 disabled:opacity-50"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200">
                Quotation management
              </p>
              <h1 className="truncate text-sm font-bold">
                {editData ? "Edit Quotation" : "Create Quotation"}
              </h1>
            </div>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={submitting}
              className="hidden h-7 items-center gap-1 rounded-md border border-white/20 bg-white/10 px-2 text-[10px] font-semibold text-white transition hover:bg-white/15 disabled:opacity-50 sm:inline-flex"
            >
              <Download size={12} />
              PDF
            </button>

            <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[10px] font-medium">
              {step}/3
            </span>
          </div>

          <div className="mt-1.5 grid grid-cols-3 gap-1">
            {steps.map((title, index) => {
              const stepNo = index + 1;
              const clickable = stepNo < step;
              return (
                <button
                  key={title}
                  type="button"
                  onClick={() => goToStep(stepNo)}
                  disabled={!clickable}
                  aria-current={step === stepNo ? "step" : undefined}
                  className={`text-left ${
                    clickable ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <div
                    className={`h-1 rounded-full transition ${
                      step >= stepNo ? "bg-blue-400" : "bg-white/20"
                    }`}
                  />
                  <p
                    className={`mt-1 truncate text-[9px] ${
                      step >= stepNo ? "text-white" : "text-slate-400"
                    }`}
                  >
                    {title}
                  </p>
                </button>
              );
            })}
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2">
          {/* STEP 1: Quotation & Customer */}
          {step === 1 && (
            <div className="space-y-2">
              <Section
                icon={FileText}
                title="Quotation information"
                subtitle="Header & pricing setup"
              >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <TextField
                    label="Quotation No"
                    value={form.quotationNo}
                    placeholder={loadingDocId ? "Loading..." : "Auto-generated"}
                    disabled
                    error={errors.quotationNo}
                  />
                  <TextField
                    label="Quotation Date"
                    required
                    type="date"
                    value={form.quotationDate}
                    onChange={(v) => setField("quotationDate", v)}
                    error={errors.quotationDate}
                  />
                  <TextField
                    label="Expiration Date"
                    required
                    type="date"
                    value={form.expirationDate}
                    onChange={(v) => setField("expirationDate", v)}
                    error={errors.expirationDate}
                  />
                  <SelectField
                    label="Status"
                    value={form.status}
                    onChange={(v) => setField("status", v || "Draft")}
                    options={statuses}
                    placeholder="Draft"
                  />
                  <TextField
                    label="Company Name"
                    required
                    maxLength={150}
                    className="lg:col-span-2"
                    value={form.company}
                    onChange={(v) => setField("company", v)}
                    placeholder="Issuing company"
                    error={errors.company}
                  />
                  <SelectField
                    label="Service Type"
                    required
                    value={form.service}
                    onChange={(v) => setField("service", v)}
                    options={serviceTypes}
                    error={errors.service}
                  />
                  <SelectField
                    label="Incoterm"
                    required
                    value={form.incoterm}
                    onChange={(v) => setField("incoterm", v)}
                    options={incoterms}
                    error={errors.incoterm}
                  />
                  <SelectField
                    label="Currency"
                    required
                    value={form.currency}
                    onChange={(v) => setField("currency", v)}
                    options={currencyList.map((c) => ({
                      value: c.id,
                      label: c.currency,
                    }))}
                    error={errors.currency}
                  />
                  <TextField
                    label="Payment Terms"
                    required
                    maxLength={100}
                    className="lg:col-span-3"
                    value={form.paymentTerms}
                    onChange={(v) => setField("paymentTerms", v)}
                    placeholder="e.g. 30 days from invoice"
                    error={errors.paymentTerms}
                  />
                </div>
              </Section>

              <div className="grid grid-cols-1 items-start gap-2 lg:grid-cols-2">
                <Section
                  icon={MapPin}
                  title="Shipment route"
                  subtitle="Origin & destination"
                >
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[110px_1fr]">
                    <TextField
                      label="Origin Code"
                      required
                      maxLength={5}
                      value={form.originCode}
                      onChange={(v) => setField("originCode", v.toUpperCase())}
                      placeholder="BCN"
                      error={errors.originCode}
                    />
                    <TextField
                      label="Origin City"
                      required
                      maxLength={100}
                      value={form.originCity}
                      onChange={(v) => setField("originCity", v)}
                      placeholder="Barcelona"
                      error={errors.originCity}
                    />
                    <TextField
                      label="Destination Code"
                      required
                      maxLength={5}
                      value={form.destinationCode}
                      onChange={(v) =>
                        setField("destinationCode", v.toUpperCase())
                      }
                      placeholder="NBO"
                      error={errors.destinationCode}
                    />
                    <TextField
                      label="Destination City"
                      required
                      maxLength={100}
                      value={form.destinationCity}
                      onChange={(v) => setField("destinationCity", v)}
                      placeholder="Nairobi"
                      error={errors.destinationCity}
                    />
                  </div>
                </Section>

                <Section
                  icon={User}
                  title="Customer & agent"
                  subtitle="Contact details"
                >
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <TextField
                      label="Customer Name"
                      required
                      maxLength={150}
                      value={form.customerName}
                      onChange={(v) => setField("customerName", v)}
                      error={errors.customerName}
                    />
                    <TextField
                      label="Customer Phone"
                      maxLength={20}
                      value={form.customerPhone}
                      onChange={(v) => setField("customerPhone", v)}
                    />
                    <TextField
                      label="Customer Email"
                      type="email"
                      maxLength={254}
                      value={form.customerEmail}
                      onChange={(v) => setField("customerEmail", v)}
                      error={errors.customerEmail}
                    />
                    <TextField
                      label="Customer Address"
                      maxLength={250}
                      value={form.customerAddress}
                      onChange={(v) => setField("customerAddress", v)}
                    />
                    <TextField
                      label="Agent Name"
                      maxLength={100}
                      value={form.agentName}
                      onChange={(v) => setField("agentName", v)}
                    />
                    <TextField
                      label="Agent Phone"
                      maxLength={20}
                      value={form.agentPhone}
                      onChange={(v) => setField("agentPhone", v)}
                    />
                    <TextField
                      label="Agent Email"
                      type="email"
                      maxLength={254}
                      className="sm:col-span-2"
                      value={form.agentEmail}
                      onChange={(v) => setField("agentEmail", v)}
                      error={errors.agentEmail}
                    />
                  </div>
                </Section>
              </div>
            </div>
          )}

          {/* STEP 2: Route & Shipment (packages) */}
          {step === 2 && (
            <div className="space-y-2">
              <Section
                icon={Package}
                title="Shipment details"
                subtitle="Package dimensions"
                action={
                  <AddRowButton
                    onClick={() => addRow("packages", emptyPackage)}
                  >
                    Add Line
                  </AddRowButton>
                }
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] text-left text-[11px]">
                    <thead>
                      <tr className={theadClass}>
                        <Th className="w-16">Qty *</Th>
                        <Th className="w-24">Weight *</Th>
                        <Th className="w-20">Unit</Th>
                        <Th className="w-20">Length *</Th>
                        <Th className="w-20">Width *</Th>
                        <Th className="w-20">Height *</Th>
                        <Th className="w-20">Unit</Th>
                        <Th>Cargo Type</Th>
                        <Th>Description</Th>
                        <Th className="w-10" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-gray-700/50">
                      {form.packages.map((p) => (
                        <tr key={p.id}>
                          <td className="px-1 py-1">
                            <Cell
                              type="number"
                              value={p.quantity}
                              onChange={(v) =>
                                updateRow("packages", p.id, "quantity", v)
                              }
                            />
                          </td>
                          <td className="px-1 py-1">
                            <Cell
                              type="number"
                              value={p.weight}
                              onChange={(v) =>
                                updateRow("packages", p.id, "weight", v)
                              }
                            />
                          </td>
                          <td className="px-1 py-1">
                            <CellSelect
                              value={p.weightUnit}
                              options={["kg", "lb"]}
                              onChange={(v) =>
                                updateRow(
                                  "packages",
                                  p.id,
                                  "weightUnit",
                                  v || "kg",
                                )
                              }
                            />
                          </td>
                          <td className="px-1 py-1">
                            <Cell
                              type="number"
                              value={p.length}
                              onChange={(v) =>
                                updateRow("packages", p.id, "length", v)
                              }
                            />
                          </td>
                          <td className="px-1 py-1">
                            <Cell
                              type="number"
                              value={p.width}
                              onChange={(v) =>
                                updateRow("packages", p.id, "width", v)
                              }
                            />
                          </td>
                          <td className="px-1 py-1">
                            <Cell
                              type="number"
                              value={p.height}
                              onChange={(v) =>
                                updateRow("packages", p.id, "height", v)
                              }
                            />
                          </td>
                          <td className="px-1 py-1">
                            <CellSelect
                              value={p.dimensionUnit}
                              options={["cm", "in", "m"]}
                              onChange={(v) =>
                                updateRow(
                                  "packages",
                                  p.id,
                                  "dimensionUnit",
                                  v || "cm",
                                )
                              }
                            />
                          </td>
                          <td className="px-1 py-1">
                            <Cell
                              maxLength={50}
                              value={p.cargoType}
                              onChange={(v) =>
                                updateRow("packages", p.id, "cargoType", v)
                              }
                            />
                          </td>
                          <td className="px-1 py-1">
                            <Cell
                              maxLength={250}
                              value={p.cargoDescription}
                              onChange={(v) =>
                                updateRow(
                                  "packages",
                                  p.id,
                                  "cargoDescription",
                                  v,
                                )
                              }
                            />
                          </td>
                          <td className="px-1 py-1 text-center">
                            <RemoveRowButton
                              disabled={form.packages.length === 1}
                              onClick={() => removeRow("packages", p.id)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {errors.packages && (
                  <p className="mt-1.5 text-[10px] text-rose-500">
                    {errors.packages}
                  </p>
                )}

                <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
                  <Stat
                    label="Gross Weight"
                    value={`${summary.gross.toFixed(2)} Kg`}
                  />
                  <Stat
                    label="Volumetric Weight"
                    value={`${summary.volumetric.toFixed(2)} Kg`}
                  />
                  <Stat
                    label="Chargeable Weight"
                    value={`${summary.chargeable.toFixed(2)} Kg`}
                    strong
                  />
                  <Stat
                    label="Volume"
                    value={`${summary.cbm.toFixed(4)} CBM`}
                  />
                  <Stat label="Pieces" value={summary.pieces} />
                </div>
              </Section>
            </div>
          )}

          {/* STEP 3: Charges & Terms */}
          {step === 3 && (
            <div className="space-y-2">
              <Section
                icon={Receipt}
                title={`Charges in ${form.originCity || "Origin"}`}
                subtitle="Amount = rate × units, or the minimum charge if higher."
                action={
                  <AddRowButton
                    onClick={() => addRow("originCharges", emptyCharge)}
                  >
                    Add Charge
                  </AddRowButton>
                }
              >
                {form.originCharges.length === 0 ? (
                  <p className="py-3 text-center text-[11px] text-slate-500 dark:text-gray-400">
                    No origin charges added.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1080px] text-left text-[11px]">
                      <thead>
                        <tr className={theadClass}>
                          <Th>Description *</Th>
                          <Th className="w-24">Rate *</Th>
                          <Th className="w-28">Rate Unit *</Th>
                          <Th className="w-24">Min Charge</Th>
                          <Th className="w-24">Units *</Th>
                          <Th className="w-36">Basis</Th>
                          <Th className="w-28 text-right">Amount</Th>
                          <Th>Notes</Th>
                          <Th className="w-10" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-gray-700/50">
                        {form.originCharges.map((c) => (
                          <tr key={c.id}>
                            <td className="px-1 py-1">
                              <Cell
                                maxLength={150}
                                value={c.description}
                                onChange={(v) =>
                                  updateRow(
                                    "originCharges",
                                    c.id,
                                    "description",
                                    v,
                                  )
                                }
                              />
                            </td>
                            <td className="px-1 py-1">
                              <Cell
                                type="number"
                                value={c.rate}
                                onChange={(v) =>
                                  updateRow("originCharges", c.id, "rate", v)
                                }
                              />
                            </td>
                            <td className="px-1 py-1">
                              <CellSelect
                                value={c.rateUnit}
                                options={rateUnits}
                                onChange={(v) =>
                                  updateRow(
                                    "originCharges",
                                    c.id,
                                    "rateUnit",
                                    v,
                                  )
                                }
                              />
                            </td>
                            <td className="px-1 py-1">
                              <Cell
                                type="number"
                                value={c.minimumCharge}
                                onChange={(v) =>
                                  updateRow(
                                    "originCharges",
                                    c.id,
                                    "minimumCharge",
                                    v,
                                  )
                                }
                              />
                            </td>
                            <td className="px-1 py-1">
                              <Cell
                                type="number"
                                value={c.quantity}
                                onChange={(v) =>
                                  updateRow(
                                    "originCharges",
                                    c.id,
                                    "quantity",
                                    v,
                                  )
                                }
                              />
                            </td>
                            <td className="px-1 py-1">
                              <CellSelect
                                value={c.basis}
                                options={bases}
                                onChange={(v) =>
                                  updateRow("originCharges", c.id, "basis", v)
                                }
                              />
                            </td>
                            <td className="px-2 py-1 text-right font-semibold text-slate-800 dark:text-gray-100">
                              {fmt(calcOriginCharge(c))}
                            </td>
                            <td className="px-1 py-1">
                              <Cell
                                maxLength={500}
                                value={c.notes}
                                onChange={(v) =>
                                  updateRow("originCharges", c.id, "notes", v)
                                }
                              />
                            </td>
                            <td className="px-1 py-1 text-center">
                              <RemoveRowButton
                                onClick={() => removeRow("originCharges", c.id)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-slate-200 dark:border-gray-700">
                          <td
                            colSpan={6}
                            className="px-2 py-1.5 text-right text-[11px] font-semibold text-slate-600 dark:text-gray-300"
                          >
                            Total Origin Charges
                          </td>
                          <td className="px-2 py-1.5 text-right text-[12px] font-bold text-blue-700 dark:text-blue-300">
                            {fmt(originTotal)}
                          </td>
                          <td colSpan={2} />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                {errors.originCharges && (
                  <p className="mt-1.5 text-[10px] text-rose-500">
                    {errors.originCharges}
                  </p>
                )}
              </Section>

              <Section
                icon={Plane}
                title="Airfreight rates"
                subtitle="Freight = rate × chargeable weight. Surcharges = (fuel + risk) × chargeable weight."
                action={
                  <AddRowButton
                    onClick={() => addRow("airRates", emptyAirRate)}
                  >
                    Add Airline
                  </AddRowButton>
                }
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1400px] text-left text-[11px]">
                    <thead>
                      <tr className={theadClass}>
                        <Th>Airline *</Th>
                        <Th className="w-20">Code</Th>
                        <Th>Product *</Th>
                        <Th className="w-20">To *</Th>
                        <Th className="w-24">Via</Th>
                        <Th className="w-24">Rate Type</Th>
                        <Th className="w-20">Min Wt</Th>
                        <Th className="w-24">Rate/KG *</Th>
                        <Th className="w-20">Fuel</Th>
                        <Th className="w-20">Risk</Th>
                        <Th className="w-24 text-right">Freight</Th>
                        <Th className="w-24 text-right">Surcharges</Th>
                        <Th className="w-28 text-right">Total</Th>
                        <Th>Remarks</Th>
                        <Th className="w-10" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-gray-700/50">
                      {airlines.map((a) => (
                        <tr key={a.id}>
                          <td className="px-1 py-1">
                            <Cell
                              maxLength={100}
                              value={a.airlineName}
                              onChange={(v) =>
                                updateRow("airRates", a.id, "airlineName", v)
                              }
                            />
                          </td>
                          <td className="px-1 py-1">
                            <Cell
                              maxLength={5}
                              value={a.airlineCode}
                              onChange={(v) =>
                                updateRow(
                                  "airRates",
                                  a.id,
                                  "airlineCode",
                                  v.toUpperCase(),
                                )
                              }
                            />
                          </td>
                          <td className="px-1 py-1">
                            <Cell
                              maxLength={100}
                              value={a.productName}
                              onChange={(v) =>
                                updateRow("airRates", a.id, "productName", v)
                              }
                            />
                          </td>
                          <td className="px-1 py-1">
                            <Cell
                              maxLength={5}
                              value={a.destinationCode}
                              onChange={(v) =>
                                updateRow(
                                  "airRates",
                                  a.id,
                                  "destinationCode",
                                  v.toUpperCase(),
                                )
                              }
                            />
                          </td>
                          <td className="px-1 py-1">
                            <Cell
                              maxLength={100}
                              value={a.transitVia}
                              onChange={(v) =>
                                updateRow("airRates", a.id, "transitVia", v)
                              }
                            />
                          </td>
                          <td className="px-1 py-1">
                            <Cell
                              maxLength={20}
                              value={a.rateType}
                              onChange={(v) =>
                                updateRow("airRates", a.id, "rateType", v)
                              }
                              placeholder="+100kg"
                            />
                          </td>
                          <td className="px-1 py-1">
                            <Cell
                              type="number"
                              value={a.minimumWeight}
                              onChange={(v) =>
                                updateRow("airRates", a.id, "minimumWeight", v)
                              }
                            />
                          </td>
                          <td className="px-1 py-1">
                            <Cell
                              type="number"
                              value={a.ratePerKg}
                              onChange={(v) =>
                                updateRow("airRates", a.id, "ratePerKg", v)
                              }
                            />
                          </td>
                          <td className="px-1 py-1">
                            <Cell
                              type="number"
                              value={a.fuelRate}
                              onChange={(v) =>
                                updateRow("airRates", a.id, "fuelRate", v)
                              }
                            />
                          </td>
                          <td className="px-1 py-1">
                            <Cell
                              type="number"
                              value={a.riskRate}
                              onChange={(v) =>
                                updateRow("airRates", a.id, "riskRate", v)
                              }
                            />
                          </td>
                          <td className="px-2 py-1 text-right text-slate-700 dark:text-gray-200">
                            {fmt(a.freight)}
                          </td>
                          <td className="px-2 py-1 text-right text-slate-700 dark:text-gray-200">
                            {fmt(a.surcharges)}
                          </td>
                          <td className="px-2 py-1 text-right font-semibold text-slate-800 dark:text-gray-100">
                            {fmt(a.total)}
                          </td>
                          <td className="px-1 py-1">
                            <Cell
                              maxLength={500}
                              value={a.remarks}
                              onChange={(v) =>
                                updateRow("airRates", a.id, "remarks", v)
                              }
                            />
                          </td>
                          <td className="px-1 py-1 text-center">
                            <RemoveRowButton
                              disabled={form.airRates.length === 1}
                              onClick={() => removeRow("airRates", a.id)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {errors.airRates && (
                  <p className="mt-1.5 text-[10px] text-rose-500">
                    {errors.airRates}
                  </p>
                )}
              </Section>

              <Section
                icon={Wallet}
                title="Quotation total"
                subtitle="Airline total plus origin charges."
              >
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                  {airlines.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-gray-700 dark:bg-gray-900/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold text-slate-800 dark:text-gray-100">
                          {a.airlineName || "Airline"}
                        </p>
                        <p className="truncate text-[10px] text-slate-500 dark:text-gray-400">
                          {a.productName || "Product"} ·{" "}
                          {a.destinationCode || "-"}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">
                          {fmt(a.total)} + {fmt(originTotal)} origin
                        </p>
                      </div>
                      <p className="shrink-0 pl-2 text-sm font-bold text-blue-700 dark:text-blue-300">
                        {fmt(a.quotationTotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>

              <Section icon={ScrollText} title="Commercial terms">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <TextField
                    label="Insurance %"
                    type="number"
                    value={form.insurancePercentage}
                    onChange={(v) => setField("insurancePercentage", v)}
                    error={errors.insurancePercentage}
                  />
                  <TextField
                    label="Cargo Value"
                    type="number"
                    value={form.cargoValue}
                    onChange={(v) => setField("cargoValue", v)}
                  />
                  <TextField
                    label="Profit Sharing %"
                    type="number"
                    value={form.profitSharingPercentage}
                    onChange={(v) => setField("profitSharingPercentage", v)}
                    error={errors.profitSharingPercentage}
                  />
                  <TextField
                    label="Bank Exchange %"
                    type="number"
                    value={form.bankExchangePercentage}
                    onChange={(v) => setField("bankExchangePercentage", v)}
                    error={errors.bankExchangePercentage}
                  />
                  <TextField
                    label="Free Storage Days"
                    type="number"
                    step="1"
                    value={form.freeStorageDays}
                    onChange={(v) => setField("freeStorageDays", v)}
                  />
                  <TextField
                    label="Storage Rate"
                    type="number"
                    value={form.storageRate}
                    onChange={(v) => setField("storageRate", v)}
                  />
                  <TextField
                    label="Storage Minimum Charge"
                    type="number"
                    value={form.storageMinimumCharge}
                    onChange={(v) => setField("storageMinimumCharge", v)}
                  />
                  <TextField
                    label="Rate Validity Remarks"
                    maxLength={500}
                    value={form.rateValidityRemarks}
                    onChange={(v) => setField("rateValidityRemarks", v)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                  <TextArea
                    label="Terms and conditions"
                    rows={4}
                    value={form.terms}
                    onChange={(v) => setField("terms", v)}
                  />
                  <TextArea
                    label="General remarks"
                    rows={4}
                    value={form.remarks}
                    onChange={(v) => setField("remarks", v)}
                  />
                </div>
              </Section>

              {errors.submit && (
                <p
                  role="alert"
                  className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] text-rose-700 dark:border-rose-900/60 dark:bg-rose-900/20 dark:text-rose-300"
                >
                  {errors.submit}
                </p>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="flex shrink-0 gap-2 border-t border-slate-200 bg-white/95 px-3 py-1.5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
          {step === 1 ? (
            <button
              type="button"
              onClick={onBack}
              disabled={submitting}
              className="flex-1 rounded-md border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={goPrevious}
              disabled={submitting}
              className="flex-1 rounded-md border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Back
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
          >
            <Download size={13} />
            PDF
          </button>

          {step < 3 ? (
            <button
              type="submit"
              disabled={submitting || loadingDocId}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              Continue
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={14} />
              {submitting
                ? "Saving..."
                : editData?.id
                  ? "Update quotation"
                  : "Save quotation"}
            </button>
          )}
        </footer>
      </form>
    </div>
  );
};

export default QuotationForm;
