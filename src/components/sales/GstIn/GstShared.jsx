import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

/* Styling tokens shared by the GST IN and Party Screening screens */

export const cardClass =
  "rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800/40";

export const controlClass =
  "h-[32px] rounded-md border border-slate-300 bg-white px-2.5 text-[12px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40 dark:[color-scheme:dark]";

export const inputClass =
  "h-[28px] w-full min-w-0 rounded-md border border-slate-300 bg-white px-2 text-[12px] font-medium text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 read-only:bg-slate-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40 dark:disabled:bg-gray-800 dark:read-only:bg-gray-800/60 dark:[color-scheme:dark]";

export const errCls = (hasError) =>
  hasError ? "!border-red-500 focus:!border-red-500 focus:!ring-red-100" : "";

const btnBase =
  "inline-flex h-[32px] items-center justify-center gap-1.5 rounded-md px-3 text-[12px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
export const btnOutline = `${btnBase} border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-300 dark:hover:bg-gray-800`;
export const btnPrimary = `${btnBase} bg-blue-600 text-white shadow-sm hover:bg-blue-700`;
export const btnDark = `${btnBase} bg-slate-900 text-white shadow-sm hover:bg-slate-800 dark:bg-blue-900 dark:hover:bg-blue-800`;

export const SectionHeader = ({ icon: Icon, title, children }) => (
  <div className="flex items-center justify-between gap-2 bg-slate-900 px-3 py-2 dark:bg-blue-950">
    <h3 className="flex items-center gap-2 text-[12px] font-semibold text-white">
      {Icon && <Icon size={13} />}
      {title}
    </h3>
    {children}
  </div>
);

export const Field = ({ label, required, error, children }) => (
  <div className="py-1">
    <div className="flex items-center gap-3">
      <label className="w-[120px] shrink-0 text-[11px] text-slate-600 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
    {error && (
      <p className="ml-[132px] mt-0.5 text-[10px] text-red-600 dark:text-red-400">
        {error}
      </p>
    )}
  </div>
);

export const SelectBox = ({
  value,
  onChange,
  options,
  label,
  className = "",
}) => (
  <div className={`relative ${className}`}>
    <select
      value={value}
      onChange={onChange}
      aria-label={label}
      className={`${controlClass} w-full appearance-none pr-8`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    <ChevronDown
      size={13}
      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
    />
  </div>
);

export const Notice = ({ notice, onClose }) =>
  notice ? (
    <div
      role="status"
      className={`mb-2 flex items-start justify-between gap-2 rounded-md border px-3 py-2 text-[12px] ${
        notice.type === "error"
          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300"
          : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300"
      }`}
    >
      <span className="flex items-start gap-1.5">
        <span className="mt-0.5 shrink-0">
          {notice.type === "error" ? (
            <AlertTriangle size={13} />
          ) : (
            <CheckCircle2 size={13} />
          )}
        </span>
        <span>{notice.text}</span>
      </span>
      <button type="button" onClick={onClose} aria-label="Dismiss">
        <X size={13} />
      </button>
    </div>
  ) : null;

export const Pager = ({
  total,
  startIndex,
  pageSize,
  setPageSize,
  currentPage,
  setCurrentPage,
  totalPages,
}) => (
  <div className="flex flex-col gap-2 border-t border-slate-100 px-3 py-2 dark:border-gray-700/60 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-gray-400">
      <span>
        Showing {total ? startIndex + 1 : 0}–
        {Math.min(startIndex + pageSize, total)} of {total}
      </span>
      <SelectBox
        value={String(pageSize)}
        onChange={(e) => setPageSize(Number(e.target.value))}
        label="Rows per page"
        className="w-24"
        options={[5, 10, 20, 50].map((c) => ({
          value: String(c),
          label: `${c} / page`,
        }))}
      />
    </div>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  </div>
);
