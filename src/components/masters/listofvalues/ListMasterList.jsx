import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  ListOrdered,
  Pencil,
  Plus,
  Search,
  Tag,
  CheckCircle2,
} from "lucide-react";
import listformApi from "../../../api/listformApi";

const controlClass =
  "h-[32px] rounded-md border border-slate-300 bg-white px-2.5 text-[12px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40 dark:[color-scheme:dark]";

const statusStyles = {
  Active:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  Inactive:
    "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20",
};

const statusDots = {
  Active: "bg-emerald-500",
  Inactive: "bg-rose-500",
};

const headings = [
  { label: "#", className: "w-10" },
  { label: "List Code", className: "" },
  { label: "List Description", className: "" },
  { label: "Branch", className: "" },
  { label: "Status", className: "" },
  { label: "Action", className: "text-center" },
];

// Safely read nested value from a row ("branch.branchName")
const readPath = (obj, path) =>
  String(path || "")
    .split(".")
    .reduce((acc, key) => (acc == null ? acc : acc[key]), obj);

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

const ListMasterList = ({ onAddNew, onEdit, onBack }) => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const orgId = localStorage.getItem("orgId");
  const branch = localStorage.getItem("branchId");

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listformApi.getList(branch, orgId);
      setItemData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load List of Values. Please try again.");
      setItemData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Normalise rows (flatten nested branch, keep original payload for edit)
  const rows = useMemo(
    () =>
      itemData.map((item) => ({
        ...item,
        id: item?.id,
        listCode: item?.listCode || "",
        listDescription: item?.listDescription || "",
        branchName:
          item?.branch?.branchName || item?.branch?.branch || item?.branch || "",
        active: item?.active || "Inactive",
        createdBy: item?.createdBy || "",
      })),
    [itemData],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rows.filter((item) => {
      const matchesSearch = [
        item.listCode,
        item.listDescription,
        item.branchName,
        item.createdBy,
        item.active,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(term),
      );

      let matchesStatus = true;
      if (statusFilter === "active") {
        matchesStatus =
          String(item.active || "").toLowerCase() === "active";
      } else if (statusFilter === "inactive") {
        matchesStatus =
          String(item.active || "").toLowerCase() === "inactive";
      }

      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentItems = filtered.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const stats = [
    {
      label: "Total Lists",
      value: rows.length,
      icon: ListOrdered,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400",
    },
    {
      label: "Active",
      value: rows.filter(
        (r) => String(r.active || "").toLowerCase() === "active",
      ).length,
      icon: CheckCircle2,
      color:
        "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400",
    },
    {
      label: "Inactive",
      value: rows.filter(
        (r) => String(r.active || "").toLowerCase() === "inactive",
      ).length,
      icon: Filter,
      color:
        "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400",
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
              onClick={onBack}
              aria-label="Go back"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ArrowLeft size={15} />
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white sm:text-lg">
                  List of Values
                </h1>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  Master
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">
                Manage list codes, descriptions and their status.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-900"
          >
            <Plus size={14} />
            New List
          </button>
        </div>

        {/* Stats */}
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

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-900/20 dark:text-rose-300">
            {error}
            <button
              type="button"
              onClick={loadItems}
              className="ml-2 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table card */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800/40">
          <div className="flex flex-col gap-2 border-b border-slate-100 px-3 py-2 dark:border-gray-700/60 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xs font-semibold text-slate-900 dark:text-white">
                List Register
              </h2>
              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">
                View and manage all list of values.
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
                  placeholder="Search lists..."
                  aria-label="Search lists"
                  className={`${controlClass} w-full pl-8`}
                />
              </div>

              <SelectBox
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filter by status"
                className="sm:w-36"
                options={[
                  { value: "all", label: "All statuses" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </div>
          </div>

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
                {loading && (
                  <tr>
                    <td colSpan={headings.length} className="px-3 py-8">
                      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-gray-400">
                        <svg
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Loading lists...
                      </div>
                    </td>
                  </tr>
                )}

                {!loading &&
                  currentItems.map((item, index) => {
                    const status = item.active || "Inactive";
                    return (
                      <tr
                        key={item.id ?? item.listCode ?? index}
                        className="transition hover:bg-slate-50/80 dark:hover:bg-gray-800/60"
                      >
                        <td className="whitespace-nowrap px-3 py-2 align-middle text-slate-500 dark:text-gray-400">
                          {startIndex + index + 1}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 align-middle">
                          <span className="font-semibold text-blue-700 dark:text-blue-400">
                            {item.listCode || "-"}
                          </span>
                        </td>
                        <td className="max-w-[280px] px-3 py-2 align-middle">
                          <p
                            className="truncate font-medium text-slate-800 dark:text-gray-100"
                            title={item.listDescription || ""}
                          >
                            {item.listDescription || "-"}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 align-middle text-slate-600 dark:text-gray-300">
                          {item.branchName || "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 align-middle">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${statusStyles[status] || statusStyles.Inactive
                              }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${statusDots[status] || statusDots.Inactive
                                }`}
                            />
                            {status}
                          </span>
                        </td>
                        <td className="px-3 py-2 align-middle">
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={() => onEdit?.(item)}
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                              title="Edit list"
                              aria-label={`Edit list ${item.listCode || ""}`}
                            >
                              <Pencil size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                {!loading && currentItems.length === 0 && (
                  <tr>
                    <td colSpan={headings.length} className="px-3 py-10">
                      <div className="flex flex-col items-center text-center">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-gray-900 dark:text-gray-500">
                          <Tag size={18} />
                        </span>
                        <p className="mt-2 text-xs font-medium text-slate-700 dark:text-gray-200">
                          No lists found
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

          {/* Footer */}
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
                options={[5, 10, 20, 50, 100].map((count) => ({
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

export default ListMasterList;