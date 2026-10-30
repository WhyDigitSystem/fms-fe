import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Box,
  Calendar as CalendarIcon,
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
  CURRENT_USER,
  DIM_UOMS,
  DOC_CATEGORIES,
  EQUIPMENT_PREFS,
  FREIGHT_TERMS,
  HANDLING,
  MAX_FILE_SIZE,
  PACKAGE_TYPES,
  PAYMENT_TERMS,
  SERVICES,
  VOLUME_UOMS,
  WEIGHT_UOMS,
  WORKFLOW_STEPS,
  BOOKING_TYPES,
  branches,
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
  snapshot,
  statusDots,
  statusStyles,
  today,
  uid,
  users,
  validateBooking,
} from "./bookingData";
import BookingAPI from "../../../api/sales/bookingAPI";
import QuotationAPI from "../../../api/sales/quotationAPI";
import currencyAPI from "../../../api/currencyAPI";
import EnquiryAPI from "../../../api/sales/enquiryAPI";

/* ------------------------------------------------------------------ */
/* Styling tokens                                                      */
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

// -------------------------------------------------------------
// Date Helpers
// -------------------------------------------------------------
const pad2 = (n) => String(n).padStart(2, "0");

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const isoToDisplay = (value) => {
  if (value == null || value === "") return "";
  const s = String(value).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  if (/^\d{2}-\d{2}-\d{4}$/.test(s)) return s;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
  }
  return s;
};

const displayToIso = (value) => {
  if (value == null || value === "") return "";
  const s = String(value).trim();
  const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    const d = Number(dd);
    const mo = Number(mm);
    const y = Number(yyyy);
    if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12 && y >= 1900 && y <= 3000) {
      return `${yyyy}-${mm}-${dd}`;
    }
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return "";
};

const formatTyping = (val) => {
  const digits = val.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
};

const plainText = (v) => {
  if (v == null || v === "") return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (typeof v === "object") {
    if (v.city) return String(v.city);
    if (v.portName) return String(v.portName);
    if (v.currencyName) return String(v.currencyName);
    if (v.branchCode) return String(v.branchCode);
    if (v.customerName) return String(v.customerName);
    if (v.id != null) return String(v.id);
    return "";
  }
  return "";
};

const plainId = (v) => {
  if (v == null || v === "") return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (typeof v === "object" && v.id != null) return String(v.id);
  return "";
};

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

/* ✅ Custom DatePickerField that visually shows dd-mm-yyyy */
const DatePickerField = ({
  label,
  required,
  error,
  onChange,
  value, // display format dd-mm-yyyy
  disabled,
  className = "",
}) => {
  const hiddenDateRef = useRef(null);

  const handleTextChange = (e) => {
    const formatted = formatTyping(e.target.value);
    onChange?.(formatted);
  };

  const handleNativeDate = (e) => {
    const iso = e.target.value;
    if (iso) onChange?.(isoToDisplay(iso));
  };

  return (
    <Field label={label} required={required} error={error} className={className}>
      <div className="relative">
        <input
          type="text"
          placeholder="dd-mm-yyyy"
          value={value ?? ""}
          disabled={disabled}
          onChange={handleTextChange}
          aria-invalid={!!error}
          aria-required={required || undefined}
          className={`${inputClass} pr-8 ${error ? errClass : ""}`}
        />
        {!disabled && (
          <button
            type="button"
            onClick={() => hiddenDateRef.current?.showPicker()}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-200"
            aria-label="Open date picker"
          >
            <CalendarIcon size={13} />
          </button>
        )}
        <input
          type="date"
          ref={hiddenDateRef}
          className="absolute bottom-0 right-0 h-0 w-0 opacity-0 pointer-events-none"
          tabIndex={-1}
          value={displayToIso(value) || ""}
          onChange={handleNativeDate}
        />
      </div>
    </Field>
  );
};

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

