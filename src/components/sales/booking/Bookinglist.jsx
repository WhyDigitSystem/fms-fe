import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  MapPin,
  Pencil,
  Plane,
  Plus,
  Search,
  Ship,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  STATUSES,
  computeTotals,
  fmtNum,
  statusDots,
  statusStyles,
} from "./bookingData";

const modeIcons = { Sea: Ship, Air: Plane, Road: Truck };

const controlClass =
  "h-[32px] rounded-md border border-slate-300 bg-white px-2.5 text-[12px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40 dark:[color-scheme:dark]";

const headings = [
  { label: "Booking No.", className: "" },
  { label: "Date", className: "" },
  { label: "Customer", className: "" },
  { label: "Type", className: "" },
  { label: "Mode / Service", className: "" },
  { label: "Origin", className: "" },
  { label: "Destination", className: "" },
  { label: "ETD", className: "" },
  { label: "Cargo", className: "" },
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

// Safely map API data to flat row structure
const mapApiToRow = (item) => {
  if (item.bookingNo !== undefined) return item;

  const cargo = item.cargoDetails?.[0] || {};
  const routing = item.routingDetails?.[0] || {};

  return {
    ...item,
    id: item.id,
    bookingNo: item.docId || "",
    bookingDate: item.docDate || "",
    customer: item.customer || "",
    bookingType: item.bookingType || "Export",
    mode: item.transportMode || "Sea",
    serviceType: item.serviceType || "",
    origin: routing.origin || "",
    destination: routing.destination || "",
    etd: routing.requestedETD || "",
    status: item.bookingStatus || "Draft",
    customerRef: item.customerReference || "",

    cargoLines: [
      {
        qty: Number(cargo.packageCount) || 0,
        weight: Number(cargo.grossWeight) || 0,
        weightUom: String(cargo.weightUnit || "kg").toLowerCase(),
        volume: Number(cargo.volume) || 0,
        volumeUom: String(cargo.volumeUnit || "m³"),
        pkgType: cargo.packageType || "",
      },
    ],
  };
};

const Bookinglist = ({
  bookings = [],
  loading = false,
  onAddNew,
  onEdit,
  onBack,
  toast,
  onDismissToast,
}) => {
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Back Navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  // Map API data to flat structure
  const rows = useMemo(() => bookings.map(mapApiToRow), [bookings]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rows.filter((item) => {
      const matchesSearch = [
        item.bookingNo,
        item.bookingDate,
        item.customer,
        item.customerRef,
        item.bookingType,
        item.mode,
        item.serviceType,
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
        (modeFilter === "All" || item.mode === modeFilter) &&
        (statusFilter === "All" || item.status === statusFilter)
      );
    });
  }, [rows, search, modeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentItems = filtered.slice(startIndex, startIndex + pageSize);

  console.log(
    "🟢 BookingList rendering. Current page:",
    currentPage,
    "Page size:",
    pageSize,
    "Total pages:",
    totalPages,
    "Filtered items:",
    filtered.length,
    "Current items:",
    currentItems.length,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, modeFilter, statusFilter, pageSize]);

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

  const stats = [
    {
      label: "Total Bookings",
      value: rows.length,
      icon: ClipboardList,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400",
    },
    {
      label: "In Progress",
      value: rows.filter((b) =>
        ["Submitted", "Pending Carrier Confirmation", "On Hold"].includes(
          b.status,
        ),
      ).length,
      icon: Clock,
      color:
        "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400",
    },
    {
      label: "Carrier Confirmed",
      value: rows.filter((b) => b.status === "Carrier Confirmed").length,
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
                  Booking Management
                </h1>

                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  Operations
                </span>
              </div>

              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">
                Capture customer bookings, validate them and submit for approval
                or carrier confirmation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-900"
          >
            <Plus size={14} />
            New Booking
          </button>
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

        {/* Booking Register */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800/40">
          {/* Search and Filters */}
          <div className="flex flex-col gap-2 border-b border-slate-100 px-3 py-2 dark:border-gray-700/60 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xs font-semibold text-slate-900 dark:text-white">
                Booking Register
              </h2>

              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">
                View and manage all freight bookings.
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
                  placeholder="Search bookings..."
                  aria-label="Search bookings"
                  className={`${controlClass} w-full pl-8`}
                />
              </div>

              <SelectBox
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                label="Filter by mode"
                className="sm:w-32"
                options={["All", "Sea", "Air", "Road"].map((value) => ({
                  value,
                  label: value === "All" ? "All modes" : value,
                }))}
              />

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
            <table className="w-full min-w-[1200px] text-left text-[11px]">
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
                      Loading bookings...
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item) => {
                    const ModeIcon = modeIcons[item.mode] || Ship;
                    const status = item.status || "Draft";
                    const totals = computeTotals(item.cargoLines);

                    return (
                      <tr
                        key={item.id ?? item.docId}
                        className="transition hover:bg-slate-50/80 dark:hover:bg-gray-800/60"
                      >
                        <td className="whitespace-nowrap px-3 py-2 align-middle">
                          <span className="font-semibold text-blue-700 dark:text-blue-400">
                            {item.docId || "-"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-3 py-2 align-middle text-slate-600 dark:text-gray-300">
                          {item.bookingDate || "-"}
                        </td>

                        <td className="max-w-[190px] px-3 py-2 align-middle">
                          <p
                            className="truncate font-semibold text-slate-800 dark:text-gray-100"
                            title={item.customer}
                          >
                            {item.customer || "-"}
                          </p>

                          {item.customerRef && (
                            <p className="mt-0.5 truncate text-[10px] text-slate-500 dark:text-gray-400">
                              Ref: {item.customerRef}
                            </p>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-3 py-2 align-middle">
                          <span className="inline-flex items-center gap-1 text-slate-600 dark:text-gray-300">
                            {item.bookingType === "Export" ? (
                              <ArrowUpRight
                                size={13}
                                className="text-emerald-500"
                              />
                            ) : item.bookingType === "Import" ? (
                              <ArrowDownLeft
                                size={13}
                                className="text-blue-500"
                              />
                            ) : null}

                            {item.bookingType || "-"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-3 py-2 align-middle">
                          <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-1.5 py-1 font-medium text-slate-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
                            <ModeIcon size={12} />
                            {item.mode || "-"}
                          </span>

                          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">
                            {item.serviceType || "-"}
                          </p>
                        </td>

                        <td className="max-w-[190px] px-3 py-2 align-middle">
                          <LocationCell code={item.origin} />
                        </td>

                        <td className="max-w-[190px] px-3 py-2 align-middle">
                          <LocationCell code={item.destination} />
                        </td>

                        <td className="whitespace-nowrap px-3 py-2 align-middle text-slate-600 dark:text-gray-300">
                          {item.etd || "-"}
                        </td>

                        <td className="max-w-[170px] px-3 py-2 align-middle text-slate-600 dark:text-gray-300">
                          <p className="truncate" title={totals.packageText}>
                            {totals.packageText}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">
                            {totals.weightKg
                              ? `${fmtNum(totals.weightKg)} kg`
                              : "-"}
                            {totals.volumeM3
                              ? ` · ${fmtNum(totals.volumeM3, 3)} m³`
                              : ""}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-3 py-2 align-middle">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
                              statusStyles[status] || statusStyles.Draft
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                statusDots[status] || statusDots.Draft
                              }`}
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
                              title="Edit booking"
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
                          No bookings found
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

export default Bookinglist;
