import { ArrowLeft, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FloatingInput, FloatingSelect } from "../../../utils/InputFields";
import masterAPI from "../../../api/cityAPI";
import { useToast } from "../../Toast/ToastContext";

const CityMasterForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const loginUserName = localStorage.getItem("userName") || "SYSTEM";

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    id: editData?.id || 0,
    cityName: editData?.cityName || "",
    cityCode: editData?.cityCode || "",
    country: "", // resolved to country id
    state: "",   // resolved to state id
    active:
      editData?.active === "Active" ||
      editData?.active === true ||
      (editData == null ? true : false),
    orgId: ORG_ID,
    createdBy: loginUserName,
  });

  const fieldLabels = {
    cityName: "City Name",
    cityCode: "City Code",
    country: "Country",
    state: "State",
  };

  // ---------------------------------------------------------------
  // Helpers: resolve editData objects/strings/ids to numeric ids
  // ---------------------------------------------------------------
  const resolveId = (value, list, nameKeys = []) => {
    if (value == null || value === "") return "";
    if (typeof value === "number") return value;
    if (typeof value === "object" && value.id != null) return value.id;

    const str = String(value).toUpperCase();
    const match =
      list.find((row) => String(row.id) === str) ||
      list.find((row) =>
        nameKeys.some((k) => (row[k] || "").toUpperCase() === str)
      );

    return match?.id ?? "";
  };

  const resolveCountryId = (v, list) =>
    resolveId(v, list, ["countryName", "country", "countryCode"]);
  const resolveStateId = (v, list) =>
    resolveId(v, list, ["stateName", "state", "stateCode"]);

  // ---------------------------------------------------------------
  // Fetch helpers
  // ---------------------------------------------------------------
  const fetchCountries = async () => {
    try {
      const list = await masterAPI.getCountries(ORG_ID);
      const sorted = [...list].sort((a, b) =>
        (a.countryName || a.country || "").localeCompare(
          b.countryName || b.country || ""
        )
      );
      setCountries(sorted);
      return sorted;
    } catch (error) {
      console.error("Error fetching countries:", error);
      addToast("Failed to load countries", "error");
      return [];
    }
  };

  const fetchStatesByCountry = async (countryId) => {
    if (!countryId) {
      setStates([]);
      return [];
    }
    try {
      const list = await masterAPI.getStateByCountry(countryId, ORG_ID);
      const sorted = [...list].sort((a, b) =>
        (a.stateName || "").localeCompare(b.stateName || "")
      );
      setStates(sorted);
      return sorted;
    } catch (error) {
      console.error("Error fetching states:", error);
      addToast("Failed to load states", "error");
      return [];
    }
  };

  // ---------------------------------------------------------------
  // Initialize data
  // ---------------------------------------------------------------
  useEffect(() => {
    const init = async () => {
      const countriesList = await fetchCountries();

      if (editData) {
        const countryId = resolveCountryId(editData.country, countriesList);
        if (countryId) {
          const statesList = await fetchStatesByCountry(countryId);
          const stateId = resolveStateId(editData.state, statesList);
          setForm((prev) => ({
            ...prev,
            country: countryId,
            state: stateId,
          }));
        }
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id]);

  // ---------------------------------------------------------------
  // Change handlers
  // ---------------------------------------------------------------
  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    const alphanumericRegex = /^[A-Za-z0-9]*$/;
    const nameRegex = /^[A-Za-z ]*$/;

    let errorMessage = "";

    if (name === "active") {
      setForm((prev) => ({ ...prev, active: checked }));
      return;
    }

    switch (name) {
      case "cityName":
        if (!nameRegex.test(value))
          errorMessage = "Only alphabets and spaces are allowed";
        break;
      case "cityCode":
        if (!alphanumericRegex.test(value))
          errorMessage = "Only alphanumeric characters are allowed";
        else if (value.length > 10)
          errorMessage = "City Code must be maximum 10 characters";
        break;
      default:
        break;
    }

    if (errorMessage) {
      setFieldErrors((prev) => ({ ...prev, [name]: errorMessage }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    }
  };

  const handleSelectChange = async (name, value) => {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "country") {
      setForm((prev) => ({ ...prev, country: value, state: "" }));
      setStates([]);
      if (value) await fetchStatesByCountry(value);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ---------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------
  const handleSave = async () => {
    const errors = {};

    if (!form.cityName.trim()) errors.cityName = "City Name is required";
    if (!form.cityCode.trim()) errors.cityCode = "City Code is required";
    if (form.country === "" || form.country == null)
      errors.country = "Country is required";
    if (form.state === "" || form.state == null)
      errors.state = "State is required";

    if (form.cityCode && form.cityCode.length > 10)
      errors.cityCode = "City Code must be maximum 10 characters";

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const fieldLabel = fieldLabels[firstErrorField] || firstErrorField;
      addToast(`${fieldLabel}: ${errors[firstErrorField]}`, "error");
      return;
    }

    setIsSubmitting(true);

    // Payload — country and state are numeric ids
    const payload = {
      active: Boolean(form.active),
      cityCode: form.cityCode,
      cityName: form.cityName,
      country: Number(form.country) || 0,
      state: Number(form.state) || 0,
      createdBy: form.createdBy || loginUserName,
      orgId: ORG_ID,
    };

    // id only when updating
    if (form.id && form.id > 0) {
      payload.id = form.id;
    }

    console.log("📤 Saving City Payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await masterAPI.saveCity(payload);
      console.log("📥 Save Response:", response);

      const status =
        response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const successMessage =
          response?.paramObjectsMap?.message ||
          (form.id && form.id > 0
            ? "City updated successfully!"
            : "City created successfully!");
        addToast(successMessage, "success");
        if (onSave) onSave(payload);
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save city";
        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      const errorMessage =
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.message ||
        "Save failed! Try again.";
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------
  // Options — value is the numeric id
  // ---------------------------------------------------------------
  const countryOptions = countries.map((country) => ({
    value: country.id,
    label: country.countryName || country.country,
  }));

  const stateOptions = states.map((state) => ({
    value: state.id,
    label: state.stateName,
  }));

  // ---------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------
  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {editData ? "Edit City" : "Add City"}
        </h2>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          <FloatingInput
            label="City Name *"
            name="cityName"
            value={form.cityName}
            onChange={handleChange}
            error={fieldErrors.cityName}
            required
          />

          <FloatingInput
            label="City Code *"
            name="cityCode"
            value={form.cityCode}
            onChange={handleChange}
            error={fieldErrors.cityCode}
            required
          />

          <FloatingSelect
            label="Country *"
            name="country"
            value={form.country}
            onChange={(name, value) => handleSelectChange(name, value)}
            options={countryOptions}
            error={fieldErrors.country}
            required
          />

          <FloatingSelect
            label="State *"
            name="state"
            value={form.state}
            onChange={(name, value) => handleSelectChange(name, value)}
            options={stateOptions}
            error={fieldErrors.state}
            required
            disabled={!form.country}
          />

          {/* ACTIVE CHECKBOX */}
          <div className="flex flex-col gap-3 p-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : editData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CityMasterForm;