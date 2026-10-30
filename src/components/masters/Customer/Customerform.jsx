import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import customerMasterAPI from "../../../api/customerMasterAPI";
import { masterAPI } from "../../../api/cityAPI";
import { useToast } from "../../Toast/ToastContext";

/* ------------------------------------------------------------------ */
/* Constants & helpers                                                 */
/* ------------------------------------------------------------------ */

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "h-[32px] w-full rounded-md border border-slate-300 bg-white px-2.5 text-[12px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40 dark:disabled:bg-gray-800 dark:disabled:text-gray-500 dark:[color-scheme:dark]";

const errClass =
  "!border-red-500 focus:!ring-red-100 dark:focus:!ring-red-900/30";

const btnBase =
  "inline-flex h-[32px] items-center justify-center gap-1.5 rounded-md px-3 text-[12px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
const btnOutline = `${btnBase} border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-300 dark:hover:bg-gray-800`;
const btnPrimary = `${btnBase} bg-blue-600 text-white shadow-sm hover:bg-blue-700`;

// Shared grid so every row of fields lines up on the same 4 columns.
const gridClass =
  "grid grid-cols-1 items-start gap-x-3 gap-y-3 sm:grid-cols-2 lg:grid-cols-4";

const newAddressRow = () => ({
  id: `${Date.now()}-${Math.random()}`,
  dbId: null,
  address: "",
  country: "",
  state: "",
  city: "",
  postalCode: "",
  contactName: "",
  mobile: "",
  alternateMobile: "",
  email: "",
  landmark: "",
  stateList: [],
});

const getRelationId = (value) => {
  if (value && typeof value === "object") {
    return value.id == null ? "" : String(value.id);
  }
  return value == null || value === "" ? "" : String(value);
};

const extractList = (result, keys = []) => {
  if (Array.isArray(result)) return result;

  const sources = [
    result?.paramObjectsMap,
    result?.data?.paramObjectsMap,
    result?.data,
    result,
  ];

  for (const source of sources) {
    if (Array.isArray(source)) return source;

    if (source && typeof source === "object") {
      for (const key of keys) {
        if (Array.isArray(source[key])) return source[key];
      }
    }
  }

  return [];
};

const getCountryLabel = (c) => c?.countryName ?? c?.country ?? c?.name ?? "";
const getStateLabel = (s) => s?.stateName ?? s?.state ?? s?.name ?? "";
const getCityLabel = (c) => c?.cityName ?? c?.city ?? c?.name ?? "";

const buildInitialForm = (editData) => ({
  id: editData?.id || 0,
  customerName: editData?.customerName || "",
  customerType: editData?.customerType || "",
  industryType: editData?.industryType || "",
  gstin: editData?.gstin || "",
  pan: editData?.pan || "",
  active: editData
    ? editData.active === "Active" || editData.active === true
    : true,
  cancel: editData
    ? editData.cancel === "T" || editData.cancel === true
    : false,
  cancelRemarks: editData?.cancelRemarks || "",
});

// Used to detect unsaved changes (ignores row ids and cached lists).
const makeSnapshot = (form, rows) =>
  JSON.stringify({
    form,
    rows: rows.map(({ id, stateList, ...rest }) => rest), // eslint-disable-line no-unused-vars
  });

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

