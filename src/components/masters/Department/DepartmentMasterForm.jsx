import { ArrowLeft, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import { departmentAPI } from "../../../api/departmentAPI";
import { useToast } from "../../Toast/ToastContext";

const DepartmentMasterForm = ({ editData, onBack }) => {
    const ORG_ID = parseInt(localStorage.getItem("orgId"));
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const [form, setForm] = useState({
        code: "",
        departmentName: "",
        active: true,
    });

    const [fieldErrors, setFieldErrors] = useState({
        code: "",
        departmentName: "",
    });

    useEffect(() => {
        if (editData) {
            setForm({
                code: editData.code || "",
                departmentName: editData.departmentName || "",
                active: editData.active === "Active" || editData.active === true,
            });
        }
    }, [editData]);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === "checkbox") {
            setForm((prev) => ({
                ...prev,
                [name]: checked,
            }));
        } else {
            // Allow only alphabets and spaces for department name
            if (name === "departmentName") {
                const nameRegex = /^[A-Za-z ]*$/;
                if (!nameRegex.test(value)) {
                    setFieldErrors((prev) => ({ ...prev, [name]: "Only alphabets allowed" }));
                    return;
                }
            }

            // Allow alphanumeric and special characters for code
            if (name === "code") {
                const codeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;
                if (!codeRegex.test(value)) {
                    setFieldErrors((prev) => ({ ...prev, [name]: "Invalid Format" }));
                    return;
                }
            }

            setForm((prev) => ({
                ...prev,
                [name]: value.toUpperCase(),
            }));
            setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!form.code) {
            errors.code = "Department Code is required";
        }
        if (!form.departmentName) {
            errors.departmentName = "Department Name is required";
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                ...(editData?.id && { id: editData.id }),
                code: form.code,
                departmentName: form.departmentName,
                active: form.active,
                orgId: ORG_ID,
                createdBy: localStorage.getItem("userName") || "SYSTEM",
            };

            console.log("📤 Saving Department Payload:", payload);

            const response = await departmentAPI.saveDepartment(payload);
            console.log("📥 Save Response:", response);

            if (response?.status === true) {
                const successMessage =
                    response?.paramObjectsMap?.message ||
                    (editData?.id ? "Department updated successfully!" : "Department created successfully!");

                addToast(successMessage, "success");
                onBack();
            } else {
                const errorMessage =
                    response?.paramObjectsMap?.errorMessage ||
                    response?.paramObjectsMap?.message ||
                    response?.message ||
                    "Failed to save department";

                addToast(errorMessage, "error");
            }
        } catch (error) {
            console.error("❌ Save Error:", error);
            const errorMessage =
                error.response?.data?.paramObjectsMap?.errorMessage ||
                error.response?.data?.paramObjectsMap?.message ||
                error.response?.data?.message ||
                "Save failed! Please try again.";

            addToast(errorMessage, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <ArrowLeft
                    onClick={onBack}
                    className="h-5 w-5 cursor-pointer text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editData ? "Edit Department" : "Add Department"}
                </h2>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Department Code */}
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Department Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="code"
                            value={form.code || ""}
                            onChange={handleFormChange}
                            className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                ${fieldErrors.code
                                    ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                    : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                } outline-none transition-all duration-200`}
                            placeholder="Enter department code"
                        />
                        {fieldErrors.code && (
                            <p className="mt-1 text-xs text-red-500">{fieldErrors.code}</p>
                        )}
                    </div>

                    {/* Department Name */}
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Department Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="departmentName"
                            value={form.departmentName || ""}
                            onChange={handleFormChange}
                            className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                ${fieldErrors.departmentName
                                    ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                    : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                } outline-none transition-all duration-200`}
                            placeholder="Enter department name"
                        />
                        {fieldErrors.departmentName && (
                            <p className="mt-1 text-xs text-red-500">{fieldErrors.departmentName}</p>
                        )}
                    </div>

                    {/* Active Checkbox */}
                    <div className="w-full flex items-center mt-2">
                        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input
                                type="checkbox"
                                name="active"
                                checked={form.active}
                                onChange={handleFormChange}
                                className="h-4 w-4 text-indigo-600 dark:text-indigo-400 rounded border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                            />
                            <span className="text-sm font-medium">Active</span>
                        </label>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1 px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                        <X className="h-4 w-4" /> Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex items-center gap-1 px-4 py-2 text-sm bg-purple-600 dark:bg-purple-500 text-white rounded hover:bg-purple-700 dark:hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="h-4 w-4" />
                        {isLoading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DepartmentMasterForm;