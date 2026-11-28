import { useEffect, useState } from "react";
import {
  ArrowLeft,
  FileText,
  MapPin,
  Plus,
  Save,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import {
  ACCOUNT_TYPES,
  BUSINESS_CATEGORIES,
  BUSINESS_PLACES,
  BUSINESS_TYPES,
  EMAIL_REGEX,
  PAN_REGEX,
  PHONE_REGEX,
  STATES,
  checkGstin,
  cleanText,
  emptyAddressRow,
  emptyGst,
  emptyStateRow,
  screeningDots,
  screeningStyles,
  stateCodeOf,
} from "./GstData";
import {
  Field,
  Notice,
  btnOutline,
  btnPrimary,
  cardClass,
  errCls,
  inputClass,
} from "./GstShared";

const TABS = [
  { id: "state", label: "State GST", icon: FileText },
  { id: "address", label: "Business Address", icon: MapPin },
];

const th = "px-2 py-2 font-semibold";
const td = "px-2 py-1.5 align-middle";

/**
 * Admin > GST Details > GST IN
 *
 * Props
 *  record               - saved record to edit (omit for a new GST IN)
 *  existingPans         - PANs already used by other records (duplicate check)
 *  parties              - party screening records (party name suggestions)
 *  getScreeningStatus   - (partyName) => "Approved" | "Pending" | "Review" | "Rejected" | ""
 *  onSave(form)         - called with the validated form
 *  onBack()
 */
const GstInForm = ({
  record,
  existingPans = [],
  parties = [],
  getScreeningStatus,
  onSave,
  onBack,
}) => {
  const isNew = !record;
  const [form, setForm] = useState(() =>
    record ? structuredClone(record) : emptyGst(),
  );
  const [tab, setTab] = useState("state");
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(t);
  }, [notice]);

  const screening = form.partyName
    ? getScreeningStatus?.(form.partyName) || ""
    : "";
  const kycLabel = screening || "Not screened";

  const setField = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const updateRow = (key, id, patch) =>
    setForm((p) => ({
      ...p,
      [key]: p[key].map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));

  const addRow = (key) =>
    setForm((p) => ({
      ...p,
      [key]: [
        ...p[key],
        key === "stateGst" ? emptyStateRow() : emptyAddressRow(),
      ],
    }));

  const removeRow = (key, id) =>
    setForm((p) => ({
      ...p,
      [key]: p[key].length > 1 ? p[key].filter((r) => r.id !== id) : p[key],
    }));

  const onApproval = (checked) => {
    if (checked && screening !== "Approved") {
      setNotice({
        type: "error",
        text: "Approval needs an Approved KYC status. Run Party Screening for this party first.",
      });
      return;
    }
    setField("approved", checked);
  };

  const validate = () => {
    const e = {};
    const msgs = [];
    const flag = (key, msg, rowMsg) => {
      e[key] = msg;
      msgs.push(rowMsg || msg);
    };

    if (!PAN_REGEX.test(form.pan))
      flag("pan", "Enter a valid 10-character PAN (e.g. AABCO4521K)");
    else if (existingPans.includes(form.pan))
      flag("pan", "This PAN already exists");
    if (!form.partyName.trim()) flag("partyName", "Party name is required");
    if (!form.accountsType) flag("accountsType", "Select accounts type");
    if (!form.businessType) flag("businessType", "Select business type");
    if (!form.businessCategory)
      flag("businessCategory", "Select business category");
    if (form.businessCategory === "Others" && !form.otherCategory.trim())
      flag("otherCategory", "Specify the category");

    const seenStates = new Set();
    form.stateGst.forEach((r, i) => {
      const n = `State GST row ${i + 1}`;
      if (!r.state) flag(`g_${r.id}_state`, "Required", `${n}: select a state`);
      else if (seenStates.has(r.state))
        flag(`g_${r.id}_state`, "Duplicate", `${n}: ${r.state} is added twice`);
      seenStates.add(r.state);
      if (!r.gstin)
        flag(`g_${r.id}_gstin`, "Required", `${n}: enter the GSTIN`);
      else {
        const m = checkGstin(r.gstin, {
          pan: form.pan,
          stateCode: r.stateCode,
        });
        if (m) flag(`g_${r.id}_gstin`, m, `${n}: ${m}`);
      }
      if (r.phone && !PHONE_REGEX.test(r.phone))
        flag(`g_${r.id}_phone`, "10 digits", `${n}: phone must be 10 digits`);
      if (r.email && !EMAIL_REGEX.test(r.email))
        flag(`g_${r.id}_email`, "Invalid", `${n}: invalid email`);
    });

    form.addresses.forEach((r, i) => {
      const n = `Address row ${i + 1}`;
      const started = r.state || r.businessPlace || r.cityName || r.address1;
      if (!started) return; // an untouched row is ignored
      if (!r.state) flag(`a_${r.id}_state`, "Required", `${n}: select a state`);
      if (!r.businessPlace)
        flag(
          `a_${r.id}_businessPlace`,
          "Required",
          `${n}: select a business place`,
        );
      if (!r.address1.trim())
        flag(`a_${r.id}_address1`, "Required", `${n}: enter Address1`);
      if (r.phone && !PHONE_REGEX.test(r.phone))
        flag(`a_${r.id}_phone`, "10 digits", `${n}: phone must be 10 digits`);
      if (r.email && !EMAIL_REGEX.test(r.email))
        flag(`a_${r.id}_email`, "Invalid", `${n}: invalid email`);
    });

    setErrors(e);
    if (msgs.length) {
      setNotice({
        type: "error",
        text:
          msgs.slice(0, 4).join(" • ") +
          (msgs.length > 4 ? ` • +${msgs.length - 4} more` : ""),
      });
      // jump to the tab holding the first problem
      if (
        Object.keys(e).some((k) => k.startsWith("a_")) &&
        !Object.keys(e).some((k) => !k.startsWith("a_"))
      )
        setTab("address");
      else if (Object.keys(e).some((k) => k.startsWith("g_"))) setTab("state");
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave?.({
      ...form,
      otherCategory:
        form.businessCategory === "Others" ? form.otherCategory : "",
      addresses: form.addresses.filter(
        (r) => r.state || r.businessPlace || r.address1,
      ),
    });
  };

  const rowInput = (key, row, field, extra = {}) => (
    <input
      aria-label={field}
      value={row[field]}
      onChange={(e) =>
        updateRow(key, row.id, {
          [field]: extra.transform
            ? extra.transform(e.target.value)
            : e.target.value,
        })
      }
      maxLength={extra.maxLength}
      inputMode={extra.inputMode}
      className={`${inputClass} ${errCls(errors[`${key === "stateGst" ? "g" : "a"}_${row.id}_${field}`])}`}
      title={
        errors[`${key === "stateGst" ? "g" : "a"}_${row.id}_${field}`] || ""
      }
    />
  );

  const digits = (v) => v.replace(/\D/g, "");

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-gray-900">
      <div className="w-full px-3 pb-0 pt-3 sm:px-4 lg:px-5">
        {/* Header */}
        <div className="mb-2 flex items-center gap-2">
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
                {isNew ? "New GST IN" : "Edit GST IN"}
              </h1>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                Admin &gt; GST Details
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">
              Capture the party PAN, state-wise GSTINs and business addresses.
            </p>
          </div>
        </div>

        <Notice notice={notice} onClose={() => setNotice(null)} />

        {/* Party details */}
        <section className={`${cardClass} mb-2 px-3 py-2`}>
          <div className="grid grid-cols-1 gap-x-6 lg:grid-cols-[1fr_1fr_1.1fr]">
            {/* Column 1 */}
            <div>
              <Field label="PAN" required error={errors.pan}>
                <input
                  aria-label="PAN"
                  value={form.pan}
                  maxLength={10}
                  onChange={(e) =>
                    setField(
                      "pan",
                      e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
                    )
                  }
                  placeholder="AABCO4521K"
                  className={`${inputClass} ${errCls(errors.pan)}`}
                />
              </Field>
              <Field label="Party Name" required error={errors.partyName}>
                <input
                  aria-label="Party Name"
                  list="gst-party-names"
                  value={form.partyName}
                  onChange={(e) =>
                    setField(
                      "partyName",
                      cleanText(e.target.value).toUpperCase(),
                    )
                  }
                  placeholder="Type or pick a screened party"
                  className={`${inputClass} ${errCls(errors.partyName)}`}
                />
                <datalist id="gst-party-names">
                  {parties.map((p) => (
                    <option key={p.id} value={p.entityName} />
                  ))}
                </datalist>
              </Field>
              <Field label="Accounts Type" required error={errors.accountsType}>
                <select
                  aria-label="Accounts Type"
                  value={form.accountsType}
                  onChange={(e) => setField("accountsType", e.target.value)}
                  className={`${inputClass} ${errCls(errors.accountsType)}`}
                >
                  <option value="">Select</option>
                  {ACCOUNT_TYPES.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Column 2 */}
            <div>
              <p className="pb-0.5 text-[11px] font-bold text-red-700 dark:text-red-400">
                As Per PAN
              </p>
              <Field label="PAN Name">
                <input
                  aria-label="PAN Name"
                  value={form.panName}
                  onChange={(e) =>
                    setField("panName", cleanText(e.target.value).toUpperCase())
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Business Type" required error={errors.businessType}>
                <select
                  aria-label="Business Type"
                  value={form.businessType}
                  onChange={(e) => setField("businessType", e.target.value)}
                  className={`${inputClass} ${errCls(errors.businessType)}`}
                >
                  <option value="">Select</option>
                  {BUSINESS_TYPES.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </Field>
              <Field
                label="Business Category"
                required
                error={errors.businessCategory}
              >
                <select
                  aria-label="Business Category"
                  value={form.businessCategory}
                  onChange={(e) => setField("businessCategory", e.target.value)}
                  className={`${inputClass} ${errCls(errors.businessCategory)}`}
                >
                  <option value="">Select</option>
                  {BUSINESS_CATEGORIES.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </Field>
              <Field label="Other Category" error={errors.otherCategory}>
                <input
                  aria-label="Other Category"
                  value={form.otherCategory}
                  disabled={form.businessCategory !== "Others"}
                  onChange={(e) =>
                    setField("otherCategory", cleanText(e.target.value))
                  }
                  placeholder={
                    form.businessCategory === "Others"
                      ? "Specify category"
                      : "Only for 'Others'"
                  }
                  className={`${inputClass} ${errCls(errors.otherCategory)}`}
                />
              </Field>
            </div>

            {/* Column 3 */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 text-[12px] text-slate-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={form.approved}
                  onChange={(e) => onApproval(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                Approval
                <span
                  className={`ml-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
                    screeningStyles[screening] || screeningStyles.Pending
                  }`}
                  title="KYC status from Party Screening"
                >
                  <ShieldCheck size={11} />
                  KYC: {kycLabel}
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${screeningDots[screening] || "bg-slate-400"}`}
                  />
                </span>
              </label>
              <p className="text-[10px] text-slate-500 dark:text-gray-400">
                Approval is allowed only when the party's Party Screening status
                is Approved.
              </p>
              <p className="text-[11px] font-semibold leading-snug text-red-700 dark:text-red-400">
                Note : Please ensure to input proper and valid data only. Do not
                use any special characters like $ ! ' * % etc., and key in valid
                data only.
              </p>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <nav aria-label="GST sections" className="mb-2 flex gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[11px] font-semibold transition ${
                tab === t.id
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <t.icon size={13} />
              {t.label} (
              {t.id === "state" ? form.stateGst.length : form.addresses.length})
            </button>
          ))}
        </nav>

        {/* State GST grid */}
        {tab === "state" && (
          <section className={`${cardClass} overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-gray-700/60">
              <button
                type="button"
                onClick={() => addRow("stateGst")}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:underline"
              >
                <Plus size={14} /> Add State GST
              </button>
              <span className="text-[10px] text-slate-500 dark:text-gray-400">
                State code is filled from the state and must match the first 2
                digits of the GSTIN.
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-[11px]">
                <thead>
                  <tr className="bg-slate-900 text-[10px] uppercase tracking-wider text-white dark:bg-blue-950">
                    <th className={`${th} w-14`}>#</th>
                    <th className={th}>State *</th>
                    <th className={th}>GSTIN *</th>
                    <th className={`${th} w-24`}>State Code</th>
                    <th className={th}>Contact Person</th>
                    <th className={th}>Contact Phone No.</th>
                    <th className={th}>Contact Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700/50">
                  {form.stateGst.map((r, i) => (
                    <tr key={r.id}>
                      <td className={td}>
                        <span className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => removeRow("stateGst", r.id)}
                            disabled={form.stateGst.length === 1}
                            aria-label={`Remove row ${i + 1}`}
                            className="text-slate-400 hover:text-red-500 disabled:opacity-40"
                          >
                            <XCircle size={15} />
                          </button>
                          {i + 1}
                        </span>
                      </td>
                      <td className={td}>
                        <select
                          aria-label="State"
                          value={r.state}
                          onChange={(e) =>
                            updateRow("stateGst", r.id, {
                              state: e.target.value,
                              stateCode: stateCodeOf(e.target.value),
                            })
                          }
                          className={`${inputClass} ${errCls(errors[`g_${r.id}_state`])}`}
                        >
                          <option value="">Select</option>
                          {STATES.map((s) => (
                            <option key={s.code}>{s.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className={td}>
                        <input
                          aria-label="GSTIN"
                          value={r.gstin}
                          maxLength={15}
                          onChange={(e) =>
                            updateRow("stateGst", r.id, {
                              gstin: e.target.value
                                .toUpperCase()
                                .replace(/[^A-Z0-9]/g, ""),
                            })
                          }
                          className={`${inputClass} font-mono tracking-wide ${errCls(errors[`g_${r.id}_gstin`])}`}
                          title={errors[`g_${r.id}_gstin`] || ""}
                        />
                        {errors[`g_${r.id}_gstin`] &&
                          errors[`g_${r.id}_gstin`] !== "Required" && (
                            <p className="mt-0.5 text-[10px] text-red-600 dark:text-red-400">
                              {errors[`g_${r.id}_gstin`]}
                            </p>
                          )}
                      </td>
                      <td className={td}>
                        <input
                          aria-label="State Code"
                          value={r.stateCode}
                          readOnly
                          className={inputClass}
                        />
                      </td>
                      <td className={td}>
                        {rowInput("stateGst", r, "contactPerson", {
                          transform: cleanText,
                        })}
                      </td>
                      <td className={td}>
                        {rowInput("stateGst", r, "phone", {
                          transform: digits,
                          maxLength: 10,
                          inputMode: "numeric",
                        })}
                      </td>
                      <td className={td}>{rowInput("stateGst", r, "email")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Business Address grid */}
        {tab === "address" && (
          <section className={`${cardClass} overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-gray-700/60">
              <button
                type="button"
                onClick={() => addRow("addresses")}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:underline"
              >
                <Plus size={14} /> Add Business Address
              </button>
              <span className="text-[10px] text-slate-500 dark:text-gray-400">
                Business place list depends on the selected state.
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1300px] text-left text-[11px]">
                <thead>
                  <tr className="bg-slate-900 text-[10px] uppercase tracking-wider text-white dark:bg-blue-950">
                    <th className={`${th} w-14`}>#</th>
                    <th className={th}>State</th>
                    <th className={th}>Business Place</th>
                    <th className={th}>City Name</th>
                    <th className={th}>Address1</th>
                    <th className={th}>Address2</th>
                    <th className={th}>Contact Person</th>
                    <th className={th}>Contact Phone No.</th>
                    <th className={th}>Contact Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700/50">
                  {form.addresses.map((r, i) => (
                    <tr key={r.id}>
                      <td className={td}>
                        <span className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => removeRow("addresses", r.id)}
                            disabled={form.addresses.length === 1}
                            aria-label={`Remove row ${i + 1}`}
                            className="text-slate-400 hover:text-red-500 disabled:opacity-40"
                          >
                            <XCircle size={15} />
                          </button>
                          {i + 1}
                        </span>
                      </td>
                      <td className={td}>
                        <select
                          aria-label="State"
                          value={r.state}
                          onChange={(e) =>
                            updateRow("addresses", r.id, {
                              state: e.target.value,
                              businessPlace: "",
                            })
                          }
                          className={`${inputClass} ${errCls(errors[`a_${r.id}_state`])}`}
                        >
                          <option value="">Select</option>
                          {STATES.map((s) => (
                            <option key={s.code}>{s.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className={td}>
                        <select
                          aria-label="Business Place"
                          value={r.businessPlace}
                          disabled={!r.state}
                          onChange={(e) =>
                            updateRow("addresses", r.id, {
                              businessPlace: e.target.value,
                              cityName: r.cityName || e.target.value,
                            })
                          }
                          className={`${inputClass} ${errCls(errors[`a_${r.id}_businessPlace`])}`}
                        >
                          <option value="">Select</option>
                          {(BUSINESS_PLACES[r.state] || []).map((p) => (
                            <option key={p}>{p}</option>
                          ))}
                        </select>
                      </td>
                      <td className={td}>
                        {rowInput("addresses", r, "cityName", {
                          transform: cleanText,
                        })}
                      </td>
                      <td className={td}>
                        {rowInput("addresses", r, "address1", {
                          transform: cleanText,
                        })}
                      </td>
                      <td className={td}>
                        {rowInput("addresses", r, "address2", {
                          transform: cleanText,
                        })}
                      </td>
                      <td className={td}>
                        {rowInput("addresses", r, "contactPerson", {
                          transform: cleanText,
                        })}
                      </td>
                      <td className={td}>
                        {rowInput("addresses", r, "phone", {
                          transform: digits,
                          maxLength: 10,
                          inputMode: "numeric",
                        })}
                      </td>
                      <td className={td}>
                        {rowInput("addresses", r, "email")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Footer actions */}
        <div className="sticky bottom-0 z-20 -mx-3 mt-2 flex flex-wrap items-center gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2 sm:-mx-4 sm:px-4 lg:-mx-5 lg:px-5 dark:border-gray-800 dark:bg-gray-900">
          <button type="button" onClick={handleSave} className={btnPrimary}>
            <Save size={12} />
            {isNew ? "Save" : "Update"}
          </button>
          <button type="button" onClick={onBack} className={btnOutline}>
            <X size={12} />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default GstInForm;
