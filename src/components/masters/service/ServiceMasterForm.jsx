import { ArrowLeft, Save, X } from "lucide-react";
import { useState } from "react";
import { FloatingInput } from "../../../utils/InputFields";
import { masterAPI } from "../../../api/customerAPI";

const ServiceMasterForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));

  const [form, setForm] = useState({
    serviceCode: data?.serviceCode || "",
    description: data?.description || "",
    active: data?.active === "Active" || data?.active === true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value.toUpperCase(),
    }));

    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSave = async () => {
    const errors = {};

    if (!form.serviceCode.trim()) {
      errors.serviceCode = "Service Code is required";
    }

    if (!form.description.trim()) {
      errors.description = "Description is required";
    }

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...(data?.id && { id: data.id }),
      orgId,
      serviceCode: form.serviceCode.trim().toUpperCase(),
      description: form.description.trim().toUpperCase(),
      active: form.active,
      cancel: false,
      createdBy: "ITC001",
    };

    try {
      // Replace with your actual API method if named differently.
      await masterAPI.saveService(payload);

      alert(
        data ? "Service updated successfully!" : "Service saved successfully!",
      );
      onBack();
    } catch (error) {
      console.error("Failed to save service:", error);
      alert("Failed to save service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Service" : "Add Service"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          <FloatingInput
            label="Service Code *"
            name="serviceCode"
            value={form.serviceCode}
            onChange={handleChange}
            error={fieldErrors.serviceCode}
            required
          />

          <FloatingInput
            label="Description *"
            name="description"
            value={form.description}
            onChange={handleChange}
            error={fieldErrors.description}
            required
          />

          <div className="flex items-center gap-2 p-1">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              className="h-3.5 w-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />

            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {isSubmitting ? "Saving..." : data ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceMasterForm;
