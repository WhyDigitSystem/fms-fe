import { ArrowLeft, Save, X, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { FloatingInput } from "../../../utils/InputFields";
import { serviceAPI } from "../../../api/serviceAPI";

const ORG_ID = Number(localStorage.getItem("orgId"));
// Make sure your login stores the branch id under this key (or change it)
const BRANCH_ID = Number(localStorage.getItem("branchId"));

const emptyForm = {
  serviceCode: "",
  serviceDescription: "",
  cancelRemarks: "",
};

const ServiceMasterForm = ({ data, onBack }) => {
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // On edit: fetch the record by id and fill the form
  useEffect(() => {
    if (!data?.id) {
      setForm(emptyForm);
      return;
    }

    const loadById = async () => {
      try {
        setIsLoading(true);
        const s = await serviceAPI.getById(data.id);
        if (s) {
          setForm({
            serviceCode: s.serviceCode || "",
            serviceDescription: s.serviceDescription || "",
            cancelRemarks: s.cancelRemarks || "",
          });
        }
      } catch (error) {
        console.error("Failed to load service:", error);
        alert("Failed to load service details.");
      } finally {
        setIsLoading(false);
      }
    };

    loadById();
  }, [data?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSave = async () => {
    const errors = {};
    if (!form.serviceCode.trim())
      errors.serviceCode = "Service Code is required";
    if (!form.serviceDescription.trim())
      errors.serviceDescription = "Description is required";

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...(data?.id && { id: data.id }),
      orgId: ORG_ID,
      branch: BRANCH_ID,
      serviceCode: form.serviceCode.trim(),
      serviceDescription: form.serviceDescription.trim(),
      cancelRemarks: form.cancelRemarks.trim(),
      createdBy: "admin",
    };

    try {
      const response = await serviceAPI.save(payload);
      if (response?.status === false) {
        alert(response?.errors?.[0]?.longMessage || "Failed to save service.");
        return;
      }
      alert(
        response?.paramObjectsMap?.message || "Service saved successfully!",
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
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto text-gray-500" />
            <p className="text-xs text-gray-500 mt-2">Loading service...</p>
          </div>
        ) : (
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
              name="serviceDescription"
              value={form.serviceDescription}
              onChange={handleChange}
              error={fieldErrors.serviceDescription}
              required
            />
            <FloatingInput
              label="Cancel Remarks"
              name="cancelRemarks"
              value={form.cancelRemarks}
              onChange={handleChange}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting || isLoading}
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
