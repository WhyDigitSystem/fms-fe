import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Save,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  PARTY_TYPES,
  cleanEntityName,
  effectiveStatus,
  emptyParty,
  fmtDate,
  screenParty,
  screeningDots,
  screeningSignature,
  screeningStyles,
  todayIso,
} from "./GstData";
import {
  Field,
  Notice,
  SectionHeader,
  btnOutline,
  btnPrimary,
  cardClass,
  errCls,
  inputClass,
} from "./GstShared";

/**
 * i Ticket > Party Screening
 *
 * Flow: enter Entity Name (CAPITAL LETTERS) -> Alternative Names / ID / Include Alias
 * default to the entity name -> click KYC Validation -> Screening Status becomes
 * Approved / Review / Rejected. Editing any screened value afterwards resets the
 * status to Pending, so the party must be validated again before it can be used for
 * GST approval.
 */
const PartyScreeningForm = ({ record, onSave, onBack }) => {
  const isNew = !record;
  const [form, setForm] = useState(() =>
    record ? { ...record } : emptyParty(),
  );
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [checking, setChecking] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(t);
  }, [notice]);

  const status = effectiveStatus(form);
  const stale =
    form.screenedSig && form.screenedSig !== screeningSignature(form);
  const locked = !isNew && form.status === "Approved" && !stale; // party type stays fixed once screened

  // Alternative Names, ID and Include Alias follow the entity name until the user edits them.
  const setEntityName = (raw) => {
    const next = cleanEntityName(raw);
    setForm((p) => {
      const follow = (v) => (v === "" || v === p.entityName ? next : v);
      return {
        ...p,
        entityName: next,
        altNames: follow(p.altNames),
        refId: follow(p.refId),
        includeAlias: follow(p.includeAlias),
      };
    });
    setErrors((p) => ({ ...p, entityName: undefined }));
  };

  const setField = (field, value) => {
    setForm((p) => ({ ...p, [field]: cleanEntityName(value) }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.entityName.trim()) e.entityName = "Entity name is required";
    if (!form.altNames.trim())
      e.altNames = "Alternative entity name is required";
    setErrors(e);
    if (Object.keys(e).length) {
      setNotice({ type: "error", text: Object.values(e).join(" • ") });
      return false;
    }
    return true;
  };

  const runKyc = () => {
    if (!validate()) return;
    setChecking(true);
    // Dummy screening - replace with your KYC / sanctions-list API call.
    timer.current = setTimeout(() => {
      const trimmed = {
        entityName: form.entityName.trim(),
        altNames: form.altNames.trim(),
        refId: form.refId.trim(),
        includeAlias: form.includeAlias.trim(),
      };
      const result = screenParty(trimmed);
      const next = {
        ...form,
        ...trimmed,
        status: result.status,
        matches: result.matches,
        screenedOn: fmtDate(todayIso()),
      };
      next.screenedSig = screeningSignature(next);
      setForm(next);
      setChecking(false);
      setNotice(
        result.status === "Approved"
          ? {
              type: "success",
              text: "KYC validation passed. No watch-list match found.",
            }
          : {
              type: "error",
              text:
                result.status === "Rejected"
                  ? "KYC validation failed. The party matches a sanctions watch-list entry."
                  : "Possible watch-list match. Manual review is required before this party can be approved.",
            },
      );
    }, 900);
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave?.({
      ...form,
      entityName: form.entityName.trim(),
      altNames: form.altNames.trim(),
      status: effectiveStatus(form),
    });
  };

  const StatusIcon = status === "Approved" ? ShieldCheck : ShieldAlert;

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
                {isNew ? "New Party Screening" : "Party Screening"}
              </h1>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                i Ticket
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">
              Screen the party against sanctions lists before creating its GST
              and account details.
            </p>
          </div>
        </div>

        <Notice notice={notice} onClose={() => setNotice(null)} />

        <div className="grid grid-cols-1 items-start gap-2 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          {/* Party details */}
          <section className={`${cardClass} overflow-hidden`}>
            <SectionHeader icon={ScanSearch} title="Party Details" />
            <div className="px-3 py-2">
              <Field label="Party Type" required>
                <select
                  aria-label="Party Type"
                  value={form.partyType}
                  disabled={locked}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, partyType: e.target.value }))
                  }
                  className={inputClass}
                >
                  {PARTY_TYPES.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </Field>
              <Field label="Entity Name" required error={errors.entityName}>
                <input
                  aria-label="Entity Name"
                  value={form.entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  onBlur={() =>
                    setForm((p) => ({ ...p, entityName: p.entityName.trim() }))
                  }
                  className={`${inputClass} ${errCls(errors.entityName)}`}
                />
              </Field>
              <p className="ml-[132px] pb-1 text-[10px] font-semibold text-red-700 dark:text-red-400">
                Entity name should always be in CAPITAL LETTERS. Do not enter
                special characters or double spaces.
              </p>
              <Field
                label="Alternative Entity Names"
                required
                error={errors.altNames}
              >
                <input
                  aria-label="Alternative Entity Names"
                  value={form.altNames}
                  onChange={(e) => setField("altNames", e.target.value)}
                  className={`${inputClass} ${errCls(errors.altNames)}`}
                />
              </Field>
              <Field label="ID">
                <input
                  aria-label="ID"
                  value={form.refId}
                  onChange={(e) => setField("refId", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Include Alias">
                <input
                  aria-label="Include Alias"
                  value={form.includeAlias}
                  onChange={(e) => setField("includeAlias", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          {/* KYC */}
          <section className={`${cardClass} overflow-hidden`}>
            <SectionHeader icon={ShieldCheck} title="KYC Validation" />
            <div className="space-y-3 px-3 py-3">
              <button
                type="button"
                onClick={runKyc}
                disabled={checking || !form.entityName.trim()}
                className={`${btnPrimary} w-full`}
              >
                {checking ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <ScanSearch size={13} />
                )}
                {checking ? "Validating..." : "KYC Validation"}
              </button>

              <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 dark:border-gray-700">
                <span className="text-[11px] font-semibold text-red-700 dark:text-red-400">
                  Screening Status
                </span>
                <span className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${screeningStyles[status]}`}
                  >
                    <StatusIcon size={12} />
                    {status}
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${screeningDots[status]}`}
                    />
                  </span>
                  <span className="rounded-md border border-slate-300 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold capitalize text-slate-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
                    {form.partyType.toLowerCase()}
                  </span>
                </span>
              </div>

              {stale && (
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  Party details changed after the last screening. Run KYC
                  Validation again.
                </p>
              )}
              {form.screenedOn && !stale && (
                <p className="text-[10px] text-slate-500 dark:text-gray-400">
                  Last screened on {form.screenedOn}
                </p>
              )}

              {!stale && form.matches?.length > 0 && (
                <div className="overflow-hidden rounded-md border border-slate-200 dark:border-gray-700">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-gray-900/60 dark:text-gray-400">
                        <th className="px-2 py-1.5 font-semibold">
                          Screened name
                        </th>
                        <th className="px-2 py-1.5 font-semibold">
                          Watch-list entry
                        </th>
                        <th className="px-2 py-1.5 font-semibold">List</th>
                        <th className="px-2 py-1.5 font-semibold">Match</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-gray-700/50">
                      {form.matches.map((m, i) => (
                        <tr key={i}>
                          <td className="px-2 py-1.5">{m.candidate}</td>
                          <td className="px-2 py-1.5 font-medium">{m.watch}</td>
                          <td className="px-2 py-1.5">{m.list}</td>
                          <td className="px-2 py-1.5">{m.level}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 z-20 -mx-3 mt-2 flex flex-wrap items-center gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2 sm:-mx-4 sm:px-4 lg:-mx-5 lg:px-5 dark:border-gray-800 dark:bg-gray-900">
          <button
            type="button"
            onClick={handleSave}
            disabled={checking}
            className={btnPrimary}
          >
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

export default PartyScreeningForm;
