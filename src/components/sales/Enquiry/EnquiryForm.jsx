import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Check,
  ClipboardList,
  MapPin,
  Plane,
  Save,
  Ship,
  Truck,
} from "lucide-react";

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

const emptyCargo = {
  cargoType: "LCL",
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
  enquiryDate: today(),
  customer: "",
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

const places = ["Bengaluru", "Mumbai", "Chennai", "Hamburg", "Frankfurt"];

const locations = {
  Sea: {
    Bengaluru: [
      "Bengaluru ICD",
      "Chennai Port",
      "Jawaharlal Nehru Port (JNPT)",
      "Cochin Port",
    ],
    Hamburg: ["Port of Hamburg", "Port of Bremerhaven"],
    Mumbai: ["Jawaharlal Nehru Port (JNPT)", "Mumbai Port"],
    Chennai: ["Chennai Port"],
    Frankfurt: ["Port of Hamburg", "Port of Bremerhaven"],
  },
  Air: {
    Bengaluru: ["Kempegowda International Airport (BLR)"],
    Hamburg: ["Hamburg Airport (HAM)"],
    Frankfurt: ["Frankfurt Airport (FRA)"],
    Mumbai: ["Chhatrapati Shivaji Maharaj International Airport (BOM)"],
    Chennai: ["Chennai International Airport (MAA)"],
  },
  Road: {
    Bengaluru: ["Bengaluru Road Terminal", "Bengaluru ICD"],
    Hamburg: ["Hamburg Freight Terminal"],
    Frankfurt: ["Frankfurt Freight Terminal"],
    Mumbai: ["Mumbai Road Freight Terminal"],
    Chennai: ["Chennai Freight Terminal"],
  },
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
    <select
      value={value ?? ""}
      disabled={disabled}
      aria-invalid={!!error}
      aria-required={required || undefined}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} ${
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
  </Field>
);

const ModeCard = ({ value, hint, icon: Icon, selected, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(value)}
    aria-pressed={selected}
    className={`flex w-full items-center gap-2 rounded-lg border p-2 text-left transition ${
      selected
        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600/10 dark:bg-blue-500/10"
        : "border-slate-200 bg-white hover:border-slate-300 dark:border-gray-700 dark:bg-gray-900"
    }`}
  >
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
        selected
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

export default function EnquiryForm({ onBack = () => {}, onSave, editData }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => ({
    ...initialForm,
    ...editData,
    enquiryDate: editData?.enquiryDate || today(),
    cargoDetails: {
      ...emptyCargo,
      ...(editData?.cargoDetails || {}),
    },
  }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (editData) {
      setForm({
        ...initialForm,
        ...editData,
        enquiryDate: editData.enquiryDate || today(),
        cargoDetails: { ...emptyCargo, ...(editData.cargoDetails || {}) },
      });
      setStep(3);
    } else {
      setForm({
        ...initialForm,
        enquiryDate: today(),
        cargoDetails: { ...emptyCargo },
      });
      setStep(1);
    }
    setErrors({});
    setToast("");
  }, [editData]);

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
      cargoDetails: {
        ...emptyCargo,
        cargoType: mode === "Sea" ? "LCL" : "",
      },
    }));
    setErrors({});
  };

  const getLocations = (place) => {
    const key = place.trim();
    const list = locations[form.mode]?.[key] || [];
    const selectedValue =
      key && key === form.origin.trim()
        ? form.pol
        : key && key === form.destination.trim()
          ? form.pod
          : "";
    const options = list.length
      ? [...list]
      : key
        ? [`${key} — Other location`]
        : [];
    if (selectedValue && !options.includes(selectedValue))
      options.unshift(selectedValue);
    return options;
  };

  const portLabels = {
    Sea: ["POL / Origin Port or ICD", "POD / Destination Port"],
    Air: ["Origin Airport", "Destination Airport"],
    Road: ["Origin Terminal", "Destination Terminal"],
  }[form.mode];

  const totalWeight = useMemo(() => Number(cargo.weight || 0), [cargo.weight]);

  const totalVolume = useMemo(() => {
    const length = Number(cargo.length || 0);
    const width = Number(cargo.width || 0);
    const height = Number(cargo.height || 0);
    return length > 0 && width > 0 && height > 0
      ? (length * width * height) / 1000000
      : 0;
  }, [cargo.length, cargo.width, cargo.height]);

  const validateStep = (currentStep) => {
    const nextErrors = {};
    const positive = (value) => value !== "" && Number(value) > 0;

    // Combined Mode & Movement validations
    if (currentStep === 1) {
      if (!form.mode) nextErrors.mode = "Select a shipment mode.";
      if (!form.movement) nextErrors.movement = "Select Import or Export.";
    }

    // Route validations
    if (currentStep === 2) {
      if (!form.origin.trim()) nextErrors.origin = "Origin is required.";
      if (!form.destination.trim()) {
        nextErrors.destination = "Destination is required.";
      }
      if (form.origin.trim() && !form.pol) {
        nextErrors.pol = "Select an origin location.";
      }
      if (form.destination.trim() && !form.pod) {
        nextErrors.pod = "Select a destination location.";
      }
    }

    // Cargo Details validations
    if (currentStep === 3) {
      if (!form.enquiryDate) nextErrors.enquiryDate = "Date is required.";
      if (!form.customer.trim()) nextErrors.customer = "Customer is required.";
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
      await onSave({
        ...form,
        customer: form.customer.trim(),
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        cargo: form.cargo.trim(),
        pol: form.pol.trim(),
        pod: form.pod.trim(),
        cargoDetails: { ...cargo },
      });
      setToast(
        editData?.id
          ? "Enquiry updated successfully"
          : "Enquiry saved successfully",
      );
      window.setTimeout(() => setToast(""), 3500);
    } catch (error) {
      console.error("Unable to save enquiry:", error);
      setErrors((current) => ({
        ...current,
        submit: "Unable to save enquiry. Please try again.",
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
                  className={`text-left ${clickable ? "cursor-pointer" : "cursor-default"}`}
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
          
          {/* STEP 1: Combined Shipment Mode & Movement */}
          {step === 1 && (
            <div className="space-y-3">
              <StepHeader
                step={1}
                title="Shipment details"
                subtitle="Choose the mode of transport and the movement direction."
              />
              
              <div>
                <p className="mb-1 text-[11px] font-medium text-slate-600 dark:text-gray-300">Shipment mode</p>
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
                  <p className="mt-1 text-[10px] text-rose-500">{errors.mode}</p>
                )}
              </div>

              <div>
                <p className="mb-1 text-[11px] font-medium text-slate-600 dark:text-gray-300">Movement</p>
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
                        className={`flex items-center gap-2 rounded-lg border p-2 text-left transition ${
                          selected
                            ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600/10 dark:bg-blue-500/10"
                            : "border-slate-200 hover:border-slate-300 dark:border-gray-700"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-md ${
                            selected
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

          {/* STEP 2: Route */}
          {step === 2 && (
            <div>
              <StepHeader
                step={2}
                title="Set the shipment route"
                subtitle="Pick origin and destination, then the matching location."
              />
              <Section
                icon={MapPin}
                title="Shipment route"
                subtitle={`${form.mode} freight · ${form.movement}`}
              >
                <datalist id="enquiry-places">
                  {places.map((place) => (
                    <option key={place} value={place} />
                  ))}
                </datalist>

                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  <TextField
                    label="From"
                    required
                    list="enquiry-places"
                    value={form.origin}
                    onChange={(value) =>
                      setField("origin", value, { pol: "" })
                    }
                    placeholder="e.g. Bengaluru"
                    error={errors.origin}
                  />
                  <TextField
                    label="To"
                    required
                    list="enquiry-places"
                    value={form.destination}
                    onChange={(value) =>
                      setField("destination", value, { pod: "" })
                    }
                    placeholder="e.g. Hamburg"
                    error={errors.destination}
                  />
                  <SelectField
                    label={portLabels[0]}
                    required
                    value={form.pol}
                    onChange={(value) => setField("pol", value)}
                    options={getLocations(form.origin)}
                    error={errors.pol}
                    disabled={!form.origin.trim()}
                    placeholder={
                      form.origin.trim()
                        ? "Select location"
                        : "Enter origin first"
                    }
                  />
                  <SelectField
                    label={portLabels[1]}
                    required
                    value={form.pod}
                    onChange={(value) => setField("pod", value)}
                    options={getLocations(form.destination)}
                    error={errors.pod}
                    disabled={!form.destination.trim()}
                    placeholder={
                      form.destination.trim()
                        ? "Select location"
                        : "Enter destination first"
                    }
                  />
                </div>
                <p className="text-[10px] leading-4 text-slate-500 dark:text-gray-400">
                  City missing? Type it in From/To — a generic location option
                  will appear.
                </p>
              </Section>
            </div>
          )}

          {/* STEP 3: Cargo Details */}
          {step === 3 && (
            <div className="space-y-2">
              <StepHeader
                step={3}
                title="Complete enquiry details"
                subtitle="Review the shipment and add customer & cargo information."
              />

              {/* Compact shipment summary strip */}
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
                  {form.pol || "Origin location"} →{" "}
                  {form.pod || "Destination location"}
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
                    />
                    <TextField
                      label="Enquiry date"
                      type="date"
                      required
                      value={form.enquiryDate}
                      onChange={(value) => setField("enquiryDate", value)}
                      error={errors.enquiryDate}
                    />
                    <TextField
                      label="Customer"
                      required
                      value={form.customer}
                      onChange={(value) => setField("customer", value)}
                      placeholder="Customer / company"
                      error={errors.customer}
                      className="col-span-2"
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
                          label="Cargo type"
                          required
                          value={cargo.cargoType}
                          onChange={(value) =>
                            setCargoField("cargoType", value)
                          }
                          options={[
                            { value: "FCL", label: "FCL — Full Container Load" },
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
                            onChange={(value) =>
                              setCargoField("weight", value)
                            }
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
                          onChange={(value) =>
                            setCargoField("packages", value)
                          }
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
                            onChange={(value) =>
                              setCargoField("length", value)
                            }
                            error={errors.length}
                          />
                          <TextField
                            label="Width (CM)"
                            type="number"
                            value={cargo.width}
                            onChange={(value) =>
                              setCargoField("width", value)
                            }
                            error={errors.width}
                          />
                          <TextField
                            label="Height (CM)"
                            type="number"
                            value={cargo.height}
                            onChange={(value) =>
                              setCargoField("height", value)
                            }
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
                          onChange={(value) =>
                            setCargoField("packages", value)
                          }
                          error={errors.packages}
                        />
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 border-t border-slate-100 pt-1.5 dark:border-gray-700">
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
                    <div className="rounded-md bg-slate-50 px-2 py-1 dark:bg-gray-900">
                      <p className="text-[10px] text-slate-500 dark:text-gray-400">
                        Calculated volume
                      </p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {totalVolume.toLocaleString(undefined, {
                          maximumFractionDigits: 4,
                        })}{" "}
                        CBM
                      </p>
                    </div>
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