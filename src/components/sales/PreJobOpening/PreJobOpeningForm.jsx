import { useEffect, useMemo, useRef, useState } from "react";
import {
    AlertTriangle,
    ArrowLeft,
    Box,
    Calendar as CalendarIcon,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    ClipboardList,
    Clock,
    FileText,
    Info,
    MapPin,
    Package,
    Paperclip,
    PauseCircle,
    Plane,
    Plus,
    Ruler,
    Save,
    Ship,
    Sparkles,
    Train,
    Trash2,
    Truck,
    Upload,
    User,
    Weight,
    X,
    XCircle,
    Zap,
    Building2,
    CircleDot,
    ExternalLink,
} from "lucide-react";
import BookingAPI from "../../../api/sales/bookingAPI";
import EnquiryAPI from "../../../api/sales/enquiryAPI";
import PreJobAPI from "../../../api/sales/preJobAPI";

/* ------------------------------------------------------------------ */
/* Tokens                                                              */
/* ------------------------------------------------------------------ */

const inputClass =
    "h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[12px] text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:hover:border-gray-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20 dark:disabled:bg-gray-800 dark:disabled:text-gray-200 dark:[color-scheme:dark]";

const cellClass =
    "h-7 w-full rounded border border-transparent bg-transparent px-1.5 text-[11.5px] text-slate-800 outline-none transition-colors hover:border-slate-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-800 dark:text-gray-100 dark:hover:border-gray-700 dark:focus:border-indigo-400 dark:focus:bg-gray-900 dark:disabled:bg-gray-800 dark:disabled:text-gray-200";

const errClass =
    "!border-rose-400 !bg-rose-50/50 focus:!border-rose-500 focus:!ring-rose-500/10 dark:!border-rose-500/60 dark:!bg-rose-500/5";

const btnBase =
    "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-[12px] font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-900";

const btnOutline = `${btnBase} border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-800`;

const btnPrimary = `${btnBase} bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-[0_1px_2px_rgba(79,70,229,0.25),0_2px_8px_-2px_rgba(79,70,229,0.3)] hover:from-indigo-600 hover:to-indigo-700 focus-visible:ring-indigo-400`;

const btnSuccess = `${btnBase} bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_1px_2px_rgba(16,185,129,0.25),0_2px_8px_-2px_rgba(16,185,129,0.3)] hover:from-emerald-600 hover:to-emerald-700 focus-visible:ring-emerald-400`;

const btnGhost = `${btnBase} text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-300 dark:text-gray-300 dark:hover:bg-gray-800`;

/* ------------------------------------------------------------------ */
/* ✅ Dynamic modes from localStorage                                 */
/* ------------------------------------------------------------------ */

const titleCase = (v) =>
    String(v || "")
        .toLowerCase()
        .replace(/(^|\s)\S/g, (s) => s.toUpperCase());

const MODE_ICON_MAP = {
    SEA: Ship,
    OCEAN: Ship,
    AIR: Plane,
    ROAD: Truck,
    RAIL: Train,
    RAILWAY: Train,
};

const getModeIcon = (mode) => {
    const key = String(mode || "").trim().toUpperCase();
    return MODE_ICON_MAP[key] || Truck;
};

const buildModesFromStorage = () => {
    try {
        const raw = localStorage.getItem("companyModes");
        const stored = raw ? JSON.parse(raw) : [];

        if (Array.isArray(stored) && stored.length > 0) {
            return stored
                .filter((m) => m && m.mode)
                .map((m) => ({
                    value: titleCase(m.mode),
                    apiValue: String(m.mode).toUpperCase(),
                    id: String(m.id || ""),
                    icon: getModeIcon(m.mode),
                    label: titleCase(m.mode),
                }));
        }
    } catch (error) {
        console.error("Failed to read companyModes from localStorage:", error);
    }

    return [
        { value: "Air", apiValue: "AIR", id: "", icon: Plane, label: "Air" },
        { value: "Sea", apiValue: "SEA", id: "", icon: Ship, label: "Sea" },
        { value: "Road", apiValue: "ROAD", id: "", icon: Truck, label: "Road" },
    ];
};

/* ------------------------------------------------------------- */
/* Date & Number helpers                                         */
/* ------------------------------------------------------------- */
const pad2 = (n) => String(n).padStart(2, "0");

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
    if (!value) return "";
    const m = String(value).match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    return "";
};

const formatTyping = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
};

const toNum = (v) => {
    if (v === "" || v == null) return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

const plainId = (v) => {
    if (v == null || v === "") return "";
    if (typeof v === "string" || typeof v === "number") return String(v);
    if (typeof v === "object" && v.id != null) return String(v.id);
    return "";
};

const plainText = (v) => {
    if (v == null || v === "") return "";
    if (typeof v === "string" || typeof v === "number") return String(v);
    if (typeof v === "object") {
        if (v.city) return String(v.city);
        if (v.portName) return String(v.portName);
        if (v.customerName) return String(v.customerName);
        if (v.branchCode) return String(v.branchCode);
        if (v.id != null) return String(v.id);
        return "";
    }
    return "";
};

const portId = (p) => {
    if (p == null || p === "") return "";
    if (typeof p === "string" || typeof p === "number") return String(p);
    if (typeof p === "object" && p.id != null) return String(p.id);
    return "";
};

const portLabel = (p) => {
    if (p == null || p === "") return "";
    if (typeof p === "string" || typeof p === "number") return String(p);
    if (typeof p === "object") {
        const name = p.portName || p.city || "";
        const code = p.portCode ? ` (${p.portCode})` : "";
        return `${name}${code}`.trim();
    }
    return "";
};

/* ------------------------------------------------------------- */
/* Primitives                                                    */
/* ------------------------------------------------------------- */

const Field = ({ label, required, error, hint, className = "", children }) => (
    <div className={`min-w-0 ${className}`}>
        {label && (
            <label className="mb-1 flex items-center gap-0.5 text-[11px] font-medium text-slate-600 dark:text-gray-300">
                {label}
                {required && <span className="text-rose-500">*</span>}
            </label>
        )}
        {children}
        {error ? (
            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400">
                <AlertTriangle size={9} />
                {error}
            </p>
        ) : (
            hint && (
                <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">
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
    icon: Icon,
    ...rest
}) => (
    <Field label={label} required={required} error={error} hint={hint} className={className}>
        <div className="relative">
            {Icon && (
                <Icon
                    size={12}
                    className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500"
                />
            )}
            <input
                type={type}
                value={value ?? ""}
                onChange={(e) => onChange?.(e.target.value)}
                className={`${inputClass} ${Icon ? "pl-7" : ""} ${error ? errClass : ""}`}
                {...rest}
            />
        </div>
    </Field>
);

const DatePickerField = ({
    label,
    required,
    error,
    onChange,
    value,
    disabled,
    className = "",
}) => {
    const hiddenDateRef = useRef(null);

    return (
        <Field label={label} required={required} error={error} className={className}>
            <div className="relative">
                <input
                    type="text"
                    placeholder="dd-mm-yyyy"
                    value={value ?? ""}
                    disabled={disabled}
                    onChange={(e) => onChange?.(formatTyping(e.target.value))}
                    className={`${inputClass} pr-8 ${error ? errClass : ""}`}
                />
                {!disabled && (
                    <button
                        type="button"
                        onClick={() => hiddenDateRef.current?.showPicker?.()}
                        className="absolute right-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                        aria-label="Pick date"
                    >
                        <CalendarIcon size={12} />
                    </button>
                )}
                <input
                    type="date"
                    ref={hiddenDateRef}
                    className="pointer-events-none absolute bottom-0 right-0 h-0 w-0 opacity-0"
                    tabIndex={-1}
                    value={
                        value && value.includes("-")
                            ? value.split("-").reverse().join("-")
                            : ""
                    }
                    onChange={(e) => {
                        const iso = e.target.value;
                        if (iso) onChange?.(isoToDisplay(iso));
                    }}
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
    icon: Icon,
}) => (
    <Field label={label} required={required} error={error} hint={hint} className={className}>
        <div className="relative">
            {Icon && (
                <Icon
                    size={12}
                    className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500"
                />
            )}
            <select
                value={value ?? ""}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                className={`${inputClass} cursor-pointer appearance-none pr-8 ${Icon ? "pl-7" : ""} ${error ? errClass : ""}`}
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
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500"
            />
        </div>
    </Field>
);

const SearchableSelectField = ({
    label,
    required,
    error,
    hint,
    value,
    onChange,
    options = [],
    placeholder = "Search...",
    disabled,
    className = "",
    fallbackLabel = "",
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
        if (found) return typeof found === "string" ? found : found.label;
        return fallbackLabel || "";
    }, [options, value, fallbackLabel]);

    const filtered = useMemo(() => {
        const t = q.trim().toLowerCase();
        const list = t
            ? options.filter((opt) => {
                const text =
                    typeof opt === "string" ? opt : `${opt.label} ${opt.value} ${opt.sub || ""}`;
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
        <Field label={label} required={required} error={error} hint={hint} className={className}>
            <div className="relative" ref={containerRef}>
                <input
                    ref={inputRef}
                    type="text"
                    value={open ? q : selectedLabel}
                    placeholder={placeholder}
                    disabled={disabled}
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
                    className={`${inputClass} pr-14 ${error ? errClass : ""}`}
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
                                const sub = typeof opt === "string" ? "" : opt.sub;
                                return (
                                    <li key={val}>
                                        <button
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => {
                                                onChange?.(val);
                                                setOpen(false);
                                            }}
                                            className={`flex w-full flex-col items-start gap-0 px-2.5 py-1.5 text-left hover:bg-indigo-50 dark:hover:bg-indigo-500/10 ${String(val) === String(value)
                                                ? "bg-indigo-50/60 font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                                                : "text-slate-700 dark:text-gray-200"
                                                }`}
                                        >
                                            <span className="w-full truncate">{lbl}</span>
                                            {sub && (
                                                <span className="w-full truncate text-[10px] font-normal text-slate-400 dark:text-gray-500">
                                                    {sub}
                                                </span>
                                            )}
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
            className={`${inputClass} h-auto resize-y py-1.5 leading-relaxed ${error ? errClass : ""}`}
        />
    </Field>
);

const SegmentedControl = ({ value, onChange, options, size = "md", disabled }) => {
    const h = size === "sm" ? "h-7" : "h-8";
    return (
        <div
            className={`inline-flex ${h} w-full items-stretch rounded-md border border-slate-200 bg-slate-100/70 p-[3px] ${disabled ? "opacity-50 cursor-not-allowed" : ""} dark:border-gray-700 dark:bg-gray-800/60`}
            role="tablist"
        >
            {options.map((opt) => {
                const active = value === opt.value;
                const Icon = opt.icon;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        disabled={disabled}
                        onClick={() => onChange(opt.value)}
                        className={`flex flex-1 items-center justify-center gap-1 rounded-[5px] px-1.5 text-[11.5px] font-semibold transition-all ${active
                            ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/70 dark:bg-gray-900 dark:text-indigo-300 dark:ring-gray-700"
                            : "text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                    >
                        {Icon && <Icon size={12} />}
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
};

/* ------------------------------------------------------------- */
/* Section card                                                   */
/* ------------------------------------------------------------- */

const Section = ({
    id,
    icon: Icon,
    title,
    subtitle,
    action,
    badge,
    collapsible = false,
    defaultOpen = true,
    children,
}) => {
    const [open, setOpen] = useState(defaultOpen);
    const isOpen = collapsible ? open : true;

    return (
        <section
            id={`pj-${id}`}
            className="group relative scroll-mt-20 overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-shadow hover:shadow-[0_1px_2px_rgba(15,23,42,0.03),0_4px_14px_-6px_rgba(15,23,42,0.08)] dark:border-gray-700/70 dark:bg-gray-800/40 dark:shadow-none"
        >
            <span className="pointer-events-none absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-indigo-500/70 via-indigo-500/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="flex items-center justify-between gap-2 border-b border-slate-100/90 px-3 py-2 dark:border-gray-700/60">
                <button
                    type="button"
                    onClick={() => collapsible && setOpen((o) => !o)}
                    className={`flex min-w-0 flex-1 items-center gap-2 text-left ${collapsible ? "cursor-pointer" : "cursor-default"}`}
                >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 ring-1 ring-indigo-100/80 dark:from-indigo-500/15 dark:to-indigo-500/5 dark:text-indigo-300 dark:ring-indigo-500/20">
                        <Icon size={13} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <h3 className="truncate text-[12.5px] font-semibold text-slate-900 dark:text-white">
                                {title}
                            </h3>
                            {badge}
                        </div>
                        {subtitle && (
                            <p className="truncate text-[10.5px] text-slate-500 dark:text-gray-400">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {collapsible && (
                        <ChevronDown
                            size={14}
                            className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                        />
                    )}
                </button>
                {action}
            </div>
            <div
                className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
                <div className="overflow-hidden">
                    <div className="px-3 py-2.5">{children}</div>
                </div>
            </div>
        </section>
    );
};

/* ------------------------------------------------------------- */
/* Stepper                                                        */
/* ------------------------------------------------------------- */

const steps = [
    { key: "draft", label: "Draft", icon: Check },
    { key: "pending", label: "Pending", icon: Clock },
    { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { key: "opened", label: "Opened", icon: ClipboardList },
    { key: "hold", label: "Hold", icon: PauseCircle },
    { key: "cancel", label: "Cancel", icon: XCircle },
];

const Stepper = ({ current = "pending" }) => {
    const currentIdx = steps.findIndex((s) => s.key === current);
    return (
        <div className="overflow-x-auto">
            <div className="relative flex min-w-[560px] items-start justify-between">
                <div className="absolute left-4 right-4 top-3 z-0 h-[2px] bg-slate-200 dark:bg-gray-700">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all"
                        style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
                    />
                </div>
                {steps.map((step, idx) => {
                    const done = idx < currentIdx;
                    const active = idx === currentIdx;
                    const Icon = step.icon;
                    return (
                        <div
                            key={step.key}
                            className="relative z-10 flex w-16 flex-col items-center gap-1"
                        >
                            <div
                                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${done
                                    ? "border-indigo-500 bg-indigo-500 text-white shadow-[0_2px_6px_-1px_rgba(79,70,229,0.5)]"
                                    : active
                                        ? "border-indigo-500 bg-white text-indigo-600 ring-[3px] ring-indigo-500/15 dark:bg-gray-900 dark:text-indigo-300"
                                        : "border-slate-300 bg-white text-slate-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-500"
                                    }`}
                            >
                                <Icon
                                    size={10}
                                    className={active ? "animate-pulse" : ""}
                                    strokeWidth={done ? 3 : 2.5}
                                />
                            </div>
                            <span
                                className={`text-center text-[10px] font-semibold leading-tight ${done || active
                                    ? "text-indigo-700 dark:text-indigo-300"
                                    : "text-slate-400 dark:text-gray-500"
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ------------------------------------------------------------- */
/* Main form                                                      */
/* ------------------------------------------------------------- */

const emptyCargoLine = () => ({
    id: String(Date.now()),
    description: "",
    hsCode: "",
    packages: "",
    weight: "",
    volume: "",
    remarks: "",
});

const emptyForm = () => ({
    preJobNo: "",
    shipmentType: "Export",
    mode: "Air",
    customer: "",
    salesPerson: "",
    shipper: "",
    consignee: "",
    origin: "",
    originLabel: "",
    destination: "",
    destinationLabel: "",
    pol: "",
    pod: "",
    commodity: "",
    packages: "",
    grossWeight: "",
    volume: "",
    bookingRef: "",
    bookingId: "",
    bookingDate: "",
    quotationRef: "",
    expectedShipmentDate: "",
    remarks: "",
    cargoLines: [emptyCargoLine()],
    attachments: [],
    audit: [],
});

const PreJobOpeningForm = ({ editData, onBack, onSaveSuccess, onNotify }) => {
    const operationStartUp = useMemo(() => {
        const val = localStorage.getItem("operationStartUp") || "";
        return String(val).trim();
    }, []);
    const isBookingBased = operationStartUp.toLowerCase() === "booking-based";
    const isDirect = operationStartUp.toLowerCase() === "direct";

    const orgId = parseInt(localStorage.getItem("orgId")) || 1000000001;
    const branchId = parseInt(localStorage.getItem("branchId")) || orgId;

    const modes = useMemo(() => buildModesFromStorage(), []);

    const [form, setForm] = useState(() => {
        const base = emptyForm();
        if (!editData) return base;
        // We will fill this in the useEffect below
        return base;
    });

    const [busy, setBusy] = useState("");
    const [notice, setNotice] = useState(null);
    const [showStepper, setShowStepper] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [errorList, setErrorList] = useState([]);
    const busyRef = useRef(false);
    const fileInputRef = useRef(null);

    /* ✅ Bookings fetched from API when operationStartUp === "Booking-based" */
    const [bookingRecords, setBookingRecords] = useState([]);
    const [bookingLoading, setBookingLoading] = useState(false);

    /* ✅ Ports fetched from API when operationStartUp === "Direct" */
    const [ports, setPorts] = useState([]);
    const [portsLoading, setPortsLoading] = useState(false);

    const [loadingDocId, setLoadingDocId] = useState(false);

    /* ✅ Fetch Pre-Job By ID on Edit */
    useEffect(() => {
        if (!editData?.id) return;

        const fetchRecord = async () => {
            try {
                setBusy("loading");
                const record = await PreJobAPI.getPreJobById(editData.id);
                if (!record) return;

                const cargoLines = (record.cargoDetails || []).map((c, i) => ({
                    id: `${Date.now()}-${i}`,
                    description: c.commodity || "",
                    hsCode: "",
                    packages: c.packages != null ? String(c.packages) : "",
                    weight: c.weight != null ? String(c.weight) : "",
                    volume: c.volume != null ? String(c.volume) : "",
                    remarks: "",
                }));

                const attachments = (record.documentationDetails || []).map((d) => ({
                    id: String(Date.now()) + Math.random(),
                    serverId: d.id,
                    serverFileName: d.fileName,
                    originalName: d.originalName || d.fileName || "Document",
                    name: d.originalName || d.fileName || "Document",
                    size: d.fileSize ? `${Math.round(d.fileSize / 1024)} KB` : "Unknown",
                    url: d.document,
                    isExisting: true,
                }));

                setForm({
                    ...emptyForm(),
                    preJobNo: record.docId || "",
                    bookingRef: record.bookingNo || "",
                    bookingDate: isoToDisplay(record.bookingDate || ""),
                    shipmentType: record.tradeType || "Export",
                    mode: record.mode || "Air",
                    customer: record.customer || "",
                    salesPerson: record.salesPerson || "",
                    shipper: record.shipper || "",
                    consignee: record.consignee || "",

                    // Port IDs
                    origin: portId(record.origin) || "",
                    originLabel: portLabel(record.origin) || "",
                    destination: portId(record.destination) || "",
                    destinationLabel: portLabel(record.destination) || "",
                    pol: record.origin?.portName || "",
                    pod: record.destination?.portName || "",

                    quotationRef: record.quotationNo || "",
                    expectedShipmentDate: isoToDisplay(record.expectedShippment || ""),
                    remarks: record.cancelRemarks || "", // Using cancelRemarks as fallback if remarks not present

                    cargoLines: cargoLines.length ? cargoLines : [emptyCargoLine()],
                    attachments,
                });
            } catch (err) {
                console.error("Failed to fetch Pre-Job details", err);
                setNotice({ type: "error", text: "Failed to load Pre-Job data." });
            } finally {
                setBusy("");
            }
        };
        fetchRecord();
    }, [editData?.id]);

    useEffect(() => {
        const fetchDocId = async () => {
            if (editData?.id) return; // Skip if editing

            try {
                setLoadingDocId(true);
                const docId = await PreJobAPI.getPreJobDocId(orgId);
                setForm((p) => ({ ...p, preJobNo: docId || "" }));
            } catch (err) {
                console.error("Failed to fetch pre-job docId:", err);
            } finally {
                setLoadingDocId(false);
            }
        };
        fetchDocId();
    }, [orgId, editData?.id]);

    useEffect(() => {
        if (!isBookingBased) return;
        const run = async () => {
            try {
                setBookingLoading(true);
                const res = await BookingAPI.getBookingByOrgId(branchId, orgId);
                setBookingRecords(Array.isArray(res) ? res : []);
            } catch (err) {
                console.error("Failed to load bookings:", err);
                setNotice({
                    type: "error",
                    text: "Unable to load bookings. Please try again.",
                });
            } finally {
                setBookingLoading(false);
            }
        };
        run();
    }, [isBookingBased, branchId, orgId]);

    useEffect(() => {
        if (!isDirect) return;
        const run = async () => {
            try {
                setPortsLoading(true);
                const res = await EnquiryAPI.getPortByOrgIdAndBranch(orgId, branchId);
                setPorts(Array.isArray(res) ? res : []);
            } catch (err) {
                console.error("Failed to load ports:", err);
                setNotice({
                    type: "error",
                    text: "Unable to load ports. Please try again.",
                });
            } finally {
                setPortsLoading(false);
            }
        };
        run();
    }, [isDirect, orgId, branchId]);

    const bookingOptions = useMemo(
        () =>
            bookingRecords.map((b) => {
                const customer =
                    typeof b.customer === "object"
                        ? b.customer?.customerName || ""
                        : b.customer || "";
                return {
                    value: String(b.id),
                    label: b.docId || `Booking ${b.id}`,
                    sub: [customer, b.bookingDate ? isoToDisplay(b.bookingDate) : ""]
                        .filter(Boolean)
                        .join(" · "),
                };
            }),
        [bookingRecords],
    );

    const portOptions = useMemo(() => {
        const modeUpper = String(form.mode || "").trim().toUpperCase();
        return ports
            .filter((p) => String(p?.portType || "").trim().toUpperCase() === modeUpper)
            .map((p) => ({
                value: String(p.id),
                label: `${p.portName}${p.portCode ? ` (${p.portCode})` : ""}`,
            }));
    }, [ports, form.mode]);

    const withSelectedPort = (options, value, label) =>
        value && !options.some((o) => String(o.value) === String(value))
            ? [{ value: String(value), label: label || String(value) }, ...options]
            : options;

    const originOptions = useMemo(
        () => withSelectedPort(portOptions, form.origin, form.originLabel),
        [portOptions, form.origin, form.originLabel],
    );
    const destinationOptions = useMemo(
        () => withSelectedPort(portOptions, form.destination, form.destinationLabel),
        [portOptions, form.destination, form.destinationLabel],
    );

    const set = (name, value) =>
        setForm((p) => ({ ...p, [name]: value }));

    const setLine = (id, field, value) =>
        setForm((p) => ({
            ...p,
            cargoLines: p.cargoLines.map((l) =>
                l.id === id ? { ...l, [field]: value } : l,
            ),
        }));

    const addLine = () =>
        setForm((p) => ({
            ...p,
            cargoLines: [...p.cargoLines, emptyCargoLine()],
        }));

    const removeLine = (id) =>
        setForm((p) => ({
            ...p,
            cargoLines:
                p.cargoLines.length > 1
                    ? p.cargoLines.filter((l) => l.id !== id)
                    : p.cargoLines,
        }));

    const applyBooking = (bookingId) => {
        const b = bookingRecords.find((x) => String(x.id) === String(bookingId));
        if (!b) {
            setForm((p) => ({ ...p, bookingRef: bookingId, bookingId: "" }));
            return;
        }

        const routing = b.routingDetails?.[0] || {};
        const party = b.partyDetails?.[0] || {};
        const commercial = b.commercialDetails?.[0] || {};

        const rawMode = String(b.transportMode || "").toUpperCase();
        const matchedMode =
            modes.find((m) => m.apiValue === rawMode) ||
            modes.find((m) => m.value.toUpperCase() === rawMode);
        const resolvedMode = matchedMode?.value || form.mode;

        const customerName =
            typeof b.customer === "object"
                ? b.customer?.customerName || ""
                : b.customer || "";

        const originPortObj = routing.origin || routing.originPort;
        const destPortObj = routing.destination || routing.destinationPort;

        const cargoLines = (b.cargoDetails || []).map((c, i) => ({
            id: `${Date.now()}-${i}`,
            description: c.commodityDescription || "",
            hsCode: "",
            packages:
                c.packageCount != null ? String(c.packageCount) : "",
            weight: c.grossWeight != null ? String(c.grossWeight) : "",
            volume: c.volume != null ? String(c.volume) : "",
            remarks: c.remarks || "",
        }));

        const attachments = (b.instructionDetails || [])
            .filter((d) => d.document)
            .map((d) => ({
                id: String(Date.now()) + Math.random(),
                serverId: d.id,
                serverFileName: d.fileName,
                originalName: d.originalName || d.fileName || "Document",
                name: d.originalName || d.fileName || "Document",
                size: d.fileSize ? `${Math.round(d.fileSize / 1024)} KB` : "Unknown",
                url: d.document,
                isExisting: true,
            }));

        const totalPackages = (b.cargoDetails || []).reduce(
            (sum, c) => sum + (Number(c.packageCount) || 0),
            0,
        );
        const totalWeight = (b.cargoDetails || []).reduce(
            (sum, c) => sum + (Number(c.grossWeight) || 0),
            0,
        );
        const totalVolume = (b.cargoDetails || []).reduce(
            (sum, c) => sum + (Number(c.volume) || 0),
            0,
        );

        const primaryCommodity = b.cargoDetails?.[0]?.commodityDescription || "";

        setForm((p) => ({
            ...p,
            bookingId: String(b.id),
            bookingRef: b.docId || `Booking ${b.id}`,
            bookingDate: isoToDisplay(b.bookingDate || b.docDate || ""),

            shipmentType:
                String(b.bookingType || "").toLowerCase() === "import"
                    ? "Import"
                    : "Export",
            mode: resolvedMode,
            customer: customerName || p.customer,
            salesPerson: b.salesperson || p.salesPerson,
            shipper: party.shipper || p.shipper,
            consignee: party.consignee || p.consignee,

            origin: portId(originPortObj) || p.origin,
            originLabel: portLabel(originPortObj) || p.originLabel,
            destination: portId(destPortObj) || p.destination,
            destinationLabel: portLabel(destPortObj) || p.destinationLabel,
            pol: plainText(originPortObj) || p.pol,
            pod: plainText(destPortObj) || p.pod,

            quotationRef:
                b.quotationNo || commercial.quotationReference || p.quotationRef,

            remarks: b.remarks || p.remarks,

            packages: totalPackages ? String(totalPackages) : p.packages,
            grossWeight: totalWeight
                ? totalWeight.toLocaleString(undefined, {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                })
                : p.grossWeight,
            volume: totalVolume
                ? totalVolume.toLocaleString(undefined, {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                })
                : p.volume,

            commodity: primaryCommodity || p.commodity,
            cargoLines: cargoLines.length ? cargoLines : [emptyCargoLine()],
            attachments,
        }));

        setErrorList([]);
        setNotice({
            type: "success",
            text: `Booking ${b.docId || b.id} applied to the pre-job.`,
        });
    };

    const handleBookingRefChange = (value) => {
        if (isBookingBased) {
            applyBooking(value);
        } else {
            set("bookingRef", value);
            set("bookingId", "");
        }
    };

    const handleOriginChange = (value) => {
        const p = ports.find((x) => String(x.id) === String(value));
        setForm((prev) => ({
            ...prev,
            origin: value,
            originLabel: p ? `${p.portName}${p.portCode ? ` (${p.portCode})` : ""}` : "",
            pol: p ? p.portName : prev.pol,
        }));
    };

    const handleDestinationChange = (value) => {
        const p = ports.find((x) => String(x.id) === String(value));
        setForm((prev) => ({
            ...prev,
            destination: value,
            destinationLabel: p ? `${p.portName}${p.portCode ? ` (${p.portCode})` : ""}` : "",
            pod: p ? p.portName : prev.pod,
        }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const sizeInKB = Math.round(file.size / 1024);
        const sizeStr =
            sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(1)} MB` : `${sizeInKB} KB`;

        setForm((p) => ({
            ...p,
            attachments: [
                ...p.attachments,
                {
                    id: String(Date.now()),
                    name: file.name,
                    size: sizeStr,
                    file,
                    isExisting: false,
                },
            ],
        }));
        e.target.value = "";
    };

    const removeAttachment = (id) =>
        setForm((p) => ({
            ...p,
            attachments: p.attachments.filter((a) => a.id !== id),
        }));

    const runSave = async (action) => {
        if (busyRef.current) return;

        const newFiles = form.attachments
            .filter((a) => !a.isExisting && a.file instanceof File)
            .map((a) => a.file);

        const mappedCargoDetails = form.cargoLines.map((l) => ({
            commodity: l.description || "",
            packages: toNum(l.packages),
            volume: toNum(l.volume),
            weight: toNum(l.weight),
        }));

        const payload = {
            ...(editData?.id ? { id: editData.id } : {}),

            bookingDate: displayToIso(form.bookingDate) || null,
            bookingNo: form.bookingRef || form.preJobNo || null,
            branch: branchId,
            cancelRemarks: "",

            cargoDetails: mappedCargoDetails,

            consignee: form.consignee || null,
            createdBy: localStorage.getItem("userName") || "SYSTEM",
            customer: form.customer || null,

            destination: form.destination ? Number(form.destination) : null,

            estimatedRevenue: 0,
            expectedShippment: displayToIso(form.expectedShipmentDate) || "",
            financialYear: new Date().getFullYear().toString(),
            mode: form.mode || "Air",
            orgId: orgId,
            origin: form.origin ? Number(form.origin) : null,

            quotationNo: form.quotationRef || null,
            salesPerson: form.salesPerson || null,
            shipper: form.shipper || null,
            tradeType: form.shipmentType || "Export",
            user: localStorage.getItem("userName") || "SYSTEM",
        };

        try {
            busyRef.current = true;
            setBusy(action);

            const res = await PreJobAPI.createUpdatePreJob(payload, newFiles);

            const body = res?.paramObjectsMap || res;
            const saved = body?.preJobVO || body?.preJobResponseVO || body;
            const savedId = saved?.id ?? null;
            const savedDocId =
                saved?.docId || saved?.preJobNo || payload.bookingNo || "PJ/NEW";

            setNotice({
                type: "success",
                text: `Pre-Job ${action === "submit" ? "submitted" : "saved as draft"} (${savedDocId}).`,
            });
            onNotify?.(
                `Pre-Job ${action === "submit" ? "submitted" : "saved as draft"} (${savedDocId}).`
            );
            onSaveSuccess?.({ id: savedId, preJobNo: savedDocId });
        } catch (err) {
            console.error("Save pre-job failed:", err);
            setNotice({
                type: "error",
                text:
                    err?.response?.data?.message ||
                    "Failed to save pre-job. Please try again.",
            });
        } finally {
            busyRef.current = false;
            setBusy("");
        }
    };

    const originDisplay = useMemo(() => {
        if (!isDirect) return form.origin;
        const p = ports.find((x) => String(x.id) === String(form.origin));
        return p ? `${p.portName}${p.portCode ? ` (${p.portCode})` : ""}` : form.originLabel || "";
    }, [isDirect, ports, form.origin, form.originLabel]);

    const destinationDisplay = useMemo(() => {
        if (!isDirect) return form.destination;
        const p = ports.find((x) => String(x.id) === String(form.destination));
        return p ? `${p.portName}${p.portCode ? ` (${p.portCode})` : ""}` : form.destinationLabel || "";
    }, [isDirect, ports, form.destination, form.destinationLabel]);

    const summaryRows = useMemo(
        () => [
            { label: "Origin", value: originDisplay || "—", icon: MapPin },
            { label: "Destination", value: destinationDisplay || "—", icon: MapPin },
            { label: "Customer", value: form.customer || "—", icon: Building2 },
        ],
        [originDisplay, destinationDisplay, form.customer],
    );

    const modeIcon = modes.find((m) => m.value === form.mode)?.icon || Plane;

    const isLocked = isBookingBased && !!form.bookingId;

    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-gray-950 dark:text-gray-100">
            {/* HEADER */}
            <div className="z-30 shrink-0 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/80">
                <div className="flex items-center justify-between gap-3 px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={!!busy}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            aria-label="Back"
                        >
                            <ArrowLeft size={14} />
                        </button>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1 text-[10.5px] text-slate-500 dark:text-gray-400">
                                <span>Operations</span>
                                <ChevronRight size={9} />
                                <span>Pre-Job</span>
                                <ChevronRight size={9} />
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                    {editData ? "Edit" : "New"}
                                </span>
                            </div>
                            <h1 className="flex items-center gap-2 text-[15px] font-bold leading-tight text-slate-900 dark:text-white">
                                Pre-Job Opening
                                {isBookingBased && (
                                    <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20">
                                        Booking-based
                                    </span>
                                )}
                                {isDirect && (
                                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
                                        Direct
                                    </span>
                                )}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <div className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-semibold text-amber-700 ring-1 ring-amber-600/20 sm:flex dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                            </span>
                            Booking Pending
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowStepper((s) => !s)}
                            className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            aria-label="Toggle steps"
                        >
                            <ChevronUp
                                size={11}
                                className={`transition-transform ${showStepper ? "" : "rotate-180"}`}
                            />
                            <span className="hidden sm:inline">Steps</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 lg:hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            aria-label="Summary"
                        >
                            <Sparkles size={12} />
                        </button>
                        <div className="hidden h-7 items-center gap-1.5 border-l border-slate-200 pl-1.5 sm:flex dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => runSave("draft")}
                                disabled={!!busy}
                                className={`${btnOutline} h-7`}
                            >
                                <Save size={12} />
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={() => runSave("submit")}
                                disabled={!!busy}
                                className={`${btnSuccess} h-7`}
                            >
                                <Check size={12} />
                                {busy === "submit" ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={`grid transition-all duration-300 ${showStepper ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                    <div className="overflow-hidden">
                        <div className="border-t border-slate-100 px-3 py-2 dark:border-gray-800">
                            <Stepper current="pending" />
                        </div>
                    </div>
                </div>
            </div>

            {/* BODY */}
            <div className="flex min-h-0 flex-1 overflow-hidden">
                <div className="min-w-0 flex-1 overflow-y-auto px-3 py-2">
                    {notice && (
                        <div
                            className={`mb-2 flex items-start justify-between gap-2 rounded-md border px-2.5 py-1.5 text-[11.5px] shadow-sm ${notice.type === "error"
                                ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                                }`}
                        >
                            <span className="flex items-center gap-1.5">
                                {notice.type === "error" ? (
                                    <AlertTriangle size={12} />
                                ) : (
                                    <CheckCircle2 size={12} />
                                )}
                                {notice.text}
                            </span>
                            <button
                                type="button"
                                onClick={() => setNotice(null)}
                                className="rounded p-0.5 hover:bg-black/5 dark:hover:bg-white/10"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )}

                    <div className="space-y-2">
                        {/* Shipment + Booking */}
                        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                            <Section
                                id="shipment"
                                icon={Plane}
                                title="Shipment Information"
                                subtitle="Type, mode, and parties"
                                badge={
                                    <span className="rounded bg-slate-100 px-1 py-0.5 text-[9.5px] font-bold text-slate-500 dark:bg-gray-800 dark:text-gray-400">
                                        A
                                    </span>
                                }
                            >
                                <div className="space-y-2">
                                    <Field label="Shipment Type" required>
                                        <SegmentedControl
                                            value={form.shipmentType}
                                            onChange={(v) => set("shipmentType", v)}
                                            options={[
                                                { value: "Export", label: "Export" },
                                                { value: "Import", label: "Import" },
                                            ]}
                                            disabled={isLocked}
                                        />
                                    </Field>

                                    <div className="grid grid-cols-2 gap-2">
                                        <Field label="Mode" required>
                                            <SegmentedControl
                                                size="sm"
                                                value={form.mode}
                                                onChange={(v) => set("mode", v)}
                                                options={modes}
                                                disabled={isLocked}
                                            />
                                        </Field>
                                        <TextField
                                            label="Customer"
                                            required
                                            icon={Building2}
                                            value={form.customer}
                                            onChange={(v) => set("customer", v)}
                                            placeholder="Customer name"
                                            disabled={isLocked}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <TextField
                                            label="Sales Person"
                                            required
                                            icon={User}
                                            value={form.salesPerson}
                                            onChange={(v) => set("salesPerson", v)}
                                            placeholder="Sales person"
                                            disabled={isLocked}
                                        />
                                        <TextField
                                            label="Shipper"
                                            value={form.shipper}
                                            onChange={(v) => set("shipper", v)}
                                            placeholder="Shipper"
                                            disabled={isLocked}
                                        />
                                        <TextField
                                            label="Consignee"
                                            value={form.consignee}
                                            onChange={(v) => set("consignee", v)}
                                            placeholder="Consignee"
                                            disabled={isLocked}
                                        />
                                    </div>
                                </div>
                            </Section>

                            <Section
                                id="booking"
                                icon={CalendarIcon}
                                title="Booking Information"
                                subtitle="References and dates"
                                badge={
                                    <span className="rounded bg-slate-100 px-1 py-0.5 text-[9.5px] font-bold text-slate-500 dark:bg-gray-800 dark:text-gray-400">
                                        D
                                    </span>
                                }
                            >
                                <div className="grid grid-cols-2 gap-2">
                                    {/* Pre-Job Number */}
                                    <TextField
                                        label="Pre-Job Number"
                                        value={form.preJobNo || ""}
                                        placeholder={loadingDocId ? "Generating..." : "Auto-generated"}
                                        disabled
                                        className="col-span-2 sm:col-span-1"
                                    />

                                    {isBookingBased ? (
                                        <SearchableSelectField
                                            label="Booking Reference"
                                            value={form.bookingId || ""}
                                            onChange={handleBookingRefChange}
                                            options={bookingOptions}
                                            placeholder={
                                                bookingLoading
                                                    ? "Loading bookings..."
                                                    : bookingOptions.length
                                                        ? "Search booking"
                                                        : "No bookings available"
                                            }
                                            disabled={bookingLoading || !bookingOptions.length}
                                            fallbackLabel={form.bookingRef}
                                            className="col-span-2 sm:col-span-1"
                                        />
                                    ) : (
                                        <TextField
                                            label="Booking Reference"
                                            value={form.bookingRef}
                                            onChange={handleBookingRefChange}
                                            placeholder="Enter reference"
                                            className="col-span-2 sm:col-span-1"
                                        />
                                    )}

                                    <DatePickerField
                                        label="Booking Date"
                                        value={form.bookingDate}
                                        onChange={(v) => set("bookingDate", v)}
                                        disabled={isLocked}
                                    />
                                    <TextField
                                        label="Quotation Reference"
                                        value={form.quotationRef}
                                        onChange={(v) => set("quotationRef", v)}
                                        placeholder="Quotation ref"
                                        disabled={isLocked}
                                    />
                                    <DatePickerField
                                        label="Expected Shipment"
                                        value={form.expectedShipmentDate}
                                        onChange={(v) => set("expectedShipmentDate", v)}
                                    // disabled={isLocked}
                                    />
                                </div>
                            </Section>
                        </div>

                        {/* Routing + Additional */}
                        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                            <Section
                                id="routing"
                                icon={MapPin}
                                title="Routing Details"
                                subtitle="Origin, destination, ports"
                                badge={
                                    <span className="rounded bg-slate-100 px-1 py-0.5 text-[9.5px] font-bold text-slate-500 dark:bg-gray-800 dark:text-gray-400">
                                        B
                                    </span>
                                }
                            >
                                <div className="grid grid-cols-2 gap-2">
                                    {isDirect ? (
                                        <>
                                            <SearchableSelectField
                                                label="Origin"
                                                required
                                                value={form.origin}
                                                onChange={handleOriginChange}
                                                options={originOptions}
                                                placeholder={
                                                    portsLoading ? "Loading ports..." : "Search port"
                                                }
                                                disabled={portsLoading || isLocked}
                                                fallbackLabel={form.originLabel}
                                            />
                                            <SearchableSelectField
                                                label="Destination"
                                                required
                                                value={form.destination}
                                                onChange={handleDestinationChange}
                                                options={destinationOptions}
                                                placeholder={
                                                    portsLoading ? "Loading ports..." : "Search port"
                                                }
                                                disabled={portsLoading || isLocked}
                                                fallbackLabel={form.destinationLabel}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <TextField
                                                label="Origin"
                                                required
                                                value={form.origin}
                                                onChange={(v) => set("origin", v)}
                                                placeholder="Origin city"
                                                disabled={isLocked}
                                            />
                                            <TextField
                                                label="Destination"
                                                required
                                                value={form.destination}
                                                onChange={(v) => set("destination", v)}
                                                placeholder="Destination city"
                                                disabled={isLocked}
                                            />
                                        </>
                                    )}
                                    <TextField
                                        label="POL / Airport"
                                        value={form.pol}
                                        onChange={(v) => set("pol", v)}
                                        placeholder="Port / airport"
                                        disabled={isLocked}
                                    />
                                    <TextField
                                        label="POD / Airport"
                                        value={form.pod}
                                        onChange={(v) => set("pod", v)}
                                        placeholder="Port / airport"
                                        disabled={isLocked}
                                    />
                                </div>
                            </Section>

                            <Section
                                id="additional"
                                icon={Info}
                                title="Additional Information"
                                subtitle="Remarks and tags"
                                badge={
                                    <span className="rounded bg-slate-100 px-1 py-0.5 text-[9.5px] font-bold text-slate-500 dark:bg-gray-800 dark:text-gray-400">
                                        E
                                    </span>
                                }
                            >
                                <div className="space-y-2">
                                    <TextAreaField
                                        label="Remarks"
                                        rows={2}
                                        value={form.remarks}
                                        onChange={(v) => set("remarks", v)}
                                        placeholder="Additional remarks"
                                        disabled={isLocked}
                                    />
                                    <div className="flex flex-wrap gap-1">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20">
                                            <Clock size={9} />
                                            Booking Pending
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20">
                                            <Paperclip size={9} />
                                            {form.attachments.length} file
                                            {form.attachments.length !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </div>
                            </Section>
                        </div>

                        {/* Cargo Details */}
                        <Section
                            id="cargo-details"
                            icon={Box}
                            title="Cargo Details"
                            subtitle="Commodity and totals"
                            badge={
                                <span className="rounded bg-slate-100 px-1 py-0.5 text-[9.5px] font-bold text-slate-500 dark:bg-gray-800 dark:text-gray-400">
                                    C
                                </span>
                            }
                        >
                            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                                <TextField
                                    label="Commodity"
                                    value={form.commodity}
                                    onChange={(v) => set("commodity", v)}
                                    placeholder="Commodity description"
                                    disabled={isLocked}
                                />
                                <TextField
                                    label="Packages"
                                    value={form.packages}
                                    onChange={(v) => set("packages", v)}
                                    placeholder="0"
                                    disabled={isLocked}
                                />
                                <TextField
                                    label="Gross Weight (kg)"
                                    value={form.grossWeight}
                                    onChange={(v) => set("grossWeight", v)}
                                    placeholder="0.000"
                                    disabled={isLocked}
                                />
                                <TextField
                                    label="Volume (CBM)"
                                    value={form.volume}
                                    onChange={(v) => set("volume", v)}
                                    placeholder="0.000"
                                    disabled={isLocked}
                                />
                            </div>
                        </Section>

                        {/* Cargo Line Items */}
                        <Section
                            id="cargo-lines"
                            icon={Package}
                            title="Cargo Line Items"
                            subtitle={`${form.cargoLines.length} item${form.cargoLines.length !== 1 ? "s" : ""}`}
                            action={
                                <button
                                    type="button"
                                    onClick={addLine}
                                    disabled={isLocked}
                                    className="inline-flex h-6 items-center gap-1 rounded border border-indigo-200 bg-indigo-50 px-2 text-[10.5px] font-semibold text-indigo-700 transition-colors hover:border-indigo-300 hover:bg-indigo-100 disabled:opacity-50 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                                >
                                    <Plus size={11} />
                                    Add Item
                                </button>
                            }
                        >
                            <div className="overflow-hidden rounded-md border border-slate-200 dark:border-gray-700">
                                <table className="w-full table-fixed text-left text-[11.5px]">
                                    <colgroup>
                                        <col className="w-8" />
                                        <col />
                                        <col className="w-[84px]" />
                                        <col className="w-[60px]" />
                                        <col className="w-[84px]" />
                                        <col className="w-[76px]" />
                                        <col />
                                        <col className="w-[36px]" />
                                    </colgroup>
                                    <thead className="bg-slate-50/90 dark:bg-gray-900/80">
                                        <tr className="text-[9.5px] uppercase tracking-wider text-slate-500 dark:text-gray-400">
                                            <th className="px-1.5 py-1.5 font-semibold">#</th>
                                            <th className="px-1.5 py-1.5 font-semibold">Description</th>
                                            <th className="px-1.5 py-1.5 font-semibold">HS Code</th>
                                            <th className="px-1.5 py-1.5 font-semibold">Pkgs</th>
                                            <th className="px-1.5 py-1.5 font-semibold">Weight</th>
                                            <th className="px-1.5 py-1.5 font-semibold">Vol</th>
                                            <th className="px-1.5 py-1.5 font-semibold">Remarks</th>
                                            <th className="px-1 py-1.5" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                                        {form.cargoLines.map((l, i) => (
                                            <tr
                                                key={l.id}
                                                className="align-middle transition-colors hover:bg-slate-50/60 dark:hover:bg-gray-800/40"
                                            >
                                                <td className="px-1.5 py-0.5 text-slate-400">
                                                    <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-[10px] font-semibold text-slate-600 dark:bg-gray-800 dark:text-gray-300">
                                                        {i + 1}
                                                    </span>
                                                </td>
                                                <td className="px-1 py-0.5">
                                                    <input
                                                        value={l.description}
                                                        onChange={(e) =>
                                                            setLine(l.id, "description", e.target.value)
                                                        }
                                                        className={cellClass}
                                                        placeholder="Description"
                                                        disabled={isLocked}
                                                    />
                                                </td>
                                                <td className="px-1 py-0.5">
                                                    <input
                                                        value={l.hsCode}
                                                        onChange={(e) =>
                                                            setLine(l.id, "hsCode", e.target.value)
                                                        }
                                                        className={`${cellClass} font-mono`}
                                                        placeholder="HS"
                                                        disabled={isLocked}
                                                    />
                                                </td>
                                                <td className="px-1 py-0.5">
                                                    <input
                                                        type="number"
                                                        value={l.packages}
                                                        onChange={(e) =>
                                                            setLine(l.id, "packages", e.target.value)
                                                        }
                                                        className={cellClass}
                                                        placeholder="0"
                                                        disabled={isLocked}
                                                    />
                                                </td>
                                                <td className="px-1 py-0.5">
                                                    <input
                                                        value={l.weight}
                                                        onChange={(e) =>
                                                            setLine(l.id, "weight", e.target.value)
                                                        }
                                                        className={cellClass}
                                                        placeholder="0.000"
                                                        disabled={isLocked}
                                                    />
                                                </td>
                                                <td className="px-1 py-0.5">
                                                    <input
                                                        value={l.volume}
                                                        onChange={(e) =>
                                                            setLine(l.id, "volume", e.target.value)
                                                        }
                                                        className={cellClass}
                                                        placeholder="0.000"
                                                        disabled={isLocked}
                                                    />
                                                </td>
                                                <td className="px-1 py-0.5">
                                                    <input
                                                        value={l.remarks}
                                                        onChange={(e) =>
                                                            setLine(l.id, "remarks", e.target.value)
                                                        }
                                                        className={cellClass}
                                                        placeholder="Remarks"
                                                        disabled={isLocked}
                                                    />
                                                </td>
                                                <td className="px-1 py-0.5 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeLine(l.id)}
                                                        disabled={form.cargoLines.length === 1 || isLocked}
                                                        className="flex h-6 w-6 items-center justify-center rounded text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                                                        aria-label="Remove row"
                                                    >
                                                        <Trash2 size={11} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {form.cargoLines.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="px-3 py-5 text-center text-[11.5px] text-slate-400"
                                                >
                                                    No line items yet. Click "Add Item" to begin.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Section>

                        {/* Attachments + History */}
                        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                            <Section
                                id="attachments"
                                icon={Paperclip}
                                title="Attachments"
                                subtitle={`${form.attachments.length} file${form.attachments.length !== 1 ? "s" : ""}`}
                            >
                                <div className="space-y-1.5">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`group flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50/60 px-2.5 py-2 transition-all hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-gray-600 dark:bg-gray-800/40 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/5`}
                                    >
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-indigo-500 shadow-sm ring-1 ring-slate-200 transition-transform group-hover:scale-105 dark:bg-gray-900 dark:ring-gray-700">
                                            <Upload size={13} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11.5px] font-medium text-slate-700 dark:text-gray-300">
                                                Drop or{" "}
                                                <span className="text-indigo-600 underline dark:text-indigo-400">
                                                    browse
                                                </span>{" "}
                                                files
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                PDF, PNG, JPG up to 10 MB
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </div>

                                    {form.attachments.length === 0 ? (
                                        <p className="px-1 text-[11px] text-slate-400 dark:text-gray-500">
                                            No attachments yet.
                                        </p>
                                    ) : (
                                        form.attachments.map((file) => (
                                            <div
                                                key={file.id}
                                                className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11.5px] transition-colors hover:border-slate-300 dark:border-gray-700 dark:bg-gray-800/60 dark:hover:border-gray-600"
                                            >
                                                <div className="flex min-w-0 items-center gap-1.5">
                                                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400">
                                                        <FileText size={10} />
                                                    </div>
                                                    <span className="truncate font-medium text-slate-700 dark:text-gray-200">
                                                        {file.name}
                                                    </span>
                                                    <span className="shrink-0 text-[10px] text-slate-400">
                                                        {file.size}
                                                    </span>
                                                    {file.isExisting && file.url && (
                                                        <a
                                                            href={file.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="ml-1 text-indigo-500 hover:text-indigo-700"
                                                            title="View file"
                                                        >
                                                            <ExternalLink size={12} />
                                                        </a>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttachment(file.id)}
                                                    // disabled={isLocked}
                                                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:text-gray-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                                                >
                                                    <Trash2 size={11} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Section>

                            <Section
                                id="history"
                                icon={Clock}
                                title="Status History"
                                subtitle="Recent activity"
                            >
                                {form.audit.length === 0 ? (
                                    <p className="text-[11.5px] text-slate-400 dark:text-gray-500">
                                        No activity recorded yet.
                                    </p>
                                ) : (
                                    <ol className="relative space-y-3 border-l-2 border-slate-100 pl-3.5 dark:border-gray-800">
                                        {form.audit.map((a, i) => (
                                            <li key={i} className="relative">
                                                <span className="absolute -left-[19px] top-1 flex h-3 w-3 items-center justify-center">
                                                    <span className="relative h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-gray-800" />
                                                </span>
                                                <p className="text-[10px] font-medium text-slate-400">
                                                    {a.at || ""}
                                                </p>
                                                <p className="text-[11.5px] font-medium text-slate-800 dark:text-gray-200">
                                                    {a.text || ""}
                                                </p>
                                            </li>
                                        ))}
                                    </ol>
                                )}
                            </Section>
                        </div>
                    </div>
                </div>

                {/* RIGHT — sidebar */}
                <aside
                    className={`${sidebarOpen ? "fixed inset-y-0 right-0 z-40 w-[280px]" : "hidden"
                        } shrink-0 overflow-y-auto border-l border-slate-200/80 bg-white/70 p-2.5 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/70 lg:static lg:z-auto lg:block lg:w-[280px]`}
                >
                    <div className="space-y-2">
                        <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-sm dark:border-gray-700/70 dark:bg-gray-800/50">
                            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-gray-700/60">
                                <h3 className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-900 dark:text-white">
                                    <Sparkles size={12} className="text-indigo-500" />
                                    Summary
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setSidebarOpen(false)}
                                    className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-100 lg:hidden dark:hover:bg-gray-700"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                            <div className="space-y-1.5 p-2.5">
                                <div className="grid grid-cols-2 gap-1">
                                    {[
                                        { icon: modeIcon, label: "Mode", value: form.mode },
                                        { icon: Package, label: "Pkg", value: form.packages },
                                        {
                                            icon: Weight,
                                            label: "Wt",
                                            value: form.grossWeight
                                                ? `${form.grossWeight} kg`
                                                : "—",
                                        },
                                        {
                                            icon: Ruler,
                                            label: "Vol",
                                            value: form.volume
                                                ? `${form.volume} CBM`
                                                : "—",
                                        },
                                    ].map((it, i) => {
                                        const Icon = it.icon;
                                        return (
                                            <div
                                                key={i}
                                                className="flex items-center gap-1.5 rounded-md bg-slate-50 px-1.5 py-1 dark:bg-gray-800/60"
                                            >
                                                <Icon
                                                    size={11}
                                                    className="shrink-0 text-indigo-500 dark:text-indigo-400"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-[9.5px] font-medium uppercase tracking-wide text-slate-400 dark:text-gray-500">
                                                        {it.label}
                                                    </p>
                                                    <p
                                                        className="truncate text-[11px] font-semibold text-slate-800 dark:text-gray-100"
                                                        title={String(it.value)}
                                                    >
                                                        {it.value || "—"}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="space-y-1 border-t border-slate-100 pt-1.5 dark:border-gray-700/60">
                                    {summaryRows.map((row) => {
                                        const Icon = row.icon;
                                        return (
                                            <div
                                                key={row.label}
                                                className="flex items-center justify-between gap-2 text-[11px]"
                                            >
                                                <span className="flex items-center gap-1 text-slate-500 dark:text-gray-400">
                                                    <Icon size={10} />
                                                    {row.label}
                                                </span>
                                                <span
                                                    className="truncate font-medium text-slate-800 dark:text-gray-100"
                                                    title={String(row.value)}
                                                >
                                                    {row.value}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {form.bookingRef && (
                                        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-1 text-[11px] dark:border-gray-700/60">
                                            <span className="flex items-center gap-1 text-slate-500 dark:text-gray-400">
                                                <ClipboardList size={10} />
                                                Booking
                                            </span>
                                            <span
                                                className="truncate font-semibold text-indigo-700 dark:text-indigo-300"
                                                title={form.bookingRef}
                                            >
                                                {form.bookingRef}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-sm dark:border-gray-700/70 dark:bg-gray-800/50">
                            <div className="border-b border-slate-100 px-3 py-2 dark:border-gray-700/60">
                                <h3 className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-900 dark:text-white">
                                    <Zap size={12} className="text-indigo-500" />
                                    Quick Actions
                                </h3>
                            </div>
                            <div className="space-y-0.5 p-1.5">
                                <button
                                    type="button"
                                    onClick={() => runSave("draft")}
                                    disabled={!!busy}
                                    className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-[11.5px] font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                                >
                                    <Save size={12} className="text-slate-400" />
                                    Save as draft
                                    <kbd className="ml-auto rounded border border-slate-200 bg-slate-50 px-1 font-mono text-[9px] text-slate-400 dark:border-gray-600 dark:bg-gray-800">
                                        ⌘S
                                    </kbd>
                                </button>
                                <button
                                    type="button"
                                    disabled={!!busy}
                                    className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-[11.5px] font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                                >
                                    <PauseCircle size={12} className="text-amber-500" />
                                    Put on hold
                                </button>
                                <button
                                    type="button"
                                    disabled={!!busy}
                                    className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-[11.5px] font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                                >
                                    <XCircle size={12} />
                                    Cancel pre-job
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {sidebarOpen && (
                    <div
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
                    />
                )}
            </div>

            {/* FOOTER */}
            <div className="z-20 flex shrink-0 items-center justify-between gap-2 border-t border-slate-200/80 bg-white/80 px-3 py-1.5 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/80">
                <div className="hidden items-center gap-2 text-[10.5px] text-slate-500 sm:flex dark:text-gray-400">
                    <span className="flex items-center gap-1">
                        <CircleDot size={9} className="text-emerald-500" />
                        Auto-saved
                    </span>
                    <span className="text-slate-300 dark:text-gray-700">·</span>
                    <span>Last edit just now</span>
                </div>
                <div className="flex flex-1 items-center justify-end gap-1.5">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={!!busy}
                        className={btnGhost}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => runSave("draft")}
                        disabled={!!busy}
                        className={`${btnOutline} hidden sm:inline-flex`}
                    >
                        <Save size={12} />
                        Save Draft
                    </button>
                    <button
                        type="button"
                        onClick={() => runSave("submit")}
                        disabled={!!busy}
                        className={btnPrimary}
                    >
                        <Check size={12} />
                        {busy === "submit" ? "Submitting..." : "Submit Pre-Job"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreJobOpeningForm;