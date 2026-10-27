import React, { useState, useEffect } from "react";
import { Save, X, List, Upload, Download, Grid } from "lucide-react";
import { useToast } from "../../Toast/ToastContext";
import { documentMappingAPI } from "../../../api/docmappingAPI";

const DocumentMappingForm = ({ editData, onBack, onSaveSuccess, orgId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recordLoading, setRecordLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { addToast } = useToast();

  const loginUserName = localStorage.getItem("userName") || "SYSTEM";

  // Data states
  const [branchList, setBranchList] = useState([]);
  const [finYearList, setFinYearList] = useState([]);
  const [mappingTableData, setMappingTableData] = useState([]);

  // Form data
  const [form, setForm] = useState({
    id: editData?.id || 0,
    branch: "",
    finYear: "",
    active: true,
    orgId: orgId,
    createdBy: loginUserName,
  });

  // Error states
  const [fieldErrors, setFieldErrors] = useState({});

  // -------------------------------------------------------------
  // Initial dropdown data
  // -------------------------------------------------------------
  useEffect(() => {
    fetchInitialData();
  }, []);

  // -------------------------------------------------------------
  // When editing, fetch full record by id
  // -------------------------------------------------------------
  useEffect(() => {
    if (!editData?.id) {
      setIsEditMode(false);
      return;
    }
    setIsEditMode(true);
    fetchMappingById(editData.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [branchesRes, finYearsRes] = await Promise.all([
        documentMappingAPI.getAllBranches(orgId),
        documentMappingAPI.getAllFinYears(orgId),
      ]);

      const branchesBody = branchesRes?.data ?? branchesRes;
      const finYearsBody = finYearsRes?.data ?? finYearsRes;

      if (branchesBody?.status) {
        const branches =
          branchesBody.paramObjectsMap?.branchVO ||
          branchesBody.paramObjectsMap?.branchVOs ||
          branchesBody.paramObjectsMap?.branchVo ||
          [];
        setBranchList(branches);
      }

      if (finYearsBody?.status) {
        const years =
          finYearsBody.paramObjectsMap?.financialYearVOs ||
          finYearsBody.paramObjectsMap?.financialYearVO ||
          [];
        setFinYearList(years);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      addToast("Failed to load initial data", "error");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // ✅ Load full record by id (new master endpoint)
  // -------------------------------------------------------------
  const fetchMappingById = async (id) => {
    try {
      setRecordLoading(true);
      const response = await documentMappingAPI.getDocumentTypeMappingById(id);
      const body = response?.data ?? response;

      const record =
        body?.paramObjectsMap?.documentTypeMappingResponseVO ||
        body?.paramObjectsMap?.documentTypeMappingVO;

      if (!record) {
        addToast("Could not load mapping details", "error");
        return;
      }

      // fallback if branchList/finYearList haven't loaded yet
      const branchName =
        record?.branch?.branchName ??
        record?.branch ??
        editData?.branch ??
        "";
      const finYearName =
        record?.financialYear?.finYear != null
          ? String(record.financialYear.finYear)
          : record?.finYear ??
          editData?.finYear ??
          "";

      setForm({
        id: record.id || id,
        branch: branchName,
        finYear: finYearName,
        active:
          record.active === "Active" ||
          record.active === true ||
          record.active === 1,
        orgId: record.orgId ?? orgId,
        createdBy: record.createdBy ?? loginUserName,
      });

      const rows =
        record.documentTypeMappingDetails ||
        record.documentTypeMappingDetailsVO ||
        record.details ||
        [];

      setMappingTableData(
        rows.map((item) => ({
          id: item.id,
          screenName: item.screenName,
          screenCode: item.screenCode,
          docCode: item.docCode,
          prefix: item.prefix ?? "",
          prefixField: item.prefix ?? "",
          lastNo: item.lastNo,
          concatenation: item.concatenation,
        }))
      );
    } catch (error) {
      console.error("Error fetching mapping by id:", error);
      addToast("Failed to load mapping details", "error");

      // Fall back to whatever the list row gave us
      if (editData) {
        setForm({
          id: editData.id || 0,
          branch: editData.branch || "",
          finYear: editData.finYear || "",
          active: editData.active === true || editData.active === "Active",
          orgId: orgId,
          createdBy: loginUserName,
        });
        const fallbackRows =
          editData.details ||
          editData.documentTypeMappingDetails ||
          editData.documentTypeMappingDetailsVO ||
          [];
        setMappingTableData(
          fallbackRows.map((item) => ({
            id: item.id,
            screenName: item.screenName,
            screenCode: item.screenCode,
            docCode: item.docCode,
            prefix: item.prefix ?? "",
            prefixField: item.prefix ?? "",
          }))
        );
      }
    } finally {
      setRecordLoading(false);
    }
  };

  // Legacy alias — kept because you had it before, now just delegates
  const loadEditData = () => {
    if (editData?.id) fetchMappingById(editData.id);
  };

  // -------------------------------------------------------------
  // Bulk upload
  // -------------------------------------------------------------
  const handleBulkUploadOpen = () => setUploadOpen(true);
  const handleBulkUploadClose = () => setUploadOpen(false);

  const handleFileUpload = (file) => {
    console.log("File to upload:", file);
  };

  const handleSubmitUpload = () => {
    handleBulkUploadClose();
    addToast("Document type mappings uploaded successfully!", "success");
  };

  const handleDownloadSample = () => {
    try {
      addToast("Sample file downloaded successfully!", "success");
    } catch (error) {
      console.error("Error downloading sample file:", error);
      addToast("Failed to download sample file", "error");
    }
  };

  // -------------------------------------------------------------
  // Field-name helpers
  // -------------------------------------------------------------
  const normalizeValue = (value) => String(value ?? "").trim().toUpperCase();

  const getBranchName = (branch) =>
    branch?.branch ?? branch?.branchName ?? branch?.name ?? "";

  const getFinYearName = (year) =>
    year?.finYear ??
    year?.financialYear ??
    year?.finYearName ??
    year?.financialYearName ??
    year?.yearName ??
    "";

  const findSelectedBranch = (value) =>
    branchList.find(
      (branch) =>
        normalizeValue(getBranchName(branch)) === normalizeValue(value) ||
        normalizeValue(branch.branchCode) === normalizeValue(value)
    );

  const findSelectedFinYear = (value) =>
    finYearList.find(
      (year) =>
        normalizeValue(getFinYearName(year)) === normalizeValue(value) ||
        normalizeValue(year.finYearIdentifier) === normalizeValue(value)
    );

  // -------------------------------------------------------------
  // Pending mappings
  // -------------------------------------------------------------
  const fetchPendingMappingsFor = async (branchObj, finYearObj) => {
    if (!branchObj || !finYearObj) {
      addToast(
        "Could not resolve branch/financial year. Check console logs.",
        "error"
      );
      return;
    }

    try {
      setTableLoading(true);
      const requestPayload = {
        branch: getBranchName(branchObj),
        branchCode: branchObj.branchCode,
        finYear: getFinYearName(finYearObj),
        finYearIdentifier: getFinYearName(finYearObj),
        orgId,
      };

      const response = await documentMappingAPI.getPendingMappings(requestPayload);
      const body = response?.data ?? response;

      if (body?.status) {
        const rows =
          body.paramObjectsMap?.documentTypeMappingVO ||
          body.paramObjectsMap?.documentTypeMappingResponseVO ||
          [];
        setMappingTableData(
          (Array.isArray(rows) ? rows : []).map((r) => ({
            ...r,
            prefix: r.prefix ?? r.prefixField ?? "",
            prefixField: r.prefix ?? r.prefixField ?? "",
          }))
        );
        addToast("Pending mappings loaded successfully", "success");
      } else {
        addToast(
          body?.paramObjectsMap?.message || "No pending mappings found",
          "info"
        );
        setMappingTableData([]);
      }
    } catch (error) {
      console.error("Error fetching pending mappings:", error);
      addToast(
        error?.response?.data?.paramObjectsMap?.message ||
        error?.response?.data?.message ||
        "Failed to load pending mappings",
        "error"
      );
      setMappingTableData([]);
    } finally {
      setTableLoading(false);
    }
  };

  const handleFormChange = (name, value) => {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    const newFormData = { ...form, [name]: value };
    setForm(newFormData);

    if (
      (name === "branch" || name === "finYear") &&
      newFormData.branch &&
      newFormData.finYear &&
      !isEditMode
    ) {
      const branchObj = findSelectedBranch(newFormData.branch);
      const finYearObj = findSelectedFinYear(newFormData.finYear);

      if (branchObj && finYearObj) {
        fetchPendingMappingsFor(branchObj, finYearObj);
      } else {
        addToast(
          "Unable to find the selected branch or financial year in the API response.",
          "error"
        );
      }
    }
  };

  const handleFillGrid = () => {
    if (isEditMode) {
      addToast("Cannot fill grid in edit mode", "warning");
      return;
    }
    if (!form.branch || !form.finYear) {
      addToast("Please select Branch and Financial Year first", "error");
      return;
    }
    const branchObj = findSelectedBranch(form.branch);
    const finYearObj = findSelectedFinYear(form.finYear);
    if (!branchObj || !finYearObj) {
      addToast("Could not resolve branch/financial year. Check console.", "error");
      return;
    }
    fetchPendingMappingsFor(branchObj, finYearObj);
  };

  const validateForm = () => {
    const errors = {};
    if (!form.branch) errors.branch = "Branch is required";
    if (!form.finYear) errors.finYear = "Financial year is required";
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      addToast(errors[Object.keys(errors)[0]], "error");
      return false;
    }
    if (mappingTableData.length === 0) {
      addToast("No mapping data available. Please fill the grid first.", "error");
      return false;
    }
    return true;
  };

  // -------------------------------------------------------------
  // Save
  // -------------------------------------------------------------
  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const branchObj = findSelectedBranch(form.branch);
      const finYearObj = findSelectedFinYear(form.finYear);

      if (!branchObj || !finYearObj) {
        addToast(
          "Unable to resolve the selected branch or financial year. Check console.",
          "error"
        );
        return;
      }

      const branchName = getBranchName(branchObj);
      const branchCode = branchObj.branchCode ?? "";
      const branchId =
        branchObj.id ?? branchObj.branchId ?? branchObj.branchMasterId ?? 0;

      const finYearName = getFinYearName(finYearObj);
      const finYearIdentifier =
        finYearObj.finYearIdentifier ?? finYearObj.finYear ?? finYearName;
      const financialYearId =
        finYearObj.id ?? finYearObj.financialYearId ?? finYearObj.finYearId ?? 0;

      const isUpdate = Boolean(form.id && form.id > 0);

      const payload = {
        active: true,
        branch: Number(branchId) || 0,
        branchCode: String(branchCode || ""),
        createdBy: loginUserName,
        description: "",
        details: mappingTableData.map((item) => {
          const row = {
            active: true,
            branch: branchName,
            branchCode: String(branchCode || ""),
            docCode: item.docCode || "",
            finYear: finYearName,
            finYearIdentifier: String(finYearIdentifier || ""),
            prefix: item.prefix ?? item.prefixField ?? "",
            screenCode: item.screenCode || "",
            screenName: item.screenName || "",
          };
          if (item.id) row.id = item.id;
          return row;
        }),
        finYear: finYearName,
        finYearIdentifier: String(finYearIdentifier || ""),
        financialYear: Number(financialYearId) || 0,
        orgId: Number(orgId) || 0,
      };

      if (isUpdate) payload.id = form.id;

      const response = await documentMappingAPI.saveDocumentTypeMappingMaster(
        payload
      );
      const body = response?.data ?? response;

      const status = body?.status === true || body?.statusFlag === "Ok";

      if (status) {
        const successMessage =
          body?.paramObjectsMap?.message ||
          (isUpdate
            ? "Document type mapping updated successfully!"
            : "Document type mapping created successfully!");
        addToast(successMessage, "success");
        onSaveSuccess && onSaveSuccess();
      } else {
        addToast(
          body?.paramObjectsMap?.errorMessage ||
          body?.paramObjectsMap?.message ||
          body?.message ||
          "Failed to save document type mapping",
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

  const handleClear = () => {
    setForm({
      id: 0,
      branch: "",
      finYear: "",
      active: true,
      orgId: orgId,
      createdBy: loginUserName,
    });
    setMappingTableData([]);
    setFieldErrors({});
    setIsEditMode(false);
  };

  if (loading || recordLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-900 dark:text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <List className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditMode
                ? "Edit Document Type Mapping"
                : "Create Document Type Mapping"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Map document types to branches and financial years
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
        >
          <List className="h-4 w-4" />
          List View
        </button>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-3 w-3" />
          {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"}
        </button>

        <button
          onClick={handleClear}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors"
        >
          <X className="h-3 w-3" />
          Clear
        </button>

        {!isEditMode && (
          <>
            <button
              onClick={handleBulkUploadOpen}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
            >
              <Upload className="h-3 w-3" />
              Bulk Upload
            </button>

            <button
              onClick={handleDownloadSample}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
            >
              <Download className="h-3 w-3" />
              Download Sample
            </button>
          </>
        )}
      </div>

      {/* MAIN FORM */}
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Branch */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              Branch *
            </label>
            <select
              value={form.branch}
              onChange={(e) => handleFormChange("branch", e.target.value)}
              disabled={isEditMode}
              className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border ${fieldErrors.branch
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
                } rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isEditMode ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
              <option value="" className="text-gray-500 dark:text-gray-400">
                Select Branch
              </option>
              {branchList.map((branch, index) => (
                <option
                  key={branch.id ?? branch.branchCode ?? index}
                  value={getBranchName(branch)}
                >
                  {getBranchName(branch)}
                </option>
              ))}
            </select>
            {fieldErrors.branch && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {fieldErrors.branch}
              </p>
            )}
            {branchList.length === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                No branches loaded — check console for API response.
              </p>
            )}
          </div>

          {/* Financial Year */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              Financial Year *
            </label>
            <select
              value={form.finYear}
              onChange={(e) => handleFormChange("finYear", e.target.value)}
              disabled={isEditMode}
              className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border ${fieldErrors.finYear
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
                } rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isEditMode ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
              <option value="" className="text-gray-500 dark:text-gray-400">
                Select Financial Year
              </option>
              {finYearList.map((year, index) => (
                <option
                  key={year.finYearIdentifier ?? year.id ?? index}
                  value={getFinYearName(year)}
                >
                  {getFinYearName(year)}
                </option>
              ))}
            </select>
            {fieldErrors.finYear && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {fieldErrors.finYear}
              </p>
            )}
            {finYearList.length === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                No financial years loaded — check console for API response.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* MAPPING TABLE */}
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Mapping Details
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage document type mappings
            </p>
          </div>
          <button
            onClick={handleFillGrid}
            disabled={tableLoading || isEditMode}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Grid className="h-3 w-3" />
            {tableLoading ? "Loading..." : "Fill Grid"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-xs">
                <th className="p-3 text-left font-medium">Screen Name</th>
                <th className="p-3 text-left font-medium">Screen Code</th>
                <th className="p-3 text-left font-medium">Document Code</th>
              </tr>
            </thead>
            <tbody>
              {mappingTableData.length > 0 ? (
                mappingTableData.map((row, index) => (
                  <tr
                    key={row.id || index}
                    className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-750 transition"
                  >
                    <td className="p-3">{row.screenName || "-"}</td>
                    <td className="p-3">{row.screenCode || "-"}</td>
                    <td className="p-3">{row.docCode || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="p-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {form.branch && form.finYear
                      ? "No mapping data available. Click 'Fill Grid' to load data."
                      : "Select branch and financial year first"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentMappingForm;