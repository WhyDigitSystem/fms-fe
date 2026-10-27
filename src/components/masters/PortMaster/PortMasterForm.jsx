import { ArrowLeft, Save, X, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { portAPI } from "../../../api/portAPI";
import masterAPI from "../../../api/cityAPI";
import modeMasterAPI from "../../../api/modeMasterAPI";
import { useToast } from "../../Toast/ToastContext";

const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;

const EMPTY_FORM = {
  portType: "",
  portCode: "",
  portName: "",
  country: "",
  city: "",
  active: true,
  cancelRemarks: "",
};

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const controlErrClasses =
  "border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

const getRelationId = (value) => {
  if (value && typeof value === "object") {
    return value.id == null ? "" : String(value.id);
  }

  return value == null || value === "" ? "" : String(value);
};

const getCountryName = (country) =>
  typeof country === "object" && country !== null
    ? country.countryName || country.country || country.name || ""
    : String(country ?? "");

const getCityName = (city) =>
  typeof city === "object" && city !== null
    ? city.cityName || city.city || city.name || ""
    : String(city ?? "");

const getCityCountryId = (city) => {
  if (!city || typeof city !== "object") return "";

  return getRelationId(city.country ?? city.countryId ?? city.countryID);
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

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  type = "text",
  options = [],
  disabled = false,
}) => (
  <div className="w-full min-w-0">
    <label htmlFor={name} className={labelClasses}>
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>

    {type === "select" ? (
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${controlClasses} ${error ? controlErrClasses : ""}`}
      >
        <option value="">
          {disabled ? `Loading ${label.toLowerCase()}...` : `Select ${label}`}
        </option>

        {options.map((option, index) => (
          <option
            key={`${String(option.value)}-${index}`}
            value={String(option.value)}
          >
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${controlClasses} ${error ? controlErrClasses : ""}`}
      />
    )}

    {error && (
      <p className="mt-0.5 text-[11px] text-red-500 dark:text-red-400">
        {error}
      </p>
    )}
  </div>
);

const PortMasterForm = ({ data, onBack }) => {
  const { addToast } = useToast();

  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [modes, setModes] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);

  const [fieldErrors, setFieldErrors] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isModesLoading, setIsModesLoading] = useState(false);
  const [isCountriesLoading, setIsCountriesLoading] = useState(false);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);

  // Load Mode Master options.
  useEffect(() => {
    let mounted = true;

    const loadModes = async () => {
      setIsModesLoading(true);

      try {
        const result = await modeMasterAPI.getAll(ORG_ID, BRANCH_ID);

        const list = extractList(result, [
          "modeResponseVO",
          "modeMasterResponseVO",
          "modeMasterVO",
          "modeList",
          "modes",
          "mode",
        ]);

        if (mounted) setModes(list);
      } catch (error) {
        console.error("Failed to load modes:", error?.response?.data || error);

        if (mounted) {
          setModes([]);
          addToast("Failed to load Mode Master options", "error");
        }
      } finally {
        if (mounted) setIsModesLoading(false);
      }
    };

    loadModes();

    return () => {
      mounted = false;
    };
  }, []);

  // Load countries and cities.
  useEffect(() => {
    let mounted = true;

    const loadDropdowns = async () => {
      setIsCountriesLoading(true);
      setIsCitiesLoading(true);

      try {
        const [countryResult, cityResult] = await Promise.allSettled([
          masterAPI.getCountries(ORG_ID),
          masterAPI.getAllCities(ORG_ID),
        ]);

        if (!mounted) return;

        if (countryResult.status === "fulfilled") {
          setCountries(
            extractList(countryResult.value, [
              "countryResponseVO",
              "country",
              "countries",
            ]),
          );
        } else {
          console.error("Failed to load countries:", countryResult.reason);
          setCountries([]);
          addToast("Failed to load countries", "error");
        }

        if (cityResult.status === "fulfilled") {
          setCities(
            extractList(cityResult.value, ["cityResponseVO", "city", "cities"]),
          );
        } else {
          console.error("Failed to load cities:", cityResult.reason);
          setCities([]);
          addToast("Failed to load cities", "error");
        }
      } finally {
        if (mounted) {
          setIsCountriesLoading(false);
          setIsCitiesLoading(false);
        }
      }
    };

    loadDropdowns();

    return () => {
      mounted = false;
    };
  }, []);

  // Load existing port when editing.
  useEffect(() => {
    let mounted = true;

    setFieldErrors({});

    if (!data?.id) {
      setForm({ ...EMPTY_FORM });
      setIsLoading(false);

      return () => {
        mounted = false;
      };
    }

    const loadPort = async () => {
      setIsLoading(true);

      try {
        const response = await portAPI.getById(data.id);

        const port =
          response?.paramObjectsMap?.port ||
          response?.paramObjectsMap?.portVO ||
          response?.paramObjectsMap?.portResponseVO ||
          response?.paramObjectsMap?.portMaster ||
          response?.data?.paramObjectsMap?.port ||
          response?.data?.paramObjectsMap?.portResponseVO ||
          response?.data ||
          response;

        if (!mounted) return;

        if (!port || port?.status === false) {
          addToast(port?.message || "Failed to load port details", "error");
          return;
        }

        // If portType is an object, use its modeName.
        // If it is already a string, use it directly.
        const portType =
          typeof port.portType === "object" && port.portType !== null
            ? port.portType.modeName || ""
            : port.portType || "";

        setForm({
          portType: String(portType),
          portCode: port.portCode || "",
          portName: port.portName || "",
          country: getRelationId(port.country),
          city: getRelationId(port.city),
          active:
            port.active === true ||
            port.active === "Active" ||
            port.active === "Y" ||
            port.active === 1,
          cancelRemarks: port.cancelRemarks || "",
        });
      } catch (error) {
        console.error("Failed to load port:", error?.response?.data || error);

        if (mounted) {
          addToast("Failed to load port details", "error");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadPort();

    return () => {
      mounted = false;
    };
  }, [data?.id]);

  // Use modeName as both the dropdown value and displayed label.
  const modeOptions = useMemo(
    () =>
      modes
        .filter((mode) => mode?.modeName)
        .map((mode) => ({
          value: String(mode.modeName),
          label: String(mode.modeName),
        })),
    [modes],
  );

  const countryOptions = useMemo(
    () =>
      countries
        .filter((country) => (country.id ?? country.countryId) != null)
        .map((country) => ({
          value: String(country.id ?? country.countryId),
          label: getCountryName(country),
        })),
    [countries],
  );

  // Filter cities by the selected country when possible.
  const availableCities = useMemo(() => {
    if (!form.country) return cities;

    const citiesWithCountry = cities.filter((city) =>
      Boolean(getCityCountryId(city)),
    );

    if (citiesWithCountry.length === 0) return cities;

    return cities.filter(
      (city) => getCityCountryId(city) === String(form.country),
    );
  }, [cities, form.country]);

  const cityOptions = useMemo(
    () =>
      availableCities
        .filter((city) => (city.id ?? city.cityId) != null)
        .map((city) => ({
          value: String(city.id ?? city.cityId),
          label: getCityName(city),
        })),
    [availableCities],
  );

  // Keep the existing selection visible if the API response
  // does not contain the current value.
  const selectedModeMissing =
    form.portType &&
    !modeOptions.some((option) => option.value === String(form.portType));

  const selectedCountryMissing =
    form.country &&
    !countryOptions.some((option) => option.value === String(form.country));

  const selectedCityMissing =
    form.city &&
    !cityOptions.some((option) => option.value === String(form.city));

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]:
          name === "portCode" || name === "portName"
            ? value.toUpperCase()
            : value,
      };

      if (name === "country" && prev.city) {
        const selectedCity = cities.find(
          (city) => String(city.id ?? city.cityId) === String(prev.city),
        );

        const selectedCityCountry = getCityCountryId(selectedCity);

        if (selectedCityCountry && selectedCityCountry !== String(value)) {
          next.city = "";
        }
      }

      return next;
    });

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
      ...(name === "country" ? { city: "" } : {}),
    }));
  };

  const handleActiveChange = (event) => {
    setForm((prev) => ({
      ...prev,
      active: event.target.checked,
    }));
  };

  const validate = () => {
    const errors = {};

    if (!form.portType.trim()) {
      errors.portType = "Port Type is required";
    }

    if (!form.portCode.trim()) {
      errors.portCode = "Port Code is required";
    }

    if (!form.portName.trim()) {
      errors.portName = "Port Name is required";
    }

    if (!form.country) {
      errors.country = "Country is required";
    }

    if (!form.city) {
      errors.city = "City is required";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      addToast("Please fill all required fields", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    const payload = {
      ...(data?.id ? { id: Number(data.id) } : {}),
      active: Boolean(form.active),
      branch: BRANCH_ID,
      cancelRemarks: form.cancelRemarks.trim(),
      city: Number(form.city),
      country: Number(form.country),
      createdBy:
        localStorage.getItem("userName") ||
        localStorage.getItem("username") ||
        "admin",
      orgId: ORG_ID,
      portCode: form.portCode.trim(),
      portName: form.portName.trim(),

      // Pass modeName as a string, not the Mode Master ID.
      portType: form.portType,
    };

    try {
      setIsSubmitting(true);

      const response = await portAPI.save(payload);

      if (response?.status === false || response?.statusFlag === "Error") {
        addToast(
          response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save port",
          "error",
        );
        return;
      }

      addToast(
        response?.message ||
          response?.paramObjectsMap?.message ||
          (data?.id
            ? "Port updated successfully"
            : "Port created successfully"),
        "success",
      );

      onBack?.();
    } catch (error) {
      console.error("Error saving port:", error?.response?.data || error);

      addToast(
        error?.response?.data?.message ||
          error?.response?.data?.paramObjectsMap?.message ||
          error?.message ||
          "Failed to save port",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {data?.id ? "Update Port" : "Create Port"}
        </h2>
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-xs text-gray-500 dark:text-gray-400">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading port details...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={fieldGrid}>
              <Field
                label="Port Type"
                name="portType"
                type="select"
                value={form.portType}
                onChange={handleChange}
                error={fieldErrors.portType}
                required
                disabled={isModesLoading}
                options={[
                  ...(selectedModeMissing
                    ? [
                        {
                          value: String(form.portType),
                          label: String(form.portType),
                        },
                      ]
                    : []),
                  ...modeOptions,
                ]}
              />

              <Field
                label="Port Code"
                name="portCode"
                value={form.portCode}
                onChange={handleChange}
                error={fieldErrors.portCode}
                required
              />

              <Field
                label="Port Name"
                name="portName"
                value={form.portName}
                onChange={handleChange}
                error={fieldErrors.portName}
                required
              />

              <Field
                label="Country"
                name="country"
                type="select"
                value={form.country}
                onChange={handleChange}
                error={fieldErrors.country}
                required
                disabled={isCountriesLoading}
                options={[
                  ...(selectedCountryMissing
                    ? [
                        {
                          value: String(form.country),
                          label: String(form.country),
                        },
                      ]
                    : []),
                  ...countryOptions,
                ]}
              />

              <Field
                label="City"
                name="city"
                type="select"
                value={form.city}
                onChange={handleChange}
                error={fieldErrors.city}
                required
                disabled={isCitiesLoading || isCountriesLoading}
                options={[
                  ...(selectedCityMissing
                    ? [
                        {
                          value: String(form.city),
                          label: String(form.city),
                        },
                      ]
                    : []),
                  ...cityOptions,
                ]}
              />

              <div className="w-full min-w-0">
                <label className={`${labelClasses} select-none opacity-0`}>
                  Active
                </label>

                <label
                  htmlFor="portActive"
                  className={`${controlClasses} flex cursor-pointer items-center gap-1.5 select-none`}
                >
                  <input
                    id="portActive"
                    name="active"
                    type="checkbox"
                    checked={Boolean(form.active)}
                    onChange={handleActiveChange}
                    className="h-3.5 w-3.5 accent-blue-600 dark:accent-blue-500"
                  />

                  <span className="text-xs text-gray-700 dark:text-gray-200">
                    Active
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
              <button
                type="button"
                onClick={onBack}
                disabled={isSubmitting}
                className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  isModesLoading ||
                  isCountriesLoading ||
                  isCitiesLoading
                }
                className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Save className="h-3 w-3" />
                )}

                {isSubmitting ? "Saving..." : data?.id ? "Update" : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PortMasterForm;
