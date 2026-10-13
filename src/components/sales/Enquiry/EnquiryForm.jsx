import { useState } from "react";
import {
  ArrowLeft,
  Box,
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
  cargoDetails: emptyCargo,
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

const inputClass =
  "h-[32px] w-full rounded-md border border-slate-300 bg-white px-2.5 text-[12px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40 dark:disabled:bg-gray-800 dark:disabled:text-gray-500 dark:[color-scheme:dark]";

const Section = ({ icon: Icon, title, subtitle, children }) => (
  <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800/40">
    <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 dark:border-gray-700/60">
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

    <div className="p-3">{children}</div>
  </section>
);

const Field = ({ label, required, error, children }) => (
  <div className="min-w-0">
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
  ...rest
}) => (
  <Field label={label} required={required} error={error}>
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

const ModeButton = ({ value, hint, icon: Icon, selected, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(value)}
    aria-pressed={selected}
    className={`relative flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition ${
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

const EnquiryForm = ({ onBack, onSave, editData }) => {
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

  const cargo = form.cargoDetails;

  const setField = (name, value, extra = {}) => {
    setForm((p) => ({ ...p, [name]: value, ...extra }));

    setErrors((p) => ({
      ...p,
      [name]: "",
      ...Object.fromEntries(Object.keys(extra).map((k) => [k, ""])),
      submit: "",
    }));
  };

  const setCargoField = (name, value) => {
    setForm((p) => ({
      ...p,
      cargoDetails: {
        ...p.cargoDetails,
        [name]: value,
      },
    }));

    setErrors((p) => ({ ...p, [name]: "", submit: "" }));
  };

  const changeMode = (mode) => {
    setForm((p) => ({
      ...p,
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

    if (list.length) return list;

    return key ? [`${key} — Other location`] : [];
  };

  const portLabels = {
    Sea: ["POL / Origin Port or ICD", "POD / Destination Port"],
    Air: ["Origin Airport", "Destination Airport"],
    Road: ["Origin Terminal", "Destination Terminal"],
  }[form.mode];

  const validate = () => {
    const e = {};
    const positive = (v) => v !== "" && Number(v) > 0;

    if (!form.enquiryDate) e.enquiryDate = "Date is required";
    if (!form.customer.trim()) e.customer = "Customer is required";
    if (!form.cargo.trim()) e.cargo = "Cargo is required";
    if (!form.origin.trim()) e.origin = "Origin is required";
    if (!form.destination.trim()) e.destination = "Destination is required";

    if (form.origin.trim() && !form.pol) {
      e.pol = "Select a location";
    }

    if (form.destination.trim() && !form.pod) {
      e.pod = "Select a location";
    }

    [
      "weight",
      "cbm",
      "packages",
      "containers",
      "length",
      "width",
      "height",
    ].forEach((n) => {
      const v = cargo[n];

      if (v !== "" && (!Number.isFinite(Number(v)) || Number(v) < 0)) {
        e[n] = "Enter a valid number";
      }
    });

    if (form.mode === "Sea") {
      if (!cargo.cargoType) {
        e.cargoType = "Select cargo type";
      }

      if (cargo.cargoType === "FCL" && !positive(cargo.containers)) {
        e.containers = "Required";
      }

      if (["LCL", "CBM"].includes(cargo.cargoType) && !positive(cargo.cbm)) {
        e.cbm = "Required";
      }

      if (
        ["LCL", "CBM", "Weight"].includes(cargo.cargoType) &&
        !positive(cargo.weight)
      ) {
        e.weight = "Required";
      }
    }

    if (form.mode === "Air") {
      if (!positive(cargo.packages)) e.packages = "Required";
      if (!positive(cargo.weight)) e.weight = "Required";
    }

    if (form.mode === "Road") {
      if (!cargo.vehicleType) {
        e.vehicleType = "Select vehicle type";
      }

      if (!positive(cargo.weight)) e.weight = "Required";
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSubmitting(true);

    try {
      await onSave({
        ...form,
        customer: form.customer.trim(),
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        cargo: form.cargo.trim(),
        cargoDetails: { ...cargo },
      });
    } catch {
      setErrors((p) => ({
        ...p,
        submit: "Unable to save enquiry. Please try again.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

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

          <div>
            <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white sm:text-lg">
              {editData ? "Edit Enquiry" : "Create Enquiry"}
            </h1>
          </div>
        </div>

        <div className="space-y-2">
          <Section icon={ClipboardList} title="Enquiry Information">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <TextField
                label="Enquiry No"
                value={form.enquiryNo}
                placeholder="Auto-generated"
                disabled
              />

              <TextField
                label="Enquiry Date"
                required
                type="date"
                value={form.enquiryDate}
                onChange={(v) => setField("enquiryDate", v)}
                error={errors.enquiryDate}
              />

              <TextField
                label="Customer"
                required
                value={form.customer}
                onChange={(v) => setField("customer", v)}
                placeholder="Customer name"
                error={errors.customer}
              />

              <SelectField
                label="Movement"
                required
                value={form.movement}
                onChange={(v) => setField("movement", v)}
                options={["Export", "Import"]}
              />
            </div>
          </Section>

          <Section icon={Ship} title="Shipment Mode">
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
          </Section>

          <div className="grid grid-cols-1 items-stretch gap-2 lg:grid-cols-2">
            <Section icon={MapPin} title="Shipment Route">
              <datalist id="enquiry-places">
                {places.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <TextField
                  label="From"
                  required
                  list="enquiry-places"
                  value={form.origin}
                  onChange={(v) => setField("origin", v, { pol: "" })}
                  placeholder="e.g. Bengaluru"
                  error={errors.origin}
                />

                <TextField
                  label="To"
                  required
                  list="enquiry-places"
                  value={form.destination}
                  onChange={(v) => setField("destination", v, { pod: "" })}
                  placeholder="e.g. Hamburg"
                  error={errors.destination}
                />

                <SelectField
                  label={portLabels[0]}
                  required
                  value={form.pol}
                  onChange={(v) => setField("pol", v)}
                  options={getLocations(form.origin)}
                  error={errors.pol}
                  disabled={!form.origin.trim()}
                  placeholder={
                    form.origin.trim() ? "Select" : "Enter origin first"
                  }
                />

                <SelectField
                  label={portLabels[1]}
                  required
                  value={form.pod}
                  onChange={(v) => setField("pod", v)}
                  options={getLocations(form.destination)}
                  error={errors.pod}
                  disabled={!form.destination.trim()}
                  placeholder={
                    form.destination.trim()
                      ? "Select"
                      : "Enter destination first"
                  }
                />
              </div>
            </Section>

            <Section icon={Box} title="Cargo Details">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <TextField
                  label="Cargo Description"
                  required
                  value={form.cargo}
                  onChange={(v) => setField("cargo", v)}
                  placeholder="e.g. Electronics, Machinery"
                  error={errors.cargo}
                />

                {form.mode === "Sea" && (
                  <>
                    <SelectField
                      label="Cargo Type"
                      required
                      value={cargo.cargoType}
                      onChange={(v) => setCargoField("cargoType", v)}
                      options={[
                        { value: "FCL", label: "FCL - Full Container" },
                        { value: "LCL", label: "LCL - Less than Container" },
                        { value: "CBM", label: "CBM - Volume Based" },
                        { value: "Weight", label: "Weight Based" },
                      ]}
                      error={errors.cargoType}
                    />

                    {cargo.cargoType === "FCL" && (
                      <>
                        <SelectField
                          label="Container Size"
                          value={cargo.containerSize}
                          onChange={(v) => setCargoField("containerSize", v)}
                          options={["20 FT", "40 FT", "40 FT HC", "45 FT"]}
                        />

                        <TextField
                          label="No. of Containers"
                          required
                          type="number"
                          value={cargo.containers}
                          onChange={(v) => setCargoField("containers", v)}
                          error={errors.containers}
                        />
                      </>
                    )}

                    {["LCL", "CBM"].includes(cargo.cargoType) && (
                      <TextField
                        label="Volume (CBM)"
                        required
                        type="number"
                        value={cargo.cbm}
                        onChange={(v) => setCargoField("cbm", v)}
                        error={errors.cbm}
                      />
                    )}

                    <TextField
                      label="Gross Weight (KG)"
                      required={cargo.cargoType !== "FCL"}
                      type="number"
                      value={cargo.weight}
                      onChange={(v) => setCargoField("weight", v)}
                      error={errors.weight}
                    />
                  </>
                )}

                {form.mode === "Air" && (
                  <>
                    <TextField
                      label="No. of Packages"
                      required
                      type="number"
                      value={cargo.packages}
                      onChange={(v) => setCargoField("packages", v)}
                      error={errors.packages}
                    />

                    <TextField
                      label="Gross Weight (KG)"
                      required
                      type="number"
                      value={cargo.weight}
                      onChange={(v) => setCargoField("weight", v)}
                      error={errors.weight}
                    />

                    <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                      <TextField
                        label="Length (CM)"
                        type="number"
                        value={cargo.length}
                        onChange={(v) => setCargoField("length", v)}
                        error={errors.length}
                      />

                      <TextField
                        label="Width (CM)"
                        type="number"
                        value={cargo.width}
                        onChange={(v) => setCargoField("width", v)}
                        error={errors.width}
                      />

                      <TextField
                        label="Height (CM)"
                        type="number"
                        value={cargo.height}
                        onChange={(v) => setCargoField("height", v)}
                        error={errors.height}
                      />
                    </div>
                  </>
                )}

                {form.mode === "Road" && (
                  <>
                    <SelectField
                      label="Vehicle Type"
                      required
                      value={cargo.vehicleType}
                      onChange={(v) => setCargoField("vehicleType", v)}
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
                      label="Gross Weight (KG)"
                      required
                      type="number"
                      value={cargo.weight}
                      onChange={(v) => setCargoField("weight", v)}
                      error={errors.weight}
                    />

                    <TextField
                      label="No. of Packages"
                      type="number"
                      value={cargo.packages}
                      onChange={(v) => setCargoField("packages", v)}
                      error={errors.packages}
                    />
                  </>
                )}
              </div>
            </Section>
          </div>

          {errors.submit && (
            <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300">
              {errors.submit}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-0 py-2 sm:flex-row sm:justify-end dark:border-gray-800 dark:bg-gray-900">
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

export default EnquiryForm;
