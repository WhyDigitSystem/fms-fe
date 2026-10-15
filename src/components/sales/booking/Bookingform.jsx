import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Box,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Copy,
  DollarSign,
  FileText,
  History,
  Info,
  MapPin,
  MoreHorizontal,
  Package,
  Paperclip,
  Plane,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Search,
  Send,
  Ship,
  Trash2,
  Truck,
  Upload,
  Users,
  X,
} from "lucide-react";
import {
  ALLOWED_EXT,
  CONTAINER_ALLOCATIONS,
  CONTAINER_TYPES,
  CURRENCIES,
  CURRENT_USER,
  DIM_UOMS,
  DOC_CATEGORIES,
  EDITABLE_STATUSES,
  EQUIPMENT_PREFS,
  FREIGHT_TERMS,
  HANDLING,
  INCOTERMS,
  MAX_FILE_SIZE,
  PACKAGE_TYPES,
  PAYMENT_TERMS,
  SERVICES,
  VOLUME_UOMS,
  WEIGHT_UOMS,
  WORKFLOW_STEPS,
  BOOKING_TYPES,
  addresses,
  branches,
  carriers,
  computeTotals,
  customers,
  emptyEquipment,
  emptyForm,
  emptyLine,
  fmtDateTime,
  fmtNum,
  fmtSize,
  getService,
  hydrate,
  locationByCode,
  locationLabel,
  locations,
  parties,
  quotations,
  snapshot,
  statusDots,
  statusStyles,
  today,
  uid,
  users,
  validateBooking,
} from "./bookingData";

/* ------------------------------------------------------------------ */
/* Styling tokens (same as Enquiry screens)                            */
/* ------------------------------------------------------------------ */

const inputClass =
  "h-[32px] w-full rounded-md border border-slate-300 bg-white px-2.5 text-[12px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40 dark:disabled:bg-gray-800 dark:disabled:text-gray-500 dark:[color-scheme:dark]";

const cellClass = inputClass
  .replace("h-[32px]", "h-[28px]")
  .replace("text-[12px]", "text-[11px]")
  .replace("px-2.5", "px-2");

const errClass =
  "!border-red-500 focus:!ring-red-100 dark:focus:!ring-red-900/30";

const btnBase =
  "inline-flex h-[32px] items-center justify-center gap-1.5 rounded-md px-3 text-[12px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
const btnOutline = `${btnBase} border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-300 dark:hover:bg-gray-800`;
const btnPrimary = `${btnBase} bg-blue-600 text-white shadow-sm hover:bg-blue-700`;

const modes = [
  { value: "Sea", icon: Ship, hint: "Ocean freight" },
  { value: "Air", icon: Plane, hint: "Air freight" },
  { value: "Road", icon: Truck, hint: "Road transport" },
];

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

const Section = ({ id, icon: Icon, title, subtitle, action, children }) => (
  <section
    id={`bk-${id}`}
    className="scroll-mt-24 rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800/40"
  >
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

const Field = ({ label, required, error, hint, className = "", children }) => (
  <div className={`min-w-0 ${className}`}>
    {label && (
      <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-gray-300">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
    )}
    {children}
    {error ? (
      <p className="mt-1 text-[10px] text-red-500">{error}</p>
    ) : (
      hint && (
        <p className="mt-1 text-[10px] text-slate-500 dark:text-gray-400">
          {hint}
        </p>
      )
    )}
  </div>
);

const TextField = ({
  label,
  required,
  error,
  hint,
  onChange,
  value,
  type = "text",
  className,
  ...rest
}) => (
  <Field
    label={label}
    required={required}
    error={error}
    hint={hint}
    className={className}
  >
    <input
      type={type}
      min={type === "number" ? 0 : undefined}
      step={type === "number" ? "any" : undefined}
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      className={`${inputClass} ${error ? errClass : ""}`}
      {...rest}
    />
  </Field>
);

const SelectField = ({
  label,
  required,
  error,
  hint,
  value,
  onChange,
  options = [],
  placeholder = "Select",
  disabled,
  className,
}) => (
  <Field
    label={label}
    required={required}
    error={error}
    hint={hint}
    className={className}
  >
    <div className="relative">
      <select
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} appearance-none pr-8 ${error ? "!border-red-500" : ""}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => {
          const item = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          );
        })}
      </select>
      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  </Field>
);

const TextAreaField = ({
  label,
  required,
  error,
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
}) => (
  <Field label={label} required={required} error={error} className={className}>
    <textarea
      rows={rows}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} h-auto resize-y py-1.5 ${error ? errClass : ""}`}
    />
  </Field>
);

// Searchable dropdown (customers, parties, ports, airports, addresses, carriers...)
const LookupField = ({
  label,
  required,
  error,
  hint,
  value,
  onChange,
  options = [],
  placeholder = "Search...",
  disabled,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const list = t
      ? options.filter((o) =>
          `${o.label} ${o.sub || ""} ${o.value}`.toLowerCase().includes(t),
        )
      : options;
    return list.slice(0, 50);
  }, [options, q]);

  return (
    <Field
      label={label}
      required={required}
      error={error}
      hint={hint}
      className={className}
    >
      <div className="relative">
        <Search
          size={13}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={open ? q : (selected?.label ?? "")}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => {
            setQ("");
            setOpen(true);
          }}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") e.currentTarget.blur();
            if (e.key === "Enter" && open && filtered.length === 1) {
              e.preventDefault();
              onChange(filtered[0].value);
              e.currentTarget.blur();
            }
          }}
          className={`${inputClass} pl-8 ${selected && !disabled ? "pr-8" : ""} ${
            error ? errClass : ""
          }`}
        />
        {selected && !disabled && (
          <button
            type="button"
            aria-label="Clear selection"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-200"
          >
            <X size={13} />
          </button>
        )}
        {open && (
          <ul className="absolute z-30 mt-1 max-h-52 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 text-[12px] shadow-lg dark:border-gray-700 dark:bg-gray-900">
            {filtered.length === 0 ? (
              <li className="px-2.5 py-2 text-slate-500 dark:text-gray-400">
                No matches
              </li>
            ) : (
              filtered.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left hover:bg-blue-50 dark:hover:bg-blue-500/10 ${
                      o.value === value
                        ? "bg-blue-50/60 font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                        : "text-slate-700 dark:text-gray-200"
                    }`}
                  >
                    <span className="truncate">{o.label}</span>
                    {o.sub && (
                      <span className="shrink-0 text-[10px] text-slate-400 dark:text-gray-500">
                        {o.sub}
                      </span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </Field>
  );
};

// Currency + amount pair (sell / buy rate)
const AmountField = ({
  label,
  error,
  currency,
  amount,
  onCurrency,
  onAmount,
}) => (
  <Field label={label} error={error}>
    <div className="flex gap-1.5">
      <div className="relative w-[84px] shrink-0">
        <select
          value={currency}
          onChange={(e) => onCurrency(e.target.value)}
          className={`${inputClass} appearance-none pr-6`}
        >
          {CURRENCIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
      <input
        type="number"
        min={0}
        step="any"
        value={amount ?? ""}
        placeholder="0.00"
        onChange={(e) => onAmount(e.target.value)}
        className={`${inputClass} ${error ? errClass : ""}`}
      />
    </div>
  </Field>
);

const CheckBox = ({ checked, onChange, label, hint }) => (
  <label className="flex cursor-pointer items-start gap-2 rounded-md border border-slate-200 bg-slate-50/60 px-2.5 py-1.5 dark:border-gray-700 dark:bg-gray-900/40">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
    />
    <span>
      <span className="block text-[11px] font-medium text-slate-700 dark:text-gray-200">
        {label}
      </span>
      {hint && (
        <span className="block text-[10px] text-slate-500 dark:text-gray-400">
          {hint}
        </span>
      )}
    </span>
  </label>
);

const ModeButton = ({ value, hint, icon: Icon, selected, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(value)}
    aria-pressed={selected}
    className={`relative flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
      selected
        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500/40 dark:bg-blue-500/10"
        : "border-slate-300 bg-white hover:border-slate-400 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
    }`}
  >
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
        selected
          ? "bg-blue-600 text-white"
          : "bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-gray-400"
      }`}
    >
      <Icon size={14} />
    </span>
    <span className="min-w-0">
      <span
        className={`block text-[12px] font-semibold ${
          selected
            ? "text-blue-700 dark:text-blue-300"
            : "text-slate-700 dark:text-gray-200"
        }`}
      >
        {value}
      </span>
      <span className="block truncate text-[10px] text-slate-500 dark:text-gray-500">
        {hint}
      </span>
    </span>
    {selected && (
      <Check
        size={13}
        className="absolute right-2 top-2 text-blue-600 dark:text-blue-400"
      />
    )}
  </button>
);

const StatusChip = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
      statusStyles[status] || statusStyles.Draft
    }`}
  >
    <span
      className={`h-1.5 w-1.5 rounded-full ${statusDots[status] || statusDots.Draft}`}
    />
    {status}
  </span>
);

const creditStyles = {
  Approved:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300",
  Warning:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300",
  "On Hold":
    "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300",
};