const Field = ({ label, required, error, hint, className = "", children }) => (
  <div className={`min-w-0 ${className}`}>
    {label && (
      <label className="mb-1 block text-[11px] font-medium leading-4 text-slate-600 dark:text-gray-300">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
    )}
    {children}
    {error ? (
      <p className="mt-1 text-[10px] leading-3 text-red-500">{error}</p>
    ) : (
      hint && (
        <p className="mt-1 text-[10px] leading-3 text-slate-500 dark:text-gray-400">
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
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      className={`${inputClass} ${error ? errClass : ""}`}
      {...rest}
    />
  </Field>
);

// Searchable dropdown (same behaviour as the Booking screen).
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
          `${o.label} ${o.sub || ""}`.toLowerCase().includes(t),
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
          className={`${inputClass} pl-8 ${
            selected && !disabled ? "pr-8" : ""
          } ${error ? errClass : ""}`}
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
        {open && !disabled && (
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

// Same height as an input so it lines up with the fields beside it.
const CheckBox = ({ checked, onChange, label, hint, tone = "blue" }) => (
  <label className="flex h-[32px] cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-slate-50/60 px-2.5 dark:border-gray-700 dark:bg-gray-900/40">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className={`h-3.5 w-3.5 rounded border-slate-300 ${
        tone === "red"
          ? "text-red-600 focus:ring-red-500"
          : "text-blue-600 focus:ring-blue-500"
      }`}
    />
    <span className="text-[11px] font-medium text-slate-700 dark:text-gray-200">
      {label}
      {hint && (
        <span className="ml-1.5 text-[10px] font-normal text-slate-500 dark:text-gray-400">
          {hint}
        </span>
      )}
    </span>
  </label>
);

const StatusChip = ({ status }) => {
  const styles = {
    Active:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    Inactive:
      "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-gray-700/40 dark:text-gray-300",
    Cancelled:
      "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300",
  };
  const dots = {
    Active: "bg-emerald-500",
    Inactive: "bg-slate-400",
    Cancelled: "bg-red-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
};

const Modal = ({ title, onClose, children, footer }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
    role="dialog"
    aria-modal="true"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose?.();
    }}
  >
    <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
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
      <div className="p-3">{children}</div>
      {footer && (
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-3 py-2 dark:border-gray-700/60">
          {footer}
        </div>
      )}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Customer form                                                       */
/* ------------------------------------------------------------------ */

const CustomerForm = ({ editData, onBack, onSaveSuccess }) => {
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";

  const { addToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [countries, setCountries] = useState([]);
  const [allCities, setAllCities] = useState([]);

  const [form, setForm] = useState(() => buildInitialForm(editData));
  const [addressRows, setAddressRows] = useState([newAddressRow()]);
  const [addressErrors, setAddressErrors] = useState([{}]);
  const [fieldErrors, setFieldErrors] = useState({});

  const [modal, setModal] = useState(null);

  const baselineRef = useRef("");
  const savedRowsRef = useRef([newAddressRow()]);
  const savedFormRef = useRef(buildInitialForm(editData));

  const dirty =
    !isLoading && makeSnapshot(form, addressRows) !== baselineRef.current;

  /* ---------- API helpers ---------- */
  const fetchStates = async (countryId) => {
    if (!countryId) return [];

    try {
      const result = await masterAPI.getStateByCountry(countryId, ORG_ID);
      return extractList(result, ["stateVO"]);
    } catch (error) {
      console.error("Failed to load states:", error);
      addToast("Failed to load states", "error");
      return [];
    }
  };

  const getCitiesForRow = (row) => {
    if (!row.state) return [];
    return allCities.filter(
      (city) => getRelationId(city.state) === String(row.state),
    );
  };

  /* ---------- Initial load ---------- */
  useEffect(() => {
    let cancelled = false;

    const buildRows = async () => {
      const addresses = Array.isArray(editData?.customerAddresses)
        ? editData.customerAddresses
        : [];

      if (addresses.length === 0) return [newAddressRow()];

      return Promise.all(
        addresses.map(async (address) => {
          const countryId = getRelationId(address.country);
          const stateId = getRelationId(address.state);
          const cityId = getRelationId(address.city);

          const stateList = countryId ? await fetchStates(countryId) : [];

          return {
            id: `edit-${address.id || Date.now()}-${Math.random()}`,
            dbId: address.id || null,
            address: address.address || "",
            country: countryId,
            state: stateId,
            city: cityId,
            postalCode: address.postalCode || "",
            contactName: address.contactName || "",
            mobile: address.mobile || "",
            alternateMobile: address.alternateMobile || "",
            email: address.email || "",
            landmark: address.landmark || "",
            stateList,
          };
        }),
      );
    };

    const initialize = async () => {
      setIsLoading(true);

      const [countryResult, cityResult] = await Promise.allSettled([
        masterAPI.getCountries(ORG_ID),
        masterAPI.getAllCities(ORG_ID),
      ]);

      if (cancelled) return;

      if (countryResult.status === "fulfilled") {
        setCountries(extractList(countryResult.value, ["countryVO"]));
      } else {
        console.error("Failed to load countries:", countryResult.reason);
        addToast("Failed to load countries", "error");
      }

      if (cityResult.status === "fulfilled") {
        setAllCities(extractList(cityResult.value, ["cityVO"]));
      } else {
        console.error("Failed to load cities:", cityResult.reason);
        addToast("Failed to load cities", "error");
      }

      const rows = editData ? await buildRows() : [newAddressRow()];

      if (cancelled) return;

      const initialForm = buildInitialForm(editData);

      setForm(initialForm);
      setAddressRows(rows);
      setAddressErrors(rows.map(() => ({})));
      setFieldErrors({});

      savedFormRef.current = initialForm;
      savedRowsRef.current = rows;
      baselineRef.current = makeSnapshot(initialForm, rows);

      setIsLoading(false);
    };

    initialize();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id]);

  /* ---------- Warn before closing the tab with unsaved changes ---------- */
  useEffect(() => {
    if (!dirty) return undefined;

    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const scrollTo = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  /* ---------- Options ---------- */
  const countryOptions = useMemo(
    () =>
      countries
        .filter((c) => c?.id != null)
        .map((c) => ({
          value: String(c.id),
          label: getCountryLabel(c),
          sub: c.countryCode,
        })),
    [countries],
  );

  /* ---------- Customer field handlers ---------- */
  const setField = (name, value) => {
    setFieldErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));

    let next = value;

    if (name === "gstin")
      next = value.toUpperCase().replace(/\s/g, "").slice(0, 15);
    if (name === "pan")
      next = value.toUpperCase().replace(/\s/g, "").slice(0, 10);

    setForm((prev) => {
      const updated = { ...prev, [name]: next };

      // Derive PAN from GSTIN.
      if (name === "gstin" && next.length === 15) {
        updated.pan = next.substring(2, 12);
      }

      return updated;
    });
  };

  /* ---------- Address handlers ---------- */
  const clearAddressError = (index, field) => {
    if (index < 0) return;

    setAddressErrors((prev) => {
      if (!prev[index]?.[field]) return prev;

      const next = [...prev];
      next[index] = { ...next[index], [field]: "" };
      return next;
    });
  };

  const updateRow = (id, patch) => {
    setAddressRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const handleAddressChange = (id, field, value) => {
    const index = addressRows.findIndex((row) => row.id === id);

    clearAddressError(index, field);

    if (["mobile", "alternateMobile"].includes(field) && value) {
      if (!/^\d+$/.test(value) || value.length > 10) return;
    }

    if (field === "postalCode" && value) {
      if (!/^\d+$/.test(value) || value.length > 6) return;
    }

    updateRow(id, { [field]: value });
  };

  const handleCountryChange = async (id, countryId) => {
    const index = addressRows.findIndex((row) => row.id === id);

    clearAddressError(index, "country");

    updateRow(id, {
      country: countryId,
      state: "",
      city: "",
      stateList: [],
    });

    if (!countryId) return;

    const stateList = await fetchStates(countryId);

    updateRow(id, { stateList });
  };

  const handleStateChange = (id, stateId) => {
    const index = addressRows.findIndex((row) => row.id === id);

    clearAddressError(index, "state");

    // Cities are filtered from allCities, so no API call is needed.
    updateRow(id, { state: stateId, city: "" });
  };

  const handleCityChange = (id, cityId) => {
    const index = addressRows.findIndex((row) => row.id === id);

    clearAddressError(index, "city");

    updateRow(id, { city: cityId });
  };

  const handleAddAddress = () => {
    const last = addressRows[addressRows.length - 1];

    if (
      last &&
      (!last.address.trim() || !last.country || !last.state || !last.city)
    ) {
      addToast(
        "Please complete the current address before adding another one",
        "warning",
      );
      return;
    }

    const row = newAddressRow();

    setAddressRows((prev) => [...prev, row]);
    setAddressErrors((prev) => [...prev, {}]);

    setTimeout(() => scrollTo(`cf-address-${row.id}`), 50);
  };

  const handleDeleteAddress = (id) => {
    if (addressRows.length === 1) {
      addToast("At least one address is required", "warning");
      return;
    }

    const index = addressRows.findIndex((row) => row.id === id);

    setAddressRows((prev) => prev.filter((row) => row.id !== id));
    setAddressErrors((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------- Validation ---------- */
  const validateForm = () => {
    const errors = {};

    if (!form.customerName.trim()) {
      errors.customerName = "Customer name is required";
    }
    if (!form.customerType.trim()) {
      errors.customerType = "Customer type is required";
    }
    if (!form.industryType.trim()) {
      errors.industryType = "Industry type is required";
    }
    if (form.gstin && !GSTIN_REGEX.test(form.gstin)) {
      errors.gstin = "Invalid GSTIN";
    }
    if (form.pan && !PAN_REGEX.test(form.pan)) {
      errors.pan = "Invalid PAN";
    }
    if (form.cancel && !form.cancelRemarks.trim()) {
      errors.cancelRemarks = "Remarks required when cancelled";
    }

    let addressesValid = true;
    let firstBadRowId = null;

    const nextAddressErrors = addressRows.map((row) => {
      const e = {};

      if (!row.address.trim()) e.address = "Address is required";
      if (!row.country) e.country = "Country is required";
      if (!row.state) e.state = "State is required";
      if (!row.city) e.city = "City is required";

      if (!row.postalCode) {
        e.postalCode = "Postal code is required";
      } else if (row.postalCode.length !== 6) {
        e.postalCode = "Must be 6 digits";
      }

      if (!row.contactName.trim()) e.contactName = "Contact name is required";

      if (!row.mobile) {
        e.mobile = "Mobile is required";
      } else if (row.mobile.length !== 10) {
        e.mobile = "Must be 10 digits";
      }

      if (row.alternateMobile && row.alternateMobile.length !== 10) {
        e.alternateMobile = "Must be 10 digits";
      }

      if (row.email && !EMAIL_REGEX.test(row.email)) {
        e.email = "Invalid email";
      }

      if (Object.keys(e).length) {
        addressesValid = false;
        if (!firstBadRowId) firstBadRowId = row.id;
      }

      return e;
    });

    setFieldErrors(errors);
    setAddressErrors(nextAddressErrors);

    const valid = Object.keys(errors).length === 0 && addressesValid;

    if (!valid) {
      addToast("Please fix the highlighted fields before saving", "error");

      if (Object.keys(errors).length) scrollTo("cf-details");
      else if (firstBadRowId) scrollTo(`cf-address-${firstBadRowId}`);
    }

    return valid;
  };

  /* ---------- Save ---------- */
  const handleSave = async () => {
    if (isSubmitting || !validateForm()) return;

    if (!ORG_ID || !BRANCH_ID) {
      addToast("Organization or Branch ID is missing", "error");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      active: form.active,
      branch: BRANCH_ID,
      cancel: form.cancel,
      cancelRemarks: form.cancelRemarks,
      createdBy: loginUserName,

      customerAddresses: addressRows.map((row) => ({
        ...(row.dbId ? { id: row.dbId } : {}),
        address: row.address.trim(),
        alternateMobile: row.alternateMobile,
        city: Number(row.city),
        contactName: row.contactName.trim(),
        country: Number(row.country),
        email: row.email,
        landmark: row.landmark,
        mobile: row.mobile,
        postalCode: row.postalCode,
        state: Number(row.state),
      })),

      customerName: form.customerName.trim(),
      customerType: form.customerType.trim(),
      gstin: form.gstin,
      industryType: form.industryType.trim(),
      orgId: ORG_ID,
      pan: form.pan,
    };

    if (form.id) payload.id = form.id;

    try {
      const response = await customerMasterAPI.saveCustomer(payload);

      const data = response?.data ?? response;
      const customerVO = data?.customerVO ?? data?.paramObjectsMap?.customerVO;

      if (customerVO) {
        // Mark as saved so the unsaved-changes warning does not fire.
        baselineRef.current = makeSnapshot(form, addressRows);

        addToast(
          data?.message ||
            (form.id
              ? "Customer updated successfully!"
              : "Customer created successfully!"),
          "success",
        );

        onSaveSuccess?.(form.id ? "updated" : "created");
        onBack?.();
      } else {
        addToast(
          data?.message ??
            data?.paramObjectsMap?.message ??
            "Failed to save customer",
          "error",
        );
      }
    } catch (error) {
      console.error("Customer save error:", error);

      addToast(
        error?.response?.data?.message ||
          error?.response?.data?.paramObjectsMap?.message ||
          "Save failed! Try again.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- Reset / exit ---------- */
  const handleReset = () => {
    setForm(savedFormRef.current);
    setAddressRows(savedRowsRef.current);
    setAddressErrors(savedRowsRef.current.map(() => ({})));
    setFieldErrors({});
    setModal(null);
    addToast("Unsaved changes cleared", "success");
  };

  const requestExit = () => {
    if (isSubmitting) return;

    if (dirty) setModal("discard");
    else onBack?.();
  };

  const status = form.cancel
    ? "Cancelled"
    : form.active
      ? "Active"
      : "Inactive";

  /* ---------- Loading gate ---------- */
  if (isLoading) {
    return (
      <div className="flex h-[70dvh] w-full items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-300">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading customer details...
        </div>
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-gray-900">
      <div className="w-full px-3 pb-0 pt-3 sm:px-4 lg:px-5">
        {/* Header */}
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={requestExit}
            disabled={isSubmitting}
            aria-label="Go back"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={15} />
          </button>

          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
            <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white sm:text-lg">
              {editData ? "Edit Customer" : "Create New Customer"}
            </h1>
            <StatusChip status={status} />
            {form.customerName && (
              <span className="truncate text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                {form.customerName}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {/* Customer details */}
          <div
            id="cf-details"
            className="scroll-mt-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-gray-700/60 dark:bg-gray-800/40"
          >
            <div className={gridClass}>
              <TextField
                label="Customer Name"
                required
                className="lg:col-span-2"
                value={form.customerName}
                onChange={(v) => setField("customerName", v)}
                error={fieldErrors.customerName}
                placeholder="Enter customer name"
              />

              <TextField
                label="Customer Type"
                required
                value={form.customerType}
                onChange={(v) => setField("customerType", v)}
                error={fieldErrors.customerType}
                placeholder="Enter Customer Type"
              />

              <TextField
                label="Industry Type"
                required
                value={form.industryType}
                onChange={(v) => setField("industryType", v)}
                error={fieldErrors.industryType}
                placeholder="Enter Industry Type"
              />

              <TextField
                label="GSTIN"
                value={form.gstin}
                onChange={(v) => setField("gstin", v)}
                error={fieldErrors.gstin}
                placeholder="15-character GSTIN"
              />

              <TextField
                label="PAN"
                value={form.pan}
                onChange={(v) => setField("pan", v)}
                error={fieldErrors.pan}
                placeholder="10-character PAN"
              />

              {/* Spacer keeps the checkbox level with the inputs beside it */}
              <div className="sm:pt-5">
                <CheckBox
                  checked={form.active}
                  onChange={(v) => setField("active", v)}
                  label="Active"
                />
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="space-y-3">
            {addressRows.map((row, index) => {
              const error = addressErrors[index] || {};

              const stateOptions = row.stateList
                .filter((s) => s?.id != null)
                .map((s) => ({
                  value: String(s.id),
                  label: getStateLabel(s),
                  sub: s.stateCode,
                }));

              const cityOptions = getCitiesForRow(row)
                .filter((c) => c?.id != null)
                .map((c) => ({
                  value: String(c.id),
                  label: getCityLabel(c),
                  sub: c.cityCode,
                }));

              const statePlaceholder = !row.country
                ? "Select country first"
                : stateOptions.length
                  ? "Search state"
                  : "No states found";

              const cityPlaceholder = !row.state
                ? "Select state first"
                : cityOptions.length
                  ? "Search city"
                  : "No cities found";

              const isLast = index === addressRows.length - 1;

              return (
                <div
                  key={row.id}
                  id={`cf-address-${row.id}`}
                  className="scroll-mt-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-gray-700/60 dark:bg-gray-800/40"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 dark:text-gray-200">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                        {index + 1}
                      </span>
                      Address {index + 1}
                    </span>

                    <div className="flex items-center gap-2">
                      {isLast && (
                        <button
                          type="button"
                          onClick={handleAddAddress}
                          className="inline-flex h-7 items-center gap-1 rounded-md border border-blue-200 bg-white px-2.5 text-[11px] font-semibold text-blue-700 transition hover:bg-blue-50 dark:border-blue-500/40 dark:bg-transparent dark:text-blue-300 dark:hover:bg-blue-500/10"
                        >
                          <Plus size={12} />
                          Add Address
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(row.id)}
                        disabled={addressRows.length === 1}
                        aria-label="Remove address"
                        title="Remove address"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-red-500/10"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className={gridClass}>
                    <TextField
                      label="Address"
                      required
                      className="sm:col-span-2"
                      value={row.address}
                      onChange={(v) =>
                        handleAddressChange(row.id, "address", v)
                      }
                      error={error.address}
                      placeholder="Street, building, area"
                    />

                    <TextField
                      label="Landmark"
                      value={row.landmark}
                      onChange={(v) =>
                        handleAddressChange(row.id, "landmark", v)
                      }
                      placeholder="Nearby landmark"
                    />

                    <TextField
                      label="Postal Code"
                      required
                      inputMode="numeric"
                      value={row.postalCode}
                      onChange={(v) =>
                        handleAddressChange(row.id, "postalCode", v)
                      }
                      error={error.postalCode}
                      placeholder="6 digits"
                    />

                    <LookupField
                      label="Country"
                      required
                      value={row.country}
                      onChange={(v) => handleCountryChange(row.id, v)}
                      options={countryOptions}
                      placeholder="Search country"
                      error={error.country}
                    />

                    <LookupField
                      label="State"
                      required
                      value={row.state}
                      onChange={(v) => handleStateChange(row.id, v)}
                      options={stateOptions}
                      disabled={!row.country}
                      placeholder={statePlaceholder}
                      error={error.state}
                    />

                    <LookupField
                      label="City"
                      required
                      value={row.city}
                      onChange={(v) => handleCityChange(row.id, v)}
                      options={cityOptions}
                      disabled={!row.state}
                      placeholder={cityPlaceholder}
                      error={error.city}
                    />

                    <TextField
                      label="Contact Name"
                      required
                      value={row.contactName}
                      onChange={(v) =>
                        handleAddressChange(row.id, "contactName", v)
                      }
                      error={error.contactName}
                      placeholder="Name"
                    />

                    <TextField
                      label="Mobile"
                      required
                      type="tel"
                      inputMode="numeric"
                      value={row.mobile}
                      onChange={(v) => handleAddressChange(row.id, "mobile", v)}
                      error={error.mobile}
                      placeholder="10 digits"
                    />

                    <TextField
                      label="Alternate Mobile"
                      type="tel"
                      inputMode="numeric"
                      value={row.alternateMobile}
                      onChange={(v) =>
                        handleAddressChange(row.id, "alternateMobile", v)
                      }
                      error={error.alternateMobile}
                      placeholder="10 digits"
                    />

                    <TextField
                      label="Email"
                      type="email"
                      className="sm:col-span-2"
                      value={row.email}
                      onChange={(v) => handleAddressChange(row.id, "email", v)}
                      error={error.email}
                      placeholder="name@company.com"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 z-20 -mx-3 mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2 sm:-mx-4 sm:px-4 lg:-mx-5 lg:px-5 dark:border-gray-800 dark:bg-gray-900">
          <button
            type="button"
            onClick={() => setModal("reset")}
            disabled={isSubmitting || !dirty}
            className={btnOutline}
          >
            <RotateCcw size={12} />
            Reset
          </button>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={requestExit}
              disabled={isSubmitting}
              className={btnOutline}
            >
              <X size={12} />
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className={btnPrimary}
            >
              {isSubmitting ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}
              {isSubmitting ? "Saving..." : editData ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {modal === "reset" && (
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
            {editData
              ? "All unsaved changes will be discarded and the last saved version restored."
              : "All entered data will be cleared."}
          </p>
        </Modal>
      )}

      {modal === "discard" && (
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
                  onBack?.();
                }}
              >
                Discard
              </button>
            </>
          }
        >
          <p className="text-[12px] text-slate-600 dark:text-gray-300">
            You have unsaved changes. Discard them and leave this screen?
          </p>
        </Modal>
      )}
    </div>
  );
};

export default CustomerForm;
