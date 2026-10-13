import React, { useState, useEffect, useRef } from "react";
import {
  Save,
  X,
  Plus,
  Trash2,
  Building2,
  Users,
  FileText,
  ChevronDown,
} from "lucide-react";
import { docTypeAPI } from "../../../api/doctypeAPI";
import { useToast } from "../../Toast/ToastContext";

// Normalizes "active" coming from the API, which may arrive as a boolean,
// a "Active"/"Inactive" string, or 1/0.
const normalizeActive = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return value.toLowerCase() === "active";
  return true; // default for "new" records
};

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

const DocTypeManager = () => {
  const ORG_ID = parseInt(localStorage.getItem("orgId")) || 1000000001;
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";
  const { addToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data states
  const [screenList, setScreenList] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [docTypeList, setDocTypeList] = useState([]);

  const nextRowId = useRef(1);

  const [form, setForm] = useState(emptyForm(ORG_ID, loginUserName));
  const [clientTableData, setClientTableData] = useState([
    { id: nextRowId.current++, clientCode: "", client: "" },
  ]);

  const [fieldErrors, setFieldErrors] = useState({});
  const [clientTableErrors, setClientTableErrors] = useState([{}]);

  const fieldLabels = {
    screenCode: "Screen Code",
    docCode: "Document Code",
    desc: "Description",
  };

  useEffect(() => {
    fetchInitialData();
    fetchDocTypeList();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [screensRes, clientsRes] = await Promise.all([
        docTypeAPI.getAllScreens(),
        docTypeAPI.getAllClients(ORG_ID),
      ]);

      if (screensRes?.status) {
        const sortedScreens = (
          screensRes.paramObjectsMap.screenNamesVO || []
        ).sort((a, b) => a.screenName.localeCompare(b.screenName));
        setScreenList(sortedScreens);
      }

      if (clientsRes?.status) {
        const sortedClients = (
          clientsRes.paramObjectsMap.CustomerVO || []
        ).sort((a, b) => a.clientCode.localeCompare(b.clientCode));
        setClientList(sortedClients);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      addToast("Failed to load initial data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Still fetched (silently) so duplicate-docCode validation on save
  // continues to work now that the visible list panel is gone.
  const fetchDocTypeList = async () => {
    try {
      const res = await docTypeAPI.getAllDocumentTypes(ORG_ID);
      if (res?.status) {
        const list =
          res.paramObjectsMap?.documentTypeVO ||
          res.paramObjectsMap?.DocumentTypeVO ||
          [];
        setDocTypeList(list);
      }
    } catch (error) {
      console.error("Error fetching document type list:", error);
    }
  };

  const resetForm = () => {
    setForm(emptyForm(ORG_ID, loginUserName));
    setClientTableData([{ id: nextRowId.current++, clientCode: "", client: "" }]);
    setClientTableErrors([{}]);
    setFieldErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "active") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    const codeRegex = /^[A-Za-z0-9_-]*$/;
    let errorMessage = "";

    switch (name) {
      case "docCode":
        if (!codeRegex.test(value)) {
          errorMessage =
            "Only alphanumeric characters, hyphens and underscores allowed";
        } else if (value.length > 20) {
          errorMessage = "Document Code must be maximum 20 characters";
        }
        break;
      case "desc":
        if (value.length > 200) {
          errorMessage = "Description must be maximum 200 characters";
        }
        break;
      default:
        break;
    }

    if (errorMessage) {
      setFieldErrors((prev) => ({ ...prev, [name]: errorMessage }));
    } else {
      const updatedValue = name === "docCode" ? value.toUpperCase() : value;
      setForm((prev) => ({ ...prev, [name]: updatedValue }));
    }
  };

  // Plain native <select> onChange — always e.target.value, no ambiguity.
  // This is the auto-fill: pick a screen code, screen name fills itself in.
  const handleScreenCodeChange = (e) => {
    const value = e.target.value;

    if (fieldErrors.screenCode) {
      setFieldErrors((prev) => ({ ...prev, screenCode: "" }));
    }

    const selectedScreen = screenList.find(
      (screen) => screen.screenCode === value
    );
    setForm((prev) => ({
      ...prev,
      screenCode: value,
      screenName: selectedScreen ? selectedScreen.screenName : "",
    }));
  };

  const handleClientTableChange = (index, field, value) => {
    const newData = [...clientTableData];
    newData[index] = { ...newData[index], [field]: value };

    if (field === "clientCode") {
      const selectedClient = clientList.find(
        (client) => client.clientCode === value
      );
      newData[index].client = selectedClient ? selectedClient.client || "" : "";
    }

    setClientTableData(newData);

    if (value && clientTableErrors[index]?.[field]) {
      const newErrors = [...clientTableErrors];
      newErrors[index] = { ...newErrors[index], [field]: "" };
      setClientTableErrors(newErrors);
    }
  };

  const addClientRow = () => {
    setClientTableData((prev) => [
      ...prev,
      { id: nextRowId.current++, clientCode: "", client: "" },
    ]);
    setClientTableErrors((prev) => [...prev, {}]);
  };

  const removeClientRow = (index) => {
    if (clientTableData.length === 1) return;
    setClientTableData((prev) => prev.filter((_, i) => i !== index));
    setClientTableErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const errors = {};

    if (!form.screenCode.trim())
      errors.screenCode = "Screen Code is required";

    if (!form.docCode.trim())
      errors.docCode = "Document Code is required";

    if (!form.desc.trim())
      errors.desc = "Description is required";

    if (form.docCode.trim().length > 20)
      errors.docCode = "Document Code must be maximum 20 characters";

    if (form.desc.trim().length > 200)
      errors.desc = "Description must be maximum 200 characters";

    const tableErrors = clientTableData.map((row) => {
      const rowErrors = {};

      if (!row.clientCode)
        rowErrors.clientCode = "Client code is required";

      return rowErrors;
    });

    setFieldErrors(errors);
    setClientTableErrors(tableErrors);

    const hasTableErrors = tableErrors.some(
      (e) => e.clientCode || e.client
    );

    if (Object.keys(errors).length > 0 || hasTableErrors) {
      const allErrors = { ...errors };

      let firstError = Object.keys(allErrors)[0];

      if (!firstError && hasTableErrors) {
        firstError = "clientTable";
        allErrors[firstError] = "Please fill all client details";
      }

      if (firstError) {
        const fieldLabel = fieldLabels[firstError] || firstError;
        addToast(`${fieldLabel}: ${allErrors[firstError]}`, "error");
      }

      return;
    }

    // -----------------------------
    // Duplicate Document Code Check
    // -----------------------------
    const duplicateDoc = docTypeList.find(
      (d) =>
        d.docCode?.trim().toUpperCase() ===
          form.docCode.trim().toUpperCase() &&
        d.id !== form.id
    );

    if (duplicateDoc) {
      addToast("Document Code already exists.", "error");
      return;
    }

    // -----------------------------
    // Duplicate Client Check
    // -----------------------------
    const clientCodes = clientTableData.map((row) =>
      row.clientCode.trim().toUpperCase()
    );

    if (new Set(clientCodes).size !== clientCodes.length) {
      addToast("Duplicate clients are not allowed.", "error");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      screenCode: form.screenCode.trim(),
      screenName: form.screenName.trim(),
      docCode: form.docCode.trim(),
      description: form.desc.trim(),
      documentTypeDetailsDTO: clientTableData.map((row) => ({
        clientCode: row.clientCode.trim(),
        client: row.client.trim(),
      })),
      active: form.active,
      orgId: ORG_ID,
      createdBy: loginUserName,
    };

    try {
      const response = await docTypeAPI.saveDocumentType(payload);

      const status =
        response?.data?.status === true ||
        response?.data?.statusFlag === "Ok";

      if (status) {
        const successMessage =
          response?.data?.paramObjectsMap?.message ||
          (form.id
            ? "Document type updated successfully!"
            : "Document type created successfully!");

        addToast(successMessage, "success");

        resetForm();

        await fetchDocTypeList();
      } else {
        const errorMessage =
          response?.data?.paramObjectsMap?.message ||
          response?.data?.paramObjectsMap?.errorMessage ||
          response?.data?.message ||
          "Failed to save document type";

        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Save Error:", error);

      const errorMessage =
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.message ||
        "Save failed! Try again.";

      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clientOptions = clientList.map((client) => ({
    value: client.clientCode,
    label: `${client.clientCode} - ${client.client}`,
  }));

  if (loading) {
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
          Document Types
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Create or edit a document type and link it to clients
        </p>
      </div>

      {/* ============ FORM ============ */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        {/* GENERAL INFO */}
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
            {/* Screen Code / Screen Name / Document Code — one row on laptop+ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Screen Code — native select, drives the auto-fill */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Screen Code *
                </label>
                <div className="relative">
                  <select
                    name="screenCode"
                    value={form.screenCode}
                    onChange={handleScreenCodeChange}
                    className={`w-full appearance-none px-3 py-2.5 pr-8 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors ${
                      fieldErrors.screenCode
                        ? "border-red-400"
                        : "border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    <option value="">Select screen code</option>
                    {screenList.map((screen) => (
                      <option key={screen.screenCode} value={screen.screenCode}>
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

              {/* Screen Name — auto-filled, read only */}
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

              {/* Document Code */}
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
                  className={`w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors ${
                    fieldErrors.docCode
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

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description *
                </label>
                <span
                  className={`text-xs ${
                    form.desc.length > 200
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
                className={`w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 ${
                  fieldErrors.desc
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

            {/* Active toggle */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Status
              </label>
              <div className="flex items-center gap-3 h-[42px]">
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.active}
                  onClick={() =>
                    handleChange({
                      target: { name: "active", type: "checkbox", checked: !form.active },
                    })
                  }
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                    form.active ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      form.active ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {form.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CLIENT DETAILS */}
        {/* <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 p-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-900/30">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                  Client Details
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Link this document type to one or more clients
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={addClientRow}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Client
            </button>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-fixed">
                <colgroup>
                  <col className="w-[45%]" />
                  <col className="w-[45%]" />
                  <col className="w-[10%]" />
                </colgroup>
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                    <th className="p-3 text-left font-medium">Client Code *</th>
                    <th className="p-3 text-left font-medium">Client Name</th>
                    <th className="p-3 text-left font-medium">
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {clientTableData.map((row, index) => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                      <td className="p-3 align-top">
                        <div className="relative">
                          <select
                            value={row.clientCode}
                            onChange={(e) =>
                              handleClientTableChange(index, "clientCode", e.target.value)
                            }
                            className={`w-full appearance-none px-3 py-2 pr-8 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors ${
                              clientTableErrors[index]?.clientCode
                                ? "border-red-400"
                                : "border-gray-200 dark:border-gray-600"
                            }`}
                          >
                            <option value="">Select client code</option>
                            {clientOptions.map((client) => (
                              <option key={client.value} value={client.value}>
                                {client.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        </div>
                        {clientTableErrors[index]?.clientCode && (
                          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                            {clientTableErrors[index].clientCode}
                          </p>
                        )}
                      </td>
                      <td className="p-3 align-top">
                        <input
                          type="text"
                          value={row.client}
                          readOnly
                          placeholder="Auto-filled"
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-sm cursor-not-allowed placeholder:text-gray-400"
                        />
                        {clientTableErrors[index]?.client && (
                          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                            {clientTableErrors[index].client}
                          </p>
                        )}
                      </td>
                      <td className="p-3 align-top text-center">
                        {clientTableData.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeClientRow(index)}
                            aria-label="Remove client row"
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div> */}

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <FileText className="h-3.5 w-3.5" />
            <span>Fields marked with * are required</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={resetForm}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[92px]"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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

export default DocTypeManager;