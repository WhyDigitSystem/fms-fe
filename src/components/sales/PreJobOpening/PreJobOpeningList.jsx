import {
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Clock,
    MapPin,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// ✅ Status Styles
const STATUSES = ["Draft", "Booking Pending", "Booking Confirmed", "Job Opened", "On Hold", "Cancelled"];

const statusStyles = {
    Draft: "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-gray-700/50 dark:text-gray-300",
    "Booking Pending": "bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-300",
    "Booking Confirmed": "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    "Job Opened": "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300",
    "On Hold": "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-300",
    Cancelled: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300",
};

const statusDots = {
    Draft: "bg-slate-400",
    "Booking Pending": "bg-yellow-500",
    "Booking Confirmed": "bg-emerald-500",
    "Job Opened": "bg-blue-500",
    "On Hold": "bg-orange-500",
    Cancelled: "bg-red-500",
};

const controlClass =
    "h-[32px] rounded-md border border-slate-300 bg-white px-2.5 text-[12px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40 dark:[color-scheme:dark]";

const headings = [
    { label: "Pre-Job No.", className: "" },
    { label: "Date", className: "" },
    { label: "Customer", className: "" },
    { label: "Route", className: "" },
    { label: "Status", className: "" },
    { label: "Action", className: "text-center" },
];

const SelectBox = ({ value, onChange, options, label, className = "" }) => (
    <div className={`relative ${className}`}>
        <select
            value={value}
            onChange={onChange}
            aria-label={label}
            className={`${controlClass} w-full appearance-none pr-8`}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
        <ChevronDown
            size={13}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
    </div>
);

const formatDate = (value) => {
    if (!value) return "-";
    const datePart = String(value).split("T")[0];
    if (/^\d{2}-\d{2}-\d{4}$/.test(datePart)) return datePart;
    const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
        const [, year, month, day] = match;
        return `${day}-${month}-${year}`;
    }
    return value;
};

const LocationCell = ({ code }) => {
    const displayName = code || "-";

    return (
        <>
            <p
                className="truncate font-medium text-slate-700 dark:text-gray-100"
                title={displayName}
            >
                {displayName}
            </p>

            <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-slate-500 dark:text-gray-400">
                <MapPin size={10} className="shrink-0" />
                <span className="truncate">Mapped Location</span>
            </p>
        </>
    );
};

const PreJobOpeningList = ({
    jobs = [],
    loading = false,
    onAddNew,
    onEdit,
    onBack,
    onReload,
    toast,
    onDismissToast,
}) => {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [refreshing, setRefreshing] = useState(false);

    // Back Navigation
    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            window.history.back();
        }
    };

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return jobs.filter((item) => {
            const matchesSearch = [
                item.preJobNo,
                item.date,
                item.customer,
                item.origin,
                item.destination,
                item.status,
            ].some((value) =>
                String(value || "")
                    .toLowerCase()
                    .includes(term),
            );

            return (
                matchesSearch &&
                (statusFilter === "All" || item.status === statusFilter)
            );
        });
    }, [jobs, search, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const currentItems = filtered.slice(startIndex, startIndex + pageSize);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, pageSize]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    useEffect(() => {
        if (!toast) return undefined;

        const t = setTimeout(() => onDismissToast?.(), 5000);

        return () => clearTimeout(t);
    }, [toast, onDismissToast]);

    const handleRefresh = async () => {
        if (!onReload || refreshing) return;
        setRefreshing(true);
        try {
            await onReload();
        } finally {
            setRefreshing(false);
        }
    };

    const stats = [
        {
            label: "Total Pre-Jobs",
            value: jobs.length,
            icon: ClipboardList,
            color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400",
        },
        {
            label: "Pending Bookings",
            value: jobs.filter((b) => b.status === "Booking Pending").length,
            icon: Clock,
            color:
                "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400",
        },
        {
            label: "Job Opened",
            value: jobs.filter((b) => b.status === "Job Opened").length,
            icon: CheckCircle2,
            color:
                "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400",
        },
    ];

    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-gray-900">
            <div className="w-full space-y-2 p-3 sm:p-4 lg:px-5 lg:py-3">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleBack}
                            aria-label="Go back"
                            title="Back"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            <ArrowLeft size={15} />
                        </button>

                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white sm:text-lg">
                                    Pre-Job Opening Management
                                </h1>

                                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                                    Operations
                                </span>
                            </div>

                            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">
                                Manage pre-job openings and route to booking.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {onReload && (
                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={refreshing || loading}
                                title="Refresh list"
                                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <RefreshCw
                                    size={13}
                                    className={refreshing ? "animate-spin" : ""}
                                />
                                Refresh
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onAddNew}
                            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-900"
                        >
                            <Plus size={14} />
                            New Pre-Job
                        </button>
                    </div>
                </div>

                {/* Toast */}
                {toast && (
                    <div
                        role="status"
                        className="flex items-center justify-between gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300"
                    >
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 size={13} />
                            {toast}
                        </span>

                        <button type="button" onClick={onDismissToast} aria-label="Dismiss">
                            <X size={13} />
                        </button>
                    </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {stats.map(({ label, value, icon: Icon, color }) => (
                        <div
                            key={label}
                            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-gray-700/60 dark:bg-gray-800/40"
                        >
                            <div>
                                <p className="text-[11px] font-medium text-slate-500 dark:text-gray-400">
                                    {label}
                                </p>

                                <p className="mt-1 text-lg font-bold leading-none text-slate-900 dark:text-white">
                                    {value}
                                </p>
                            </div>

                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-md ${color}`}
                            >
                                <Icon size={16} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pre-Job Register */}
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800/40">
                    {/* Search and Filters */}
                    <div className="flex flex-col gap-2 border-b border-slate-100 px-3 py-2 dark:border-gray-700/60 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-xs font-semibold text-slate-900 dark:text-white">
                                Pre-Job Register
                            </h2>

                            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">
                                View and manage all pre-job openings.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="relative min-w-0 sm:w-64">
                                <Search
                                    size={14}
                                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search pre-jobs..."
                                    aria-label="Search pre-jobs"
                                    className={`${controlClass} w-full pl-8`}
                                />
                            </div>

                            <SelectBox
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                label="Filter by status"
                                className="sm:w-40"
                                options={["All", ...STATUSES].map((value) => ({
                                    value,
                                    label: value === "All" ? "All statuses" : value,
                                }))}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left text-[11px]">
                            <thead>
                                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-gray-900/60 dark:text-gray-400">
                                    {headings.map(({ label, className }) => (
                                        <th
                                            key={label}
                                            className={`whitespace-nowrap px-3 py-2 font-semibold ${className}`}
                                        >
                                            {label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 dark:divide-gray-700/50">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={headings.length}
                                            className="px-3 py-10 text-center text-gray-500"
                                        >
                                            Loading pre-jobs...
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((item) => {
                                        const status = item.status || "Draft";

                                        return (
                                            <tr
                                                key={item.id ?? item.preJobNo}
                                                className="transition hover:bg-slate-50/80 dark:hover:bg-gray-800/60"
                                            >
                                                <td className="whitespace-nowrap px-3 py-2 align-middle">
                                                    <span className="font-semibold text-blue-700 dark:text-blue-400">
                                                        {item.preJobNo || "-"}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-3 py-2 align-middle text-slate-600 dark:text-gray-300">
                                                    {formatDate(item.date)}
                                                </td>

                                                <td className="max-w-[190px] px-3 py-2 align-middle">
                                                    <p
                                                        className="truncate font-semibold text-slate-800 dark:text-gray-100"
                                                        title={item.customer}
                                                    >
                                                        {item.customer || "-"}
                                                    </p>
                                                </td>

                                                <td className="px-3 py-2 align-middle flex gap-4">
                                                    <LocationCell code={item.origin} />
                                                    <span className="text-slate-400 py-1">→</span>
                                                    <LocationCell code={item.destination} />
                                                </td>

                                                <td className="whitespace-nowrap px-3 py-2 align-middle">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${statusStyles[status] || statusStyles.Draft}`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${statusDots[status] || statusDots.Draft}`}
                                                        />
                                                        {status}
                                                    </span>
                                                </td>

                                                <td className="px-3 py-2 align-middle">
                                                    <div className="flex justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => onEdit?.(item)}
                                                            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                                                            title="Edit pre-job"
                                                        >
                                                            <Pencil size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}

                                {!loading && currentItems.length === 0 && (
                                    <tr>
                                        <td colSpan={headings.length} className="px-3 py-10">
                                            <div className="flex flex-col items-center text-center">
                                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-gray-900 dark:text-gray-500">
                                                    <Search size={18} />
                                                </span>

                                                <p className="mt-2 text-xs font-medium text-slate-700 dark:text-gray-200">
                                                    No pre-jobs found
                                                </p>

                                                <p className="mt-1 text-[10px] text-slate-500 dark:text-gray-400">
                                                    Try changing your search or filters.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col gap-2 border-t border-slate-100 px-3 py-2 dark:border-gray-700/60 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-gray-400">
                            <span>
                                Showing {filtered.length ? startIndex + 1 : 0}–
                                {Math.min(startIndex + pageSize, filtered.length)} of{" "}
                                {filtered.length}
                            </span>

                            <SelectBox
                                value={String(pageSize)}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                label="Rows per page"
                                className="w-24"
                                options={[5, 10, 20, 50].map((count) => ({
                                    value: String(count),
                                    label: `${count} / page`,
                                }))}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                disabled={currentPage === 1}
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <ChevronLeft size={14} />
                            </button>

                            <span className="min-w-24 text-center text-[11px] text-slate-600 dark:text-gray-300">
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                                }
                                disabled={currentPage === totalPages}
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreJobOpeningList;