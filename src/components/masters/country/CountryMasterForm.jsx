import { ArrowLeft, Save, X } from "lucide-react";
import { useState } from "react";
import { FloatingInput } from "../../../utils/InputFields";
import { masterAPI } from "../../../api/customerAPI";

const CountryMasterForm = ({ data, onBack }) => {
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [form, setForm] = useState({
    countryCode: data?.countryCode || "",
    countryName: data?.countryName || "",
    id: data?.id || "",
    active: data?.active === "Active" ? true : false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    setForm({ ...form, [name]: type === "checkbox" ? checked : value.toUpperCase() });
  };

  const handleSave = async () => {
    // Basic validation
    const errors = {};
    if (!form.countryCode.trim()) errors.countryCode = "Country Code is required";
    if (!form.countryName.trim()) errors.countryName = "Country Name is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...(data?.id && { id: data?.id }), // Only include id if editing
      orgId: orgId,
      countryCode: form.countryCode.toUpperCase(),
      countryName: form.countryName.toUpperCase(),
      active: form.active ? true : false,
      cancel: false,
      createdBy: "ITC001",
    };

    console.log("📤 Saving Country Payload:", payload);

    try {
      const response = await masterAPI.saveCountry(payload);
      console.log("📥 Save Response:", response);

      alert(
        data ? "Country Updated successfully!" : "Country saved successfully!"
      );
      onBack();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save country.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {data ? "Edit Country" : "Add Country"}
        </h2>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        {/* MAIN FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <FloatingInput
            label="Country Code *"
            name="countryCode"
            value={form.countryCode}
            onChange={handleChange}
            error={fieldErrors.countryCode}
            required
          />
          
          <FloatingInput
            label="Country Name *"
            name="countryName"
            value={form.countryName}
            onChange={handleChange}
            error={fieldErrors.countryName}
            required
          />

          {/* ACTIVE CHECKBOX */}
          <div className="flex items-center gap-2 p-1">
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
            {isSubmitting ? "Saving..." : (data ? "Update" : "Save")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountryMasterForm;