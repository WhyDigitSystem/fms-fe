import React, { useEffect, useState } from "react";
import { ArrowLeft, Save, AlertTriangle, Loader2 } from "lucide-react";
import IncotermsAPI from "../../../api/IncotermsAPI";

const inputClass =
    "h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20";

const emptyForm = (orgId) => ({
    id: 0,
    incoterm: "",
    description: "",
    cancelRemarks: "",
    createdBy: localStorage.getItem("userName") || "SYSTEM",
    orgId: orgId,
});

const IncotermsForm = ({ onBack, onSaveSuccess, editData, orgId }) => {
    const [form, setForm] = useState(emptyForm(orgId));
    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecord = async () => {
            if (!editData?.id) {
                setForm(emptyForm(orgId));
                return;
            }

            try {
                setLoading(true);
                const record = await IncotermsAPI.getIncotermById(editData.id);
                if (record) {
                    setForm({
                        id: record.id || 0,
                        incoterm: record.incoterm || "",
                        description: record.description || "",
                        cancelRemarks: record.cancelRemarks || "",
                        createdBy: record.createdBy || localStorage.getItem("userName") || "",
                        orgId: record.orgId || orgId,
                    });
                }
            } catch (err) {
                console.error("Failed to fetch Incoterm details:", err);
                setError("Failed to load Incoterm details.");
            } finally {
                setLoading(false);
            }
        };
        fetchRecord();
    }, [editData?.id, orgId]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (error) setError(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.incoterm.trim() || !form.description.trim()) {
            setError("Incoterm and Description are required.");
            return;
        }

        try {
            setBusy(true);
            setError(null);

            const payload = {
                ...form,
                incoterm: form.incoterm.trim().toUpperCase(),
                description: form.description.trim(),
            };

            await IncotermsAPI.createUpdateIncoterm(payload);
            onSaveSuccess?.();
        } catch (err) {
            console.error("Failed to save Incoterm:", err);
            setError(err?.response?.data?.message || "Failed to save Incoterm.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-slate-50 dark:bg-gray-950">
            {/* Header */}
            <div className="z-30 shrink-0 border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/80">
                <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={busy || loading}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <h1 className="text-[15px] font-bold text-slate-900 dark:text-white">
                                {editData ? "Edit Incoterm" : "New Incoterm"}
                            </h1>
                            <p className="text-[11px] text-slate-500 dark:text-gray-400">
                                Basic Master - Incoterms
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={busy || loading}
                        className="inline-flex h-9 items-center gap-2 rounded-md bg-indigo-600 px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
                    >
                        <Save size={15} />
                        {busy ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>

            {/* Form Body */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="mx-auto max-w-3xl">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                        {error && (
                            <div className="mb-6 flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-[12px] text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                                <AlertTriangle size={16} />
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="flex items-center justify-center py-10 text-slate-500">
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Loading details...
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div>
                                    <label className="mb-1.5 block text-[12px] font-medium text-slate-700 dark:text-gray-300">
                                        Incoterm <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.incoterm}
                                        onChange={(e) => handleChange("incoterm", e.target.value)}
                                        placeholder="e.g. FOB, CIF, EXW"
                                        className={inputClass}
                                        disabled={busy}
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[12px] font-medium text-slate-700 dark:text-gray-300">
                                        Description <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={form.description}
                                        onChange={(e) => handleChange("description", e.target.value)}
                                        placeholder="e.g. Free On Board"
                                        className={`${inputClass} resize-y py-2`}
                                        disabled={busy}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncotermsForm;