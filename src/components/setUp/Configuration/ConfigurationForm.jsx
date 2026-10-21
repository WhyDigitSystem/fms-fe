import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Globe,
  Save,
  Settings2,
  SlidersHorizontal,
  X,
} from "lucide-react";

const initialForm = {
  id: 0,
  configurationName: "",
  companyName: "",
  companyCode: "",
  financialYear: "2026-2027",
  dateFormat: "DD-MM-YYYY",
  currency: "INR",
  timeZone: "Asia/Kolkata",
  language: "English",
  rowsPerPage: "10",
  theme: "System Default",
  emailNotifications: true,
  autoDocNumber: true,
  status: "Active",
};

const inputClass =
  "h-[32px] w-full rounded-md border border-slate-300 bg-white px-2.5 text-[12px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40 dark:disabled:bg-gray-800 dark:[color-scheme:dark]";

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

const TextField = ({ label, required, error, value, onChange, ...rest }) => (
  <Field label={label} required={required} error={error}>
    <input
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      className={`${inputClass} ${error ? "!border-red-500" : ""}`}
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
}) => (
  <Field label={label} required={required} error={error}>
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} appearance-none pr-8 ${
          error ? "!border-red-500" : ""
        }`}
      >
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
        size={13}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  </Field>
);

const ConfigurationForm = ({ onBack, onSave, editData }) => {
  const [form, setForm] = useState(() => ({
    ...initialForm,
    ...editData,
  }));

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", submit: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.configurationName.trim()) {
      nextErrors.configurationName = "Configuration name is required";
    }

    if (!form.companyName.trim()) {
      nextErrors.companyName = "Company name is required";
    }

    if (!form.companyCode.trim()) {
      nextErrors.companyCode = "Company code is required";
    }

    if (!form.financialYear) {
      nextErrors.financialYear = "Financial year is required";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSubmitting(true);

    try {
      await onSave({
        ...form,
        configurationName: form.configurationName.trim(),
        companyName: form.companyName.trim(),
        companyCode: form.companyCode.trim(),
      });
    } catch {
      setErrors((prev) => ({
        ...prev,
        submit: "Unable to save configuration. Please try again.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-gray-900">
      <div className="w-full px-3 pb-2 pt-3 sm:px-4 lg:px-5">
        {/* Header */}
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
              {editData ? "Edit Configuration" : "Create Configuration"}
            </h1>

            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">
              Configure company information and application preferences.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {/* Company Information */}
          <Section
            icon={Building2}
            title="Company Information"
            subtitle="Basic configuration and company details"
          >
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <TextField
                label="Configuration Name"
                required
                value={form.configurationName}
                onChange={(v) => setField("configurationName", v)}
                placeholder="e.g. Default Configuration"
                error={errors.configurationName}
              />

              <TextField
                label="Company Name"
                required
                value={form.companyName}
                onChange={(v) => setField("companyName", v)}
                placeholder="Enter company name"
                error={errors.companyName}
              />

              <TextField
                label="Company Code"
                required
                value={form.companyCode}
                onChange={(v) => setField("companyCode", v)}
                placeholder="Enter company code"
                error={errors.companyCode}
              />

              <SelectField
                label="Status"
                required
                value={form.status}
                onChange={(v) => setField("status", v)}
                options={["Active", "Inactive"]}
              />
            </div>
          </Section>

          {/* Regional Settings */}
          <Section
            icon={Globe}
            title="Regional Settings"
            subtitle="Financial year, currency and regional formats"
          >
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <SelectField
                label="Financial Year"
                required
                value={form.financialYear}
                onChange={(v) => setField("financialYear", v)}
                options={["2025-2026", "2026-2027", "2027-2028", "2028-2029"]}
                error={errors.financialYear}
              />

              <SelectField
                label="Date Format"
                value={form.dateFormat}
                onChange={(v) => setField("dateFormat", v)}
                options={["DD-MM-YYYY", "MM-DD-YYYY", "YYYY-MM-DD"]}
              />

              <SelectField
                label="Currency"
                value={form.currency}
                onChange={(v) => setField("currency", v)}
                options={[
                  { value: "INR", label: "INR - Indian Rupee" },
                  { value: "USD", label: "USD - US Dollar" },
                  { value: "EUR", label: "EUR - Euro" },
                  { value: "GBP", label: "GBP - British Pound" },
                ]}
              />

              <SelectField
                label="Language"
                value={form.language}
                onChange={(v) => setField("language", v)}
                options={["English", "Kannada", "Hindi"]}
              />

              <SelectField
                label="Time Zone"
                value={form.timeZone}
                onChange={(v) => setField("timeZone", v)}
                options={[
                  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
                  { value: "UTC", label: "UTC" },
                  {
                    value: "America/New_York",
                    label: "America/New_York",
                  },
                ]}
              />
            </div>
          </Section>

          {/* Application Preferences */}
          <Section
            icon={SlidersHorizontal}
            title="Application Preferences"
            subtitle="Set default behavior for the application"
          >
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <SelectField
                label="Rows Per Page"
                value={form.rowsPerPage}
                onChange={(v) => setField("rowsPerPage", v)}
                options={["10", "25", "50", "100"]}
              />

              <SelectField
                label="Theme"
                value={form.theme}
                onChange={(v) => setField("theme", v)}
                options={["System Default", "Light", "Dark"]}
              />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-slate-200 p-3 dark:border-gray-700">
                <div>
                  <p className="text-[12px] font-semibold text-slate-800 dark:text-gray-100">
                    Automatic Document Numbering
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">
                    Generate document numbers automatically.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.autoDocNumber}
                  onChange={(e) => setField("autoDocNumber", e.target.checked)}
                  className="h-4 w-4 accent-blue-600"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-slate-200 p-3 dark:border-gray-700">
                <div>
                  <p className="text-[12px] font-semibold text-slate-800 dark:text-gray-100">
                    Email Notifications
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">
                    Enable application email notifications.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.emailNotifications}
                  onChange={(e) =>
                    setField("emailNotifications", e.target.checked)
                  }
                  className="h-4 w-4 accent-blue-600"
                />
              </label>
            </div>
          </Section>

          {errors.submit && (
            <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300">
              {errors.submit}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 py-2 sm:flex-row sm:justify-end dark:border-gray-800 dark:bg-gray-900">
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
              {editData ? <Check size={12} /> : <Save size={12} />}
              {submitting ? "Saving..." : editData ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationForm;
