import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  FileText,
  MapPin,
  Package,
  Plane,
  Plus,
  Download,
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
  currency: "INR",
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
const currencies = ["INR", "USD", "EUR", "GBP", "AED"];
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

const inputClass =
  "h-[32px] w-full rounded-md border border-slate-300 bg-white px-2.5 text-[12px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40 dark:disabled:bg-gray-800 dark:disabled:text-gray-500 dark:[color-scheme:dark]";

const cellClass = `${inputClass} !h-[28px] !px-2 !text-[11px]`;

const Section = ({ icon: Icon, title, subtitle, action, children }) => (
  <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800/40">
    <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 dark:border-gray-700/60">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <Icon size={14} />
        </span>

        <div className="min-w-0">
          <h3 className="text-[12px] font-semibold leading-tight text-slate-900 dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[10px] text-slate-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action}
    </div>

    <div className="p-3">{children}</div>
  </section>
);

const Field = ({ label, required, error, children, className = "" }) => (
  <div className={`min-w-0 ${className}`}>
    <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-gray-300">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
  </div>
);

const TextField = ({
  label,
  required,
  error,
  onChange,
  value,
  type = "text",
  className,
  ...rest
}) => (
  <Field label={label} required={required} error={error} className={className}>
    <input
      type={type}
      min={type === "number" ? 0 : undefined}
      step={type === "number" ? "any" : undefined}
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      className={`${inputClass} ${
        error
          ? "!border-red-500 focus:!ring-red-100 dark:focus:!ring-red-900/30"
          : ""
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
  placeholder = "Select",
  disabled,
}) => (
  <Field label={label} required={required} error={error}>
    <div className="relative">
      <select
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} appearance-none pr-8 ${
          error ? "!border-red-500" : ""
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  </Field>
);

const TextArea = ({ label, value, onChange, rows = 4, placeholder }) => (
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

// Compact inputs used inside line-item tables
const Cell = ({ value, onChange, type = "text", error, ...rest }) => (
  <input
    type={type}
    min={type === "number" ? 0 : undefined}
    step={type === "number" ? "any" : undefined}
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    className={`${cellClass} ${error ? "!border-red-500" : ""}`}
    {...rest}
  />
);

const CellSelect = ({ value, onChange, options, placeholder = "Select" }) => (
  <div className="relative">
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={`${cellClass} appearance-none pr-6`}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    <ChevronDown
      size={11}
      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
    />
  </div>
);

const AddRowButton = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex h-7 items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 text-[11px] font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
  >
    <Plus size={12} />
    {children}
  </button>
);

const RemoveRowButton = ({ onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label="Remove row"
    className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:border-red-500/40 dark:hover:bg-red-500/10"
  >
    <Trash2 size={12} />
  </button>
);

const Th = ({ children, className = "" }) => (
  <th className={`whitespace-nowrap px-2 py-1.5 font-semibold ${className}`}>
    {children}
  </th>
);

const theadClass =
  "bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-gray-900/60 dark:text-gray-400";

const Stat = ({ label, value, strong }) => (
  <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-gray-700 dark:bg-gray-900/50">
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

const QuotationForm = ({ onBack, onSave, editData }) => {
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

  const totals = useMemo(() => calcQuotationTotals(form), [form]);
  const { summary, originTotal, airlines } = totals;
  const cur = form.currency || "INR";

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

  const handleSave = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSave({
        ...form,
        company: form.company.trim(),
        customerName: form.customerName.trim(),
        originCode: form.originCode.trim().toUpperCase(),
        destinationCode: form.destinationCode.trim().toUpperCase(),
        total: airlines.length
          ? Math.min(...airlines.map((a) => a.quotationTotal))
          : originTotal,
      });
    } catch {
      setErrors((p) => ({
        ...p,
        submit: "Unable to save quotation. Please try again.",
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

  const fmt = (v) => formatMoney(v, cur);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-gray-900">
      <div className="w-full px-3 pt-3 pb-0 sm:px-4 sm:pt-3 sm:pb-0 lg:px-5">
        <div className="mb-2 flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            aria-label="Go back"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={15} />
          </button>

          <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white sm:text-lg">
            {editData ? "Edit Quotation" : "Create Quotation"}
          </h1>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={submitting}
            className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
          >
            <Download size={13} />
            Download PDF
          </button>
        </div>

        <div className="space-y-2">
          {/* 1. Header */}
          <Section icon={FileText} title="Quotation Information">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <TextField
                label="Quotation No"
                value={form.quotationNo}
                placeholder="Auto-generated"
                disabled
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
                options={currencies}
                error={errors.currency}
              />
              <TextField
                label="Payment Terms"
                required
                maxLength={100}
                className="sm:col-span-2"
                value={form.paymentTerms}
                onChange={(v) => setField("paymentTerms", v)}
                placeholder="e.g. 30 days from invoice"
                error={errors.paymentTerms}
              />
            </div>
          </Section>

          <div className="grid grid-cols-1 items-stretch gap-2 lg:grid-cols-2">
            {/* 2. Route */}
            <Section icon={MapPin} title="Shipment Route">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[110px_1fr]">
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
                  onChange={(v) => setField("destinationCode", v.toUpperCase())}
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

            {/* 3. Customer & agent */}
            <Section icon={User} title="Customer & Agent">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
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

          {/* 4. Shipment details */}
          <Section
            icon={Package}
            title="Shipment Details"
            subtitle="Package dimension lines. Volumetric weight uses 1 CBM = 167 KG."
            action={
              <AddRowButton onClick={() => addRow("packages", emptyPackage)}>
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
                    <Th className="w-10 text-center" />
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
                          placeholder=""
                          onChange={(v) =>
                            updateRow("packages", p.id, "weightUnit", v || "kg")
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
                          placeholder=""
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
                            updateRow("packages", p.id, "cargoDescription", v)
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
              <p className="mt-1.5 text-[10px] text-red-500">
                {errors.packages}
              </p>
            )}

            <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
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
              <Stat label="Volume" value={`${summary.cbm.toFixed(4)} CBM`} />
              <Stat label="Pieces" value={summary.pieces} />
            </div>
          </Section>

          {/* 5. Origin charges */}
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
                              updateRow("originCharges", c.id, "description", v)
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
                              updateRow("originCharges", c.id, "rateUnit", v)
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
                              updateRow("originCharges", c.id, "quantity", v)
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
                        className="px-2 py-2 text-right text-[11px] font-semibold text-slate-600 dark:text-gray-300"
                      >
                        Total Origin Charges
                      </td>
                      <td className="px-2 py-2 text-right text-[12px] font-bold text-blue-700 dark:text-blue-300">
                        {fmt(originTotal)}
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {errors.originCharges && (
              <p className="mt-1.5 text-[10px] text-red-500">
                {errors.originCharges}
              </p>
            )}
          </Section>

          {/* 6. Airfreight rates */}
          <Section
            icon={Plane}
            title="Airfreight Rates"
            subtitle="Freight = rate × chargeable weight. Surcharges = (fuel + risk) × chargeable weight."
            action={
              <AddRowButton onClick={() => addRow("airRates", emptyAirRate)}>
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
              <p className="mt-1.5 text-[10px] text-red-500">
                {errors.airRates}
              </p>
            )}
          </Section>

          {/* 7. Totals */}
          <Section
            icon={Wallet}
            title="Quotation Total"
            subtitle="Airline total plus origin charges."
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {airlines.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-semibold text-slate-800 dark:text-gray-100">
                      {a.airlineName || "Airline"}
                    </p>
                    <p className="truncate text-[10px] text-slate-500 dark:text-gray-400">
                      {a.productName || "Product"} · {a.destinationCode || "-"}
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

          {/* 8. Commercial terms */}
          <Section icon={ScrollText} title="Commercial Terms">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
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

            <div className="mt-2.5 grid grid-cols-1 gap-2.5 lg:grid-cols-2">
              <TextArea
                label="Terms and Conditions"
                rows={5}
                value={form.terms}
                onChange={(v) => setField("terms", v)}
              />
              <TextArea
                label="General Remarks"
                rows={5}
                value={form.remarks}
                onChange={(v) => setField("remarks", v)}
              />
            </div>
          </Section>

          {errors.submit && (
            <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300">
              {errors.submit}
            </p>
          )}

          <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-0 py-2 sm:flex-row sm:justify-end dark:border-gray-800 dark:bg-gray-900">
            <button
              type="button"
              onClick={onBack}
              disabled={submitting}
              className="inline-flex h-[32px] items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3.5 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <X size={12} />
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={submitting}
              className="inline-flex h-[32px] items-center justify-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3.5 text-[12px] font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
            >
              <Download size={12} />
              Download PDF
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={submitting}
              className="inline-flex h-[32px] items-center justify-center gap-1.5 rounded-md bg-blue-600 px-[19px] text-[12px] font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={12} />
              {submitting ? "Saving..." : editData ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationForm;
