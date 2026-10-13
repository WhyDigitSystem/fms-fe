// CreateCompanyForm.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { companyAPI } from "../../../api/newEntry";
import { encryptPassword } from '../../../utils/PasswordEnc';
import { useToast } from "../../Toast/ToastContext";

const CreateCompanyForm = ({ editData, onBack }) => {
    const [editingId, setEditingId] = useState(editData?.id || null);
    const [loading, setLoading] = useState(false);
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [loginUserName] = useState(localStorage.getItem('userName'));
     const { addToast } = useToast();

    const [formData, setFormData] = useState({
        companyCode: "",
        companyName: "",
        companyAdminName: "",
        companyAdminEmail: "",
        companyAdminPwd: "",
        employeeCode: "",
        isActive: true
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (editData) {
            setFormData({
                companyCode: editData.companyCode || "",
                companyName: editData.companyName || "",
                companyAdminName: editData.employeeName || "",
                companyAdminEmail: editData.email || "",
                companyAdminPwd: "",
                employeeCode: editData.employeeCode || "",
                isActive: editData.active === "Active" || editData.active === true
            });
        }
    }, [editData]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let processedValue = type === "checkbox" ? checked : value;

        // Apply uppercase transformation for specific fields
        if (name !== "companyAdminEmail") {
            processedValue = processedValue.toUpperCase();
        }

        setFormData({
            ...formData,
            [name]: processedValue
        });

        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const nameRegex = /^[A-Za-z ]*$/;
        const codeRegex = /^[a-zA-Z0-9 ]*$/;

        if (!formData.companyCode) {
            newErrors.companyCode = "Company Code is required";
        } else if (formData.companyCode.length < 3) {
            newErrors.companyCode = "Minimum length is 3 characters";
        } else if (!codeRegex.test(formData.companyCode)) {
            newErrors.companyCode = "Only alphanumeric characters allowed";
        } else if (formData.companyCode.length > 10) {
            newErrors.companyCode = "Maximum length is 10 characters";
        }

        if (!formData.companyName) {
            newErrors.companyName = "Company Name is required";
        } else if (formData.companyName.length < 3) {
            newErrors.companyName = "Minimum length is 3 characters";
        } else if (formData.companyName.length > 50) {
            newErrors.companyName = "Maximum length is 50 characters";
        }

        if (!formData.companyAdminName) {
            newErrors.companyAdminName = "Admin Name is required";
        } else if (formData.companyAdminName.length < 3) {
            newErrors.companyAdminName = "Minimum length is 3 characters";
        } else if (!nameRegex.test(formData.companyAdminName)) {
            newErrors.companyAdminName = "Only alphabetic characters allowed";
        } else if (formData.companyAdminName.length > 50) {
            newErrors.companyAdminName = "Maximum length is 50 characters";
        }

        if (!formData.employeeCode) {
            newErrors.employeeCode = "Employee Code is required";
        } else if (formData.employeeCode.length < 3) {
            newErrors.employeeCode = "Minimum length is 3 characters";
        } else if (!codeRegex.test(formData.employeeCode)) {
            newErrors.employeeCode = "Only alphanumeric characters allowed";
        } else if (formData.employeeCode.length > 10) {
            newErrors.employeeCode = "Maximum length is 10 characters";
        }

        if (!formData.companyAdminEmail) {
            newErrors.companyAdminEmail = "Company Admin Email is required";
        } else if (!emailRegex.test(formData.companyAdminEmail)) {
            newErrors.companyAdminEmail = "Invalid email format";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);

            const payload = {
                ...(editingId && { id: editingId }),
                active: formData.isActive,
                address: "",
                city: "",
                companyCode: formData.companyCode,
                companyName: formData.companyName,
                ceo: "",
                country: "",
                createdBy: loginUserName,
                currency: "",
                email: formData.companyAdminEmail,
                employeeName: formData.companyAdminName,
                mainCurrency: "",
                note: "",
                password: encryptPassword("Wds@2022"),
                phone: "",
                state: "",
                gst: "",
                webSite: "",
                employeeCode: formData.employeeCode,
                zip: "",
                orgId: orgId
            };

            // Create or Update API
            const response = editingId
                ? await companyAPI.updateCompany(payload)
                : await companyAPI.createCompany(payload);

            if (response?.status) {
                addToast(
                    editingId
                        ? "Company updated successfully!"
                        : "Company created successfully!"
                );

                onBack();
            } else {
                addToast(
                    response?.paramObjectsMap?.errorMessage ||
                    "Failed to save company"
                );
            }
        } catch (err) {
            console.error("Error saving company:", err);
            addToast("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        onBack();
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {editingId ? "Edit Company" : "Add New Company"}
                    </h2>
                    <span className="text-sm text-orange-500 dark:text-orange-400">
                        • {editingId ? "Editing" : "New Entry"}
                    </span>
                </div>
                <button
                    onClick={handleCancel}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
            </div>

            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Company Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="companyCode"
                                value={formData.companyCode}
                                onChange={handleInputChange}
                                placeholder="Enter company code"
                                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${errors.companyCode
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                                    }`}
                            />
                            {errors.companyCode && (
                                <p className="text-red-500 text-xs mt-1">{errors.companyCode}</p>
                            )}
                        </div>

                        {/* Company Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleInputChange}
                                placeholder="Enter company name"
                                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${errors.companyName
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                                    }`}
                            />
                            {errors.companyName && (
                                <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
                            )}
                        </div>

                        {/* Admin Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Admin Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="companyAdminName"
                                value={formData.companyAdminName}
                                onChange={handleInputChange}
                                placeholder="Enter admin name"
                                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${errors.companyAdminName
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                                    }`}
                            />
                            {errors.companyAdminName && (
                                <p className="text-red-500 text-xs mt-1">{errors.companyAdminName}</p>
                            )}
                        </div>

                        {/* Admin Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Admin Email Id <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="companyAdminEmail"
                                value={formData.companyAdminEmail}
                                onChange={handleInputChange}
                                placeholder="Enter admin email"
                                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${errors.companyAdminEmail
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                                    }`}
                            />
                            {errors.companyAdminEmail && (
                                <p className="text-red-500 text-xs mt-1">{errors.companyAdminEmail}</p>
                            )}
                        </div>

                        {/* Employee Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Employee Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="employeeCode"
                                value={formData.employeeCode}
                                onChange={handleInputChange}
                                placeholder="Enter employee code"
                                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${errors.employeeCode
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                                    }`}
                            />
                            {errors.employeeCode && (
                                <p className="text-red-500 text-xs mt-1">{errors.employeeCode}</p>
                            )}
                        </div>
                    </div>

                    {/* Checkbox */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="isActive"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Active
                            </label>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Saving..." : editingId ? "Update" : "Save"}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCompanyForm;