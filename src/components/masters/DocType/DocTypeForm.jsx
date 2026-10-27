import React, { useState, useEffect } from "react";
import { Save, X, Building2, FileText, ChevronDown } from "lucide-react";
import { docTypeAPI } from "../../../api/doctypeAPI";
import { useToast } from "../../Toast/ToastContext";

const emptyForm = (ORG_ID, loginUserName) => ({
  id: 0,
  screenCode: "",
  screenName: "",
  docCode: "",
  desc: "",
  active: true,
  orgId: ORG_ID,
  createdBy: loginUserName,
});

// Normalise "active" from any of the shapes the APIs return:
// true / 1 / "Active"  → active
// false / 0 / "In-Active" / "Inactive" → inactive
const isActiveValue = (v) =>
  v === true || v === 1 || v === "Active" || v === "ACTIVE";

// Build form state from a record returned by either
// documentTypeMasterList, documentTypeMasterVO, or legacy list
const formFromRecord = (record, ORG_ID, loginUserName) => ({
  id: record?.id ?? 0,
  screenCode: record?.screenCode ?? "",
  screenName: record?.screenName ?? "",
  docCode: record?.docCode ?? "",
  desc: record?.description ?? record?.desc ?? "",
  active: isActiveValue(record?.active),
  orgId: record?.orgId ?? ORG_ID,
  createdBy: record?.createdBy ?? loginUserName,
});

