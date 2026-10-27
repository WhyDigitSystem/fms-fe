import { useEffect, useState } from "react";
import { ArrowLeft, ChevronDown, Save, X } from "lucide-react";
import { useToast } from "../../Toast/ToastContext";
import currencyAPI from "../../../api/currencyAPI";

const inputClass =
    "h-[40px] w-full rounded-md border border-slate-300 bg-white px-3 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100";

const CurrencyForm = ({ editData, onBack, onSaveSuccess }) => {
    const { addToast } = useToast();
    const orgId = parseInt(localStorage.getItem("orgId")) || 1000000001;
    const loginUserName = localStorage.getItem("userName") || "SYSTEM";

    const [form, setForm] = useState({
        id: editData?.id || 0,
        currency: editData?.currency || "",
        currencySymbol: editData?.currencySymbol || "",
        subCurrency: editData?.subCurrency || "",
        country: editData?.country || "",
        active: editData ? editData.active === "Active" || editData.active === true : true,
        cancel: false,
    });

    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true); // Start true to gate UI
    const [submitting, setSubmitting] = useState(false);

    // ✅ Fetch initial data (Countries + Get By ID if editing)
    useEffect(() => {
        const initData = async () => {
            try {
                setLoading(true);

                // 1. Fetch countries
                const countriesData = await currencyAPI.getCountries(orgId);
                setCountries(countriesData);

                // 2. If editing, fetch the latest full record
                if (editData?.id) {
                    const record = await currencyAPI.getCurrencyById(editData.id);
                    if (record) {
                        setForm({
                            id: record.id,
                            currency: record.currency || "",
                            currencySymbol: record.currencySymbol || "",
                            subCurrency: record.subCurrency || "",
                            country: record.country || "",
                            active: record.active === "Active" || record.active === true,
                            cancel: record.cancel === "T" || record.cancel === true,
                        });
                    }
                }
            } catch (error) {
                addToast("Failed to load initial data", "error");
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, [orgId, editData?.id, addToast]);

    const handleChange = (name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!form.currency.trim()) {
            addToast("Currency is required", "error");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                active: form.active,
                cancel: false,
                country: form.country,
                createdBy: loginUserName,
                currency: form.currency.trim(),
                currencySymbol: form.currencySymbol.trim(),
                orgId: orgId,
                subCurrency: form.subCurrency.trim(),
            };

            if (form.id > 0) {
                payload.id = form.id;
            }

            const response = await currencyAPI.createUpdateCurrency(payload);
            const body = response?.data ?? response;

            if (body?.status === true || body?.statusFlag === "Ok") {
                addToast(
                    form.id > 0
                        ? "Currency updated successfully!"
                        : "Currency created successfully!",
                    "success"
                );
                onSaveSuccess?.();
                onBack?.();
            } else {
                addToast(
                    body?.paramObjectsMap?.message || "Failed to save currency",
                    "error"
                );
            }
        } catch (error) {
            addToast(
                error?.response?.data?.paramObjectsMap?.message ||
                "Save failed! Try again.",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-slate-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={onBack}
                    className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-gray-800 text-slate-600 transition"
                >
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    {form.id ? "Edit Currency" : "Add Currency"}
                </h1>
            </div>

            {/* Form Container */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex flex-col gap-6">
                    {/* Row of inputs matching the image */}
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                        <div className="w-full">
                            <input
                                type="text"
                                placeholder="Currency"
                                value={form.currency}
                                onChange={(e) => handleChange("currency", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div className="w-full">
                            <input
                                type="text"
                                placeholder="Currency Description"
                                value={form.currencySymbol}
                                onChange={(e) => handleChange("currencySymbol", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div className="w-full">
                            <input
                                type="text"
                                placeholder="Sub Currency"
                                value={form.subCurrency}
                                onChange={(e) => handleChange("subCurrency", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div className="w-full relative">
                            <select
                                value={form.country}
                                onChange={(e) => handleChange("country", e.target.value)}
                                className={`${inputClass} appearance-none pr-8`}
                            >
                                <option value="">Country</option>
                                {countries.map((c) => (
                                    <option key={c.id} value={c.countryName}>
                                        {c.countryName}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                size={14}
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Active Checkbox */}
                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="active"
                            checked={form.active}
                            onChange={(e) => handleChange("active", e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <label
                            htmlFor="active"
                            className="text-sm font-medium text-slate-700 dark:text-gray-300 cursor-pointer"
                        >
                            Active
                        </label>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
                <button
                    onClick={onBack}
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                    <X size={16} /> Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium text-white shadow-sm disabled:opacity-50"
                >
                    <Save size={16} /> {submitting ? "Saving..." : "Save"}
                </button>
            </div>
        </div>
    );
};

export default CurrencyForm;