const Modal = ({ title, onClose, children, footer, wide }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
    role="dialog"
    aria-modal="true"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose?.();
    }}
  >
    <div
      className={`w-full ${
        wide ? "max-w-2xl" : "max-w-md"
      } rounded-lg border border-slate-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-gray-700/60">
        <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-gray-200"
        >
          <X size={15} />
        </button>
      </div>
      <div className="max-h-[70vh] overflow-auto p-3">{children}</div>
      {footer && (
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-3 py-2 dark:border-gray-700/60">
          {footer}
        </div>
      )}
    </div>
  </div>
);

// Generic controlled-action dialog (cancel / hold / reject / carrier confirmation / amend)
const ActionModal = ({ config, busy, onClose, onSubmit }) => {
  const [values, setValues] = useState(() =>
    Object.fromEntries(config.fields.map((f) => [f.name, f.initial ?? ""])),
  );
  const [errors, setErrors] = useState({});

  const submit = () => {
    const e = {};
    config.fields.forEach((f) => {
      if (f.required && !String(values[f.name] || "").trim())
        e[f.name] = "Required";
    });
    setErrors(e);
    if (Object.keys(e).length === 0) onSubmit(values);
  };

  return (
    <Modal
      title={config.title}
      onClose={busy ? undefined : onClose}
      footer={
        <>
          <button
            type="button"
            className={btnOutline}
            onClick={onClose}
            disabled={busy}
          >
            Close
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className={`${btnBase} text-white ${
              config.danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {busy ? "Saving..." : config.confirmLabel}
          </button>
        </>
      }
    >
      {config.description && (
        <p className="mb-2.5 text-[11px] text-slate-600 dark:text-gray-300">
          {config.description}
        </p>
      )}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {config.fields.map((f) => {
          const common = {
            label: f.label,
            required: f.required,
            error: errors[f.name],
            value: values[f.name],
            onChange: (v) => setValues((p) => ({ ...p, [f.name]: v })),
          };
          if (f.type === "textarea")
            return (
              <TextAreaField
                key={f.name}
                {...common}
                className="sm:col-span-2"
                placeholder={f.placeholder}
              />
            );
          if (f.type === "select")
            return <SelectField key={f.name} {...common} options={f.options} />;
          if (f.type === "file")
            return (
              <Field
                key={f.name}
                label={f.label}
                required={f.required}
                error={errors[f.name]}
                className="sm:col-span-2"
              >
                <input
                  type="file"
                  accept={ALLOWED_EXT.map((x) => `.${x}`).join(",")}
                  onChange={(e) =>
                    setValues((p) => ({
                      ...p,
                      [f.name]: e.target.files?.[0]?.name || "",
                    }))
                  }
                  className="block w-full text-[11px] text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-blue-50 file:px-2.5 file:py-1.5 file:text-[11px] file:font-semibold file:text-blue-700 dark:text-gray-300 dark:file:bg-blue-500/10 dark:file:text-blue-300"
                />
              </Field>
            );
          return (
            <TextField
              key={f.name}
              {...common}
              type={f.type || "text"}
              placeholder={f.placeholder}
            />
          );
        })}
      </div>
    </Modal>
  );
};

/* ------------------------------------------------------------------ */
/* Form                                                                */
/* ------------------------------------------------------------------ */

const BookingForm = ({ editData, onBack, onSave, onNotify }) => {
  const initial = useMemo(
    () => (editData ? hydrate(editData) : emptyForm()),
    [],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  const [form, setForm] = useState(initial);
  const [errorList, setErrorList] = useState([]);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState("");
  const [modal, setModal] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [docCategory, setDocCategory] = useState(DOC_CATEGORIES[0]);
  const [dragOver, setDragOver] = useState(false);
  const [uploadMsgs, setUploadMsgs] = useState([]);

  const savedRef = useRef(initial); // last server-confirmed state (used by Reset)
  const baselineRef = useRef(snapshot(initial));
  const requestIdRef = useRef(uid()); // idempotency key: stops duplicate records on double click / retry
  const busyRef = useRef(false);
  const salesTouched = useRef(false);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  /* ---------- derived ---------- */
  const svc = getService(form.mode, form.serviceType);
  const customer = customers.find((c) => c.id === form.customer);
  const editable = EDITABLE_STATUSES.includes(form.status);
  const hasReefer =
    form.cargoLines.some((l) => l.reefer === "Yes") || !!svc?.reefer;
  const hasDG = form.cargoLines.some((l) => l.dg === "Yes");
  const needsEquipment = !!svc?.equipment;
  const showEquipment = needsEquipment || hasReefer;
  const totals = useMemo(
    () => computeTotals(form.cargoLines),
    [form.cargoLines],
  );
  const errors = useMemo(
    () => Object.fromEntries(errorList.map((e) => [e.key, e.message])),
    [errorList],
  );
  const dirty = snapshot(form) !== baselineRef.current;

  const sections = [
    { id: "details", title: "Booking Details", icon: ClipboardList },
    { id: "routing", title: "Routing & Schedule", icon: MapPin },
    { id: "parties", title: "Parties", icon: Users },
    { id: "cargo", title: "Cargo Details", icon: Box },
    ...(showEquipment
      ? [{ id: "equipment", title: "Equipment Details", icon: Package }]
      : []),
    { id: "commercial", title: "Commercial", icon: DollarSign },
    { id: "documents", title: "Documents & Instructions", icon: FileText },
  ];
  const sectionKey = sections.map((s) => s.id).join(",");
  const titleOf = (id) => {
    const i = sections.findIndex((s) => s.id === id);
    return `${i + 1}. ${sections[i].title}`;
  };

  /* ---------- options ---------- */
  const customerOptions = useMemo(
    () =>
      customers
        .filter(
          (c) =>
            c.id === form.customer ||
            (c.active && c.branches.includes(form.branch)),
        )
        .map((c) => ({
          value: c.id,
          label: `${c.name} (${c.id})`,
          sub: c.credit === "On Hold" ? "Credit hold" : undefined,
        })),
    [form.branch, form.customer],
  );
  const billingOptions = useMemo(
    () =>
      customers
        .filter((c) => c.id === form.billingCustomer || c.active)
        .map((c) => ({ value: c.id, label: `${c.name} (${c.id})` })),
    [form.billingCustomer],
  );
  const partyOptions = useMemo(
    () => parties.map((p) => ({ value: p.id, label: p.name, sub: p.id })),
    [],
  );
  const notifyOptions = useMemo(
    () => [{ value: "SAME", label: "Same as consignee" }, ...partyOptions],
    [partyOptions],
  );
  const locOpt = (l) => ({
    value: l.code,
    label: `${l.name} (${l.code})`,
    sub: l.type,
  });
  const gatewayOptions = useMemo(
    () =>
      locations
        .filter((l) => l.modes.includes(form.mode) && l.role !== "inland")
        .map(locOpt),
    [form.mode],
  );
  const inlandOptions = useMemo(
    () => locations.filter((l) => l.role !== "gateway").map(locOpt),
    [],
  );
  const carrierOptions = useMemo(
    () =>
      carriers
        .filter(
          (c) =>
            c.id === form.carrier || (c.active && c.modes.includes(form.mode)),
        )
        .map((c) => ({ value: c.id, label: c.name })),
    [form.mode, form.carrier],
  );
  const addressOptionsFor = (partyId) =>
    addresses
      .filter((a) => a.partyId === partyId)
      .map((a) => ({ value: a.id, label: a.label }));
  const quotationOptions = useMemo(
    () =>
      quotations
        .filter((q) => q.customerId === form.customer)
        .map((q) => ({
          value: q.id,
          label: `${q.id} - ${q.currency} ${fmtNum(q.sell)}`,
        })),
    [form.customer],
  );
  const incotermOptions = INCOTERMS.filter(
    (i) => !i.seaOnly || form.mode === "Sea",
  ).map((i) => i.value);

  const portLabels = {
    Sea: ["Origin (Port / ICD)", "Destination (Port / ICD)"],
    Air: ["Origin (Airport)", "Destination (Airport)"],
    Road: ["Origin (Terminal / Depot)", "Destination (Terminal / Depot)"],
  }[form.mode];

  /* ---------- effects ---------- */
  useEffect(() => {
    if (!notice || notice.type === "error") return undefined;
    const t = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const els = sectionKey
      .split(",")
      .map((id) => document.getElementById(`bk-${id}`))
      .filter(Boolean);
    if (!els.length) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        const first = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];
        if (first) setActiveTab(first.target.id.replace("bk-", ""));
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sectionKey]);

  /* ---------- helpers ---------- */
  const scrollToSection = (id) => {
    setActiveTab(id);
    document
      .getElementById(`bk-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const clearErr = (pred) => setErrorList((l) => l.filter((e) => !pred(e.key)));

  const set = (name, value, extra = {}) => {
    setForm((p) => ({ ...p, [name]: value, ...extra }));
    const keys = [name, ...Object.keys(extra)];
    clearErr((k) => keys.includes(k));
  };

  const setGroup = (group, name, value) => {
    setForm((p) => ({ ...p, [group]: { ...p[group], [name]: value } }));
    clearErr((k) => k === `${group}.${name}`);
  };

  const updateLine = (id, patch) => {
    setForm((p) => ({
      ...p,
      cargoLines: p.cargoLines.map((l) =>
        l.id === id ? { ...l, ...patch } : l,
      ),
    }));
    const fields = Object.keys(patch);
    if (fields.some((f) => ["length", "width", "height", "qty"].includes(f)))
      fields.push("volume");
    clearErr(
      (k) => fields.some((f) => k === `line.${id}.${f}`) || k === "cargoLines",
    );
  };

  const addLine = () => {
    const line = emptyLine();
    setForm((p) => ({ ...p, cargoLines: [...p.cargoLines, line] }));
    clearErr((k) => k === "cargoLines");
  };

  const removeLine = (id) => {
    setForm((p) =>
      p.cargoLines.length > 1
        ? { ...p, cargoLines: p.cargoLines.filter((l) => l.id !== id) }
        : p,
    );
    clearErr((k) => k.startsWith(`line.${id}.`));
  };

  const toggleHandling = (id, tag) => {
    const line = form.cargoLines.find((l) => l.id === id);
    if (!line) return;
    updateLine(id, {
      handling: line.handling.includes(tag)
        ? line.handling.filter((h) => h !== tag)
        : [...line.handling, tag],
    });
  };

  /* ---------- field behaviours ---------- */
  const changeMode = (mode) => {
    if (mode === form.mode) return;
    setForm((p) => ({
      ...p,
      mode,
      serviceType: "",
      origin: "",
      destination: "",
      carrier: "",
      incoterm:
        INCOTERMS.find((i) => i.value === p.incoterm)?.seaOnly && mode !== "Sea"
          ? ""
          : p.incoterm,
      pickupRequired: mode === "Road",
      deliveryRequired: mode === "Road",
      equipment: emptyEquipment(),
    }));
    setErrorList([]);
  };

  const changeService = (value) => {
    const s = getService(form.mode, value);
    setForm((p) => ({
      ...p,
      serviceType: value,
      pickupRequired: s?.door ? true : p.pickupRequired,
      deliveryRequired: s?.door ? true : p.deliveryRequired,
      equipment: { ...p.equipment, loadType: s?.loadType || "" },
    }));
    clearErr((k) => ["serviceType", "equipment.loadType"].includes(k));
  };

  const changeBranch = (branch) => {
    setForm((p) => {
      const c = customers.find((x) => x.id === p.customer);
      const ok = !c || c.branches.includes(branch);
      return {
        ...p,
        branch,
        ...(ok
          ? {}
          : {
              customer: "",
              billingCustomer:
                p.billingCustomer === p.customer ? "" : p.billingCustomer,
            }),
      };
    });
    clearErr((k) => ["branch", "customer"].includes(k));
  };

  const changeCustomer = (id) => {
    const c = customers.find((x) => x.id === id);
    setForm((p) => ({
      ...p,
      customer: id,
      billingCustomer: !id
        ? p.billingCustomer
        : !p.billingCustomer || p.billingCustomer === p.customer
          ? id
          : p.billingCustomer,
      salesperson: salesTouched.current
        ? p.salesperson
        : c?.salesperson || CURRENT_USER.id,
      commercial: {
        ...p.commercial,
        quotationRef: "",
        paymentTerms: c ? c.paymentTerms : p.commercial.paymentTerms,
      },
    }));
    clearErr((k) => ["customer", "billingCustomer", "credit"].includes(k));
  };

  const changeQuotation = (id) => {
    const q = quotations.find((x) => x.id === id);
    setForm((p) => ({
      ...p,
      commercial: {
        ...p.commercial,
        quotationRef: id,
        ...(q && !p.commercial.sellRate
          ? {
              sellRate: String(q.sell),
              sellCurrency: q.currency,
              currency: p.commercial.currency || q.currency,
            }
          : {}),
      },
    }));
  };

  /* ---------- documents ---------- */
  const addFiles = (fileList) => {
    const accepted = [];
    const rejected = [];
    Array.from(fileList || []).forEach((f) => {
      const ext = f.name.split(".").pop().toLowerCase();
      if (!ALLOWED_EXT.includes(ext))
        rejected.push(`${f.name}: unsupported file type`);
      else if (f.size > MAX_FILE_SIZE)
        rejected.push(`${f.name}: larger than 10 MB`);
      else if (
        form.docs.files.some(
          (d) =>
            d.name === f.name &&
            d.size === f.size &&
            d.category === docCategory,
        )
      )
        rejected.push(`${f.name}: already added`);
      else
        accepted.push({
          id: uid(),
          name: f.name,
          size: f.size,
          category: docCategory,
          file: f,
        });
    });
    if (accepted.length) {
      setForm((p) => ({
        ...p,
        docs: { ...p.docs, files: [...p.docs.files, ...accepted] },
      }));
      clearErr((k) => k === "docs.dg");
    }
    setUploadMsgs(rejected);
  };

  const removeFile = (id) =>
    setForm((p) => ({
      ...p,
      docs: { ...p.docs, files: p.docs.files.filter((f) => f.id !== id) },
    }));

  /* ---------- save / submit ---------- */
  const applySaved = (saved) => {
    const next = hydrate(saved);
    setForm(next);
    savedRef.current = next;
    baselineRef.current = snapshot(next);
    return next;
  };

  const runSave = async (action) => {
    if (busyRef.current || !editable) return null;

    const { list } = validateBooking(
      form,
      action === "submit" ? "submit" : "draft",
    );
    setErrorList(list);

    if (list.length) {
      const open = {};
      list.forEach((e) => {
        const m = /^line\.([^.]+)\.(length|width|height|hsCode)$/.exec(e.key);
        if (m) open[m[1]] = true;
      });
      setExpanded((p) => ({ ...p, ...open }));
      setNotice({
        type: "error",
        text: `Please fix ${list.length} issue${list.length > 1 ? "s" : ""} before ${
          action === "submit" ? "submitting" : "saving"
        }.`,
      });
      scrollToSection(list[0].section);
      return null;
    }

    busyRef.current = true;
    setBusy(action);
    try {
      const saved = await onSave(
        {
          ...form,
          clientRequestId: requestIdRef.current,
          status: action === "submit" ? "Submitted" : form.status,
        },
        { action },
      );
      return applySaved(saved);
    } catch (err) {
      setNotice({
        type: "error",
        text: err?.message || "Unable to save booking. Please try again.",
      });
      return null;
    } finally {
      busyRef.current = false;
      setBusy("");
    }
  };

  const handleSaveDraft = async () => {
    const saved = await runSave("draft");
    if (saved)
      setNotice({
        type: "success",
        text: `Draft saved as ${saved.bookingNo}.`,
      });
  };

  const handleSubmit = async () => {
    const saved = await runSave("submit");
    if (saved) {
      onNotify?.(`Booking ${saved.bookingNo} submitted for approval.`);
      onBack();
    }
  };

  const handleSaveNew = async () => {
    const saved = await runSave("draft");
    if (!saved) return;
    const fresh = emptyForm();
    setForm(fresh);
    savedRef.current = fresh;
    baselineRef.current = snapshot(fresh);
    requestIdRef.current = uid();
    salesTouched.current = false;
    setErrorList([]);
    setExpanded({});
    setNotice({
      type: "success",
      text: `${saved.bookingNo} saved. You can start a new booking.`,
    });
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    const base = form.id ? hydrate(savedRef.current) : emptyForm();
    setForm(base);
    baselineRef.current = snapshot(base);
    salesTouched.current = false;
    setErrorList([]);
    setExpanded({});
    setUploadMsgs([]);
    setModal(null);
    setNotice({ type: "success", text: "Unsaved changes cleared." });
  };

  const requestExit = () => {
    if (busyRef.current) return;
    if (dirty && editable) setModal({ kind: "discard" });
    else onBack();
  };

  const saveAndExit = async () => {
    const saved = await runSave("draft");
    if (saved) {
      setModal(null);
      onNotify?.(`Draft ${saved.bookingNo} saved.`);
      onBack();
    } else {
      setModal(null);
    }
  };

  const duplicateBooking = () => {
    const copy = hydrate({
      ...form,
      id: 0,
      bookingNo: "",
      status: "Draft",
      bookingDate: today(),
      carrierConfirmation: null,
      audit: [],
      cargoLines: form.cargoLines.map((l) => ({ ...l, id: uid() })),
      docs: { ...form.docs, files: [] },
    });
    setForm(copy);
    const blank = emptyForm();
    savedRef.current = blank;
    baselineRef.current = snapshot(blank); // copy counts as unsaved
    requestIdRef.current = uid();
    setErrorList([]);
    setNotice({
      type: "success",
      text: "Duplicated as a new draft. Review and save it.",
    });
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  };

  /* ---------- controlled status actions ---------- */
  const transition = async (status, label, values = {}, note = "") => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy("status");
    try {
      const extra =
        status === "Carrier Confirmed"
          ? {
              carrier: values.carrier || form.carrier,
              carrierConfirmation: {
                carrier: values.carrier || form.carrier,
                reference: values.reference,
                etd: values.etd,
                eta: values.eta,
                evidence: values.evidence,
                at: new Date().toISOString(),
                by: CURRENT_USER.name,
              },
            }
          : {};
      const saved = await onSave(
        { ...form, ...extra, clientRequestId: requestIdRef.current, status },
        { action: "status", label, note },
      );
      applySaved(saved);
      setModal(null);
      setNotice({
        type: "success",
        text: `${label}. Status is now ${status}.`,
      });
    } catch (err) {
      setNotice({
        type: "error",
        text: err?.message || "Action failed. Please try again.",
      });
    } finally {
      busyRef.current = false;
      setBusy("");
    }
  };

  const actionConfigs = {
    cancel: {
      title: "Cancel Booking",
      description:
        "Cancelling is a controlled action. The reason is recorded in the audit history.",
      confirmLabel: "Cancel Booking",
      danger: true,
      fields: [
        {
          name: "reason",
          label: "Cancellation reason",
          type: "textarea",
          required: true,
        },
      ],
      run: (v) => transition("Cancelled", "Booking cancelled", v, v.reason),
    },
    hold: {
      title: "Put Booking On Hold",
      confirmLabel: "Put On Hold",
      fields: [
        {
          name: "reason",
          label: "Reason for hold",
          type: "textarea",
          required: true,
        },
      ],
      run: (v) => transition("On Hold", "Booking put on hold", v, v.reason),
    },
    reject: {
      title: "Reject Booking",
      confirmLabel: "Reject Booking",
      danger: true,
      fields: [
        {
          name: "reason",
          label: "Rejection reason",
          type: "textarea",
          required: true,
        },
      ],
      run: (v) => transition("Rejected", "Booking rejected", v, v.reason),
    },
    amend: {
      title: "Amend Booking",
      description:
        "The booking becomes editable again and must be re-submitted for approval.",
      confirmLabel: "Start Amendment",
      fields: [
        {
          name: "reason",
          label: "Reason for amendment",
          type: "textarea",
          required: true,
        },
      ],
      run: (v) =>
        transition("Amendment Pending", "Amendment started", v, v.reason),
    },
    carrierConfirm: {
      title: "Record Carrier Confirmation",
      description:
        "Carrier confirmation needs the carrier's reference and evidence. Customer acceptance is not carrier confirmation.",
      confirmLabel: "Confirm with Carrier",
      fields: [
        {
          name: "carrier",
          label: "Carrier",
          type: "select",
          required: true,
          initial: form.carrier,
          options: carriers
            .filter((c) => c.active && c.modes.includes(form.mode))
            .map((c) => ({ value: c.id, label: c.name })),
        },
        {
          name: "reference",
          label: "Carrier booking reference",
          required: true,
          placeholder: "e.g. MAEU123456789",
        },
        {
          name: "etd",
          label: "Confirmed ETD",
          type: "date",
          initial: form.etd,
        },
        {
          name: "eta",
          label: "Confirmed ETA",
          type: "date",
          initial: form.eta,
        },
        {
          name: "evidence",
          label: "Confirmation evidence (email / PDF)",
          type: "file",
          required: true,
        },
      ],
      run: (v) =>
        transition(
          "Carrier Confirmed",
          "Carrier confirmed",
          v,
          `Reference ${v.reference}`,
        ),
    },
  };

  const menuItems = [
    { label: "Print Booking", icon: Printer, onClick: () => window.print() },
    {
      label: "Duplicate Booking",
      icon: Copy,
      onClick: duplicateBooking,
      disabled: !form.id,
    },
    {
      label: "View Audit History",
      icon: History,
      onClick: () => setModal({ kind: "audit" }),
    },
  ];
  const addStatusItem = (label, onClick, danger) =>
    menuItems.push({
      label,
      onClick,
      danger,
      divider: menuItems.every((m) => !m.divider),
    });
  if (form.id) {
    const s = form.status;
    if (s === "Submitted") {
      addStatusItem("Request Carrier Confirmation", () =>
        transition(
          "Pending Carrier Confirmation",
          "Carrier confirmation requested",
        ),
      );
      addStatusItem(
        "Reject Booking",
        () => setModal({ kind: "action", name: "reject" }),
        true,
      );
    }
    if (s === "Pending Carrier Confirmation")
      addStatusItem("Record Carrier Confirmation", () =>
        setModal({ kind: "action", name: "carrierConfirm" }),
      );
    if (["Submitted", "Pending Carrier Confirmation"].includes(s))
      addStatusItem("Put On Hold", () =>
        setModal({ kind: "action", name: "hold" }),
      );
    if (s === "On Hold")
      addStatusItem("Release Hold", () =>
        transition("Submitted", "Hold released"),
      );
    if (
      [
        "Submitted",
        "Pending Carrier Confirmation",
        "Carrier Confirmed",
      ].includes(s)
    )
      addStatusItem("Amend Booking", () =>
        setModal({ kind: "action", name: "amend" }),
      );
    if (!["Cancelled", "Rejected"].includes(s))
      addStatusItem(
        "Cancel Booking",
        () => setModal({ kind: "action", name: "cancel" }),
        true,
      );
  }

  /* ---------- sidebar data ---------- */
  const stepIndex = WORKFLOW_STEPS.findIndex((s) => s.status === form.status);
  const margin = (() => {
    const c = form.commercial;
    const sell = Number(c.sellRate);
    const buy = Number(c.buyRate);
    if (!sell || !buy || c.sellCurrency !== c.buyCurrency) return null;
    return {
      amount: sell - buy,
      pct: ((sell - buy) / sell) * 100,
      cur: c.sellCurrency,
    };
  })();

  const summaryRows = [
    ["Mode", form.mode],
    ["Service", form.serviceType || "-"],
    ["Origin", form.origin ? locationByCode(form.origin)?.code : "-"],
    [
      "Destination",
      form.destination ? locationByCode(form.destination)?.code : "-",
    ],
    ["ETD", form.etd || "-"],
    ["ETA", form.eta || "-"],
    ["Customer", customer?.name || "-"],
    ["Packages", totals.packageText],
    ["Gross Weight", totals.weightKg ? `${fmtNum(totals.weightKg)} kg` : "-"],
    ["Volume", totals.volumeM3 ? `${fmtNum(totals.volumeM3, 3)} m³` : "-"],
  ];

  const shownErrors = errorList.slice(0, 8);

  /* ---------- render ---------- */
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-gray-900">
      <div className="w-full px-3 pt-3 pb-0 sm:px-4 lg:px-5">
        {/* Header */}
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={requestExit}
              disabled={!!busy}
              aria-label="Go back"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ArrowLeft size={15} />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white sm:text-lg">
                  {form.id ? "Edit Booking" : "Create New Booking"}
                </h1>
                <StatusChip status={form.status} />
              </div>
              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">
                Booking No.:{" "}
                {form.bookingNo ? (
                  <span className="font-semibold text-blue-700 dark:text-blue-400">
                    {form.bookingNo}
                  </span>
                ) : (
                  "Auto-generated after first save"
                )}
              </p>
            </div>
          </div>

          <fieldset disabled={!editable} className="flex flex-wrap gap-2">
            <TextField
              label="Booking Date"
              required
              type="date"
              className="w-[140px]"
              value={form.bookingDate}
              onChange={(v) => set("bookingDate", v)}
              error={errors.bookingDate}
              disabled={!CURRENT_USER.canEditBookingDate || !editable}
            />
            <SelectField
              label="Branch"
              required
              className="w-[160px]"
              value={form.branch}
              onChange={changeBranch}
              options={branches.filter(
                (b) =>
                  CURRENT_USER.authorizedBranches.includes(b.value) ||
                  b.value === form.branch,
              )}
              error={errors.branch}
            />
            <Field label="Status" className="w-[150px]">
              <div className="flex h-[32px] items-center">
                <StatusChip status={form.status} />
              </div>
            </Field>
          </fieldset>
        </div>

        {/* Banners */}
        {notice && (
          <div
            role="status"
            className={`mb-2 flex items-start justify-between gap-2 rounded-md border px-3 py-2 text-[12px] ${
              notice.type === "error"
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {notice.type === "error" ? (
                <AlertTriangle size={13} />
              ) : (
                <CheckCircle2 size={13} />
              )}
              {notice.text}
            </span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Dismiss"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {!editable && (
          <div className="mb-2 flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-300">
            <Info size={13} />
            This booking is {form.status} and locked for editing. Use More
            Actions to amend, hold or cancel it.
          </div>
        )}

        {/* Section tabs */}
        <nav
          aria-label="Booking sections"
          className="sticky top-0 z-20 mb-2 flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white px-1.5 shadow-sm dark:border-gray-700/60 dark:bg-gray-900"
        >
          {sections.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollToSection(s.id)}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 py-2 text-[11px] font-semibold transition ${
                activeTab === s.id
                  ? "border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-300"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <s.icon size={13} />
              {i + 1}. {s.title}
              {errorList.some((e) => e.section === s.id) && (
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              )}
            </button>
          ))}
        </nav>

        <div className="grid grid-cols-1 items-start gap-2 lg:grid-cols-[minmax(0,1fr)_280px]">
          <fieldset disabled={!editable} className="min-w-0 space-y-2">
            {/* 1. Booking Details */}
            <Section
              id="details"
              icon={ClipboardList}
              title={titleOf("details")}
            >
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                <SelectField
                  label="Booking Type"
                  required
                  value={form.bookingType}
                  onChange={(v) => set("bookingType", v)}
                  options={BOOKING_TYPES}
                  error={errors.bookingType}
                />
                <LookupField
                  label="Customer"
                  required
                  className="lg:col-span-2"
                  value={form.customer}
                  onChange={changeCustomer}
                  options={customerOptions}
                  placeholder="Search active customers for this branch"
                  error={errors.customer}
                />
                <TextField
                  label="Customer Reference"
                  value={form.customerRef}
                  onChange={(v) => set("customerRef", v)}
                  placeholder="e.g. PO12345"
                />
              </div>

              <div className="mt-2.5">
                <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-gray-300">
                  Transport Mode<span className="ml-0.5 text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {modes.map((m) => (
                    <ModeButton
                      key={m.value}
                      {...m}
                      selected={form.mode === m.value}
                      onClick={changeMode}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                <SelectField
                  label="Service Type"
                  required
                  value={form.serviceType}
                  onChange={changeService}
                  options={(SERVICES[form.mode] || []).map((s) => s.value)}
                  error={errors.serviceType}
                />
                <SelectField
                  label="Salesperson"
                  required={false}
                  value={form.salesperson}
                  onChange={(v) => {
                    salesTouched.current = true;
                    set("salesperson", v);
                  }}
                  options={users}
                  error={errors.salesperson}
                  placeholder="Select user"
                />
                <SelectField
                  label="Operations Owner"
                  value={form.opsOwner}
                  onChange={(v) => set("opsOwner", v)}
                  options={users}
                  placeholder="Select user"
                />
              </div>
            </Section>

            {/* 2. Routing & Schedule */}
            <Section id="routing" icon={MapPin} title={titleOf("routing")}>
              <div className="mb-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <CheckBox
                  checked={form.pickupRequired}
                  onChange={(v) => set("pickupRequired", v)}
                  label="Pickup service (collect from shipper)"
                  hint="Makes place of receipt, pickup address and contact mandatory on submit"
                />
                <CheckBox
                  checked={form.deliveryRequired}
                  onChange={(v) => set("deliveryRequired", v)}
                  label="Delivery service (deliver to consignee)"
                  hint="Makes place of delivery, delivery address and contact mandatory on submit"
                />
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                <LookupField
                  label="Place of Receipt"
                  required={form.pickupRequired}
                  value={form.placeOfReceipt}
                  onChange={(v) => set("placeOfReceipt", v)}
                  options={inlandOptions}
                  placeholder="Depot / warehouse / door"
                  error={errors.placeOfReceipt}
                />
                <TextField
                  label="Requested ETD"
                  type="date"
                  value={form.etd}
                  onChange={(v) => set("etd", v)}
                  error={errors.etd}
                />
                <SelectField
                  label="Incoterm"
                  value={form.incoterm}
                  onChange={(v) => set("incoterm", v)}
                  options={incotermOptions}
                  error={errors.incoterm}
                  required={false}
                />

                <LookupField
                  label={portLabels[0]}
                  required
                  value={form.origin}
                  onChange={(v) => set("origin", v)}
                  options={gatewayOptions}
                  placeholder={`Search ${form.mode.toLowerCase()} locations`}
                  error={errors.origin}
                />
                <TextField
                  label="Requested ETA"
                  type="date"
                  min={form.etd || undefined}
                  value={form.eta}
                  onChange={(v) => set("eta", v)}
                  error={errors.eta}
                />
                <TextField
                  label="Incoterm Place"
                  value={form.incotermPlace}
                  onChange={(v) => set("incotermPlace", v)}
                  placeholder="e.g. Singapore"
                  error={errors.incotermPlace}
                />

                <LookupField
                  label={portLabels[1]}
                  required
                  value={form.destination}
                  onChange={(v) => set("destination", v)}
                  options={gatewayOptions}
                  placeholder={`Search ${form.mode.toLowerCase()} locations`}
                  error={errors.destination}
                />
                <LookupField
                  label="Carrier Preference"
                  value={form.carrier}
                  onChange={(v) => set("carrier", v)}
                  options={carrierOptions}
                  placeholder="Select carrier"
                />
                <TextField
                  label="Routing Preference"
                  value={form.routingPref}
                  onChange={(v) => set("routingPref", v)}
                  placeholder="e.g. Via Busan"
                />

                <LookupField
                  label="Place of Delivery"
                  required={form.deliveryRequired}
                  value={form.placeOfDelivery}
                  onChange={(v) => set("placeOfDelivery", v)}
                  options={inlandOptions}
                  placeholder="Depot / warehouse / door"
                  error={errors.placeOfDelivery}
                />
              </div>
            </Section>

            {/* 3. Parties */}
            <Section id="parties" icon={Users} title={titleOf("parties")}>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                <LookupField
                  label="Shipper"
                  required
                  value={form.shipper}
                  onChange={(v) => set("shipper", v, { pickupAddress: "" })}
                  options={partyOptions}
                  error={errors.shipper}
                />
                <LookupField
                  label="Consignee"
                  required
                  value={form.consignee}
                  onChange={(v) => set("consignee", v, { deliveryAddress: "" })}
                  options={partyOptions}
                  error={errors.consignee}
                />
                <LookupField
                  label="Notify Party"
                  value={form.notifyParty}
                  onChange={(v) => set("notifyParty", v)}
                  options={notifyOptions}
                  hint="Defaults to the consignee; change it independently if needed"
                />

                <LookupField
                  label="Pickup Address"
                  required={form.pickupRequired}
                  value={form.pickupAddress}
                  onChange={(v) => set("pickupAddress", v)}
                  options={addressOptionsFor(form.shipper)}
                  disabled={!form.shipper}
                  placeholder={
                    form.shipper ? "Select address" : "Select shipper first"
                  }
                  error={errors.pickupAddress}
                />
                <LookupField
                  label="Delivery Address"
                  required={form.deliveryRequired}
                  value={form.deliveryAddress}
                  onChange={(v) => set("deliveryAddress", v)}
                  options={addressOptionsFor(form.consignee)}
                  disabled={!form.consignee}
                  placeholder={
                    form.consignee ? "Select address" : "Select consignee first"
                  }
                  error={errors.deliveryAddress}
                />
                <LookupField
                  label="Billing Customer"
                  required
                  value={form.billingCustomer}
                  onChange={(v) => set("billingCustomer", v)}
                  options={billingOptions}
                  hint="Defaults to the booking customer"
                  error={errors.billingCustomer}
                />

                <TextField
                  label="Contact Person"
                  required={form.pickupRequired || form.deliveryRequired}
                  value={form.contactPerson}
                  onChange={(v) => set("contactPerson", v)}
                  placeholder="Name"
                  error={errors.contactPerson}
                />
                <TextField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => set("email", v)}
                  placeholder="name@company.com"
                  error={errors.email}
                />
                <TextField
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => set("phone", v)}
                  placeholder="+65 9876 5432"
                  error={errors.phone}
                />
              </div>
            </Section>

            {/* 4. Cargo */}
            <Section
              id="cargo"
              icon={Box}
              title={titleOf("cargo")}
              action={
                <button
                  type="button"
                  onClick={addLine}
                  className="inline-flex h-7 items-center gap-1 rounded-md border border-blue-200 bg-white px-2.5 text-[11px] font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-50 dark:border-blue-500/40 dark:bg-transparent dark:text-blue-300 dark:hover:bg-blue-500/10"
                >
                  <Plus size={12} />
                  Add Cargo Line
                </button>
              }
            >
              <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-gray-700/60">
                <table className="w-full min-w-[980px] text-left text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-gray-900/60 dark:text-gray-400">
                      <th className="w-8 px-2 py-2 font-semibold">#</th>
                      <th className="px-2 py-2 font-semibold">
                        Commodity Description *
                      </th>
                      <th className="w-[120px] px-2 py-2 font-semibold">
                        Pkg Type *
                      </th>
                      <th className="w-[80px] px-2 py-2 font-semibold">
                        Qty *
                      </th>
                      <th className="w-[160px] px-2 py-2 font-semibold">
                        Gross Weight *
                      </th>
                      <th className="w-[160px] px-2 py-2 font-semibold">
                        Volume{svc?.needsVolume ? " *" : ""}
                      </th>
                      <th className="w-[66px] px-2 py-2 font-semibold">DG</th>
                      <th className="w-[76px] px-2 py-2 font-semibold">
                        Reefer
                      </th>
                      <th className="w-[64px] px-2 py-2 text-center font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-gray-700/50">
                    {form.cargoLines.map((l, i) => {
                      const e = (f) => errors[`line.${l.id}.${f}`];
                      const cls = (f) => `${cellClass} ${e(f) ? errClass : ""}`;
                      const open = !!expanded[l.id];
                      return (
                        <Fragment key={l.id}>
                          <tr className="align-top">
                            <td className="px-2 py-2 text-slate-500 dark:text-gray-400">
                              {i + 1}
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                value={l.commodity}
                                onChange={(ev) =>
                                  updateLine(l.id, {
                                    commodity: ev.target.value,
                                  })
                                }
                                placeholder="e.g. Electronics (TV)"
                                title={e("commodity")}
                                aria-label={`Commodity ${i + 1}`}
                                className={cls("commodity")}
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <select
                                value={l.pkgType}
                                onChange={(ev) =>
                                  updateLine(l.id, { pkgType: ev.target.value })
                                }
                                title={e("pkgType")}
                                aria-label={`Package type ${i + 1}`}
                                className={cls("pkgType")}
                              >
                                <option value="">Select</option>
                                {PACKAGE_TYPES.map((p) => (
                                  <option key={p}>{p}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                min={0}
                                step={1}
                                value={l.qty}
                                onChange={(ev) =>
                                  updateLine(l.id, { qty: ev.target.value })
                                }
                                title={e("qty")}
                                aria-label={`Quantity ${i + 1}`}
                                className={cls("qty")}
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <div className="flex gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  step="any"
                                  value={l.weight}
                                  onChange={(ev) =>
                                    updateLine(l.id, {
                                      weight: ev.target.value,
                                    })
                                  }
                                  title={e("weight")}
                                  aria-label={`Gross weight ${i + 1}`}
                                  className={cls("weight")}
                                />
                                <select
                                  value={l.weightUom}
                                  onChange={(ev) =>
                                    updateLine(l.id, {
                                      weightUom: ev.target.value,
                                    })
                                  }
                                  aria-label="Weight unit"
                                  className={`${cellClass} !w-[56px] shrink-0 !px-1`}
                                >
                                  {WEIGHT_UOMS.map((u) => (
                                    <option key={u}>{u}</option>
                                  ))}
                                </select>
                              </div>
                            </td>
                            <td className="px-2 py-1.5">
                              <div className="flex gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  step="any"
                                  value={l.volume}
                                  onChange={(ev) =>
                                    updateLine(l.id, {
                                      volume: ev.target.value,
                                    })
                                  }
                                  title={e("volume")}
                                  aria-label={`Volume ${i + 1}`}
                                  className={cls("volume")}
                                />
                                <select
                                  value={l.volumeUom}
                                  onChange={(ev) =>
                                    updateLine(l.id, {
                                      volumeUom: ev.target.value,
                                    })
                                  }
                                  aria-label="Volume unit"
                                  className={`${cellClass} !w-[62px] shrink-0 !px-1`}
                                >
                                  {VOLUME_UOMS.map((u) => (
                                    <option key={u}>{u}</option>
                                  ))}
                                </select>
                              </div>
                            </td>
                            <td className="px-2 py-1.5">
                              <select
                                value={l.dg}
                                onChange={(ev) =>
                                  updateLine(l.id, { dg: ev.target.value })
                                }
                                aria-label={`Dangerous goods ${i + 1}`}
                                className={`${cellClass} ${l.dg === "Yes" ? "!border-orange-400 font-semibold text-orange-700 dark:text-orange-300" : ""}`}
                              >
                                <option>No</option>
                                <option>Yes</option>
                              </select>
                            </td>
                            <td className="px-2 py-1.5">
                              <select
                                value={l.reefer}
                                onChange={(ev) =>
                                  updateLine(l.id, { reefer: ev.target.value })
                                }
                                aria-label={`Reefer ${i + 1}`}
                                className={`${cellClass} ${l.reefer === "Yes" ? "!border-sky-400 font-semibold text-sky-700 dark:text-sky-300" : ""}`}
                              >
                                <option>No</option>
                                <option>Yes</option>
                              </select>
                            </td>
                            <td className="px-2 py-1.5">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpanded((p) => ({
                                      ...p,
                                      [l.id]: !p[l.id],
                                    }))
                                  }
                                  aria-expanded={open}
                                  aria-label="Toggle line details"
                                  title="Dimensions, HS code, handling, remarks"
                                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-blue-500/10"
                                >
                                  <ChevronDown
                                    size={13}
                                    className={`transition ${open ? "rotate-180" : ""}`}
                                  />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeLine(l.id)}
                                  disabled={form.cargoLines.length === 1}
                                  aria-label="Remove cargo line"
                                  title="Remove line"
                                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-red-500/10"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {open && (
                            <tr className="bg-slate-50/60 dark:bg-gray-900/30">
                              <td />
                              <td colSpan={8} className="px-2 py-2">
                                <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-6">
                                  {["length", "width", "height"].map((d) => (
                                    <TextField
                                      key={d}
                                      label={`${d[0].toUpperCase()}${d.slice(1)}`}
                                      type="number"
                                      value={l[d]}
                                      onChange={(v) =>
                                        updateLine(l.id, { [d]: v })
                                      }
                                      error={e(d)}
                                    />
                                  ))}
                                  <SelectField
                                    label="Dim. Unit"
                                    value={l.dimUom}
                                    onChange={(v) =>
                                      updateLine(l.id, { dimUom: v })
                                    }
                                    options={DIM_UOMS}
                                    placeholder="Unit"
                                  />
                                  <TextField
                                    label="HS Code"
                                    value={l.hsCode}
                                    onChange={(v) =>
                                      updateLine(l.id, { hsCode: v })
                                    }
                                    placeholder="e.g. 8528.72"
                                    error={e("hsCode")}
                                    className="col-span-2"
                                  />
                                </div>
                                <div className="mt-2">
                                  <p className="mb-1 text-[11px] font-medium text-slate-600 dark:text-gray-300">
                                    Special Handling
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {HANDLING.map((h) => {
                                      const on = l.handling.includes(h);
                                      return (
                                        <button
                                          type="button"
                                          key={h}
                                          aria-pressed={on}
                                          onClick={() =>
                                            toggleHandling(l.id, h)
                                          }
                                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition ${
                                            on
                                              ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                                              : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                          }`}
                                        >
                                          {h}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                                <TextField
                                  className="mt-2"
                                  label="Cargo Remarks"
                                  value={l.remarks}
                                  onChange={(v) =>
                                    updateLine(l.id, { remarks: v })
                                  }
                                  placeholder="Additional handling instructions"
                                />
                                {(l.dg === "Yes" || l.reefer === "Yes") && (
                                  <p className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-700 dark:text-amber-300">
                                    <AlertTriangle size={11} />
                                    {l.dg === "Yes" &&
                                      "Upload DG documents under Documents & Instructions. "}
                                    {l.reefer === "Yes" &&
                                      "Enter the reefer temperature in Equipment Details."}
                                  </p>
                                )}
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {errors.cargoLines && (
                <p className="mt-1 text-[10px] text-red-500">
                  {errors.cargoLines}
                </p>
              )}

              <div
                className={`mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2 ${
                  form.mode === "Air" ? "lg:grid-cols-4" : "lg:grid-cols-3"
                }`}
              >
                {[
                  ["Total Packages", totals.packageText],
                  [
                    "Total Gross Weight",
                    totals.weightKg ? `${fmtNum(totals.weightKg)} kg` : "-",
                  ],
                  [
                    "Total Volume",
                    totals.volumeM3 ? `${fmtNum(totals.volumeM3, 3)} m³` : "-",
                  ],
                  ...(form.mode === "Air"
                    ? [
                        [
                          "Chargeable Weight (est.)",
                          totals.chargeableKg
                            ? `${fmtNum(totals.chargeableKg, 1)} kg`
                            : "-",
                        ],
                      ]
                    : []),
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-md border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 dark:border-gray-700 dark:bg-gray-900/40"
                  >
                    <p className="text-[10px] font-medium text-slate-500 dark:text-gray-400">
                      {label}
                    </p>
                    <p
                      className="mt-0.5 truncate text-[12px] font-bold text-slate-900 dark:text-white"
                      title={value}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-2 flex items-start gap-1.5 rounded-md border border-blue-100 bg-blue-50/60 px-2.5 py-1.5 text-[10px] text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                <Info size={12} className="mt-px shrink-0" />
                <span>
                  Totals are calculated from the cargo lines; weights are
                  converted to kg and volumes to m³ before adding. Different
                  package types are shown as a breakdown.
                  {form.mode === "Air" &&
                    " Chargeable weight uses a 6000 cm³/kg volumetric divisor and is subject to carrier confirmation."}
                </span>
              </p>
            </Section>

            {/* 5. Equipment */}
            {showEquipment && (
              <Section
                id="equipment"
                icon={Package}
                title={titleOf("equipment")}
                subtitle={
                  needsEquipment
                    ? "Container numbers and seals are captured later in the shipment screen."
                    : "Required because the cargo is marked as reefer."
                }
              >
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {needsEquipment && (
                    <>
                      <SelectField
                        label="Load Type"
                        required
                        value={form.equipment.loadType}
                        onChange={(v) => setGroup("equipment", "loadType", v)}
                        options={["FCL", "LCL"]}
                        error={errors["equipment.loadType"]}
                      />
                      <SelectField
                        label="Container Type"
                        required={form.equipment.loadType === "FCL"}
                        value={form.equipment.containerType}
                        onChange={(v) =>
                          setGroup("equipment", "containerType", v)
                        }
                        options={CONTAINER_TYPES}
                        error={errors["equipment.containerType"]}
                      />
                      <TextField
                        label="Container Quantity"
                        required={form.equipment.loadType === "FCL"}
                        type="number"
                        step={1}
                        value={form.equipment.containerQty}
                        onChange={(v) =>
                          setGroup("equipment", "containerQty", v)
                        }
                        error={errors["equipment.containerQty"]}
                      />
                    </>
                  )}

                  <Field
                    label="Reefer Temperature"
                    required={hasReefer}
                    error={errors["equipment.reeferTemp"]}
                  >
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        step="any"
                        value={form.equipment.reeferTemp}
                        placeholder="-18"
                        onChange={(e) =>
                          setGroup("equipment", "reeferTemp", e.target.value)
                        }
                        className={`${inputClass} ${errors["equipment.reeferTemp"] ? errClass : ""}`}
                      />
                      <div className="relative w-[76px] shrink-0">
                        <select
                          value={form.equipment.tempUnit}
                          onChange={(e) =>
                            setGroup("equipment", "tempUnit", e.target.value)
                          }
                          className={`${inputClass} appearance-none pr-6`}
                        >
                          <option>°C</option>
                          <option>°F</option>
                        </select>
                        <ChevronDown
                          size={12}
                          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                      </div>
                    </div>
                  </Field>

                  {needsEquipment && (
                    <>
                      <SelectField
                        label="Equipment Preference"
                        value={form.equipment.equipPref}
                        onChange={(v) => setGroup("equipment", "equipPref", v)}
                        options={EQUIPMENT_PREFS}
                      />
                      <SelectField
                        label="Container Allocation"
                        value={form.equipment.containerAlloc}
                        onChange={(v) =>
                          setGroup("equipment", "containerAlloc", v)
                        }
                        options={CONTAINER_ALLOCATIONS}
                      />
                    </>
                  )}
                </div>
              </Section>
            )}

            {/* 6. Commercial */}
            <Section
              id="commercial"
              icon={DollarSign}
              title={titleOf("commercial")}
            >
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                <SelectField
                  label="Freight Payment Terms"
                  required
                  value={form.commercial.freightTerms}
                  onChange={(v) => setGroup("commercial", "freightTerms", v)}
                  options={FREIGHT_TERMS}
                  error={errors["commercial.freightTerms"]}
                />
                <SelectField
                  label="Quotation Reference"
                  value={form.commercial.quotationRef}
                  onChange={changeQuotation}
                  options={quotationOptions}
                  disabled={!form.customer}
                  placeholder={
                    !form.customer
                      ? "Select customer first"
                      : quotationOptions.length
                        ? "Select quotation"
                        : "No quotations"
                  }
                />
                <AmountField
                  label="Sell Rate"
                  currency={form.commercial.sellCurrency}
                  amount={form.commercial.sellRate}
                  onCurrency={(v) => setGroup("commercial", "sellCurrency", v)}
                  onAmount={(v) => setGroup("commercial", "sellRate", v)}
                  error={errors["commercial.sellRate"]}
                />
                <AmountField
                  label="Buy Rate (carrier cost estimate)"
                  currency={form.commercial.buyCurrency}
                  amount={form.commercial.buyRate}
                  onCurrency={(v) => setGroup("commercial", "buyCurrency", v)}
                  onAmount={(v) => setGroup("commercial", "buyRate", v)}
                  error={errors["commercial.buyRate"]}
                />
                <SelectField
                  label="Payment Terms"
                  value={form.commercial.paymentTerms}
                  onChange={(v) => setGroup("commercial", "paymentTerms", v)}
                  options={PAYMENT_TERMS}
                />
                <SelectField
                  label="Currency"
                  required={
                    form.commercial.sellRate !== "" ||
                    form.commercial.buyRate !== ""
                  }
                  value={form.commercial.currency}
                  onChange={(v) => setGroup("commercial", "currency", v)}
                  options={CURRENCIES}
                  error={errors["commercial.currency"]}
                />

                <Field label="Credit Check Status" error={errors.credit}>
                  <div className="flex h-[32px] items-center">
                    {customer ? (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${creditStyles[customer.credit]}`}
                      >
                        {customer.credit === "Approved" ? (
                          <CheckCircle2 size={11} />
                        ) : (
                          <AlertTriangle size={11} />
                        )}
                        {customer.credit}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        Select a customer
                      </span>
                    )}
                  </div>
                </Field>
                <TextAreaField
                  label="Commercial Remarks"
                  className="sm:col-span-1 lg:col-span-2"
                  rows={2}
                  value={form.commercial.remarks}
                  onChange={(v) => setGroup("commercial", "remarks", v)}
                  placeholder="Special pricing or approval comments"
                />
              </div>
              {margin && (
                <p className="mt-2 text-[11px] text-slate-600 dark:text-gray-300">
                  Estimated margin:{" "}
                  <span
                    className={`font-semibold ${margin.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {margin.cur} {fmtNum(margin.amount)} (
                    {fmtNum(margin.pct, 1)}%)
                  </span>
                </p>
              )}
            </Section>

            {/* 7. Documents & Instructions */}
            <Section
              id="documents"
              icon={FileText}
              title={titleOf("documents")}
            >
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div>
                  <SelectField
                    label="Document Type"
                    value={docCategory}
                    onChange={(v) => setDocCategory(v || DOC_CATEGORIES[0])}
                    options={DOC_CATEGORIES}
                    placeholder="Document type"
                  />
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      addFiles(e.dataTransfer.files);
                    }}
                    className={`mt-2 flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-3 py-5 text-center transition ${
                      dragOver
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                        : "border-slate-300 bg-slate-50/60 dark:border-gray-700 dark:bg-gray-900/40"
                    }`}
                  >
                    <Upload
                      size={18}
                      className="text-blue-600 dark:text-blue-400"
                    />
                    <p className="mt-1 text-[11px] text-slate-600 dark:text-gray-300">
                      Drag and drop files here or{" "}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="font-semibold text-blue-600 underline dark:text-blue-400"
                      >
                        click to upload
                      </button>
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      PDF, JPG, PNG, DOC, DOCX (max 10 MB each)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      hidden
                      accept={ALLOWED_EXT.map((x) => `.${x}`).join(",")}
                      onChange={(e) => {
                        addFiles(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </div>

                  {errors["docs.dg"] && (
                    <p className="mt-1 text-[10px] text-red-500">
                      {errors["docs.dg"]}
                    </p>
                  )}
                  {hasDG &&
                    !errors["docs.dg"] &&
                    !form.docs.files.some(
                      (f) => f.category === "DG Documents",
                    ) && (
                      <p className="mt-1 text-[10px] text-amber-700 dark:text-amber-300">
                        Dangerous goods selected: upload DG Documents before
                        submitting.
                      </p>
                    )}
                  {uploadMsgs.length > 0 && (
                    <ul className="mt-1 space-y-0.5 text-[10px] text-red-500">
                      {uploadMsgs.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  )}

                  {form.docs.files.length > 0 && (
                    <ul className="mt-2 divide-y divide-slate-100 rounded-md border border-slate-200 dark:divide-gray-700/50 dark:border-gray-700/60">
                      {form.docs.files.map((f) => (
                        <li
                          key={f.id}
                          className="flex items-center justify-between gap-2 px-2.5 py-1.5"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <FileText
                              size={13}
                              className="shrink-0 text-slate-400"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-[11px] font-medium text-slate-800 dark:text-gray-100">
                                {f.name}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-gray-400">
                                {f.category} · {fmtSize(f.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(f.id)}
                            aria-label={`Remove ${f.name}`}
                            className="text-slate-400 hover:text-red-600"
                          >
                            <Trash2 size={13} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-2.5">
                  <TextAreaField
                    label="Pickup Instructions"
                    rows={2}
                    value={form.docs.pickupInstructions}
                    onChange={(v) => setGroup("docs", "pickupInstructions", v)}
                    placeholder="e.g. Please call before arrival"
                  />
                  <TextAreaField
                    label="Delivery Instructions"
                    rows={2}
                    value={form.docs.deliveryInstructions}
                    onChange={(v) =>
                      setGroup("docs", "deliveryInstructions", v)
                    }
                    placeholder="e.g. Deliver to warehouse gate 2"
                  />
                  <TextAreaField
                    label="Internal Remarks"
                    rows={2}
                    value={form.docs.internalRemarks}
                    onChange={(v) => setGroup("docs", "internalRemarks", v)}
                    placeholder="Internal only - not included in customer documents"
                  />
                </div>
              </div>
            </Section>
          </fieldset>

          {/* Sidebar */}
          <aside className="space-y-2 lg:sticky lg:top-14">
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-gray-700/60 dark:bg-gray-800/40">
              <h3 className="mb-2 text-[12px] font-semibold text-slate-900 dark:text-white">
                Booking Summary
              </h3>
              <dl className="space-y-1.5 text-[11px]">
                {summaryRows.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-slate-500 dark:text-gray-400">{k}</dt>
                    <dd
                      className="truncate text-right font-medium text-slate-800 dark:text-gray-100"
                      title={String(v)}
                    >
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-gray-700/60 dark:bg-gray-800/40">
              <h3 className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-slate-900 dark:text-white">
                <Info size={13} className="text-blue-600" />
                Validation Messages
              </h3>
              {errorList.length === 0 ? (
                <p className="rounded-md bg-blue-50 px-2.5 py-2 text-[10px] text-blue-800 dark:bg-blue-500/10 dark:text-blue-300">
                  Please complete all mandatory fields before submitting. Save
                  Draft only needs customer and mode.
                </p>
              ) : (
                <ul className="space-y-1">
                  {shownErrors.map((e) => (
                    <li key={e.key}>
                      <button
                        type="button"
                        onClick={() => scrollToSection(e.section)}
                        className="flex w-full items-start gap-1.5 rounded-md bg-red-50 px-2 py-1 text-left text-[10px] text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300"
                      >
                        <AlertTriangle size={11} className="mt-px shrink-0" />
                        {e.message}
                      </button>
                    </li>
                  ))}
                  {errorList.length > shownErrors.length && (
                    <li className="px-1 text-[10px] text-slate-500">
                      +{errorList.length - shownErrors.length} more
                    </li>
                  )}
                </ul>
              )}
              {customer?.credit === "Warning" && (
                <p className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-50 px-2 py-1.5 text-[10px] text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                  <AlertTriangle size={11} className="mt-px shrink-0" />
                  Credit warning for {customer.name}. Review before approval.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-gray-700/60 dark:bg-gray-800/40">
              <h3 className="mb-2 text-[12px] font-semibold text-slate-900 dark:text-white">
                Status Workflow
              </h3>
              <ol className="space-y-1.5">
                {WORKFLOW_STEPS.map((s, i) => {
                  const current = i === stepIndex;
                  const done = stepIndex > i;
                  return (
                    <li
                      key={s.status}
                      className={`flex items-start gap-2 rounded-md px-2 py-1.5 ${
                        current ? "bg-blue-50 dark:bg-blue-500/10" : ""
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          current
                            ? "bg-blue-600 text-white"
                            : done
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-100 text-slate-400 dark:bg-gray-800"
                        }`}
                      >
                        {done ? <Check size={11} /> : i + 1}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block text-[11px] font-semibold ${
                            current
                              ? "text-blue-700 dark:text-blue-300"
                              : "text-slate-700 dark:text-gray-200"
                          }`}
                        >
                          {s.label}
                        </span>
                        <span className="block text-[10px] text-slate-500 dark:text-gray-400">
                          {s.status === "Carrier Confirmed" &&
                          form.carrierConfirmation?.reference
                            ? `Ref ${form.carrierConfirmation.reference}`
                            : current && s.status === "Draft"
                              ? s.sub
                              : s.sub.replace(
                                  "Current status / editable",
                                  "Editable booking",
                                )}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-2 rounded-md bg-slate-50 px-2.5 py-1.5 text-[10px] text-slate-600 dark:bg-gray-900/50 dark:text-gray-300">
                {stepIndex === -1 ? (
                  <>
                    Current: <StatusChip status={form.status} />
                  </>
                ) : (
                  "Alternative transitions:"
                )}{" "}
                Rejected, On Hold, Cancelled, Amendment Pending.
              </div>
              <p className="mt-2 text-[10px] text-slate-500 dark:text-gray-400">
                Carrier confirmation does not mark cargo as shipped. Departure,
                arrival and delivery are tracked as separate shipment
                milestones.
              </p>
            </div>
          </aside>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 z-20 -mx-3 mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2 sm:-mx-4 sm:px-4 lg:-mx-5 lg:px-5 dark:border-gray-800 dark:bg-gray-900">
          <button
            type="button"
            onClick={() => setModal({ kind: "reset" })}
            disabled={!!busy || !editable || !dirty}
            className={btnOutline}
          >
            <RotateCcw size={12} />
            Reset
          </button>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {editable && (
              <>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={!!busy}
                  className={btnOutline}
                >
                  <Save size={12} />
                  {busy === "draft" ? "Saving..." : "Save Draft"}
                </button>
                <button
                  type="button"
                  onClick={handleSaveNew}
                  disabled={!!busy}
                  className={btnOutline}
                >
                  <Plus size={12} />
                  Save & New
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!!busy}
                  className={btnPrimary}
                >
                  <Send size={12} />
                  {busy === "submit" ? "Submitting..." : "Submit Booking"}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => scrollToSection("documents")}
              className={btnOutline}
            >
              <Paperclip size={12} />
              Attachments
              {form.docs.files.length > 0 && (
                <span className="rounded-full bg-blue-600 px-1.5 text-[10px] text-white">
                  {form.docs.files.length}
                </span>
              )}
            </button>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                disabled={!!busy}
                className={btnOutline}
              >
                <MoreHorizontal size={13} />
                More Actions
                <ChevronDown size={12} />
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute bottom-full right-0 mb-1 w-60 rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
                >
                  {menuItems.map((m) => (
                    <Fragment key={m.label}>
                      {m.divider && (
                        <div className="my-1 border-t border-slate-100 dark:border-gray-700/60" />
                      )}
                      <button
                        type="button"
                        role="menuitem"
                        disabled={m.disabled}
                        onClick={() => {
                          setMenuOpen(false);
                          m.onClick();
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-800 ${
                          m.danger
                            ? "text-red-600 dark:text-red-400"
                            : "text-slate-700 dark:text-gray-200"
                        }`}
                      >
                        {m.icon && <m.icon size={13} />}
                        {m.label}
                      </button>
                    </Fragment>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={requestExit}
              disabled={!!busy}
              className={btnOutline}
            >
              <X size={12} />
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {modal?.kind === "reset" && (
        <Modal
          title="Reset form?"
          onClose={() => setModal(null)}
          footer={
            <>
              <button
                type="button"
                className={btnOutline}
                onClick={() => setModal(null)}
              >
                Keep editing
              </button>
              <button
                type="button"
                className={`${btnBase} bg-red-600 text-white hover:bg-red-700`}
                onClick={handleReset}
              >
                Reset
              </button>
            </>
          }
        >
          <p className="text-[12px] text-slate-600 dark:text-gray-300">
            {form.id
              ? "All unsaved changes will be discarded and the last saved version restored."
              : "All entered data will be cleared."}
          </p>
        </Modal>
      )}

      {modal?.kind === "discard" && (
        <Modal
          title="Unsaved changes"
          onClose={() => setModal(null)}
          footer={
            <>
              <button
                type="button"
                className={btnOutline}
                onClick={() => setModal(null)}
              >
                Keep editing
              </button>
              <button
                type="button"
                className={`${btnBase} border border-red-300 bg-white text-red-600 hover:bg-red-50 dark:bg-transparent`}
                onClick={() => {
                  setModal(null);
                  onBack();
                }}
              >
                Discard
              </button>
              <button
                type="button"
                className={btnPrimary}
                onClick={saveAndExit}
                disabled={!!busy}
              >
                <Save size={12} />
                {busy ? "Saving..." : "Save draft & exit"}
              </button>
            </>
          }
        >
          <p className="text-[12px] text-slate-600 dark:text-gray-300">
            You have unsaved changes. Save them as a draft or discard them
            before leaving.
          </p>
        </Modal>
      )}

      {modal?.kind === "action" && actionConfigs[modal.name] && (
        <ActionModal
          key={modal.name}
          config={actionConfigs[modal.name]}
          busy={busy === "status"}
          onClose={() => setModal(null)}
          onSubmit={actionConfigs[modal.name].run}
        />
      )}

      {modal?.kind === "audit" && (
        <Modal
          wide
          title={`Audit History${form.bookingNo ? ` - ${form.bookingNo}` : ""}`}
          onClose={() => setModal(null)}
          footer={
            <button
              type="button"
              className={btnOutline}
              onClick={() => setModal(null)}
            >
              Close
            </button>
          }
        >
          {form.audit.length === 0 ? (
            <p className="text-[12px] text-slate-500 dark:text-gray-400">
              No activity recorded yet. Save the booking to start the audit
              trail.
            </p>
          ) : (
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-gray-400">
                  <th className="py-1.5 pr-2 font-semibold">When</th>
                  <th className="py-1.5 pr-2 font-semibold">User</th>
                  <th className="py-1.5 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-700/50">
                {[...form.audit].reverse().map((a) => (
                  <tr key={a.id}>
                    <td className="whitespace-nowrap py-1.5 pr-2 text-slate-600 dark:text-gray-300">
                      {fmtDateTime(a.at)}
                    </td>
                    <td className="whitespace-nowrap py-1.5 pr-2 text-slate-600 dark:text-gray-300">
                      {a.by}
                    </td>
                    <td className="py-1.5 text-slate-800 dark:text-gray-100">
                      <span className="font-semibold">{a.action}</span>
                      {a.note && (
                        <span className="text-slate-500 dark:text-gray-400">
                          {" "}
                          - {a.note}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal>
      )}
    </div>
  );
};

export default BookingForm;
