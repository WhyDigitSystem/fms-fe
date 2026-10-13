import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, X, Calendar } from "lucide-react";
import dayjs from "dayjs";
import { FloatingInput } from "../../../utils/InputFields";
import { finYearAPI } from "../../../api/finyearAPI";
import { useToast } from "../../Toast/ToastContext";

const FinYearForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId")) || 1000000001;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const loginUserName = localStorage.getItem("userName") || "SYSTEM";

  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldLabels] = useState({
    finYear: "Financial Year",
    finYearId: "Financial Year ID",
    finYearIdentifier: "Financial Year Identifier",
    startDate: "Start Date",
    endDate: "End Date",
  });

  const [form, setForm] = useState({
    id: editData?.id || 0,
    finYear: editData?.finYear ? dayjs().year(editData.finYear) : dayjs(),
    finYearId: editData?.finYearId || "",
    finYearIdentifier: editData?.finYearIdentifier || "",
    startDate: editData?.startDate ? dayjs(editData.startDate) : dayjs(),
    endDate: editData?.endDate ? dayjs(editData.endDate) : dayjs(),
    currentFinYear: editData?.currentFinYear || false,
    active: editData?.active !== undefined ? editData.active : true,
    closed: editData?.closed || false,

    // Additional fields from localStorage
    orgId: ORG_ID,
    createdBy: loginUserName,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    const numericRegex = /^[0-9]*$/;

    let errorMessage = "";

    if (name === "active" || name === "closed" || name === "currentFinYear") {
      setForm(prev => ({ ...prev, [name]: checked }));
      return;
    }

    switch (name) {
      case "finYearId":
        if (!numericRegex.test(value)) {
          errorMessage = "Only numbers are allowed";
        } else if (value.length > 10) {
          errorMessage = "Financial Year ID must be maximum 10 characters";
        }
        break;
      case "finYearIdentifier":
        if (value.length > 50) {
          errorMessage = "Identifier must be maximum 50 characters";
        }
        break;
      default:
        break;
    }

    if (errorMessage) {
      setFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
    } else {
      const updatedValue = name === "finYearIdentifier" ? value.toUpperCase() : value;
      setForm(prev => ({ ...prev, [name]: updatedValue }));
    }
  };

  const handleDateChange = (name, date) => {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    const newForm = { ...form, [name]: date };
    setForm(newForm);

    // Validate date range
    if (name === "startDate" || name === "endDate") {
      if (newForm.startDate && newForm.endDate) {
        const start = dayjs(newForm.startDate);
        const end = dayjs(newForm.endDate);
        if (start.isAfter(end)) {
          setFieldErrors(prev => ({ ...prev, endDate: "End date must be after start date" }));
        } else {
          setFieldErrors(prev => ({ ...prev, endDate: "" }));
        }
      }
    }
  };

  const handleSave = async () => {
    // Validate form and show toast for first error
    const errors = {};

    if (!form.finYear) errors.finYear = "Financial Year is required";
    if (!form.finYearId) errors.finYearId = "Financial Year ID is required";
    if (!form.finYearIdentifier) errors.finYearIdentifier = "Identifier is required";
    if (!form.startDate) errors.startDate = "Start Date is required";
    if (!form.endDate) errors.endDate = "End Date is required";

    // Validate lengths
    if (form.finYearId && form.finYearId.length > 10) errors.finYearId = "Financial Year ID must be maximum 10 characters";
    if (form.finYearIdentifier && form.finYearIdentifier.length > 50) errors.finYearIdentifier = "Identifier must be maximum 50 characters";

    // Validate numeric
    if (form.finYearId && !/^[0-9]+$/.test(form.finYearId)) {
      errors.finYearId = "Only numbers allowed";
    }

    setFieldErrors(errors);

    // If there are errors, show the first one in toast and return
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const fieldLabel = fieldLabels[firstErrorField] || firstErrorField;
      const errorMessage = errors[firstErrorField];

      addToast(`${fieldLabel}: ${errorMessage}`, 'error');
      return;
    }

    setIsSubmitting(true);

    // Build payload - only include id if it's an update (editData exists)
    const payload = {
      finYear: parseInt(dayjs(form.finYear).format("YYYY")),
      finYearId: parseInt(form.finYearId),
      finYearIdentifier: form.finYearIdentifier,
      startDate: dayjs(form.startDate).format("YYYY-MM-DD"),
      endDate: dayjs(form.endDate).format("YYYY-MM-DD"),
      currentFinYear: form.currentFinYear,
      active: Boolean(form.active),
      closed: form.closed,
      orgId: ORG_ID,
      createdBy: loginUserName,
    };

    // Only add id if we have an editData (update operation)
    if (editData?.id) {
      payload.id = form.id;
    }

    console.log("📤 Saving Financial Year Payload:", payload);

    try {
      const response = await finYearAPI.saveFinYear(payload);
      console.log("📥 Save Response:", response);

      // Check response status
      const status = response?.data?.status === true || response?.data?.statusFlag === "Ok";

      if (status) {
        const successMessage = response?.data?.paramObjectsMap?.message ||
          (form.id ? "Financial Year updated successfully!" : "Financial Year created successfully!");

        addToast(successMessage, 'success');

        if (onSave) onSave(payload);
        onBack();
      } else {
        const errorMessage = response?.data?.paramObjectsMap?.message ||
          response?.data?.paramObjectsMap?.errorMessage ||
          response?.data?.message ||
          "Failed to save financial year";

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

  const handleClear = () => {
    setForm({
      id: 0,
      finYear: dayjs(),
      finYearId: "",
      finYearIdentifier: "",
      startDate: dayjs(),
      endDate: dayjs(),
      currentFinYear: false,
      active: true,
      closed: false,
      orgId: ORG_ID,
      createdBy: loginUserName,
    });
    setFieldErrors({});
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
          {editData ? "Edit Financial Year" : "Add Financial Year"}
        </h2>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        {/* MAIN FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {/* Financial Year */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Financial Year *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                value={form.finYear ? dayjs(form.finYear).format("YYYY") : ""}
                onChange={(e) => {
                  const year = parseInt(e.target.value);
                  if (year && year > 1900 && year < 2100) {
                    handleDateChange("finYear", dayjs().year(year));
                  }
                }}
                className={`w-full pl-10 pr-3 py-2 border ${fieldErrors.finYear ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="YYYY"
                min="1900"
                max="2100"
              />
            </div>
            {fieldErrors.finYear && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.finYear}</p>
            )}
          </div>

          {/* Financial Year ID */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Financial Year ID *
            </label>
            <input
              type="text"
              name="finYearId"
              value={form.finYearId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${fieldErrors.finYearId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {fieldErrors.finYearId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.finYearId}</p>
            )}
          </div>

          {/* Financial Year Identifier */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Financial Year Identifier *
            </label>
            <input
              type="text"
              name="finYearIdentifier"
              value={form.finYearIdentifier}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${fieldErrors.finYearIdentifier ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {fieldErrors.finYearIdentifier && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.finYearIdentifier}</p>
            )}
          </div>

          {/* Start Date */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={form.startDate ? dayjs(form.startDate).format("YYYY-MM-DD") : ""}
                onChange={(e) => handleDateChange("startDate", dayjs(e.target.value))}
                className={`w-full pl-10 pr-3 py-2 border ${fieldErrors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            {fieldErrors.startDate && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.startDate}</p>
            )}
          </div>

          {/* End Date */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={form.endDate ? dayjs(form.endDate).format("YYYY-MM-DD") : ""}
                onChange={(e) => handleDateChange("endDate", dayjs(e.target.value))}
                min={form.startDate ? dayjs(form.startDate).format("YYYY-MM-DD") : ""}
                className={`w-full pl-10 pr-3 py-2 border ${fieldErrors.endDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            {fieldErrors.endDate && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.endDate}</p>
            )}
          </div>

          {/* CHECKBOXES */}
          <div className="flex flex-col gap-3 p-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="currentFinYear"
                checked={form.currentFinYear}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Financial Year
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="closed"
                checked={form.closed}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Closed
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

export default FinYearForm;