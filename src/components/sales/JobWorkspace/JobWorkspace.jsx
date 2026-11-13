import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Box,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Clock,
  Copy,
  DollarSign,
  Eye,
  FileText,
  Flag,
  History,
  Link2,
  Package,
  Paperclip,
  Pause,
  Printer,
  Save,
  ShieldCheck,
  Ship,
  Sparkles,
  X,
} from "lucide-react";
import {
  buildInfoSections,
  buildSteps,
  jobStatusDots,
  jobStatusStyles,
} from "./Jobdata";

/* ------------------------------------------------------------------ */
/* Styling tokens                                                      */
/* ------------------------------------------------------------------ */

const btnBase =
  "inline-flex h-[32px] items-center justify-center gap-1.5 rounded-md px-3 text-[12px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
const btnOutline = `${btnBase} border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-300 dark:hover:bg-gray-800`;
const btnPrimary = `${btnBase} bg-blue-600 text-white shadow-sm hover:bg-blue-700`;
const btnDark = `${btnBase} bg-slate-900 text-white shadow-sm hover:bg-slate-800 dark:bg-blue-900 dark:hover:bg-blue-800`;
const btnSmall =
  "inline-flex h-7 items-center justify-center gap-1 rounded-md border px-2.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
const btnSmallOutline = `${btnSmall} border-blue-200 bg-white text-blue-700 hover:bg-blue-50 dark:border-blue-500/40 dark:bg-transparent dark:text-blue-300 dark:hover:bg-blue-500/10`;

const cardClass =
  "rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800/40";

const sectionIcons = {
  shipment: Ship,
  routing: CalendarIcon,
  cargo: Box,
  commercial: DollarSign,
};

const TABS = [
  { id: "details", label: "Job Details", icon: FileText },
  { id: "documents", label: "Documents", icon: Paperclip },
  { id: "activity", label: "Activity & Notes", icon: History },
  { id: "related", label: "Related Jobs", icon: Link2 },
];

const docStatusMeta = {
  Generated: {
    icon: CheckCircle2,
    cls: "text-emerald-600 dark:text-emerald-400",
  },
  Ready: { icon: CircleDot, cls: "text-blue-600 dark:text-blue-400" },
  Pending: { icon: Clock, cls: "text-slate-400 dark:text-gray-500" },
};

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

const InfoItem = ({ label, value, kind }) => (
  <div className="flex items-center gap-3 py-0.5 text-[11px]">
    <dt className="w-[96px] shrink-0 text-slate-500 dark:text-gray-400">
      {label}
    </dt>
    <dd className="flex min-w-0 items-center gap-1.5 truncate font-medium text-slate-800 dark:text-gray-100">
      {kind === "date" && (
        <CalendarIcon size={11} className="shrink-0 text-slate-400" />
      )}
      <span className="truncate" title={value}>
        {value}
      </span>
    </dd>
  </div>
);

const CollapsibleSection = ({
  id,
  icon: Icon,
  title,
  columns,
  open,
  onToggle,
}) => (
  <section id={`job-${id}`} className={`${cardClass} overflow-hidden`}>
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center justify-between gap-2 border-b border-blue-100 bg-blue-50/70 px-3 py-2 text-left dark:border-blue-500/20 dark:bg-blue-500/10"
    >
      <span className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-blue-600 shadow-sm dark:bg-gray-900 dark:text-blue-400">
          <Icon size={13} />
        </span>
        <span className="text-[12px] font-semibold text-blue-800 dark:text-blue-300">
          {title}
        </span>
      </span>
      {open ? (
        <ChevronUp size={14} className="text-blue-700 dark:text-blue-300" />
      ) : (
        <ChevronDown size={14} className="text-blue-700 dark:text-blue-300" />
      )}
    </button>

    {open && (
      <div
        className={`grid grid-cols-1 gap-x-4 px-3 py-2 sm:grid-cols-2 ${
          columns.length === 3 ? "lg:grid-cols-3" : ""
        } divide-slate-100 dark:divide-gray-700/50 sm:divide-x`}
      >
        {columns.map((col, i) => (
          <dl key={i} className={i > 0 ? "sm:pl-4" : ""}>
            {col.map(([label, value, kind]) => (
              <InfoItem key={label} label={label} value={value} kind={kind} />
            ))}
          </dl>
        ))}
      </div>
    )}
  </section>
);

const SummaryCell = ({ label, children, className = "" }) => (
  <div className={`min-w-0 px-3 py-1.5 ${className}`}>
    <p className="text-[10px] font-medium text-slate-500 dark:text-gray-400">
      {label}
    </p>
    <div className="mt-0.5 text-[13px] font-bold text-slate-900 dark:text-white">
      {children}
    </div>
  </div>
);

