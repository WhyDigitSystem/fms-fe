import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Check,
  FileText,
  Layers,
  Loader2,
  Package,
  Plus,
  Save,
  Settings2,
  Trash2,
  X,
  ChevronDown,
} from "lucide-react";

import configAPI from "../../../api/configAPI";
import modeMasterAPI from "../../../api/modeMasterAPI";
import { serviceAPI } from "../../../api/serviceAPI";
import { productAPI } from "../../../api/productAPI";

const ORG_ID = Number(localStorage.getItem("orgId")) || 1;
const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;

const inputClass =
  "h-[32px] w-full rounded-md border border-slate-300 bg-white px-2.5 text-[12px] text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:focus:border-blue-500";

const cellClass = `${inputClass} !h-[30px] !px-2 !text-[11px]`;

const emptyChild = () => ({
  id: null,
  mode: "",
  service: "",
  product: "",
  active: true,
});

const emptyHeader = () => ({
  company: "",
  active: true,
});

const getBody = (response) => response?.data ?? response;

const getOptions = (response, keys) => {
  const body = getBody(response);

  if (Array.isArray(body)) return body;

  for (const key of keys) {
    const value = body?.paramObjectsMap?.[key] ?? body?.[key];

    if (Array.isArray(value)) return value;
  }

  return [];
};

const getOptionLabel = (item, type) => {
  if (type === "mode") {
    return (
      item.modeName ??
      item.mode ??
      item.modeDescription ??
      item.description ??
      ""
    );
  }

  if (type === "service") {
    return item.serviceDescription ?? item.serviceCode ?? "";
  }

  return item.productDescription ?? item.productCode ?? "";
};

const getModeValue = (item) => {
  if (typeof item?.mode === "string") {
    return item.mode;
  }

  if (item?.mode && typeof item.mode === "object") {
    return item.mode.modeName ?? item.mode.mode ?? item.mode.description ?? "";
  }

  return item?.modeName ?? item?.modeDescription ?? "";
};

const isActive = (item) =>
  item?.active === undefined ||
  item?.active === true ||
  item?.active === 1 ||
  item?.active === "Active";

const Section = ({ icon: Icon, title, subtitle, action, children }) => (
  <section className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800/40">
    <div className="flex min-h-[44px] items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 dark:border-gray-700/60">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <Icon size={14} />
        </span>

        <div className="min-w-0">
          <h3 className="text-[12px] font-semibold text-slate-900 dark:text-white">
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

const Field = ({ label, required, children, error }) => (
  <div className="min-w-0">
    <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-gray-300">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>

    {children}

    {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
  </div>
);

const SelectField = ({
  value,
  onChange,
  options,
  type,
  placeholder,
  disabled,
}) => (
  <div className="relative min-w-0">
    <select
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className={`${cellClass} appearance-none pr-7`}
    >
      <option value="">{disabled ? "Loading..." : placeholder}</option>

      {options.map((item) => {
        const label = getOptionLabel(item, type);
        const optionValue = type === "mode" ? label : String(item.id ?? "");

        if (!label || !optionValue) return null;

        return (
          <option key={`${type}-${optionValue}`} value={optionValue}>
            {label}
          </option>
        );
      })}
    </select>

    <ChevronDown
      size={12}
      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
    />
  </div>
);

const AddButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
  >
    <Plus size={12} />
    Add
  </button>
);

const RemoveButton = ({ onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title="Remove row"
    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
  >
    <Trash2 size={12} />
  </button>
);

const ActiveToggle = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    aria-pressed={Boolean(value)}
    className={`flex h-[30px] w-full min-w-[76px] items-center justify-center gap-1 rounded-md border px-2 text-[10px] font-semibold ${
      value
        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
        : "border-slate-200 bg-slate-50 text-slate-500 dark:border-gray-700 dark:bg-gray-900"
    }`}
  >
    {value ? <Check size={11} /> : <X size={11} />}
    {value ? "Active" : "Inactive"}
  </button>
);

const ConfigChildTable = ({
  title,
  type,
  rows,
  modeOptions,
  itemOptions,
  optionsLoading,
  onChange,
  onAdd,
  onRemove,
  error,
}) => {
  const singular =
    type === "mode" ? "Mode" : type === "service" ? "Service" : "Product";

  const Icon =
    type === "mode" ? Layers : type === "service" ? Settings2 : Package;

  const showMode = type === "mode";

  return (
    <Section
      icon={Icon}
      title={title}
      subtitle={`${rows.length} ${rows.length === 1 ? "row" : "rows"}`}
      action={<AddButton onClick={onAdd} />}
    >
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div
            key={`${type}-${row.id ?? "new"}-${index}`}
            className="rounded-md border border-slate-100 p-2 dark:border-gray-700"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-gray-300">
                {singular} {index + 1}
              </span>

              <RemoveButton
                onClick={() => onRemove(index)}
                disabled={rows.length <= 1}
              />
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_84px] items-end gap-2">
              <Field label={singular} required>
                <SelectField
                  value={showMode ? row.mode : row[type]}
                  onChange={(value) =>
                    onChange(index, showMode ? "mode" : type, value)
                  }
                  options={showMode ? modeOptions : itemOptions}
                  type={type}
                  placeholder={`Select ${singular}`}
                  disabled={
                    showMode ? optionsLoading.modes : optionsLoading[`${type}s`]
                  }
                />
              </Field>

              <Field label="Active">
                <ActiveToggle
                  value={row.active}
                  onChange={(value) => onChange(index, "active", value)}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="mt-2 text-[10px] text-red-500">{error}</p>}
    </Section>
  );
};

/*
 * The API response for configServices/configProducts contains:
 * { id, mode: "DESCRIPTION", active }
 *
 * It does not include the selected service/product ID.
 * Resolve that ID by matching the returned description against
 * the corresponding dropdown options.
 */
const normalizeRows = (rows, type, options = []) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [emptyChild()];
  }

  return rows.map((item) => {
    const description = getModeValue(item).trim();

    const relation =
      item?.[type] && typeof item[type] === "object" ? item[type] : null;

    const explicitId =
      relation?.id ??
      (typeof item?.[type] === "number" || typeof item?.[type] === "string"
        ? item[type]
        : null) ??
      item?.[`${type}Id`] ??
      item?.[`${type}MasterId`] ??
      "";

    const matchedOption = options.find((option) => {
      const label = String(getOptionLabel(option, type)).trim().toLowerCase();

      return label === description.toLowerCase();
    });

    const selectedId = explicitId || matchedOption?.id || "";

    return {
      id: item.id ?? null,
      mode: description,
      service: type === "service" ? String(selectedId) : "",
      product: type === "product" ? String(selectedId) : "",
      active: isActive(item),
    };
  });
};

const ConfigForm = ({ onBack, onSave, data }) => {
  const orgId = ORG_ID;
  const branchId = BRANCH_ID;
  const editId = data?.id;
  const isEditMode = Boolean(editId);

  const [header, setHeader] = useState(emptyHeader);

  const [modes, setModes] = useState([emptyChild()]);
  const [services, setServices] = useState([emptyChild()]);
  const [products, setProducts] = useState([emptyChild()]);

  const [modeOptions, setModeOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);

  const [optionsLoading, setOptionsLoading] = useState({
    modes: true,
    services: true,
    products: true,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");

  // Keep the fetched configuration until dropdown options are available.
  const [loadedConfig, setLoadedConfig] = useState(null);

  // Load dropdown options.
  useEffect(() => {
    let cancelled = false;

    const loadOptions = async () => {
      const tasks = [
        {
          key: "modes",
          request: () => modeMasterAPI.getAll(orgId),
          keys: ["modeMasterVO", "modeResponseVO"],
          setter: setModeOptions,
        },
        {
          key: "services",
          request: () => serviceAPI.getAll(orgId, branchId),
          keys: ["serviceResponseVO"],
          setter: setServiceOptions,
        },
        {
          key: "products",
          request: () => productAPI.getAll(orgId, branchId),
          keys: ["productResponseVO"],
          setter: setProductOptions,
        },
      ];

      await Promise.all(
        tasks.map(async (task) => {
          try {
            const response = await task.request();

            if (cancelled) return;

            task.setter(getOptions(response, task.keys).filter(isActive));
          } catch (err) {
            console.error(`Failed to load ${task.key}:`, err);

            if (!cancelled) {
              task.setter([]);
              setError(`Failed to load ${task.key} dropdown options.`);
            }
          } finally {
            if (!cancelled) {
              setOptionsLoading((previous) => ({
                ...previous,
                [task.key]: false,
              }));
            }
          }
        }),
      );
    };

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, [orgId, branchId]);

  // Fetch configuration details for editing.
  useEffect(() => {
    let cancelled = false;

    const loadConfig = async () => {
      if (!editId) {
        setLoadedConfig(null);
        setHeader(emptyHeader());
        setModes([emptyChild()]);
        setServices([emptyChild()]);
        setProducts([emptyChild()]);
        setErrors({});
        setError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setLoadedConfig(null);

      try {
        const response = await configAPI.getById(editId);

        if (cancelled) return;

        const body = getBody(response);

        const actualRecord =
          body?.paramObjectsMap?.configResponseVO ??
          body?.paramObjectsMap?.configVO ??
          body?.data?.paramObjectsMap?.configResponseVO ??
          body?.data?.paramObjectsMap?.configVO ??
          body;

        if (!actualRecord || !actualRecord.id) {
          throw new Error("Configuration record not found.");
        }

        setHeader({
          company: actualRecord.company ?? "",
          active: isActive(actualRecord),
        });

        // Child dropdown selections are restored by the next effect.
        setLoadedConfig(actualRecord);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.paramObjectsMap?.errorMessage ??
              err.message ??
              "Failed to load configuration.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadConfig();

    return () => {
      cancelled = true;
    };
  }, [editId]);

  /*
   * Restore child selections whenever the configuration or dropdown
   * options change. This handles either request completing first.
   */
  useEffect(() => {
    if (!loadedConfig) return;

    setModes(normalizeRows(loadedConfig.configModes, "mode", modeOptions));

    setServices(
      normalizeRows(loadedConfig.configServices, "service", serviceOptions),
    );

    setProducts(
      normalizeRows(loadedConfig.configProducts, "product", productOptions),
    );
  }, [loadedConfig, modeOptions, serviceOptions, productOptions]);

  const updateChild = (setter, index, key, value) => {
    setter((previous) =>
      previous.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    );

    setErrors((previous) => ({
      ...previous,
      mode: "",
      service: "",
      product: "",
    }));

    setError("");
  };

  const addChild = (setter) => {
    setter((previous) => [...previous, emptyChild()]);
  };

  const removeChild = (setter, index) => {
    setter((previous) =>
      previous.length <= 1 ? previous : previous.filter((_, i) => i !== index),
    );

    setErrors({});
  };

  const validateRows = (rows, type, nextErrors) => {
    const label =
      type === "mode" ? "Mode" : type === "service" ? "Service" : "Product";

    const invalid = rows.some((row) => {
      if (type === "mode") {
        return !String(row.mode).trim();
      }

      return !row[type];
    });

    if (invalid) {
      nextErrors[type] = `Select all required ${label.toLowerCase()} fields.`;
      return;
    }

    const values = rows.map((row) => (type === "mode" ? row.mode : row[type]));

    if (new Set(values).size !== values.length) {
      nextErrors[type] =
        `Duplicate ${label.toLowerCase()} entries are not allowed.`;
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!header.company.trim()) {
      nextErrors.company = "Company name is required.";
    }

    validateRows(modes, "mode", nextErrors);
    validateRows(services, "service", nextErrors);
    validateRows(products, "product", nextErrors);

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const userName = localStorage.getItem("userName") || "SYSTEM";

      const commonChildFields = (row) => ({
        ...(row.id ? { id: Number(row.id) } : {}),
        ...(isEditMode ? { configId: Number(editId) } : {}),
        active: Boolean(row.active),
      });

      const selectedService = (serviceId) =>
        serviceOptions.find((item) => String(item.id) === String(serviceId));

      const selectedProduct = (productId) =>
        productOptions.find((item) => String(item.id) === String(productId));

      const payload = {
        ...(isEditMode ? { id: Number(editId) } : {}),
        branch: branchId,
        orgId,
        company: header.company.trim(),
        active: Boolean(header.active),
        createdBy: data?.createdBy || userName,
        cancelRemarks: data?.cancelRemarks ?? "",

        configModes: modes.map((row) => ({
          ...commonChildFields(row),
          mode: row.mode,
        })),

        configServices: services.map((row) => {
          const service = selectedService(row.service);

          return {
            ...(row.id ? { id: Number(row.id) } : {}),
            ...(isEditMode ? { configId: Number(editId) } : {}),
            service: service?.id ?? Number(row.service),
            mode: service?.serviceDescription ?? "",
            active: Boolean(row.active),
          };
        }),

        configProducts: products.map((row) => {
          const product = selectedProduct(row.product);

          return {
            ...(row.id ? { id: Number(row.id) } : {}),
            ...(isEditMode ? { configId: Number(editId) } : {}),
            product: product?.id ?? Number(row.product),
            mode: product?.productDescription ?? "",
            active: Boolean(row.active),
          };
        }),
      };

      console.log("Configuration save payload:", payload);

      const response = await configAPI.save(payload);
      const result = getBody(response);

      if (result?.status === true || result?.statusFlag === "Ok") {
        const savedRecord =
          result?.paramObjectsMap?.configResponseVO ??
          result?.paramObjectsMap?.configVO ??
          result?.data ??
          payload;

        await onSave?.(savedRecord);
        onBack?.();
      } else {
        setError(
          result?.paramObjectsMap?.errorMessage ??
            result?.paramObjectsMap?.message ??
            result?.message ??
            "Failed to save configuration.",
        );
      }
    } catch (err) {
      console.error("Configuration save failed:", err);

      setError(
        err.response?.data?.paramObjectsMap?.errorMessage ??
          err.response?.data?.paramObjectsMap?.message ??
          err.message ??
          "Failed to save configuration.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-500">
        <Loader2 size={17} className="animate-spin" />
        Loading configuration...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-gray-900">
      <div className="w-full px-3 pb-2 pt-3 sm:px-4 lg:px-5">
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <ArrowLeft size={15} />
          </button>

          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
              {isEditMode ? "Edit Configuration" : "Create Configuration"}
            </h1>

            <p className="text-[11px] text-slate-500 dark:text-gray-400">
              Manage company modes, services and products
            </p>
          </div>

          <span className="ml-auto hidden items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] text-slate-500 sm:inline-flex dark:border-gray-700 dark:bg-gray-800">
            <FileText size={12} />
            {isEditMode ? `ID: ${editId}` : "New record"}
          </span>
        </div>

        {error && (
          <div className="mb-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-2.5">
          <Section
            icon={Building2}
            title="Configuration Information"
            subtitle="Company details and status"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Company Name" required error={errors.company}>
                <input
                  value={header.company}
                  onChange={(event) => {
                    setHeader((previous) => ({
                      ...previous,
                      company: event.target.value,
                    }));

                    setErrors((previous) => ({
                      ...previous,
                      company: "",
                    }));
                  }}
                  placeholder="Enter company name"
                  maxLength={150}
                  className={`${inputClass} ${
                    errors.company ? "!border-red-500" : ""
                  }`}
                />
              </Field>

              <Field label="Active">
                <div className="sm:w-32">
                  <ActiveToggle
                    value={header.active}
                    onChange={(value) =>
                      setHeader((previous) => ({
                        ...previous,
                        active: value,
                      }))
                    }
                  />
                </div>
              </Field>
            </div>
          </Section>

          <div className="grid grid-cols-1 items-start gap-2.5 md:grid-cols-3">
            <ConfigChildTable
              title="Modes"
              type="mode"
              rows={modes}
              modeOptions={modeOptions}
              itemOptions={[]}
              optionsLoading={optionsLoading}
              error={errors.mode}
              onChange={(index, key, value) =>
                updateChild(setModes, index, key, value)
              }
              onAdd={() => addChild(setModes)}
              onRemove={(index) => removeChild(setModes, index)}
            />

            <ConfigChildTable
              title="Services"
              type="service"
              rows={services}
              modeOptions={[]}
              itemOptions={serviceOptions}
              optionsLoading={optionsLoading}
              error={errors.service}
              onChange={(index, key, value) =>
                updateChild(setServices, index, key, value)
              }
              onAdd={() => addChild(setServices)}
              onRemove={(index) => removeChild(setServices, index)}
            />

            <ConfigChildTable
              title="Products"
              type="product"
              rows={products}
              modeOptions={[]}
              itemOptions={productOptions}
              optionsLoading={optionsLoading}
              error={errors.product}
              onChange={(index, key, value) =>
                updateChild(setProducts, index, key, value)
              }
              onAdd={() => addChild(setProducts)}
              onRemove={(index) => removeChild(setProducts, index)}
            />
          </div>

          <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 py-2 sm:flex-row sm:justify-end dark:border-gray-800 dark:bg-gray-900">
            <button
              type="button"
              onClick={onBack}
              disabled={saving}
              className="inline-flex h-[32px] items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <X size={12} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-[32px] items-center justify-center gap-1.5 rounded-md bg-blue-600 px-[19px] text-[12px] font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}

              {saving ? "Saving..." : isEditMode ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigForm;
