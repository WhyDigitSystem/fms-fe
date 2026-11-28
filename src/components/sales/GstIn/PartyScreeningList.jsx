import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  PARTY_TYPES,
  SCREENING_STATUSES,
  effectiveStatus,
  screeningDots,
  screeningStyles,
} from "./GstData";
import { Pager, SelectBox, controlClass } from "./GstShared";

const newBtnClass =
  "inline-flex h-[32px] items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 text-[12px] font-semibold text-white shadow-sm transition hover:bg-blue-700";

const headings = [
  "Party Type",
  "Entity Name",
  "Alternative Names",
  "ID",
  "Screening Status",
  "Screened On",
  "Action",
];

const PartyScreeningList = ({
  parties = [],
  loading = false,
  onOpen,
  onNew,
  onBack,
  toast,
  onDismissToast,
}) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleBack = () => (onBack ? onBack() : window.history.back());

  const rows = useMemo(
    () => parties.map((p) => ({ ...p, shownStatus: effectiveStatus(p) })),
    [parties],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(
      (p) =>
        [p.entityName, p.altNames, p.refId, p.includeAlias].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(term),
        ) &&
        (typeFilter === "All" || p.partyType === typeFilter) &&
        (statusFilter === "All" || p.shownStatus === statusFilter),
    );
  }, [rows, search, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentItems = filtered.slice(startIndex, startIndex + pageSize);

  useEffect(
    () => setCurrentPage(1),
    [search, typeFilter, statusFilter, pageSize],
  );
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => onDismissToast?.(), 5000);
    return () => clearTimeout(t);
  }, [toast, onDismissToast]);

  const count = (s) => rows.filter((p) => p.shownStatus === s).length;
  const stats = [
    {
      label: "Total Parties",
      value: rows.length,
      icon: ShieldCheck,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400",
    },
    {
      label: "Approved",
      value: count("Approved"),
      icon: CheckCircle2,
      color:
        "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400",
    },
    {
      label: "Pending",
      value: count("Pending"),
      icon: Clock,
      color:
        "text-slate-600 bg-slate-100 dark:bg-gray-700/50 dark:text-gray-300",
    },
    {
      label: "Review / Rejected",
      value: count("Review") + count("Rejected"),
      icon: ShieldAlert,
      color: "text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400",
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
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ArrowLeft size={15} />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white sm:text-lg">
                  Party Screening
                </h1>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  i Ticket
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">
                KYC and sanctions screening for customers, suppliers and agents.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNew?.()}
            className={newBtnClass}
          >
            <Plus size={14} />
            New Screening
          </button>
        </div>

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
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
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

        {/* Register */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800/40">
          <div className="flex flex-col gap-2 border-b border-slate-100 px-3 py-2 dark:border-gray-700/60 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-xs font-semibold text-slate-900 dark:text-white">
                All Screenings
              </h2>
              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">
                Double-click a row or use Edit to open a party.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative min-w-0 sm:w-64">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search parties..."
                  aria-label="Search parties"
                  className={`${controlClass} w-full pl-8`}
                />
              </div>
              <SelectBox
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Filter by party type"
                className="sm:w-36"
                options={["All", ...PARTY_TYPES].map((v) => ({
                  value: v,
                  label: v === "All" ? "All types" : v,
                }))}
              />
              <SelectBox
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filter by screening status"
                className="sm:w-40"
                options={["All", ...SCREENING_STATUSES].map((v) => ({
                  value: v,
                  label: v === "All" ? "All statuses" : v,
                }))}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-[11px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-gray-900/60 dark:text-gray-400">
                  {headings.map((h) => (
                    <th
                      key={h}
                      className={`whitespace-nowrap px-3 py-2 font-semibold ${h === "Action" ? "text-center" : ""}`}
                    >
                      {h}
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
                      Loading parties...
                    </td>
                  </tr>
                ) : (
                  currentItems.map((p) => (
                    <tr
                      key={p.id}
                      onDoubleClick={() => onOpen?.(p)}
                      className="transition hover:bg-slate-50/80 dark:hover:bg-gray-800/60"
                    >
                      <td className="whitespace-nowrap px-3 py-2 align-middle">
                        <span className="rounded-md border border-slate-200 px-1.5 py-1 font-medium text-slate-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
                          {p.partyType}
                        </span>
                      </td>
                      <td className="max-w-[240px] px-3 py-2 align-middle">
                        <p
                          className="truncate font-semibold text-blue-700 dark:text-blue-400"
                          title={p.entityName}
                        >
                          {p.entityName}
                        </p>
                      </td>
                      <td className="max-w-[200px] px-3 py-2 align-middle text-slate-600 dark:text-gray-300">
                        <p className="truncate" title={p.altNames}>
                          {p.altNames || "-"}
                        </p>
                      </td>
                      <td className="max-w-[200px] px-3 py-2 align-middle text-slate-600 dark:text-gray-300">
                        <p className="truncate" title={p.refId}>
                          {p.refId || "-"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 align-middle">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${screeningStyles[p.shownStatus]}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${screeningDots[p.shownStatus]}`}
                          />
                          {p.shownStatus}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 align-middle text-slate-600 dark:text-gray-300">
                        {p.screenedOn || "-"}
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => onOpen?.(p)}
                            title="Open"
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                          >
                            <Pencil size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}

                {!loading && currentItems.length === 0 && (
                  <tr>
                    <td colSpan={headings.length} className="px-3 py-10">
                      <div className="flex flex-col items-center text-center">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-gray-900 dark:text-gray-500">
                          <Search size={18} />
                        </span>
                        <p className="mt-2 text-xs font-medium text-slate-700 dark:text-gray-200">
                          No parties found
                        </p>
                        <p className="mt-1 text-[10px] text-slate-500 dark:text-gray-400">
                          Try changing your search or filters.
                        </p>
                        <button
                          type="button"
                          onClick={() => onNew?.()}
                          className={`${newBtnClass} mt-3`}
                        >
                          <Plus size={14} />
                          New Screening
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pager
            total={filtered.length}
            startIndex={startIndex}
            pageSize={pageSize}
            setPageSize={setPageSize}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        </div>
      </div>
    </div>
  );
};

export default PartyScreeningList;
