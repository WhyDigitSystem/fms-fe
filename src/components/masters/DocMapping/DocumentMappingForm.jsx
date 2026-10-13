import React, { useState, useEffect } from "react";
import { Save, X, List, Upload, Download, Grid } from "lucide-react";
import { useToast } from "../../Toast/ToastContext";
import { documentMappingAPI} from "../../../api/docmappingAPI";

const DocumentMappingForm = ({ editData, onBack, onSaveSuccess, orgId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);
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
    branch: editData?.branch || "",
    finYear: editData?.finYear || "",
    active: editData?.active === "Active" ? true : false,
    orgId: orgId,
    createdBy: loginUserName,
  });

  // Error states
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (editData) {
      loadEditData();
    }
  }, [editData]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [branchesRes, finYearsRes] = await Promise.all([
        documentMappingAPI.getAllBranches(orgId),
        documentMappingAPI.getAllFinYears(orgId)
      ]);

      if (branchesRes?.status) {
        setBranchList(branchesRes.paramObjectsMap.branchVO || []);
      }

      if (finYearsRes?.status) {
        setFinYearList(finYearsRes.paramObjectsMap.financialYearVOs || []);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      addToast("Failed to load initial data", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadEditData = () => {
    setIsEditMode(true);
    setForm({
      id: editData.id || 0,
      branch: editData.branch || "",
      finYear: editData.finYear || "",
      active: editData.active === "Active" ? true : false,
      orgId: orgId,
      createdBy: loginUserName,
    });

    if (editData.documentTypeMappingDetailsVO?.length > 0) {
      setMappingTableData(
        editData.documentTypeMappingDetailsVO.map((item) => ({
          id: item.id,
          screenName: item.screenName,
          screenCode: item.screenCode,
          client: item.client,
          clientCode: item.clientCode,
          docCode: item.docCode,
          prefixField: item.prefixField,
        }))
      );
    } else {
      setMappingTableData([]);
    }
  };

  // Bulk Upload Handlers
  const handleBulkUploadOpen = () => setUploadOpen(true);
  const handleBulkUploadClose = () => setUploadOpen(false);

  const handleFileUpload = (file) => {
    console.log("File to upload:", file);
  };

  const handleSubmitUpload = () => {
    console.log("Submit upload");
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

  const handleFormChange = (name, value) => {
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }

    const newFormData = { ...form, [name]: value };
    setForm(newFormData);

    // If both branch and finYear are selected, fetch pending mappings
    if (
      (name === "branch" || name === "finYear") &&
      newFormData.branch &&
      newFormData.finYear &&
      !isEditMode
    ) {
      handleFillGrid();
    }
  };

  const getPendingMappings = async () => {
    if (!form.branch || !form.finYear) {
      addToast("Please select both Branch and Financial Year", "error");
      return;
    }

    try {
      setTableLoading(true);
      const selectedBranch = branchList.find(b => b.branch === form.branch);
      const selectedFinYear = finYearList.find(f => f.finYear === form.finYear);

      if (!selectedBranch || !selectedFinYear) {
        addToast("Invalid branch or financial year selection", "error");
        return;
      }

      const response = await documentMappingAPI.getPendingMappings({
        branch: form.branch,
        branchCode: selectedBranch.branchCode,
        finYear: form.finYear,
        finYearIdentifier: selectedFinYear.finYearIdentifier,
        orgId: orgId,
      });

      if (response?.status) {
        setMappingTableData(response.paramObjectsMap.documentTypeMappingVO || []);
        addToast("Pending mappings loaded successfully", "success");
      } else {
        addToast("No pending mappings found", "info");
        setMappingTableData([]);
      }
    } catch (error) {
      console.error("Error fetching pending mappings:", error);
      addToast("Failed to load pending mappings", "error");
      setMappingTableData([]);
    } finally {
      setTableLoading(false);
    }
  };

  const handleFillGrid = () => {
    if (isEditMode) {
      addToast("Cannot fill grid in edit mode", "warning");
      return;
    }
    getPendingMappings();
  };

  const validateForm = () => {
    const errors = {};
    if (!form.branch) errors.branch = "Branch is required";
    if (!form.finYear) errors.finYear = "Financial year is required";
    
    if (mappingTableData.length === 0) {
      addToast("No mapping data available. Please fill the grid first.", "error");
      return false;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedBranch = branchList.find(b => b.branch === form.branch);
      const selectedFinYear = finYearList.find(f => f.finYear === form.finYear);

      if (!selectedBranch || !selectedFinYear) {
        addToast("Invalid branch or financial year selection", "error");
        return;
      }

      const payload = {
        ...(form.id && { id: form.id }),
        branch: form.branch,
        branchCode: selectedBranch.branchCode,
        finYear: form.finYear,
        finYearIdentifier: selectedFinYear.finYearIdentifier,
        documentTypeMappingDetailsDTO: mappingTableData.map(item => ({
          screenName: item.screenName,
          screenCode: item.screenCode,
          client: item.client,
          clientCode: item.clientCode,
          docCode: item.docCode,
          prefixField: item.prefixField,
        })),
        active: form.active,
        orgId: orgId,
        createdBy: loginUserName,
      };

      const response = await documentMappingAPI.saveDocumentTypeMapping(payload);

      if (response?.data?.status) {
        const successMessage = response?.data?.paramObjectsMap?.message || 
          (form.id ? "Document type mapping updated successfully!" : "Document type mapping created successfully!");
        
        addToast(successMessage, 'success');
        onSaveSuccess && onSaveSuccess();
      } else {
        const errorMessage = response?.data?.paramObjectsMap?.errorMessage ||
          response?.data?.message ||
          "Failed to save document type mapping";
        
        addToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error("Save Error:", error);
      const errorMessage = error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.message ||
        "Save failed! Try again.";
      
      addToast(errorMessage, 'error');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-900 dark:text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div 
      className="p-6 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen"
    >
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
              {editData ? "Edit Document Type Mapping" : "Create Document Type Mapping"}
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
          {isSubmitting ? "Saving..." : (editData ? "Update" : "Save")}
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

      {/* MAIN FORM CONTENT */}
      <div 
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-6 mb-6 shadow-sm"
      >
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
              className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border ${fieldErrors.branch ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isEditMode ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <option value="" className="text-gray-500 dark:text-gray-400">Select Branch</option>
              {branchList.map((branch) => (
                <option key={branch.branchCode} value={branch.branch} className="text-gray-900 dark:text-white">
                  {branch.branch}
                </option>
              ))}
            </select>
            {fieldErrors.branch && (
              <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.branch}</p>
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
              className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border ${fieldErrors.finYear ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isEditMode ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <option value="" className="text-gray-500 dark:text-gray-400">Select Financial Year</option>
              {finYearList.map((year) => (
                <option key={year.finYearIdentifier} value={year.finYear} className="text-gray-900 dark:text-white">
                  {year.finYear}
                </option>
              ))}
            </select>
            {fieldErrors.finYear && (
              <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.finYear}</p>
            )}
          </div>

<div className="space-y-1">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              Client
       
       
            </label>
            <select
              
              className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border ${fieldErrors.finYear ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isEditMode ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <option value="" className="text-gray-500 dark:text-gray-400">Select Financial Year</option>
              {finYearList.map((year) => (
                <option key={year.finYearIdentifier} value={year.finYear} className="text-gray-900 dark:text-white">
                   
                </option>
              ))}
            </select>
            {fieldErrors.finYear && (
              <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.finYear}</p>
            )}
          </div>
          {/* Active Checkbox */}
          <div className="flex items-center space-x-2 p-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => handleFormChange("active", e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* MAPPING TABLE SECTION */}
      <div 
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-6 shadow-sm"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mapping Details</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage document type mappings</p>
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

        {/* Mapping Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-xs">
                <th className="p-3 text-left font-medium">Screen Name</th>
                <th className="p-3 text-left font-medium">Screen Code</th>
                <th className="p-3 text-left font-medium">Client</th>
                <th className="p-3 text-left font-medium">Client Code</th>
                <th className="p-3 text-left font-medium">Document Code</th>
                <th className="p-3 text-left font-medium">Prefix</th>
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
                    <td className="p-3">{row.client || "-"}</td>
                    <td className="p-3">{row.clientCode || "-"}</td>
                    <td className="p-3">{row.docCode || "-"}</td>
                    <td className="p-3">{row.prefixField || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
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