/* ✅ Searchable combobox */
const SearchableSelectField = ({
  label,
  required,
  error,
  value,
  onChange,
  options = [],
  placeholder = "Search...",
  disabled,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [rect, setRect] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedLabel = useMemo(() => {
    const found = options.find((opt) => {
      const val = typeof opt === "string" ? opt : opt.value;
      return String(val) === String(value);
    });
    if (!found) return "";
    return typeof found === "string" ? found : found.label;
  }, [options, value]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const list = t
      ? options.filter((opt) => {
        const text =
          typeof opt === "string" ? opt : `${opt.label} ${opt.value}`;
        return text.toLowerCase().includes(t);
      })
      : options;
    return list.slice(0, 100);
  }, [options, q]);

  const updateRect = () => {
    if (inputRef.current) {
      setRect(inputRef.current.getBoundingClientRect());
    }
  };

  useEffect(() => {
    const onDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onScroll = () => {
      if (open) updateRect();
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  const handleFocus = () => {
    updateRect();
    setQ("");
    setOpen(true);
  };

  return (
    <Field label={label} required={required} error={error} className={className}>
      <div className="relative" ref={containerRef}>
        <input
          ref={inputRef}
          type="text"
          value={open ? q : selectedLabel}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          aria-required={required || undefined}
          onFocus={handleFocus}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            updateRect();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              e.currentTarget.blur();
            }
            if (e.key === "Enter" && open && filtered.length === 1) {
              e.preventDefault();
              const opt = filtered[0];
              onChange?.(typeof opt === "string" ? opt : opt.value);
              setOpen(false);
              e.currentTarget.blur();
            }
          }}
          className={`${inputClass} pr-14 ${error ? "!border-red-500" : ""
            }`}
        />
        {value && !disabled && (
          <button
            type="button"
            aria-label="Clear selection"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onChange?.("");
              setOpen(false);
            }}
            className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-200"
          >
            <X size={12} />
          </button>
        )}
        <ChevronDown
          size={12}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
        />

        {open && rect && (
          <ul
            style={{
              position: "fixed",
              top: rect.bottom + 4,
              left: rect.left,
              width: rect.width,
              zIndex: 9999,
            }}
            className="max-h-52 overflow-auto rounded-md border border-slate-200 bg-white py-1 text-[11px] shadow-lg dark:border-gray-700 dark:bg-gray-900"
          >
            {filtered.length === 0 ? (
              <li className="px-2.5 py-2 text-slate-500 dark:text-gray-400">
                No matches
              </li>
            ) : (
              filtered.map((opt) => {
                const val = typeof opt === "string" ? opt : opt.value;
                const lbl = typeof opt === "string" ? opt : opt.label;
                return (
                  <li key={val}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        onChange?.(val);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left hover:bg-blue-50 dark:hover:bg-blue-500/10 ${String(val) === String(value)
                          ? "bg-blue-50/60 font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                          : "text-slate-700 dark:text-gray-200"
                        }`}
                    >
                      <span className="truncate">{lbl}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
    </Field>
  );
};

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

const AmountField = ({
  label,
  error,
  currency,
  currencyOptions = [],
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
          {currencyOptions.length === 0 ? (
            <option value="">—</option>
          ) : (
            currencyOptions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))
          )}
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
    className={`relative flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${selected
        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500/40 dark:bg-blue-500/10"
        : "border-slate-300 bg-white hover:border-slate-400 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
      }`}
  >
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${selected
          ? "bg-blue-600 text-white"
          : "bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-gray-400"
        }`}
    >
      <Icon size={14} />
    </span>
    <span className="min-w-0">
      <span
        className={`block text-[12px] font-semibold ${selected
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
    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${statusStyles[status] || statusStyles.Draft
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
      className={`w-full ${wide ? "max-w-2xl" : "max-w-md"
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
            className={`${btnBase} text-white ${config.danger
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

const BookingForm = ({ editData, onBack, onSaveSuccess, onNotify }) => {
  const initial = useMemo(
    () => (editData ? hydrate(editData) : emptyForm()),
    [],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  const [form, setForm] = useState(() => {
    const base = editData ? hydrate(editData) : emptyForm();
    return {
      ...base,
      bookingDate: isoToDisplay(base.bookingDate),
      etd: isoToDisplay(base.etd),
      eta: isoToDisplay(base.eta),
    };
  });

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

  const [loadingDocId, setLoadingDocId] = useState(false);
  const [recordLoading, setRecordLoading] = useState(false);

  const [quotationRecords, setQuotationRecords] = useState([]);
  const [quotationLoading, setQuotationLoading] = useState(false);

  /* ✅ currency master list */
  const [currencyList, setCurrencyList] = useState([]);
  const [ports, setPorts] = useState([]);

  const savedRef = useRef(initial);
  const baselineRef = useRef(snapshot(initial));
  const busyRef = useRef(false);
  const salesTouched = useRef(false);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  const orgId = parseInt(localStorage.getItem("orgId")) || 1000000001;
  const branchId = parseInt(localStorage.getItem("branchId")) || orgId;
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";

  /* ---------- derived ---------- */
  const svc = getService(form.mode, form.serviceType);
  const customer = customers.find((c) => c.id === form.customer);
  const editable = true;
  const hasReefer =
    form.cargoLines.some((l) => l.reefer === "Yes") || !!svc?.reefer;
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

  const isFlowBooking = form.bookingSource === "Flow";

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

  const quotationOptions = useMemo(
    () =>
      quotationRecords.map((q) => ({
        value: String(q.id),
        label: q.docId || `Quotation ${q.id}`,
        sub: q.docDate ? isoToDisplay(q.docDate) : undefined,
      })),
    [quotationRecords],
  );

  const currencyOptions = useMemo(
    () =>
      currencyList.map((c) => ({
        value: c.id != null ? String(c.id) : c.currency,
        label: c.currency,
      })),
    [currencyList],
  );

  const findCurrencyByCode = (code) => {
    if (!code) return "";
    const found = currencyList.find(
      (c) => String(c.currency || "").toUpperCase() === String(code).toUpperCase(),
    );
    return found ? (found.id != null ? String(found.id) : found.currency) : "";
  };

  const currencyCodeFor = (value) => {
    const found = currencyList.find(
      (c) => String(c.id) === String(value) || String(c.currency) === String(value),
    );
    return found?.currency || value || "";
  };

  // ✅ Port options for the searchable select based on selected mode
  const portOptions = useMemo(() => {
    const modeUpper = String(form.mode || "").trim().toUpperCase();
    return ports
      .filter((p) => {
        const pType = String(p?.portType || "").trim().toUpperCase();
        return pType === modeUpper;
      })
      .map((p) => ({
        value: String(p.id),
        label: `${p.portName} (${p.portCode})`,
      }));
  }, [ports, form.mode]);

  const portLabels = {
    Sea: ["Origin (Port / ICD)", "Destination (Port / ICD)"],
    Air: ["Origin (Airport)", "Destination (Airport)"],
    Road: ["Origin (Terminal / Depot)", "Destination (Terminal / Depot)"],
  }[form.mode];

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

  /* ---------- ✅ Fetch currencies & ports ---------- */
  useEffect(() => {
    const run = async () => {
      try {
        const [currData, portData] = await Promise.all([
          currencyAPI.getAllCurrencies(orgId),
          EnquiryAPI.getPortByOrgIdAndBranch(orgId, branchId)
        ]);
        setCurrencyList(Array.isArray(currData) ? currData : []);
        setPorts(Array.isArray(portData) ? portData : []);
      } catch (err) {
        console.error("Failed to fetch currencies/ports:", err);
      }
    };
    run();
  }, [orgId, branchId]);

  /* ---------- DocId on create ---------- */
  useEffect(() => {
    const fetchDocId = async () => {
      if (form.id) return;
      try {
        setLoadingDocId(true);
        const docId = await BookingAPI.getBookingDocId(orgId);
        setForm((p) => ({ ...p, bookingNo: docId || "" }));
      } catch (err) {
        console.error("Failed to fetch booking docId:", err);
      } finally {
        setLoadingDocId(false);
      }
    };
    fetchDocId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, form.id]);

  /* ---------- Full record on edit ---------- */
  useEffect(() => {
    const fetchRecord = async () => {
      if (!editData?.id) return;

      try {
        setRecordLoading(true);
        const response = await BookingAPI.getBookingById(editData.id);
        if (!response) return;

        const record =
          response?.paramObjectsMap?.bookingVO ||
          response?.bookingVO ||
          response;

        if (!record) {
          setNotice({ type: "error", text: "Booking record not found." });
          return;
        }

        const routing = record.routingDetails?.[0] || {};
        const party = record.partyDetails?.[0] || {};
        const commercial = record.commercialDetails?.[0] || {};
        const equipment = record.equipmentDetails?.[0] || {};
        const instruction = record.instructionDetails?.[0] || {};

        const cargoLines = (record.cargoDetails || []).map((c) => ({
          id: uid(),
          commodity: c.commodityDescription || "",
          pkgType: c.packageType || "",
          qty: c.packageCount?.toString() || "",
          weight: c.grossWeight?.toString() || "",
          weightUom: c.weightUnit || "kg",
          volume: c.volume?.toString() || "",
          volumeUom: c.volumeUnit === "CBM" ? "m³" : c.volumeUnit || "m³",
          length: c.length?.toString() || "",
          width: c.width?.toString() || "",
          height: c.height?.toString() || "",
          dimUom: c.dimensionUnit || "cm",
          hsCode: "",
          dg: c.hazardous ? "Yes" : "No",
          reefer: c.equipmentType === "Reefer" ? "Yes" : "No",
          handling: [],
          remarks: c.remarks || "",
        }));

        const existingFiles = (record.instructionDetails || [])
          .filter((d) => d.document)
          .map((d) => ({
            id: uid(),
            name: d.originalName || d.fileName || "Document",
            size: d.fileSize || 0,
            category: d.documentType || DOC_CATEGORIES[0],
            url: d.document,
            file: null,
            isExisting: true,
            uploadedOn: d.uploadOn || null,
            contentType: d.contentType || null,
          }));

        setForm({
          id: record.id,
          bookingNo: record.docId || "",
          bookingDate: isoToDisplay(record.docDate || today()),
          branch: record.branch?.branchCode || CURRENT_USER.branch,
          status: record.bookingStatus || "Draft",
          bookingType: record.bookingType || "Export",
          bookingSource: record.bookingSource || "Direct",
          quotationNo: record.quotationNo || "",
          quotationDate: isoToDisplay(record.quotationDate || ""),
          mode: record.transportMode || "Sea",
          serviceType: record.serviceType || "",
          customer: record.customer || "",
          customerRef: record.customerReference || "",
          salesperson: record.salesperson || "",
          opsOwner: record.operationsOwner || "",

          pickupRequired: !!routing.placeOfReceipt,
          deliveryRequired: !!routing.placeOfDelivery,
          placeOfReceipt: routing.placeOfReceipt || "",
          origin: routing.originPort ? String(routing.originPort) : "",
          destination: routing.destinationPort ? String(routing.destinationPort) : "",
          placeOfDelivery: routing.placeOfDelivery || "",
          etd: isoToDisplay(routing.requestedETD || ""),
          eta: isoToDisplay(routing.requestedETA || ""),
          carrier: routing.carrierPreference || "",
          routingPref: routing.routingPreference || "",
          incoterm: routing.incoterm || "",
          incotermPlace: "",

          shipper: party.shipper || "",
          consignee: party.consignee || "",
          notifyParty: party.notifyParty || "",
          billingCustomer: party.billingCustomer || "",
          pickupAddress: party.pickupAddress || "",
          deliveryAddress: party.deliveryAddress || "",
          contactPerson: party.contactPerson || "",
          email: party.email || "",
          phone: party.phone || "",

          cargoLines: cargoLines.length ? cargoLines : [emptyLine()],

          equipment: {
            loadType: equipment.equipmentType === "LCL" ? "LCL" : "FCL",
            containerType: equipment.containerType || "",
            containerQty: equipment.quantity?.toString() || "",
            reeferTemp: equipment.temperatureMin?.toString() || "",
            tempUnit: "°C",
            equipPref: equipment.specialEquipment
              ? "Special Equipment"
              : "Standard",
            containerAlloc: "Pending",
          },

          commercial: {
            freightTerms: commercial.freightPaymentTerms || "",
            quotationRef: commercial.quotationReference || "",
            sellCurrency:
              findCurrencyByCode(commercial.sellCurrency) ||
              commercial.sellCurrency ||
              "",
            sellRate: commercial.sellRate?.toString() || "",
            buyCurrency:
              findCurrencyByCode(commercial.buyCurrency) ||
              commercial.buyCurrency ||
              "",
            buyRate: commercial.buyRate?.toString() || "",
            currency:
              findCurrencyByCode(commercial.sellCurrency) ||
              commercial.sellCurrency ||
              "",
            paymentTerms: commercial.paymentTerms || "",
            remarks: commercial.commercialRemarks || "",
          },

          docs: {
            files: existingFiles,
            pickupInstructions: instruction.pickupInstructions || "",
            deliveryInstructions: instruction.deliveryInstructions || "",
            internalRemarks: instruction.internalRemarks || "",
          },
          carrierConfirmation: null,
          audit: [],
        });

        savedRef.current = record;
      } catch (error) {
        console.error("Error fetching booking:", error);
        setNotice({ type: "error", text: "Failed to load booking details." });
      } finally {
        setRecordLoading(false);
      }
    };
    fetchRecord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id, currencyList.length]);

  /* ---------- Fetch quotations when Flow chosen ---------- */
  useEffect(() => {
    if (!isFlowBooking || quotationRecords.length) return;
    const run = async () => {
      try {
        setQuotationLoading(true);
        const res = await QuotationAPI.getQuotationByOrgIdAndBranch(
          branchId,
          orgId,
        );
        setQuotationRecords(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("Failed to load quotations:", err);
      } finally {
        setQuotationLoading(false);
      }
    };
    run();
  }, [isFlowBooking, quotationRecords.length, branchId, orgId]);

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

  const changeBookingSource = (source) => {
    if (source === form.bookingSource) return;
    setForm((p) => ({
      ...p,
      bookingSource: source,
      quotationNo: "",
      quotationDate: "",
    }));
    setErrorList([]);
  };

  /* ---------- Apply a quotation → fill the booking ---------- */
  const applyQuotation = (quotationId) => {
    const q = quotationRecords.find((x) => String(x.id) === String(quotationId));
    if (!q) {
      setForm((p) => ({ ...p, quotationNo: quotationId, quotationDate: "" }));
      return;
    }

    const qMode = String(q.shipmentMode || "").toUpperCase();
    const mode =
      qMode === "SEA"
        ? "Sea"
        : qMode === "AIR"
          ? "Air"
          : qMode === "ROAD"
            ? "Road"
            : form.mode;

    const originTerminalId = plainId(q.originPort) || plainId(q.originTerminal);
    const destinationTerminalId = plainId(q.destinationPort) || plainId(q.destinationTerminal);

    const ci = q.customerInformation?.[0] || {};
    const quoteCustomerName = ci.customerName || q.companyName || "";

    const matchedCustomer = customers.find(
      (c) =>
        String(c.name || "").trim().toLowerCase() ===
        String(quoteCustomerName || "").trim().toLowerCase(),
    );

    const cargoLines = (q.shippingDetails || []).map((s) => ({
      id: uid(),
      commodity: s.cargoDescription || s.cargoType || "",
      pkgType: "",
      qty: s.quantity != null ? String(s.quantity) : "",
      weight: s.packageWeight != null ? String(s.packageWeight) : "",
      weightUom: s.weightUnit || "kg",
      volume: s.totalVolumeCbm != null ? String(s.totalVolumeCbm) : "",
      volumeUom: "m³",
      length: s.length != null ? String(s.length) : "",
      width: s.width != null ? String(s.width) : "",
      height: s.height != null ? String(s.height) : "",
      dimUom: s.dimensionUnit || "cm",
      hsCode: "",
      dg: "No",
      reefer: "No",
      handling: [],
      remarks: s.cargoType || "",
    }));

    const ct = q.commercialTerms?.[0] || {};
    const qCurrencyCode = plainText(q.currency);

    setForm((p) => ({
      ...p,
      bookingSource: "Flow",
      quotationNo: String(q.id),
      quotationDate: isoToDisplay(q.docDate),

      mode,
      serviceType: q.serviceType || "",

      customer: matchedCustomer?.id || p.customer,
      billingCustomer: matchedCustomer?.id || p.billingCustomer,
      customerRef: q.enquiryNo ? `ENQ-${q.enquiryNo}` : p.customerRef,

      origin: originTerminalId || p.origin,
      destination: destinationTerminalId || p.destination,

      contactPerson: ci.customerName || p.contactPerson,
      email: ci.customerEmail || p.email,
      phone: ci.customerPhone || p.phone,

      incoterm: q.incoterm || p.incoterm,
      commercial: {
        ...p.commercial,
        paymentTerms: q.paymentTerms || p.commercial.paymentTerms,
        sellCurrency:
          findCurrencyByCode(qCurrencyCode) || p.commercial.sellCurrency,
        currency:
          findCurrencyByCode(qCurrencyCode) || p.commercial.currency,
        remarks: q.remarks || p.commercial.remarks,
        quotationRef: String(q.id),
        sellRate:
          ct.airlineQuotationTotal != null
            ? String(ct.airlineQuotationTotal)
            : p.commercial.sellRate,
      },

      cargoLines: cargoLines.length ? cargoLines : [emptyLine()],
      customerDisplayName: quoteCustomerName,
    }));

    setErrorList([]);
    setNotice({
      type: "success",
      text: `Quotation ${q.docId || q.id} applied to the booking.`,
    });
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
          isExisting: false,
        });
    });
    if (accepted.length) {
      setForm((p) => ({
        ...p,
        docs: { ...p.docs, files: [...p.docs.files, ...accepted] },
      }));
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

    validateBooking(form, action === "submit" ? "submit" : "draft");

    busyRef.current = true;
    setBusy(action);

    try {
      const isUpdate = Boolean(form.id && form.id > 0);

      const apiPayload = {
        orgId,
        createdBy: loginUserName,
        branch: Number(form.branch) || orgId,
        bookingStatus:
          action === "submit" ? "Submitted" : form.status || "Draft",
        bookingType: form.bookingType || "Standard",
        bookingSource: form.bookingSource || "Direct",
        quotationNo: form.quotationNo || "",
        quotationDate: displayToIso(form.quotationDate) || null,
        transportMode: form.mode || "",
        serviceType: form.serviceType || "",
        salesperson: form.salesperson || "",
        operationsOwner: form.opsOwner || "",
        customer: form.customer || "",
        customerReference: form.customerRef || "",
        remarks: form.commercial?.remarks || "",
        bookingNo: form.bookingNo || "",

        routingDetails: [
          {
            carrierPreference: form.carrier || "",
            originPort: Number(form.origin) || 0,
            destinationPort: Number(form.destination) || 0,
            incoterm: form.incoterm || "",
            placeOfDelivery: form.placeOfDelivery || "",
            placeOfReceipt: form.placeOfReceipt || "",
            requestedETA: displayToIso(form.eta) || null,
            requestedETD: displayToIso(form.etd) || null,
            routingPreference: form.routingPref || "",
          },
        ],

        partyDetails: [
          {
            billingCustomer: form.billingCustomer || "",
            consignee: form.consignee || "",
            contactPerson: form.contactPerson || "",
            deliveryAddress: form.deliveryAddress || "",
            email: form.email || "",
            notifyParty: form.notifyParty || "",
            phone: form.phone || "",
            pickupAddress: form.pickupAddress || "",
            shipper: form.shipper || "",
          },
        ],

        cargoDetails: (form.cargoLines || []).map((line) => ({
          commodityDescription: line.commodity || "",
          dimensionUnit: line.dimUom || "cm",
          grossWeight: Number(line.weight) || 0,
          hazardous: line.dg === "Yes",
          hazardousClass: "",
          height: Number(line.height) || 0,
          length: Number(line.length) || 0,
          marksAndNumbers: "",
          netWeight: 0,
          packageCount: Number(line.qty) || 0,
          packageType: line.pkgType || "",
          remarks: line.remarks || "",
          unNumber: "",
          volume: Number(line.volume) || 0,
          volumeUnit: line.volumeUom === "m³" ? "CBM" : line.volumeUom || "CBM",
          weightUnit: line.weightUom || "kg",
          width: Number(line.width) || 0,
        })),

        equipmentDetails: [
          {
            containerNumber: "",
            containerType: form.equipment?.containerType || "",
            equipmentSize: "",
            equipmentType: form.equipment?.equipPref || "",
            humidityRequired: false,
            humidityValue: 0,
            isoCode: "",
            quantity: Number(form.equipment?.containerQty) || 0,
            remarks: "",
            specialEquipment: false,
            temperatureMax: 0,
            temperatureMin: 0,
            temperatureRequired: !!form.equipment?.reeferTemp,
            ventilationRequired: false,
            ventilationValue: 0,
          },
        ],

        commercialDetails: [
          {
            buyCurrency: currencyCodeFor(form.commercial?.buyCurrency) || "USD",
            buyRate: Number(form.commercial?.buyRate) || 0,
            commercialRemarks: form.commercial?.remarks || "",
            creditCheckStatus: "Approved",
            freightPaymentTerms: form.commercial?.freightTerms || "",
            paymentTerms: form.commercial?.paymentTerms || "",
            quotationReference: form.commercial?.quotationRef || "",
            sellCurrency:
              currencyCodeFor(form.commercial?.sellCurrency) || "USD",
            sellRate: Number(form.commercial?.sellRate) || 0,
          },
        ],

        instructionDetails: [
          {
            commercialInvoice: "",
            customerReferenceDocument: "",
            dangerousGoodsDocument: "",
            deliveryInstructions: form.docs?.deliveryInstructions || "",
            internalRemarks: form.docs?.internalRemarks || "",
            packingList: "",
            pickupInstructions: form.docs?.pickupInstructions || "",
          },
        ],
      };

      if (isUpdate) apiPayload.id = form.id;

      const filesToUpload = (form.docs?.files || [])
        .map((f) => f.file)
        .filter(Boolean);

      const res = await BookingAPI.createUpdateBooking(
        apiPayload,
        filesToUpload,
      );
      const body = res?.data ?? res;

      if (!body?.status && body?.statusFlag !== "Ok") {
        throw new Error(
          body?.paramObjectsMap?.message || "Failed to save booking",
        );
      }

      const serverId =
        body?.paramObjectsMap?.bookingId || form.id || Math.max(0, 0) + 1;
      const serverBookingNo =
        body?.paramObjectsMap?.bookingNo ||
        form.bookingNo ||
        `BKG/26-27/${String(serverId).padStart(4, "0")}`;

      const savedData = {
        ...form,
        id: serverId,
        bookingNo: serverBookingNo,
        status: apiPayload.bookingStatus,
      };

      const next = applySaved(savedData);

      onNotify?.(
        action === "submit"
          ? `Booking ${next.bookingNo} submitted for approval.`
          : `Draft saved as ${next.bookingNo}.`,
      );

      return next;
    } catch (err) {
      console.error(err);
      setNotice({
        type: "error",
        text:
          err?.response?.data?.paramObjectsMap?.message ||
          err?.message ||
          "Unable to save booking. Please try again.",
      });
      return null;
    } finally {
      busyRef.current = false;
      setBusy("");
    }
  };

  const handleSaveDraft = async () => {
    await runSave("draft");
  };

  const handleSubmit = async () => {
    const saved = await runSave("submit");
    if (saved) onBack();
  };

  const handleSaveNew = async () => {
    const saved = await runSave("draft");
    if (!saved) return;
    const fresh = emptyForm();
    setForm(fresh);
    savedRef.current = fresh;
    baselineRef.current = snapshot(fresh);
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
    baselineRef.current = snapshot(blank);
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

      setForm((p) => ({ ...p, ...extra, status }));

      const saved = await runSave("draft");

      if (saved) {
        setModal(null);
        setNotice({
          type: "success",
          text: `${label}. Status is now ${status}.`,
        });
      }
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
          type: "text",
          required: true,
          initial: form.carrier,
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
    if (!sell || !buy) return null;
    return {
      amount: sell - buy,
      pct: ((sell - buy) / sell) * 100,
      cur: currencyCodeFor(c.sellCurrency) || "",
    };
  })();

  const summaryRows = [
    ["Mode", form.mode],
    ["Service", form.serviceType || "-"],
    ["Origin", form.origin || "-"],
    ["Destination", form.destination || "-"],
    ["ETD", form.etd || "-"],
    ["ETA", form.eta || "-"],
    [
      "Customer",
      isFlowBooking
        ? form.customerDisplayName || customer?.name || "-"
        : customer?.name || "-",
    ],
    ["Packages", totals.packageText],
    ["Gross Weight", totals.weightKg ? `${fmtNum(totals.weightKg)} kg` : "-"],
    ["Volume", totals.volumeM3 ? `${fmtNum(totals.volumeM3, 3)} m³` : "-"],
  ];

  const shownErrors = errorList.slice(0, 8);

  /* ---------- loading gate ---------- */
  if (loadingDocId || recordLoading) {
    return (
      <div className="flex h-[90dvh] w-full items-center justify-center bg-slate-50 dark:bg-gray-950">
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
          Loading booking...
        </div>
      </div>
    );
  }

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

          <fieldset className="flex flex-wrap gap-2">
            <TextField
              label="Booking No"
              value={form.bookingNo}
              placeholder={loadingDocId ? "Loading..." : "Auto-generated"}
              disabled
              error={errors.bookingNo}
              className="w-[180px]"
            />
            <DatePickerField
              label="Booking Date"
              required
              className="w-[140px]"
              value={form.bookingDate}
              onChange={(v) => set("bookingDate", v)}
              error={errors.bookingDate}
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
            className={`mb-2 flex items-start justify-between gap-2 rounded-md border px-3 py-2 text-[12px] ${notice.type === "error"
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
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 py-2 text-[11px] font-semibold transition ${activeTab === s.id
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
          <fieldset className="min-w-0 space-y-2">
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

                <SelectField
                  label="Booking Source"
                  required
                  value={form.bookingSource || "Direct"}
                  onChange={changeBookingSource}
                  options={[
                    { value: "Direct", label: "Direct" },
                    { value: "Flow", label: "Flow" },
                  ]}
                  error={errors.bookingSource}
                />

                <TextField
                  label="Customer"
                  required
                  className="lg:col-span-2"
                  value={
                    isFlowBooking
                      ? form.customerDisplayName || customer?.name || ""
                      : form.customerDisplayName || customer?.name || form.customer || ""
                  }
                  onChange={(v) => {
                    if (isFlowBooking) return;
                    const matched = customers.find(
                      (c) =>
                        String(c.name || "").trim().toLowerCase() ===
                        String(v || "").trim().toLowerCase(),
                    );
                    setForm((p) => ({
                      ...p,
                      customerDisplayName: v,
                      customer: matched?.id || p.customer,
                      billingCustomer: matched?.id || p.billingCustomer,
                    }));
                  }}
                  placeholder={
                    isFlowBooking
                      ? "Auto-filled from quotation"
                      : "Enter customer name"
                  }
                  disabled={isFlowBooking}
                  error={errors.customer}
                />

                <TextField
                  label="Customer Reference"
                  value={form.customerRef}
                  onChange={(v) => set("customerRef", v)}
                  placeholder="e.g. PO12345"
                />

                {isFlowBooking && (
                  <>
                    <SelectField
                      label="Quotation No"
                      required
                      value={form.quotationNo}
                      onChange={applyQuotation}
                      options={quotationOptions}
                      placeholder={
                        quotationLoading
                          ? "Loading quotations..."
                          : quotationOptions.length
                            ? "Select quotation"
                            : "No quotations available"
                      }
                      disabled={quotationLoading || !quotationOptions.length}
                      error={errors.quotationNo}
                    />
                    <TextField
                      label="Quotation Date"
                      value={form.quotationDate || ""}
                      placeholder="Auto-filled"
                      disabled
                      className="lg:col-span-1"
                    />
                  </>
                )}
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
                <TextField
                  label="Salesperson"
                  value={form.salesperson}
                  onChange={(v) => {
                    salesTouched.current = true;
                    set("salesperson", v);
                  }}
                  placeholder="Enter salesperson"
                  error={errors.salesperson}
                />
                <TextField
                  label="Operations Owner"
                  value={form.opsOwner}
                  onChange={(v) => set("opsOwner", v)}
                  placeholder="Enter operations owner"
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
                <TextField
                  label="Place of Receipt"
                  required={form.pickupRequired}
                  value={form.placeOfReceipt}
                  onChange={(v) => set("placeOfReceipt", v)}
                  placeholder="Depot / warehouse / door"
                  error={errors.placeOfReceipt}
                />
                <DatePickerField
                  label="Requested ETD"
                  value={form.etd}
                  onChange={(v) => set("etd", v)}
                  error={errors.etd}
                />
                <TextField
                  label="Incoterm"
                  value={form.incoterm}
                  onChange={(v) => set("incoterm", v)}
                  placeholder="e.g. FOB"
                  error={errors.incoterm}
                />

                <SearchableSelectField
                  label={portLabels[0]}
                  required
                  value={form.origin}
                  onChange={(v) => set("origin", v)}
                  options={portOptions}
                  placeholder="Search port"
                  error={errors.origin}
                />
                <DatePickerField
                  label="Requested ETA"
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

                <SearchableSelectField
                  label={portLabels[1]}
                  required
                  value={form.destination}
                  onChange={(v) => set("destination", v)}
                  options={portOptions}
                  placeholder="Search port"
                  error={errors.destination}
                />
                <TextField
                  label="Carrier Preference"
                  value={form.carrier}
                  onChange={(v) => set("carrier", v)}
                  placeholder="Enter carrier"
                />
                <TextField
                  label="Routing Preference"
                  value={form.routingPref}
                  onChange={(v) => set("routingPref", v)}
                  placeholder="e.g. Via Busan"
                />

                <TextField
                  label="Place of Delivery"
                  required={form.deliveryRequired}
                  value={form.placeOfDelivery}
                  onChange={(v) => set("placeOfDelivery", v)}
                  placeholder="Depot / warehouse / door"
                  error={errors.placeOfDelivery}
                />
              </div>
            </Section>

            {/* 3. Parties */}
            <Section id="parties" icon={Users} title={titleOf("parties")}>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                <TextField
                  label="Shipper"
                  required
                  value={form.shipper}
                  onChange={(v) => set("shipper", v, { pickupAddress: "" })}
                  placeholder="Shipper name"
                  error={errors.shipper}
                />
                <TextField
                  label="Consignee"
                  required
                  value={form.consignee}
                  onChange={(v) => set("consignee", v, { deliveryAddress: "" })}
                  placeholder="Consignee name"
                  error={errors.consignee}
                />
                <TextField
                  label="Notify Party"
                  value={form.notifyParty}
                  onChange={(v) => set("notifyParty", v)}
                  placeholder="Notify party name"
                  hint="Defaults to the consignee if left blank"
                />

                <TextField
                  label="Pickup Address"
                  required={form.pickupRequired}
                  value={form.pickupAddress}
                  onChange={(v) => set("pickupAddress", v)}
                  placeholder="Pickup address"
                  error={errors.pickupAddress}
                />
                <TextField
                  label="Delivery Address"
                  required={form.deliveryRequired}
                  value={form.deliveryAddress}
                  onChange={(v) => set("deliveryAddress", v)}
                  placeholder="Delivery address"
                  error={errors.deliveryAddress}
                />
                <TextField
                  label="Billing Customer"
                  required
                  value={form.billingCustomer}
                  onChange={(v) => set("billingCustomer", v)}
                  placeholder="Billing customer"
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
                  disabled={isFlowBooking}
                />
                <TextField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => set("email", v)}
                  placeholder="name@company.com"
                  error={errors.email}
                  disabled={isFlowBooking}
                />
                <TextField
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => set("phone", v)}
                  placeholder="+65 9876 5432"
                  error={errors.phone}
                  disabled={isFlowBooking}
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
                                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition ${on
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
                className={`mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2 ${form.mode === "Air" ? "lg:grid-cols-4" : "lg:grid-cols-3"
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
                <AmountField
                  label="Sell Rate"
                  currency={form.commercial.sellCurrency}
                  currencyOptions={currencyOptions}
                  amount={form.commercial.sellRate}
                  onCurrency={(v) => setGroup("commercial", "sellCurrency", v)}
                  onAmount={(v) => setGroup("commercial", "sellRate", v)}
                  error={errors["commercial.sellRate"]}
                />
                <AmountField
                  label="Buy Rate (carrier cost estimate)"
                  currency={form.commercial.buyCurrency}
                  currencyOptions={currencyOptions}
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
                  options={currencyOptions}
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
                        No matching customer record
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
                    className={`mt-2 flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-3 py-5 text-center transition ${dragOver
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
                              {f.url ? (
                                <a
                                  href={f.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  title={f.name}
                                  className="block truncate text-[11px] font-medium text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  {f.name}
                                </a>
                              ) : (
                                <p
                                  className="truncate text-[11px] font-medium text-slate-800 dark:text-gray-100"
                                  title={f.name}
                                >
                                  {f.name}
                                </p>
                              )}
                              <p className="text-[10px] text-slate-500 dark:text-gray-400">
                                {f.category} · {fmtSize(f.size)}
                                {f.isExisting && " · uploaded"}
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
                      className={`flex items-start gap-2 rounded-md px-2 py-1.5 ${current ? "bg-blue-50 dark:bg-blue-500/10" : ""
                        }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${current
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
                          className={`block text-[11px] font-semibold ${current
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
                        className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-800 ${m.danger
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