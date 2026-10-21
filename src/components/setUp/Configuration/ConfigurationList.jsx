import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe,
  Pencil,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";

const controlClass =
  "h-[32px] rounded-md border border-slate-300 bg-white px-2.5 text-[12px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40 dark:[color-scheme:dark]";

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

const ConfigurationList = ({
  configurations = [],
  onAddNew,
  onEdit,
  onBack,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return configurations.filter((item) => {
      const matchesSearch = [
        item.configurationName,
        item.companyName,
        item.companyCode,
        item.financialYear,
        item.currency,
        item.language,
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
  }, [configurations, search, statusFilter]);

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

  const stats = [
    {
      label: "Total Configurations",
      value: configurations.length,
      icon: Settings2,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400",
    },
    {
      label: "Active Configurations",
      value: configurations.filter((item) => item.status === "Active").length,
      icon: SlidersHorizontal,
      color:
        "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400",
    },
    {
      label: "Financial Years",
      value: new Set(configurations.map((item) => item.financialYear)).size,
      icon: CalendarDays,
      color:
        "text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-gray-900">
      <div className="w-full space-y-2 p-3 sm:p-4 lg:px-5 lg:py-3">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Go back"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <ArrowLeft size={15} />
              </button>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white sm:text-lg">
                  Configuration Management
                </h1>

                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  Setup
                </span>
              </div>

              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">
                Manage company details, regional preferences and application
                settings.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <Plus size={14} />
            New Configuration
          </button>
        </div>

        {/* Summary Cards */}
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

        {/* Configuration Register */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800/40">
          <div className="flex flex-col gap-2 border-b border-slate-100 px-3 py-2 dark:border-gray-700/60 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xs font-semibold text-slate-900 dark:text-white">
                Configuration Register
              </h2>
              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">
                View and manage application configuration records.
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
                  placeholder="Search configurations..."
                  aria-label="Search configurations"
                  className={`${controlClass} w-full pl-8`}
                />
              </div>

              <SelectBox
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filter by status"
                className="sm:w-36"
                options={["All", "Active", "Inactive"].map((value) => ({
                  value,
                  label: value === "All" ? "All statuses" : value,
                }))}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-[11px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-gray-900/60 dark:text-gray-400">
                  {[
                    "Configuration",
                    "Company Name",
                    "Company Code",
                    "Financial Year",
                    "Currency",
                    "Date Format",
                    "Language",
                    "Status",
                    "Action",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className={`whitespace-nowrap px-3 py-2 font-semibold ${
                        heading === "Action" ? "text-center" : ""
                      }`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-gray-700/50">
                {currentItems.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-50/80 dark:hover:bg-gray-800/60"
                  >
                    <td className="whitespace-nowrap px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                          <Settings2 size={14} />
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-gray-100">
                          {item.configurationName || "-"}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-2 font-medium text-slate-700 dark:text-gray-200">
                      {item.companyName || "-"}
                    </td>

                    <td className="whitespace-nowrap px-3 py-2 text-slate-600 dark:text-gray-300">
                      {item.companyCode || "-"}
                    </td>

                    <td className="whitespace-nowrap px-3 py-2 text-slate-600 dark:text-gray-300">
                      {item.financialYear || "-"}
                    </td>

                    <td className="whitespace-nowrap px-3 py-2">
                      <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-1.5 py-1 text-slate-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
                        <Globe size={12} />
                        {item.currency || "-"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-2 text-slate-600 dark:text-gray-300">
                      {item.dateFormat || "-"}
                    </td>

                    <td className="whitespace-nowrap px-3 py-2 text-slate-600 dark:text-gray-300">
                      {item.language || "-"}
                    </td>

                    <td className="whitespace-nowrap px-3 py-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
                          item.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20"
                            : "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-gray-700/50 dark:text-gray-300"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.status === "Active"
                              ? "bg-emerald-500"
                              : "bg-slate-400"
                          }`}
                        />
                        {item.status || "Inactive"}
                      </span>
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => onEdit?.(item)}
                          title="Edit configuration"
                          aria-label={`Edit ${item.configurationName || "configuration"}`}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                        >
                          <Pencil size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-3 py-10">
                      <div className="flex flex-col items-center text-center">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-gray-900 dark:text-gray-500">
                          <Search size={18} />
                        </span>

                        <p className="mt-2 text-xs font-medium text-slate-700 dark:text-gray-200">
                          No configurations found
                        </p>

                        <p className="mt-1 text-[10px] text-slate-500 dark:text-gray-400">
                          Try changing your search or filter.
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
                aria-label="Previous page"
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
                aria-label="Next page"
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

export default ConfigurationList;
