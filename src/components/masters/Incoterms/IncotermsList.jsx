import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ArrowLeft,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    CheckCircle2,
    X,
    AlertCircle,
} from "lucide-react";
import IncotermsAPI from "../../../api/IncotermsAPI";

const IncotermsList = ({ onBack, onAddNew, onEdit, orgId }) => {
    const [incoterms, setIncoterms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [toast, setToast] = useState(null);

    const fetchTokenRef = useRef(0);

    const fetchIncoterms = useCallback(async () => {
        const token = ++fetchTokenRef.current;
        try {
            setLoading(true);
            const data = await IncotermsAPI.getIncotermsByOrgId(orgId);

            if (token !== fetchTokenRef.current) return;
            setIncoterms(Array.isArray(data) ? data : []);
        } catch (error) {
            if (token !== fetchTokenRef.current) return;
            console.error("Failed to load Incoterms:", error);
            setToast({ type: "error", message: "Failed to load Incoterms." });
        } finally {
            if (token === fetchTokenRef.current) setLoading(false);
        }
    }, [orgId]);

    useEffect(() => {
        fetchIncoterms();
    }, [fetchIncoterms]);

    // Auto-dismiss toast
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(t);
    }, [toast]);

    const handleRefresh = async () => {
        if (refreshing) return;
        setRefreshing(true);
        await fetchIncoterms();
        setRefreshing(false);
    };

    const filteredData = incoterms.filter(
        (item) =>
            (item.incoterm || "").toLowerCase().includes(search.toLowerCase()) ||
            (item.description || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-gray-950">
            <div className="mx-auto w-full max-w-5xl p-4 lg:py-6">

                {/* Header */}
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            aria-label="Back"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                                Incoterms Master
                            </h1>
                            <p className="text-[11px] text-slate-500 dark:text-gray-400">
                                Manage international commercial terms
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={refreshing || loading}
                            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-[12px] font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                            Refresh
                        </button>
                        <button
                            type="button"
                            onClick={onAddNew}
                            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-indigo-600 px-4 text-[12px] font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
                        >
                            <Plus size={15} />
                            New Incoterm
                        </button>
                    </div>
                </div>

                {/* Toast */}
                {toast && (
                    <div
                        className={`mb-4 flex items-center justify-between rounded-md border px-3 py-2 text-[12px] ${toast.type === "error"
                                ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-900/20 dark:text-rose-300"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300"
                            }`}
                    >
                        <span className="flex items-center gap-1.5">
                            {toast.type === "error" ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                            {toast.message}
                        </span>
                        <button onClick={() => setToast(null)} aria-label="Dismiss">
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* Card */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">

                    {/* Search Bar */}
                    <div className="flex items-center justify-between border-b border-slate-100 p-3 dark:border-gray-800">
                        <div className="relative w-full max-w-xs">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by Incoterm or Description..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-[12px] outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-400"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[12px]">
                            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:bg-gray-800/50 dark:text-gray-400">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Incoterm</th>
                                    <th className="px-4 py-3 font-semibold">Description</th>
                                    <th className="px-4 py-3 text-right font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-12 text-center text-slate-500">
                                            <div className="flex items-center justify-center gap-2">
                                                <RefreshCw className="h-4 w-4 animate-spin text-indigo-500" />
                                                Loading Incoterms...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-12 text-center text-slate-500">
                                            {search ? "No Incoterms match your search." : "No Incoterms created yet."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-gray-800/40"
                                        >
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                                                    {item.incoterm}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-gray-300">
                                                {item.description}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => onEdit(item)}
                                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                                                    title="Edit Incoterm"
                                                >
                                                    <Pencil size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    {!loading && filteredData.length > 0 && (
                        <div className="border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-500 dark:border-gray-800 dark:text-gray-400">
                            Showing {filteredData.length} of {incoterms.length} Incoterms
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IncotermsList;