const Stepper = ({ steps }) => (
  <div className={`${cardClass} overflow-x-auto px-3 py-3`}>
    <ol className="flex min-w-[980px] items-start">
      {steps.map((s, i) => {
        const done = s.state === "done";
        const current = s.state === "current";
        const last = i === steps.length - 1;
        return (
          <li
            key={s.label}
            className="relative flex flex-1 flex-col items-center"
          >
            {!last && (
              <span
                className={`absolute left-1/2 top-[13px] h-0.5 w-full ${
                  done ? "bg-emerald-500" : "bg-slate-200 dark:bg-gray-700"
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-[26px] w-[26px] items-center justify-center rounded-full ring-4 ring-white dark:ring-gray-900 ${
                done
                  ? "bg-emerald-500 text-white"
                  : current
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-400 dark:bg-gray-700 dark:text-gray-500"
              }`}
            >
              {done ? (
                <Check size={14} />
              ) : current ? (
                <ArrowRight size={14} />
              ) : (
                <Clock size={13} />
              )}
            </span>
            <p
              className={`mt-1.5 max-w-[90px] text-center text-[10px] font-semibold leading-tight ${
                current
                  ? "text-blue-700 dark:text-blue-300"
                  : done
                    ? "text-slate-800 dark:text-gray-100"
                    : "text-slate-500 dark:text-gray-400"
              }`}
            >
              {s.label}
            </p>
            {s.date && (
              <p
                className={`mt-0.5 text-[10px] ${
                  current
                    ? "font-semibold text-blue-700 dark:text-blue-300"
                    : "text-slate-500 dark:text-gray-400"
                }`}
              >
                {s.date}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  </div>
);

const Modal = ({ title, onClose, children, footer }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
    role="dialog"
    aria-modal="true"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose?.();
    }}
  >
    <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-gray-700/60">
        <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-gray-200"
        >
          <X size={15} />
        </button>
      </div>
      <div className="p-3">{children}</div>
      {footer && (
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-3 py-2 dark:border-gray-700/60">
          {footer}
        </div>
      )}
    </div>
  </div>
);

const DropdownButton = ({ label, icon: Icon, items, className, onSelect }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={className}
      >
        {Icon && <Icon size={13} />}
        {label}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute bottom-full right-0 z-30 mb-1 w-52 rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          {items.map((it) => (
            <button
              key={it}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSelect?.(it);
              }}
              className="flex w-full items-center px-3 py-1.5 text-left text-[12px] text-slate-700 hover:bg-slate-50 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              {it}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

const JobWorkspace = ({ job, onBack, onNotify, onStatusChange }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [direction, setDirection] = useState(job.type || "Export");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState({
    shipment: true,
    routing: true,
    cargo: true,
    commercial: true,
  });
  const [documents, setDocuments] = useState(job.documents || []);
  const [tasks, setTasks] = useState(job.tasks || []);
  const [startedTasks, setStartedTasks] = useState({});
  const [genMenu, setGenMenu] = useState(false);
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState(null);
  const genRef = useRef(null);

  const steps = useMemo(() => buildSteps(job), [job]);
  const sections = useMemo(() => buildInfoSections(job), [job]);
  const activities = job.activities || [];
  const isClosed = job.status === "Closed";

  useEffect(() => {
    const onDown = (e) => {
      if (genRef.current && !genRef.current.contains(e.target))
        setGenMenu(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const copyJobNo = async () => {
    try {
      await navigator.clipboard?.writeText(job.jobNo);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const toggle = (id) => setOpen((p) => ({ ...p, [id]: !p[id] }));
  const allOpen = Object.values(open).every(Boolean);
  const setAll = (v) =>
    setOpen({ shipment: v, routing: v, cargo: v, commercial: v });

  const scrollTo = (id) =>
    document
      .getElementById(`job-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  const onTab = (id) => {
    setActiveTab(id);
    if (id === "documents") scrollTo("documents");
    if (id === "activity") scrollTo("activity");
    if (id === "details") scrollTo("shipment");
  };

  const generateDoc = (id) =>
    setDocuments((p) =>
      p.map((d) => (d.id === id ? { ...d, status: "Generated" } : d)),
    );

  const generateAll = (mode) => {
    setDocuments((p) =>
      p.map((d) => {
        if (d.status === "Generated") return d;
        if (mode === "Generate all pending")
          return { ...d, status: "Generated" };
        const forImport = /import/i.test(d.name);
        const wantImport = mode === "Generate import set";
        return forImport === wantImport ? { ...d, status: "Generated" } : d;
      }),
    );
    setNotice({ type: "success", text: "Documents generated." });
  };

  const generateFromFooter = (name) => {
    setDocuments((p) =>
      p.map((d) =>
        d.name.toLowerCase().includes(name.toLowerCase().split(" ")[0])
          ? { ...d, status: "Generated" }
          : d,
      ),
    );
    setNotice({ type: "success", text: `${name} generated.` });
  };

  const handleSave = () => {
    setNotice({ type: "success", text: `Job ${job.jobNo} saved.` });
    onNotify?.(`Job ${job.jobNo} saved.`);
  };

  const handleValidate = () => {
    const pending = documents.filter((d) => d.status === "Pending").length;
    if (pending > 0)
      setNotice({
        type: "error",
        text: `${pending} document(s) are still pending.`,
      });
    else setNotice({ type: "success", text: "Validation passed." });
  };

  const confirmHold = () => {
    setModal(null);
    onStatusChange?.(job.id, "On Hold");
    setNotice({ type: "success", text: "Job put on hold." });
  };

  const confirmClose = () => {
    setModal(null);
    onStatusChange?.(job.id, "Closed");
    onBack?.();
  };

  const status = job.status || "In Progress";

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-gray-900">
      <div className="w-full px-3 pb-0 pt-3 sm:px-4 lg:px-5">
        {/* Header */}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
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
                  Unified Job Workspace
                </h1>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  Operations
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">
                Track the job, manage documents and complete milestones in one
                place.
              </p>
            </div>
          </div>
        </div>

        {/* Notice */}
        {notice && (
          <div
            role="status"
            className={`mb-2 flex items-start justify-between gap-2 rounded-md border px-3 py-2 text-[12px] ${
              notice.type === "error"
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {notice.type === "error" ? (
                <AlertTriangle size={13} />
              ) : (
                <CheckCircle2 size={13} />
              )}
              {notice.text}
            </span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Dismiss"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Job summary bar */}
        <div
          className={`${cardClass} mb-2 grid grid-cols-2 divide-slate-100 dark:divide-gray-700/50 sm:grid-cols-3 lg:grid-cols-[1.6fr_1fr_0.8fr_1.6fr_1fr_1fr] lg:divide-x`}
        >
          <SummaryCell label="Job No.">
            <span className="flex items-center gap-1.5">
              <span className="truncate">{job.jobNo}</span>
              <button
                type="button"
                onClick={copyJobNo}
                aria-label="Copy job number"
                title={copied ? "Copied" : "Copy job number"}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </span>
          </SummaryCell>
          <SummaryCell label="Mode">
            <span className="flex items-center gap-1.5">
              <Ship size={15} className="text-slate-700 dark:text-gray-200" />
              {job.modeLabel || job.mode}
            </span>
          </SummaryCell>
          <SummaryCell label="Type">
            <span className="inline-flex rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
              {job.type}
            </span>
          </SummaryCell>
          <SummaryCell label="Customer">
            <span className="block truncate" title={job.customer}>
              {job.customer}
            </span>
          </SummaryCell>
          <SummaryCell label="Branch">{job.branch}</SummaryCell>
          <SummaryCell label="Status">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
                jobStatusStyles[status] || jobStatusStyles["In Progress"]
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  jobStatusDots[status] || "bg-emerald-500"
                }`}
              />
              {status}
            </span>
          </SummaryCell>
        </div>

        {/* Milestone stepper */}
        <div className="mb-2">
          <Stepper steps={steps} />
        </div>

        {/* Tabs + Export/Import toggle */}
        <nav
          aria-label="Job sections"
          className="mb-2 flex flex-wrap items-center justify-between gap-2"
        >
          <div className="flex flex-wrap gap-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onTab(t.id)}
                aria-pressed={activeTab === t.id}
                className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[11px] font-semibold transition ${
                  activeTab === t.id
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <t.icon size={13} />
                {t.id === "documents"
                  ? `Documents (${documents.length})`
                  : t.label}
              </button>
            ))}
          </div>

          <div className="inline-flex overflow-hidden rounded-md border border-slate-300 dark:border-gray-700">
            {["Export", "Import"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDirection(d)}
                aria-pressed={direction === d}
                className={`h-8 px-4 text-[12px] font-semibold transition ${
                  direction === d
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-1 items-start gap-2 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          {/* Left: info sections */}
          <div className="min-w-0 space-y-2">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setAll(!allOpen)}
                className="text-[11px] font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                {allOpen ? "Collapse all" : "Expand all"}
              </button>
            </div>
            {sections.map((s) => (
              <CollapsibleSection
                key={s.id}
                {...s}
                icon={sectionIcons[s.id] || Package}
                open={open[s.id]}
                onToggle={() => toggle(s.id)}
              />
            ))}
          </div>

          {/* Right: documents */}
          <section
            id="job-documents"
            className={`${cardClass} scroll-mt-4 overflow-hidden`}
          >
            <div className="flex items-center justify-between gap-2 bg-slate-900 px-3 py-2 dark:bg-blue-950">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-white">
                  <FileText size={13} />
                </span>
                <h3 className="text-[12px] font-semibold text-white">
                  Documents
                </h3>
              </div>

              <div className="relative" ref={genRef}>
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={genMenu}
                  onClick={() => setGenMenu((o) => !o)}
                  className="inline-flex h-7 items-center gap-1.5 rounded-md bg-blue-100 px-2.5 text-[11px] font-semibold text-blue-800 transition hover:bg-blue-200"
                >
                  <Sparkles size={12} />
                  Generate All
                  <ChevronDown size={12} />
                </button>
                {genMenu && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-30 mt-1 w-52 rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
                  >
                    {[
                      "Generate all pending",
                      "Generate export set",
                      "Generate import set",
                    ].map((x) => (
                      <button
                        key={x}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setGenMenu(false);
                          generateAll(x);
                        }}
                        className="flex w-full items-center px-3 py-1.5 text-left text-[12px] text-slate-700 hover:bg-slate-50 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        {x}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[460px] text-left text-[11px]">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-gray-900/60 dark:text-gray-400">
                    <th className="px-3 py-2 font-semibold">Document</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="px-3 py-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700/50">
                  {documents.map((d) => {
                    const meta =
                      docStatusMeta[d.status] || docStatusMeta.Pending;
                    const StatusIcon = meta.icon;
                    const available = d.status !== "Pending";
                    return (
                      <tr
                        key={d.id}
                        className="transition hover:bg-slate-50/80 dark:hover:bg-gray-800/60"
                      >
                        <td className="px-3 py-1.5">
                          <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-gray-100">
                            <FileText
                              size={13}
                              className="shrink-0 text-blue-600 dark:text-blue-400"
                            />
                            {d.name}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-1.5">
                          <span
                            className={`inline-flex items-center gap-1.5 font-semibold ${meta.cls}`}
                          >
                            <StatusIcon size={13} />
                            {d.status}
                          </span>
                        </td>
                        <td className="px-3 py-1.5">
                          {available ? (
                            <div className="flex gap-1.5">
                              <button type="button" className={btnSmallOutline}>
                                <Eye size={12} />
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => window.print()}
                                className={btnSmallOutline}
                              >
                                <Printer size={12} />
                                Print
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => generateDoc(d.id)}
                              className={`${btnSmallOutline} w-[104px]`}
                            >
                              <Eye size={12} />
                              Generate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Bottom: activity + tasks */}
        <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <section
            id="job-activity"
            className={`${cardClass} scroll-mt-4 overflow-hidden`}
          >
            <div className="flex items-center justify-between bg-slate-900 px-3 py-2 dark:bg-blue-950">
              <h3 className="flex items-center gap-2 text-[12px] font-semibold text-white">
                <History size={13} />
                Activity & Notes
              </h3>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-white hover:underline"
              >
                View All
                <ArrowRight size={12} />
              </button>
            </div>
            {activities.length === 0 ? (
              <p className="px-3 py-4 text-[11px] text-slate-500 dark:text-gray-400">
                No activity recorded yet.
              </p>
            ) : (
              <ol className="px-3 py-2">
                {activities.map((a, i) => (
                  <li
                    key={a.id}
                    className="relative flex gap-2.5 pb-2.5 last:pb-0"
                  >
                    {i < activities.length - 1 && (
                      <span className="absolute left-[5px] top-3 h-full w-px bg-slate-200 dark:bg-gray-700" />
                    )}
                    <span
                      className={`relative z-10 mt-1 h-[11px] w-[11px] shrink-0 rounded-full border-2 ${
                        a.tone === "done"
                          ? "border-emerald-500 bg-emerald-500"
                          : a.tone === "current"
                            ? "border-blue-600 bg-blue-600"
                            : "border-blue-500 bg-white dark:bg-gray-900"
                      }`}
                    />
                    <div className="min-w-0 text-[11px]">
                      <p className="text-[10px] text-slate-500 dark:text-gray-400">
                        {a.at}
                        <span className="mx-1.5 text-slate-300">|</span>
                        {a.by}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 font-semibold text-slate-800 dark:text-gray-100">
                        <span>{a.text}</span>
                        {a.attachment && (
                          <Paperclip size={12} className="text-blue-600" />
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="overflow-hidden rounded-lg border border-amber-200 bg-amber-50/60 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/5">
            <div className="flex items-center justify-between border-b border-amber-200 bg-amber-100/70 px-3 py-2 dark:border-amber-500/20 dark:bg-amber-500/10">
              <h3 className="flex items-center gap-2 text-[12px] font-semibold text-slate-900 dark:text-white">
                <Flag size={13} className="text-orange-500" />
                Pending Tasks ({tasks.length})
              </h3>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-800 hover:underline dark:text-gray-200"
              >
                View All
                <ArrowRight size={12} />
              </button>
            </div>
            {tasks.length === 0 ? (
              <p className="px-3 py-4 text-[11px] text-slate-500 dark:text-gray-400">
                No pending tasks.
              </p>
            ) : (
              <ul className="divide-y divide-amber-200/70 dark:divide-amber-500/20">
                {tasks.map((t) => {
                  const started = !!startedTasks[t.id];
                  return (
                    <li
                      key={t.id}
                      className="flex items-center justify-between gap-2 px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <Clock
                          size={14}
                          className={`shrink-0 ${started ? "text-blue-500" : "text-red-500"}`}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-semibold text-slate-800 dark:text-gray-100">
                            {t.title}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-gray-400">
                            Due: {t.due}
                          </p>
                        </div>
                      </div>
                      {started ? (
                        <button
                          type="button"
                          onClick={() =>
                            setTasks((p) => p.filter((x) => x.id !== t.id))
                          }
                          className={btnSmallOutline}
                        >
                          <Check size={12} />
                          Done
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setStartedTasks((p) => ({ ...p, [t.id]: true }))
                          }
                          className={btnSmallOutline}
                        >
                          Start
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 z-20 -mx-3 mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2 sm:-mx-4 sm:px-4 lg:-mx-5 lg:px-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={handleSave} className={btnOutline}>
              <Save size={12} />
              Save
            </button>
            <button
              type="button"
              onClick={handleValidate}
              className={btnOutline}
            >
              <ShieldCheck size={12} />
              Validate
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <DropdownButton
              label="Generate Documents"
              icon={Sparkles}
              className={btnPrimary}
              items={[
                "Shipping Instructions",
                "House Bill of Lading",
                "Master Bill of Lading",
                "Manifest",
              ]}
              onSelect={generateFromFooter}
            />
            <DropdownButton
              label="Print Pack"
              icon={Printer}
              className={btnOutline}
              items={["Export pack", "Customs pack", "All documents"]}
              onSelect={() => window.print()}
            />
            <button
              type="button"
              onClick={() => setModal({ kind: "hold" })}
              disabled={isClosed || status === "On Hold"}
              className={btnOutline}
            >
              <Pause size={12} />
              Hold
            </button>
            <button
              type="button"
              onClick={() => setModal({ kind: "close" })}
              disabled={isClosed}
              className={btnDark}
            >
              <Flag size={12} />
              Close Job
            </button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {modal?.kind === "hold" && (
        <Modal
          title="Put job on hold?"
          onClose={() => setModal(null)}
          footer={
            <>
              <button
                type="button"
                className={btnOutline}
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${btnBase} bg-orange-600 text-white hover:bg-orange-700`}
                onClick={confirmHold}
              >
                Put On Hold
              </button>
            </>
          }
        >
          <p className="text-[12px] text-slate-600 dark:text-gray-300">
            Milestone updates are paused until the hold is released.
          </p>
        </Modal>
      )}

      {modal?.kind === "close" && (
        <Modal
          title="Close job?"
          onClose={() => setModal(null)}
          footer={
            <>
              <button
                type="button"
                className={btnOutline}
                onClick={() => setModal(null)}
              >
                Keep open
              </button>
              <button
                type="button"
                className={`${btnBase} bg-red-600 text-white hover:bg-red-700`}
                onClick={confirmClose}
              >
                Close Job
              </button>
            </>
          }
        >
          <p className="text-[12px] text-slate-600 dark:text-gray-300">
            {tasks.length > 0
              ? `${tasks.length} task(s) are still pending. `
              : ""}
            Closing the job marks it complete and it can no longer be edited.
          </p>
        </Modal>
      )}
    </div>
  );
};

export default JobWorkspace;