const DocTypeForm = ({
  onBack,
  onSaveSuccess,
  editData,          // row from the list (may be partial)
  editId,            // optional explicit id
  orgId: ORG_ID_PROP,
}) => {
  const ORG_ID =
    ORG_ID_PROP != null
      ? parseInt(ORG_ID_PROP)
      : parseInt(localStorage.getItem("orgId")) || 1000000001;

  const loginUserName = localStorage.getItem("userName") || "SYSTEM";
  const { addToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingRecord, setLoadingRecord] = useState(false);

  const [screenList, setScreenList] = useState([]);
  const [docTypeList, setDocTypeList] = useState([]);

  // Resolve the id we should fetch (editId wins, then editData.id)
  const resolvedEditId =
    editId ?? (editData?.id != null ? editData.id : null);

  const [form, setForm] = useState(() =>
    editData && !resolvedEditId
      ? formFromRecord(editData, ORG_ID, loginUserName)
      : emptyForm(ORG_ID, loginUserName)
  );
  const [fieldErrors, setFieldErrors] = useState({});

  const fieldLabels = {
    screenCode: "Screen Code",
    docCode: "Document Code",
    desc: "Description",
  };

  // ------------------------------------------------------------
  // Load screens + dup-check list
  // ------------------------------------------------------------
  useEffect(() => {
    fetchScreens();
    fetchDocTypeList();
  }, []);

  // ------------------------------------------------------------
  // Load the record via getDocumentTypeMasterById when editing
  // ------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const loadRecord = async () => {
      if (!resolvedEditId) {
        setForm(emptyForm(ORG_ID, loginUserName));
        setFieldErrors({});
        return;
      }

      try {
        setLoadingRecord(true);
        const response = await docTypeAPI.getDocumentTypeMasterById(resolvedEditId);
        const body = response?.data ?? response;

        const record =
          body?.paramObjectsMap?.documentTypeMasterVO ||
          body?.paramObjectsMap?.documentTypeMasterVo;

        if (!cancelled && record) {
          setForm(formFromRecord(record, ORG_ID, loginUserName));
        }
      } catch (error) {
        console.error("Error fetching document type by id:", error);
        addToast("Failed to load document type details", "error");

        // Fall back to whatever the list gave us (so the form isn't empty)
        if (!cancelled && editData) {
          setForm(formFromRecord(editData, ORG_ID, loginUserName));
        }
      } finally {
        if (!cancelled) {
          setFieldErrors({});
          setLoadingRecord(false);
        }
      }
    };

    loadRecord();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedEditId]);

  // ------------------------------------------------------------
  // Data fetching
  // ------------------------------------------------------------
  const fetchScreens = async () => {
    try {
      setLoading(true);
      const res = await docTypeAPI.getAllScreens();
      const body = res?.data ?? res;

      const list =
        body?.paramObjectsMap?.screenNamesVO ||
        body?.paramObjectsMap?.screenNamesVo ||
        body?.paramObjectsMap?.ScreenNamesVO ||
        [];

      const sorted = [...list].sort((a, b) =>
        (a.screenName || "").localeCompare(b.screenName || "")
      );

      setScreenList(sorted);

      setForm((prev) => {
        if (prev.screenCode && !prev.screenName) {
          const match = sorted.find((s) => s.screenCode === prev.screenCode);
          if (match) return { ...prev, screenName: match.screenName };
        }
        return prev;
      });
    } catch (error) {
      console.error("Error fetching screens:", error);
      addToast("Failed to load screens", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocTypeList = async () => {
    try {
      const res = await docTypeAPI.getAllDocumentTypeMaster(ORG_ID);
      const body = res?.data ?? res;
      const rows =
        body?.paramObjectsMap?.documentTypeMasterList ||
        body?.paramObjectsMap?.documentTypeMasterVo ||
        [];
      setDocTypeList(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.error("Error fetching document type list:", error);
    }
  };

  // ------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------
  const resetForm = () => {
    setForm(emptyForm(ORG_ID, loginUserName));
    setFieldErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    const codeRegex = /^[A-Za-z0-9_-]*$/;
    let errorMessage = "";

    if (name === "docCode") {
      if (!codeRegex.test(value)) {
        errorMessage =
          "Only alphanumeric characters, hyphens and underscores allowed";
      } else if (value.length > 20) {
        errorMessage = "Document Code must be maximum 20 characters";
      }
    } else if (name === "desc") {
      if (value.length > 200) {
        errorMessage = "Description must be maximum 200 characters";
      }
    }

    if (errorMessage) {
      setFieldErrors((prev) => ({ ...prev, [name]: errorMessage }));
    } else {
      const updatedValue = name === "docCode" ? value.toUpperCase() : value;
      setForm((prev) => ({ ...prev, [name]: updatedValue }));
    }
  };

  const handleScreenCodeChange = (e) => {
    const value = e.target.value;

    if (fieldErrors.screenCode) {
      setFieldErrors((prev) => ({ ...prev, screenCode: "" }));
    }

    const selectedScreen = screenList.find((s) => s.screenCode === value);

    setForm((prev) => ({
      ...prev,
      screenCode: value,
      screenName: selectedScreen ? selectedScreen.screenName : "",
    }));
  };

  const toggleActive = () => {
    setForm((prev) => ({ ...prev, active: !prev.active }));
  };

  // ------------------------------------------------------------
  // Save
  // ------------------------------------------------------------
  const handleSave = async () => {
    const errors = {};

    if (!form.screenCode.trim()) errors.screenCode = "Screen Code is required";
    if (!form.docCode.trim()) errors.docCode = "Document Code is required";
    if (!form.desc.trim()) errors.desc = "Description is required";
    if (form.docCode.trim().length > 20)
      errors.docCode = "Document Code must be maximum 20 characters";
    if (form.desc.trim().length > 200)
      errors.desc = "Description must be maximum 200 characters";

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstError = Object.keys(errors)[0];
      const fieldLabel = fieldLabels[firstError] || firstError;
      addToast(`${fieldLabel}: ${errors[firstError]}`, "error");
      return;
    }

    // Duplicate check across the master list
    const duplicateDoc = docTypeList.find(
      (d) =>
        d.docCode?.trim().toUpperCase() === form.docCode.trim().toUpperCase() &&
        d.id !== form.id
    );
    if (duplicateDoc) {
      addToast("Document Code already exists.", "error");
      return;
    }

    setIsSubmitting(true);

    // ✅ Only send id when updating
    const isUpdate = Boolean(form.id && form.id > 0);

    const payload = {
      screenCode: form.screenCode.trim(),
      screenName: form.screenName.trim(),
      docCode: form.docCode.trim(),
      description: form.desc.trim(),
      orgId: ORG_ID,
      createdBy: loginUserName,
    };

    if (isUpdate) payload.id = form.id;

    try {
      const response = await docTypeAPI.saveDocumentTypeMaster(payload);
      const body = response?.data ?? response;

      const status = body?.status === true || body?.statusFlag === "Ok";

      if (status) {
        const successMessage =
          body?.paramObjectsMap?.message ||
          (isUpdate
            ? "Document type updated successfully!"
            : "Document type created successfully!");
        addToast(successMessage, "success");

        onSaveSuccess?.();
        onBack?.();
      } else {
        addToast(
          body?.paramObjectsMap?.message ||
          body?.paramObjectsMap?.errorMessage ||
          body?.message ||
          "Failed to save document type",
          "error"
        );
      }
    } catch (error) {
      console.error("Save Error:", error);
      addToast(
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.message ||
        "Save failed! Try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  if (loading || loadingRecord) {
    return (
      <div className="p-4 max-w-3xl mx-auto animate-pulse">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-6 h-96" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
          {form.id ? "Edit Document Type" : "Add Document Type"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {form.id
            ? "Update the document type details"
            : "Create a document type against a screen"}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
              <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
              {form.id ? "Edit Document Type" : "Add Document Type"}
            </h3>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Screen Code *
                </label>
                <div className="relative">
                  <select
                    name="screenCode"
                    value={form.screenCode}
                    onChange={handleScreenCodeChange}
                    className={`w-full appearance-none px-3 py-2.5 pr-8 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors ${fieldErrors.screenCode
                        ? "border-red-400"
                        : "border-gray-200 dark:border-gray-600"
                      }`}
                  >
                    <option value="">Select screen code</option>
                    {screenList.map((screen, idx) => (
                      <option
                        key={`${screen.screenCode}-${idx}`}
                        value={screen.screenCode}
                      >
                        {screen.screenCode} - {screen.screenName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                </div>
                {fieldErrors.screenCode && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                    {fieldErrors.screenCode}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Screen Name
                </label>
                <input
                  type="text"
                  value={form.screenName}
                  readOnly
                  placeholder="Auto-filled from screen code"
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-sm cursor-not-allowed placeholder:text-gray-400"
                />
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Document Code *
                </label>
                <input
                  type="text"
                  name="docCode"
                  value={form.docCode}
                  onChange={handleChange}
                  placeholder="e.g. INV-001"
                  className={`w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors ${fieldErrors.docCode
                      ? "border-red-400"
                      : "border-gray-200 dark:border-gray-600"
                    }`}
                />
                {fieldErrors.docCode && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                    {fieldErrors.docCode}
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description *
                </label>
                <span
                  className={`text-xs ${form.desc.length > 200
                      ? "text-red-500"
                      : "text-gray-400 dark:text-gray-500"
                    }`}
                >
                  {form.desc.length}/200
                </span>
              </div>
              <textarea
                name="desc"
                value={form.desc}
                onChange={handleChange}
                rows={3}
                maxLength={200}
                placeholder="Briefly describe this document type"
                className={`w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 ${fieldErrors.desc
                    ? "border-red-400"
                    : "border-gray-200 dark:border-gray-600"
                  }`}
              />
              {fieldErrors.desc && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                  {fieldErrors.desc}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <FileText className="h-3.5 w-3.5" />
            <span>Fields marked with * are required</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onBack ?? resetForm}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[92px]"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="h-3.5 w-3.5 animate-spin"
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  {form.id ? "Update" : "Save"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocTypeForm;