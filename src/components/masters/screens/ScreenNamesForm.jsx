import { ArrowLeft, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FloatingInput } from "../../../utils/InputFields";
import screensAPI from "../../../api/screensAPI";
import { useToast } from "../../Toast/ToastContext";

const ScreenNamesForm = ({ onBack, onSave, editData }) => {
    const ORG_ID = parseInt(localStorage.getItem("orgId")) || 1000000001;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    // Use globalParams similar to CityForm
    const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");

    const loginUserName = localStorage.getItem("userName") || "SYSTEM";

    const [fieldErrors, setFieldErrors] = useState({});

    const [form, setForm] = useState({
        id: editData?.id || 0,
        screenCode: editData?.screenCode || "",
        screenName: editData?.screenName || "",
        active: editData?.active ?? true,
        createdBy: localStorage.getItem("userName") || "SYSTEM",
    });

    // Field labels for toast messages
    const fieldLabels = {
        screenCode: "Screen Code",
        screenName: "Screen Name",
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        }

        const alphanumericRegex = /^[A-Za-z0-9]*$/;
        const nameRegex = /^[A-Za-z ]*$/;

        let errorMessage = "";

        // Handle checkbox separately
        if (name === "active") {
            setForm(prev => ({ ...prev, active: checked }));
            return;
        }

        switch (name) {
            case "screenCode":
                if (!alphanumericRegex.test(value)) {
                    errorMessage = "Only alphanumeric characters are allowed";
                } else if (value.length > 10) {
                    errorMessage = "Screen Code must be maximum 10 characters";
                }
                break;
            case "screenName":
                if (!nameRegex.test(value)) {
                    errorMessage = "Only alphabets and spaces are allowed";
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

    const handleSave = async () => {
        // Validate form and show toast for first error
        const errors = {};

        if (!form.screenCode.trim()) errors.screenCode = "Screen Code is required";
        if (!form.screenName.trim()) errors.screenName = "Screen Name is required";

        // Validate lengths
        if (form.screenCode && form.screenCode.length > 10) errors.screenCode = "Screen Code must be maximum 10 characters";

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

        // Build payload - only include id if it exists and is not 0 (update scenario)
        const payload = {
            screenCode: form.screenCode,
            screenName: form.screenName,
            active: form.active === true || form.active === "true" ? true : false,
            createdBy: form.createdBy,
        };

        // Only add id if it exists and is not 0 (update scenario)
        if (form.id && form.id !== 0) {
            payload.id = form.id;
        }

        console.log("📤 Saving Screen Payload:", payload);

        try {
            const response = await screensAPI.saveScreen(payload);
            console.log("📥 Save Response:", response);

            // Check response status - similar to CityForm
            const status = response?.status === true || response?.statusFlag === "Ok";

            if (status) {
                const successMessage = response?.paramObjectsMap?.message ||
                    (form.id && form.id !== 0 ? "Screen updated successfully!" : "Screen created successfully!");

                addToast(successMessage, 'success');

                if (onSave) onSave(payload);
            } else {
                const errorMessage = response?.paramObjectsMap?.errorMessage ||
                    response?.paramObjectsMap?.message ||
                    response?.message ||
                    "Failed to save screen";

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
                    {editData ? "Edit Screen" : "Add Screen"}
                </h2>
            </div>

            {/* MAIN CARD */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                {/* MAIN FORM GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                    <FloatingInput
                        label="Screen Code *"
                        name="screenCode"
                        value={form.screenCode}
                        onChange={handleChange}
                        error={fieldErrors.screenCode}
                        required
                    />

                    <FloatingInput
                        label="Screen Name *"
                        name="screenName"
                        value={form.screenName}
                        onChange={handleChange}
                        error={fieldErrors.screenName}
                        required
                    />

                    {/* STATUS CHECKBOX */}
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

export default ScreenNamesForm;