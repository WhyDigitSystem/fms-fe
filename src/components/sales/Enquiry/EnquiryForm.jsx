import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  ClipboardList,
  MapPin,
  Plane,
  Save,
  Ship,
  Truck,
  X,
} from "lucide-react";
import EnquiryAPI from "../../../api/sales/enquiryAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";

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

const todayDisplay = () => isoToDisplay(todayIso());

// -------------------------------------------------------------
// Other Helpers
// -------------------------------------------------------------
const titleCase = (v) =>
  String(v || "")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (s) => s.toUpperCase());

const locationValue = (value) => {
  if (value == null || value === "") return "";
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  if (typeof value === "object") {
    if (value.city) return String(value.city);
    if (value.portName) return String(value.portName);
    return "";
  }
  return "";
};

const idValue = (value) => {
  if (value == null || value === "") return "";
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  if (typeof value === "object" && value.id != null) return String(value.id);
  return "";
};

const emptyCargo = {
  cargoType: "LCL",
  cargoTypeId: "",
  cargoGroupId: "",
  containerSize: "20 FT",
  containers: "",
  cbm: "",
  weight: "",
  packages: "",
  length: "",
  width: "",
  height: "",
  vehicleType: "",
};

const initialForm = {
  id: 0,
  enquiryNo: "",
  enquiryDate: todayDisplay(), // ✅ store display format
  company: "",
  movement: "Export",
  mode: "Sea",
  origin: "",
  destination: "",
  cargo: "",
  pol: "",
  pod: "",
  status: "Open",
  cargoDetails: { ...emptyCargo },
};

const modes = [
  { value: "Sea", icon: Ship, hint: "Ocean freight" },
  { value: "Air", icon: Plane, hint: "Air freight" },
  { value: "Road", icon: Truck, hint: "Road transport" },
];

/* ------------------------------------------------------------------ */
/* Compact primitives                                                   */
/* ------------------------------------------------------------------ */

const inputClass =
  "mt-0.5 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/30 dark:disabled:bg-gray-800";

const Section = ({ icon: Icon, title, subtitle, children, className = "" }) => (
  <section
    className={`overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-800/60 ${className}`}
  >
    <div className="flex items-center gap-1.5 border-b border-slate-100 px-2 py-1 dark:border-gray-700">
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
      className={`${inputClass} ${error ? "!border-rose-500 focus:!ring-rose-500/10" : ""
        }`}
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
          onChange={handleTextChange}
          aria-invalid={!!error}
          aria-required={required || undefined}
          className={`${inputClass} pr-8 ${error ? "!border-rose-500 focus:!ring-rose-500/10" : ""
            }`}
        />
        <button
          type="button"
          onClick={() => hiddenDateRef.current?.showPicker()}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-200"
          aria-label="Open date picker"
        >
          <CalendarIcon size={13} />
        </button>
        {/* Hidden native date input for the calendar widget */}
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
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  disabled,
  className = "",
}) => (
  <Field label={label} required={required} error={error} className={className}>
    <select
      value={value ?? ""}
      disabled={disabled}
      aria-invalid={!!error}
      aria-required={required || undefined}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} ${error ? "!border-rose-500 focus:!ring-rose-500/10" : ""
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
  </Field>
);

/* ✅ Searchable combobox for city pickers */
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

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const list = t
      ? options.filter((opt) => String(opt).toLowerCase().includes(t))
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
          value={open ? q : value ?? ""}
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
              onChange?.(filtered[0]);
              setOpen(false);
              e.currentTarget.blur();
            }
          }}
          className={`${inputClass} pr-14 ${error ? "!border-rose-500 focus:!ring-rose-500/10" : ""
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
              filtered.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange?.(opt);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left hover:bg-blue-50 dark:hover:bg-blue-500/10 ${opt === value
                        ? "bg-blue-50/60 font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                        : "text-slate-700 dark:text-gray-200"
                      }`}
                  >
                    <span className="truncate">{opt}</span>
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

const ModeCard = ({ value, hint, icon: Icon, selected, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(value)}
    aria-pressed={selected}
    className={`flex w-full items-center gap-2 rounded-lg border p-2 text-left transition ${selected
        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600/10 dark:bg-blue-500/10"
        : "border-slate-200 bg-white hover:border-slate-300 dark:border-gray-700 dark:bg-gray-900"
      }`}
  >
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${selected
          ? "bg-blue-600 text-white"
          : "bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-gray-300"
        }`}
    >
      <Icon size={18} />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-xs font-bold text-slate-900 dark:text-white">
        {value}
      </span>
      <span className="block truncate text-[10px] text-slate-500 dark:text-gray-400">
        {hint}
      </span>
    </span>
    {selected && (
      <Check size={16} className="shrink-0 text-blue-600 dark:text-blue-400" />
    )}
  </button>
);

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

export default function EnquiryForm({ onBack = () => { }, onSave, editData }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => ({
    ...initialForm,
    ...editData,
    // ✅ Normalize the date into dd-mm-yyyy for display
    enquiryDate: editData?.enquiryDate
      ? isoToDisplay(editData.enquiryDate)
      : todayDisplay(),
    cargoDetails: {
      ...emptyCargo,
      ...(editData?.cargoDetails || {}),
    },
  }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const [enquiryDocId, setEnquiryDocId] = useState("");
  const [loadingDocId, setLoadingDocId] = useState(false);
  const [recordLoading, setRecordLoading] = useState(false);

  // Port data
  const [ports, setPorts] = useState([]);
  const [portsLoading, setPortsLoading] = useState(false);

  // Cargo-type / cargo-group lookups
  const [cargoTypeValues, setCargoTypeValues] = useState([]);
  const [cargoGroupValues, setCargoGroupValues] = useState([]);
  const [lovLoading, setLovLoading] = useState(false);

  const orgId = parseInt(localStorage.getItem("orgId"), 10);
  const branch = Number(localStorage.getItem("branchId"));
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";

  // --------------------------------------------------------------
  // Fetch ports
  // --------------------------------------------------------------
  const fetchPorts = useCallback(async () => {
    if (!orgId || !branch) return;
    try {
      setPortsLoading(true);
      const list = await EnquiryAPI.getPortByOrgIdAndBranch(orgId, branch);
      setPorts(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to load ports:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Unable to load ports.",
      }));
    } finally {
      setPortsLoading(false);
    }
  }, [orgId, branch]);

  // --------------------------------------------------------------
  // Fetch cargo type + cargo group list values
  // --------------------------------------------------------------
  const fetchLookups = useCallback(async () => {
    if (!orgId) return;
    try {
      setLovLoading(true);
      const [cargoTypes, cargoGroups] = await Promise.all([
        listOfValuesAPI.getListValuesGroup("CARGO TYPE", orgId),
        listOfValuesAPI.getListValuesGroup("CARGO GROUP", orgId),
      ]);
      setCargoTypeValues(Array.isArray(cargoTypes) ? cargoTypes : []);
      setCargoGroupValues(Array.isArray(cargoGroups) ? cargoGroups : []);
    } catch (error) {
      console.error("Failed to load cargo lookups:", error);
    } finally {
      setLovLoading(false);
    }
  }, [orgId]);

  // --------------------------------------------------------------
  // Fetch auto-generated enquiry number when creating
  // --------------------------------------------------------------
  const fetchEnquiryDocId = useCallback(async () => {
    try {
      setLoadingDocId(true);
      const docId = await EnquiryAPI.getEnquiryDocId(orgId);
      setEnquiryDocId(docId || "");
      setForm((prev) => ({ ...prev, enquiryNo: docId || "" }));
    } catch (error) {
      console.error("Failed to load enquiry DocId:", error);
      setErrors((prev) => ({
        ...prev,
        enquiryNo: "Unable to fetch enquiry number.",
      }));
    } finally {
      setLoadingDocId(false);
    }
  }, [orgId]);

  // --------------------------------------------------------------
  // Load full record by id in edit mode
  // --------------------------------------------------------------
  const fetchEnquiryById = useCallback(async (id) => {
    try {
      setRecordLoading(true);
      const record = await EnquiryAPI.getEnquiryById(id);
      if (!record) return;

      const pickOrigin =
        record.originTerminal || record.originPort || record.originAirport;

      const pickDestination =
        record.destinationTerminal ||
        record.destinationPort ||
        record.destinationAirport;

      setForm({
        id: record.id || id,
        enquiryNo: record.docId || "",
        enquiryDate: isoToDisplay(record.docDate || todayIso()), // ✅ display format
        company: record.company || record.customer || "",
        movement: record.movement ? titleCase(record.movement) : "Export",
        mode: record.shipmentMode ? titleCase(record.shipmentMode) : "Sea",
        origin: locationValue(record.fromLocation),
        destination: locationValue(record.toLocation),
        cargo: record.cargoDescription || "",
        pol: idValue(pickOrigin),
        pod: idValue(pickDestination),
        status: "Open",
        cargoDetails: {
          cargoType:
            typeof record.cargoType === "object"
              ? record.cargoType?.valueCode || "LCL"
              : record.cargoType || "LCL",
          cargoTypeId: idValue(record.cargoTypeId || record.cargoType),
          cargoGroupId: idValue(record.cargoGroupId || record.cargoGroup),
          containerSize: "20 FT",
          containers: "",
          cbm: record.volumeCbm != null ? String(record.volumeCbm) : "",
          weight:
            record.grossWeightKg != null ? String(record.grossWeightKg) : "",
          packages:
            record.noOfPackages != null ? String(record.noOfPackages) : "",
          length: record.lengthCm != null ? String(record.lengthCm) : "",
          width: record.widthCm != null ? String(record.widthCm) : "",
          height: record.heightCm != null ? String(record.heightCm) : "",
          vehicleType: record.vehicleType || "",
        },
      });
      setEnquiryDocId(record.docId || "");
    } catch (error) {
      console.error("Failed to load enquiry:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to load enquiry details.",
      }));
    } finally {
      setRecordLoading(false);
    }
  }, []);

  // --------------------------------------------------------------
  // On mount
  // --------------------------------------------------------------
  useEffect(() => {
    fetchPorts();
    fetchLookups();
  }, [fetchPorts, fetchLookups]);

  useEffect(() => {
    if (editData?.id) {
      fetchEnquiryById(editData.id);
      setStep(3);
    } else {
      fetchEnquiryDocId();
      setStep(1);
    }
    setErrors({});
    setToast("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id]);

  const cargo = form.cargoDetails;

  const setField = (name, value, extra = {}) => {
    setForm((current) => ({ ...current, [name]: value, ...extra }));
    setErrors((current) => ({
      ...current,
      [name]: "",
      ...Object.fromEntries(Object.keys(extra).map((key) => [key, ""])),
      submit: "",
    }));
  };

  const setCargoField = (name, value) => {
    setForm((current) => ({
      ...current,
      cargoDetails: { ...current.cargoDetails, [name]: value },
    }));
    setErrors((current) => ({ ...current, [name]: "", submit: "" }));
  };

  const changeMode = (mode) => {
    setForm((current) => ({
      ...current,
      mode,
      pol: "",
      pod: "",
      origin: "",
      destination: "",
      cargoDetails: {
        ...emptyCargo,
        cargoType: mode === "Sea" ? "LCL" : "",
      },
    }));
    setErrors({});
  };

  // --------------------------------------------------------------
  // Derived data
  // --------------------------------------------------------------

  const cities = useMemo(() => {
    const seen = new Map();
    ports.forEach((p) => {
      const raw = p?.city?.city;
      if (!raw) return;
      const key = String(raw).trim().toUpperCase();
      if (key && !seen.has(key)) seen.set(key, String(raw).trim());
    });
    return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
  }, [ports]);

  const originCityOptions = useMemo(() => {
    const destinationKey = String(form.destination || "")
      .trim()
      .toUpperCase();
    return cities.filter(
      (c) =>
        !destinationKey || String(c).trim().toUpperCase() !== destinationKey,
    );
  }, [cities, form.destination]);

  const destinationCityOptions = useMemo(() => {
    const originKey = String(form.origin || "").trim().toUpperCase();
    return cities.filter(
      (c) => !originKey || String(c).trim().toUpperCase() !== originKey,
    );
  }, [cities, form.origin]);

  const getPortsForCity = useCallback(
    (city) => {
      if (!city || !ports.length) return [];
      const modeUpper = String(form.mode || "").trim().toUpperCase();
      const cityUpper = String(city).trim().toUpperCase();
      return ports
        .filter((p) => {
          const pType = String(p?.portType || "").trim().toUpperCase();
          const pCity = String(p?.city?.city || "").trim().toUpperCase();
          return pType === modeUpper && pCity === cityUpper;
        })
        .map((p) => ({
          value: String(p.id),
          label: `${p.portName} (${p.portCode})`,
        }));
    },
    [ports, form.mode],
  );

  const originPortOptions = useMemo(
    () => getPortsForCity(form.origin),
    [getPortsForCity, form.origin],
  );

  const destinationPortOptions = useMemo(
    () => getPortsForCity(form.destination),
    [getPortsForCity, form.destination],
  );

  // ✅ Auto-select when a city has exactly one matching port
  useEffect(() => {
    if (
      originPortOptions.length === 1 &&
      form.pol !== originPortOptions[0].value
    ) {
      setForm((current) => ({
        ...current,
        pol: originPortOptions[0].value,
      }));
      setErrors((current) => ({ ...current, pol: "" }));
    }
  }, [originPortOptions, form.pol]);

  useEffect(() => {
    if (
      destinationPortOptions.length === 1 &&
      form.pod !== destinationPortOptions[0].value
    ) {
      setForm((current) => ({
        ...current,
        pod: destinationPortOptions[0].value,
      }));
      setErrors((current) => ({ ...current, pod: "" }));
    }
  }, [destinationPortOptions, form.pod]);

  const getAvailableTypesForCity = useCallback(
    (city) => {
      if (!city || !ports.length) return [];
      const cityUpper = String(city).trim().toUpperCase();
      const set = new Set();
      ports.forEach((p) => {
        const pCity = String(p?.city?.city || "").trim().toUpperCase();
        if (pCity === cityUpper && p?.portType) {
          set.add(String(p.portType).toUpperCase());
        }
      });
      return Array.from(set);
    },
    [ports],
  );

  const cargoTypeOptions = useMemo(
    () =>
      cargoTypeValues.map((v) => ({
        value: String(v.id),
        label: v.valuesDescription || String(v.id),
      })),
    [cargoTypeValues],
  );

  const cargoGroupOptions = useMemo(
    () =>
      cargoGroupValues.map((v) => ({
        value: String(v.id),
        label: v.valuesDescription || String(v.id),
      })),
    [cargoGroupValues],
  );

  const portLabels = {
    Sea: ["Origin Port", "Destination Port"],
    Air: ["Origin Airport", "Destination Airport"],
    Road: ["Origin Terminal", "Destination Terminal"],
  }[form.mode];

  const totalWeight = useMemo(() => Number(cargo.weight || 0), [cargo.weight]);

  const validateStep = (currentStep) => {
    const nextErrors = {};
    const positive = (value) => value !== "" && Number(value) > 0;

    if (currentStep === 1) {
      if (!form.mode) nextErrors.mode = "Select a shipment mode.";
      if (!form.movement) nextErrors.movement = "Select Import or Export.";
    }

    if (currentStep === 2) {
      if (!form.origin.trim()) nextErrors.origin = "Origin is required.";
      if (!form.destination.trim()) {
        nextErrors.destination = "Destination is required.";
      }
      if (
        form.origin.trim() &&
        form.destination.trim() &&
        form.origin.trim().toUpperCase() ===
        form.destination.trim().toUpperCase()
      ) {
        nextErrors.destination = "Destination must be different from origin.";
      }
      if (form.origin.trim() && !form.pol) {
        nextErrors.pol = "Select an origin port.";
      }
      if (form.destination.trim() && !form.pod) {
        nextErrors.pod = "Select a destination port.";
      }
    }

    if (currentStep === 3) {
      if (!displayToIso(form.enquiryDate)) {
        nextErrors.enquiryDate = "Enter a valid date (dd-mm-yyyy).";
      }
      if (!form.company.trim()) nextErrors.company = "Company is required.";
      if (!form.cargo.trim())
        nextErrors.cargo = "Cargo description is required.";

      [
        "weight",
        "cbm",
        "packages",
        "containers",
        "length",
        "width",
        "height",
      ].forEach((name) => {
        const value = cargo[name];
        if (
          value !== "" &&
          (!Number.isFinite(Number(value)) || Number(value) < 0)
        ) {
          nextErrors[name] = "Enter a valid number.";
        }
      });

      if (form.mode === "Sea") {
        if (!cargo.cargoType) nextErrors.cargoType = "Select cargo type.";
        if (cargo.cargoType === "FCL" && !positive(cargo.containers)) {
          nextErrors.containers = "Enter the number of containers.";
        }
        if (["LCL", "CBM"].includes(cargo.cargoType) && !positive(cargo.cbm)) {
          nextErrors.cbm = "Enter volume in CBM.";
        }
        if (
          ["LCL", "CBM", "Weight"].includes(cargo.cargoType) &&
          !positive(cargo.weight)
        ) {
          nextErrors.weight = "Enter gross weight.";
        }
      }

      if (form.mode === "Air") {
        if (!positive(cargo.packages)) {
          nextErrors.packages = "Enter the number of packages.";
        }
        if (!positive(cargo.weight)) nextErrors.weight = "Enter gross weight.";
      }

      if (form.mode === "Road") {
        if (!cargo.vehicleType) {
          nextErrors.vehicleType = "Select a vehicle type.";
        }
        if (!positive(cargo.weight)) nextErrors.weight = "Enter gross weight.";
      }
    }

    setErrors((current) => ({ ...current, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    setErrors({});
    setStep((current) => Math.min(3, current + 1));
  };

  const previousStep = () => {
    setErrors({});
    setStep((current) => Math.max(1, current - 1));
  };

  const goToStep = (target) => {
    if (target >= step) return;
    setErrors({});
    setStep(target);
  };

  // --------------------------------------------------------------
  // Save
  // --------------------------------------------------------------
  const handleSave = async () => {
    if (!validateStep(3)) return;
    if (typeof onSave !== "function") {
      setErrors((current) => ({
        ...current,
        submit: "Save handler is missing. Pass an onSave function.",
      }));
      return;
    }

    setSubmitting(true);

    try {
      const toNumber = (value) => {
        const n = Number(value);
        return Number.isFinite(n) ? n : 0;
      };

      const originPortRec = ports.find(
        (p) => String(p.id) === String(form.pol),
      );
      const destPortRec = ports.find(
        (p) => String(p.id) === String(form.pod),
      );
      const fromLocationId = toNumber(originPortRec?.city?.id || 0);
      const toLocationId = toNumber(destPortRec?.city?.id || 0);

      const originTerminal = toNumber(form.pol);
      const destinationTerminal = toNumber(form.pod);

      const isUpdate = Boolean(form.id && form.id > 0);

      // ✅ Convert dd-mm-yyyy → yyyy-mm-dd for the API
      const enquiryDateIso = displayToIso(form.enquiryDate) || null;

      const payload = {
        orgId,
        branch: Number(branch),
        createdBy: loginUserName,

        enquiryDate: enquiryDateIso,
        shipmentMode: form.mode.toUpperCase(),
        movement: form.movement.toUpperCase(),

        fromLocation: fromLocationId,
        toLocation: toLocationId,

        originTerminal,
        destinationTerminal,

        cargoDescription: form.cargo.trim(),
        cargoType: toNumber(cargo.cargoTypeId),
        cargoGroup: toNumber(cargo.cargoGroupId),

        grossWeightKg: toNumber(cargo.weight),
        volumeCbm: toNumber(cargo.cbm),
        noOfPackages: toNumber(cargo.packages),
        lengthCm: toNumber(cargo.length),
        widthCm: toNumber(cargo.width),
        heightCm: toNumber(cargo.height),
        vehicleType: cargo.vehicleType || "",

        company: form.company.trim(),
        remarks: "",
        cancelRemarks: "",
      };

      if (isUpdate) {
        payload.id = form.id;
      }

      const result = await EnquiryAPI.createUpdateEnquiry(payload);

      await onSave({
        ...form,
        enquiryDate: enquiryDateIso,
        company: form.company.trim(),
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        cargo: form.cargo.trim(),
        pol: form.pol.trim(),
        pod: form.pod.trim(),
        cargoDetails: { ...cargo },
        payload,
        result,
      });

      setToast(
        isUpdate
          ? "Enquiry updated successfully"
          : "Enquiry saved successfully",
      );
      window.setTimeout(() => setToast(""), 3500);
    } catch (error) {
      console.error("Unable to save enquiry:", error);
      setErrors((current) => ({
        ...current,
        submit:
          error?.response?.data?.paramObjectsMap?.message ||
          error?.response?.data?.message ||
          "Unable to save enquiry. Please try again.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (submitting) return;
    if (step < 3) nextStep();
    else handleSave();
  };

  const steps = ["Mode & Movement", "Route", "Cargo details"];

  if (loadingDocId || recordLoading) {
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
          Loading enquiry...
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
        className="flex h-full max-h-[500px] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900"
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
                Enquiry management
              </p>
              <h1 className="truncate text-sm font-bold">
                {editData ? "Edit Enquiry" : "Create Enquiry"}
              </h1>
            </div>
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
                  className={`text-left ${clickable ? "cursor-pointer" : "cursor-default"
                    }`}
                >
                  <div
                    className={`h-1 rounded-full transition ${step >= stepNo ? "bg-blue-400" : "bg-white/20"
                      }`}
                  />
                  <p
                    className={`mt-1 truncate text-[9px] ${step >= stepNo ? "text-white" : "text-slate-400"
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
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <p className="mb-1 text-[11px] font-medium text-slate-600 dark:text-gray-300">
                  Shipment mode
                </p>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                  {modes.map((mode) => (
                    <ModeCard
                      key={mode.value}
                      {...mode}
                      selected={form.mode === mode.value}
                      onClick={changeMode}
                    />
                  ))}
                </div>
                {errors.mode && (
                  <p className="mt-1 text-[10px] text-rose-500">
                    {errors.mode}
                  </p>
                )}
              </div>

              <div>
                <p className="mb-1 text-[11px] font-medium text-slate-600 dark:text-gray-300">
                  Movement
                </p>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {[
                    {
                      value: "Import",
                      title: "Import",
                      description: "Cargo arriving into the country",
                      icon: ArrowLeft,
                    },
                    {
                      value: "Export",
                      title: "Export",
                      description: "Cargo moving out of the country",
                      icon: ArrowRight,
                    },
                  ].map(({ value, title, description, icon: Icon }) => {
                    const selected = form.movement === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setField("movement", value)}
                        aria-pressed={selected}
                        className={`flex items-center gap-2 rounded-lg border p-2 text-left transition ${selected
                            ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600/10 dark:bg-blue-500/10"
                            : "border-slate-200 hover:border-slate-300 dark:border-gray-700"
                          }`}
                      >
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-md ${selected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                        >
                          <Icon size={18} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-bold text-slate-900 dark:text-white">
                            {title}
                          </span>
                          <span className="block truncate text-[10px] text-slate-500 dark:text-gray-400">
                            {description}
                          </span>
                        </span>
                        {selected && (
                          <Check size={16} className="text-blue-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {errors.movement && (
                  <p className="mt-1 text-[10px] text-rose-500">
                    {errors.movement}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <Section
                icon={MapPin}
                title="Shipment route"
                subtitle={`${form.mode} freight · ${form.movement}`}
              >
                {portsLoading ? (
                  <p className="text-[11px] text-slate-500 dark:text-gray-400">
                    Loading locations...
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {/* ✅ Searchable From / To */}
                    <SearchableSelectField
                      label="From"
                      required
                      value={form.origin}
                      onChange={(value) =>
                        setField("origin", value, { pol: "" })
                      }
                      options={originCityOptions}
                      placeholder={
                        cities.length
                          ? "Search origin city"
                          : "No cities available"
                      }
                      error={errors.origin}
                    />
                    <SearchableSelectField
                      label="To"
                      required
                      value={form.destination}
                      onChange={(value) =>
                        setField("destination", value, { pod: "" })
                      }
                      options={destinationCityOptions}
                      placeholder={
                        cities.length
                          ? "Search destination city"
                          : "No cities available"
                      }
                      error={errors.destination}
                    />
                    <SelectField
                      label={portLabels[0]}
                      required
                      value={form.pol}
                      onChange={(value) => setField("pol", value)}
                      options={originPortOptions}
                      error={errors.pol}
                      disabled={!form.origin}
                      placeholder={
                        form.origin
                          ? "Select port"
                          : "Select origin city first"
                      }
                    />
                    <SelectField
                      label={portLabels[1]}
                      required
                      value={form.pod}
                      onChange={(value) => setField("pod", value)}
                      options={destinationPortOptions}
                      error={errors.pod}
                      disabled={!form.destination}
                      placeholder={
                        form.destination
                          ? "Select port"
                          : "Select destination city first"
                      }
                    />
                  </div>
                )}

                {form.origin && !originPortOptions.length && !portsLoading && (
                  <p className="text-[10px] leading-4 text-amber-600 dark:text-amber-400">
                    No {form.mode.toLowerCase()} ports found for "{form.origin}
                    ".{" "}
                    {(() => {
                      const types = getAvailableTypesForCity(form.origin);
                      return types.length
                        ? `Available types: ${types.join(", ")}. Switch mode to continue.`
                        : "No ports at all for this city.";
                    })()}
                  </p>
                )}

                {form.destination &&
                  !destinationPortOptions.length &&
                  !portsLoading && (
                    <p className="text-[10px] leading-4 text-amber-600 dark:text-amber-400">
                      No {form.mode.toLowerCase()} ports found for "
                      {form.destination}".{" "}
                      {(() => {
                        const types = getAvailableTypesForCity(
                          form.destination,
                        );
                        return types.length
                          ? `Available types: ${types.join(", ")}. Switch mode to continue.`
                          : "No ports at all for this city.";
                      })()}
                    </p>
                  )}
              </Section>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-2">
              {/* Route summary */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-gray-700 dark:bg-gray-800/60">
                <div className="flex min-w-0 items-center gap-1.5 text-xs">
                  <span className="truncate font-semibold text-slate-900 dark:text-white">
                    {form.origin || "Origin"}
                  </span>
                  <ArrowRight size={12} className="shrink-0 text-blue-500" />
                  <span className="truncate font-semibold text-slate-900 dark:text-white">
                    {form.destination || "Destination"}
                  </span>
                </div>
                <div className="min-w-0 flex-1 truncate text-[10px] text-slate-500 dark:text-gray-400">
                  {originPortOptions.find((o) => o.value === form.pol)
                    ?.label || "Origin port"}{" "}
                  →{" "}
                  {destinationPortOptions.find((o) => o.value === form.pod)
                    ?.label || "Destination port"}
                </div>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                  {form.mode} · {form.movement}
                </span>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-[10px] font-semibold text-blue-600 underline underline-offset-2 dark:text-blue-400"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 items-start gap-2 md:grid-cols-2">
                <Section
                  icon={ClipboardList}
                  title="Enquiry information"
                  subtitle="Basic details"
                >
                  <div className="grid grid-cols-2 gap-1.5">
                    <TextField
                      label="Enquiry number"
                      value={form.enquiryNo}
                      placeholder="Auto-generated"
                      disabled
                      error={errors.enquiryNo}
                    />
                    {/* ✅ dd-mm-yyyy Date Input */}
                    <DatePickerField
                      label="Enquiry date"
                      required
                      value={form.enquiryDate}
                      onChange={(value) => setField("enquiryDate", value)}
                      error={errors.enquiryDate}
                    />
                    <TextField
                      label="Company"
                      required
                      value={form.company}
                      onChange={(value) => setField("company", value)}
                      placeholder="Company name"
                      error={errors.company}
                      className="col-span-2"
                    />
                    <SelectField
                      label="Cargo type"
                      className="col-span-1"
                      value={cargo.cargoTypeId}
                      onChange={(value) =>
                        setCargoField("cargoTypeId", value)
                      }
                      options={cargoTypeOptions}
                      placeholder={
                        lovLoading
                          ? "Loading cargo types..."
                          : cargoTypeOptions.length
                            ? "Select cargo type"
                            : "No cargo types available"
                      }
                      disabled={lovLoading || !cargoTypeOptions.length}
                    />
                    <SelectField
                      label="Cargo group"
                      className="col-span-1"
                      value={cargo.cargoGroupId}
                      onChange={(value) =>
                        setCargoField("cargoGroupId", value)
                      }
                      options={cargoGroupOptions}
                      placeholder={
                        lovLoading
                          ? "Loading cargo groups..."
                          : cargoGroupOptions.length
                            ? "Select cargo group"
                            : "No cargo groups available"
                      }
                      disabled={lovLoading || !cargoGroupOptions.length}
                    />
                    <TextField
                      label="Cargo description"
                      required
                      value={form.cargo}
                      onChange={(value) => setField("cargo", value)}
                      placeholder="e.g. Electronics, machinery"
                      error={errors.cargo}
                      className="col-span-2"
                    />
                  </div>
                </Section>

                <Section
                  icon={Box}
                  title="Cargo details"
                  subtitle="Fields adapt to the selected mode"
                >
                  <div className="grid grid-cols-2 gap-1.5">
                    {form.mode === "Sea" && (
                      <>
                        <SelectField
                          className="col-span-2"
                          label="Load type"
                          required
                          value={cargo.cargoType}
                          onChange={(value) =>
                            setCargoField("cargoType", value)
                          }
                          options={[
                            {
                              value: "FCL",
                              label: "FCL — Full Container Load",
                            },
                            {
                              value: "LCL",
                              label: "LCL — Less than Container Load",
                            },
                            { value: "CBM", label: "CBM — Volume Based" },
                            { value: "Weight", label: "Weight Based" },
                          ]}
                          error={errors.cargoType}
                        />
                        {cargo.cargoType === "FCL" && (
                          <>
                            <SelectField
                              label="Container size"
                              value={cargo.containerSize}
                              onChange={(value) =>
                                setCargoField("containerSize", value)
                              }
                              options={["20 FT", "40 FT", "40 FT HC", "45 FT"]}
                            />
                            <TextField
                              label="No. of containers"
                              required
                              type="number"
                              value={cargo.containers}
                              onChange={(value) =>
                                setCargoField("containers", value)
                              }
                              error={errors.containers}
                            />
                            <TextField
                              className="col-span-2"
                              label="Gross weight (KG)"
                              type="number"
                              value={cargo.weight}
                              onChange={(value) =>
                                setCargoField("weight", value)
                              }
                              error={errors.weight}
                            />
                          </>
                        )}
                        {["LCL", "CBM"].includes(cargo.cargoType) && (
                          <>
                            <TextField
                              label="Volume (CBM)"
                              required
                              type="number"
                              value={cargo.cbm}
                              onChange={(value) => setCargoField("cbm", value)}
                              error={errors.cbm}
                            />
                            <TextField
                              label="Gross weight (KG)"
                              required
                              type="number"
                              value={cargo.weight}
                              onChange={(value) =>
                                setCargoField("weight", value)
                              }
                              error={errors.weight}
                            />
                          </>
                        )}
                        {cargo.cargoType === "Weight" && (
                          <TextField
                            className="col-span-2"
                            label="Gross weight (KG)"
                            required
                            type="number"
                            value={cargo.weight}
                            onChange={(value) => setCargoField("weight", value)}
                            error={errors.weight}
                          />
                        )}
                      </>
                    )}

                    {form.mode === "Air" && (
                      <>
                        <TextField
                          label="No. of packages"
                          required
                          type="number"
                          value={cargo.packages}
                          onChange={(value) => setCargoField("packages", value)}
                          error={errors.packages}
                        />
                        <TextField
                          label="Gross weight (KG)"
                          required
                          type="number"
                          value={cargo.weight}
                          onChange={(value) => setCargoField("weight", value)}
                          error={errors.weight}
                        />
                        <div className="col-span-2 grid grid-cols-3 gap-1.5">
                          <TextField
                            label="Length (CM)"
                            type="number"
                            value={cargo.length}
                            onChange={(value) => setCargoField("length", value)}
                            error={errors.length}
                          />
                          <TextField
                            label="Width (CM)"
                            type="number"
                            value={cargo.width}
                            onChange={(value) => setCargoField("width", value)}
                            error={errors.width}
                          />
                          <TextField
                            label="Height (CM)"
                            type="number"
                            value={cargo.height}
                            onChange={(value) => setCargoField("height", value)}
                            error={errors.height}
                          />
                        </div>
                      </>
                    )}

                    {form.mode === "Road" && (
                      <>
                        <SelectField
                          className="col-span-2"
                          label="Vehicle type"
                          required
                          value={cargo.vehicleType}
                          onChange={(value) =>
                            setCargoField("vehicleType", value)
                          }
                          options={[
                            "Mini Truck",
                            "LCV",
                            "Truck",
                            "Trailer",
                            "Container Truck",
                          ]}
                          error={errors.vehicleType}
                        />
                        <TextField
                          label="Gross weight (KG)"
                          required
                          type="number"
                          value={cargo.weight}
                          onChange={(value) => setCargoField("weight", value)}
                          error={errors.weight}
                        />
                        <TextField
                          label="No. of packages"
                          type="number"
                          value={cargo.packages}
                          onChange={(value) => setCargoField("packages", value)}
                          error={errors.packages}
                        />
                      </>
                    )}
                  </div>

                  <div className="rounded-md bg-slate-50 px-2 py-1 dark:bg-gray-900">
                    <p className="text-[10px] text-slate-500 dark:text-gray-400">
                      Gross weight
                    </p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {totalWeight.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      kg
                    </p>
                  </div>
                </Section>
              </div>

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
              onClick={previousStep}
              disabled={submitting}
              className="flex-1 rounded-md border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              type="submit"
              disabled={submitting}
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
                  ? "Update enquiry"
                  : "Save enquiry"}
            </button>
          )}
        </footer>
      </form>
    </div>
  );
}