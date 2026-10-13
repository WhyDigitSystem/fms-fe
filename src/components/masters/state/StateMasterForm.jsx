import { ArrowLeft, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FloatingInput, FloatingSelect } from "../../../utils/InputFields";
import { useToast } from "../../Toast/ToastContext";
import { stateAPI } from "../../../api/stateAPI";

const StateMasterForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  // Use globalParams similar to SupplierForm
  const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");

  const loginBranchCode = globalParam?.branchcode || localStorage.getItem("branchcode") || "";
  const loginBranch = globalParam?.branch || localStorage.getItem("branch") || "";
  const loginWarehouse = globalParam?.warehouse || localStorage.getItem("warehouse") || "";
  const loginCustomer = globalParam?.customer || localStorage.getItem("customer") || "";
  const loginClient = globalParam?.client || localStorage.getItem("client") || "";
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";

  const [countries, setCountries] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    id: editData?.id || 0,
    stateName: editData?.stateName || "",
    stateCode: editData?.stateCode || "",
    stateNumber: editData?.stateNumber || "",
    country: editData?.country || "",
    region: editData?.region || "",
    active: editData?.active ?? true,
    cancel: editData?.cancel ?? false,

    // Additional fields from localStorage
    branch: editData?.branch || loginBranch,
    branchCode: editData?.branchCode || loginBranchCode,
    warehouse: editData?.warehouse || loginWarehouse,
    customer: editData?.customer || loginCustomer,
    client: editData?.client || loginClient,
    orgId: ORG_ID,
    createdBy: localStorage.getItem("userName") || "SYSTEM",
  });

  // Field labels for toast messages
  const fieldLabels = {
    stateName: "State Name",
    stateCode: "State Code",
    stateNumber: "State Number",
    country: "Country",
    region: "Region",
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const countriesData = await stateAPI.getCountries(ORG_ID);
      const sortedCountries = countriesData.sort((a, b) =>
        a.countryName.localeCompare(b.countryName)
      );
      setCountries(sortedCountries);
    } catch (error) {
      console.error("Error fetching countries:", error);
      addToast("Failed to load countries", 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    const numericRegex = /^[0-9]*$/;
    const alphanumericRegex = /^[A-Za-z0-9]*$/;
    const nameRegex = /^[A-Za-z ]*$/;

    let errorMessage = "";

    if (name === "active" || name === "cancel") {
      setForm(prev => ({ ...prev, [name]: checked }));
      return;
    }

    switch (name) {
      case "stateName":
      case "region":
        if (!nameRegex.test(value)) {
          errorMessage = "Only alphabets and spaces are allowed";
        }
        break;
      case "stateCode":
        if (!alphanumericRegex.test(value)) {
          errorMessage = "Only alphanumeric characters are allowed";
        } else if (value.length > 10) {
          errorMessage = "State Code must be maximum 10 characters";
        }
        break;
      case "stateNumber":
        if (!numericRegex.test(value)) {
          errorMessage = "Only numbers are allowed";
        } else if (value.length > 10) {
          errorMessage = "State Number must be maximum 10 digits";
        }
        break;
      default:
        break;
    }

    if (errorMessage) {
      setFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
    } else {
      const updatedValue = value.toUpperCase();
      setForm(prev => ({ ...prev, [name]: updatedValue }));
    }
  };

  const handleSelectChange = (name, value) => {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const errors = {};

    if (!form.stateName.trim()) errors.stateName = "State Name is required";
    if (!form.stateCode.trim()) errors.stateCode = "State Code is required";
    if (!form.country) errors.country = "Country is required";
    if (!form.region.trim()) errors.region = "Region is required";

    if (form.stateCode && form.stateCode.length > 10) errors.stateCode = "State Code must be maximum 10 characters";
    if (form.stateNumber && form.stateNumber.length > 10) errors.stateNumber = "State Number must be maximum 10 digits";

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const fieldLabel = fieldLabels[firstErrorField] || firstErrorField;
      const errorMessage = errors[firstErrorField];

      addToast(`${fieldLabel}: ${errorMessage}`, 'error');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      stateName: form.stateName,
      stateCode: form.stateCode,
      stateNumber: form.stateNumber,
      country: form.country,
      region: form.region,
      active: Boolean(form.active),
      cancel: Boolean(form.cancel),
      createdBy: form.createdBy,
      orgId: form.orgId
    };

    if (form.id && form.id > 0) {
      payload.id = form.id;
    }

    console.log("📤 Saving State Payload:", payload);

    try {
      const response = await stateAPI.createState(payload);
      console.log("📥 Response:", response);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const successMessage = response?.paramObjectsMap?.message ||
          (form.id && form.id > 0 ? "State updated successfully!" : "State created successfully!");

        addToast(successMessage, 'success');

        if (onSave) onSave(payload);
      } else {
        const errorMessage = response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save state";

        addToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      const errorMessage = error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.message ||
        "Save failed! Try again.";

      addToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Options
  const countryOptions = countries.map(country => ({
    value: country.countryName,
    label: country.countryName
  }));

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
          {editData ? "Edit State" : "Add State"}
        </h2>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        {/* MAIN FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          <FloatingInput
            label="State Name *"
            name="stateName"
            value={form.stateName}
            onChange={handleChange}
            error={fieldErrors.stateName}
            required
          />

          <FloatingInput
            label="State Code *"
            name="stateCode"
            value={form.stateCode}
            onChange={handleChange}
            error={fieldErrors.stateCode}
            required
          />

          <FloatingInput
            label="State Number"
            name="stateNumber"
            value={form.stateNumber}
            onChange={handleChange}
            error={fieldErrors.stateNumber}
            type="number"
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

          <FloatingInput
            label="Region *"
            name="region"
            value={form.region}
            onChange={handleChange}
            error={fieldErrors.region}
            required
          />

          {/* STATUS & CANCEL CHECKBOXES */}
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
            {isSubmitting ? "Saving..." : (editData ? "Update" : "Save")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StateMasterForm;