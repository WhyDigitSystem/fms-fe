import { ArrowLeft, Save, X, Plus, List, Calendar, Upload, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { employeeAPI } from "../../../api/employeeAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import { designationAPI } from "../../../api/designationAPI";
import apiClient from "../../../api/apiClient";
import { useToast } from "../../Toast/ToastContext";
import CommonBulkUpload from "../../../utils/CommonBulkUpload";
import EmployeeMasterList from "./EmployeeMasterList";

const EmployeeForm = ({ editData, onBack, onSaveSuccess }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const loginUserName = localStorage.getItem("userName") || "SYSTEM";

  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [viewMode, setViewMode] = useState("form");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const [form, setForm] = useState({
    id: editData?.id || 0,
    employeeCode: editData?.employeeCode || "",
    employeeName: editData?.employeeName || "",
    department: editData?.department || "",
    designation: editData?.designation || "",
    gender: editData?.gender || "",
    branch: editData?.branch || "",
    branchCode: editData?.branchCode || "",
    dateOfBirth: editData?.dateOfBirth || "",
    joiningdate: editData?.joiningdate || editData?.joiningDate || "",
    active: editData?.active === "Active" || editData?.active === true || true,
  });

  const [fieldErrors, setFieldErrors] = useState({});

  // Field labels for toast messages
  const fieldLabels = {
    employeeCode: "Employee Code",
    employeeName: "Employee Name",
    gender: "Gender",
    branch: "Branch",
    department: "Department",
    designation: "Designation",
    dateOfBirth: "Date of Birth",
    joiningdate: "Date of Join",
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (editData) {
      initializeForm();
    }
  }, [editData, branches]);

  // ============================
  // DATA FETCHING
  // ============================
  const fetchInitialData = async () => {
    try {
      console.log("🔄 Fetching initial data for org:", ORG_ID);

      const [branchesData, employeesData, departmentsData, designationsData] =
        await Promise.all([
          fetchBranches(),
          fetchEmployees(),
          fetchDepartments(),
          fetchDesignations(),
        ]);

      setBranches(branchesData || []);
      setEmployees(employeesData || []);
      setDepartments(departmentsData || []);
      setDesignations(designationsData || []);
    } catch (error) {
      console.error("❌ Error fetching initial data:", error);
      addToast("Failed to load initial data", "error");
    }
  };

  // ✅ Branches (direct API call)
  const fetchBranches = async () => {
    try {
      const response = await apiClient.get(
        `/api/warehousemastercontroller/branch?orgid=${ORG_ID}`
      );
      const list =
        response?.paramObjectsMap?.branchVO ||
        response?.data?.paramObjectsMap?.branchVO ||
        [];
      return list.filter((b) => b.active !== "Inactive" && b.cancel !== "T");
    } catch (error) {
      console.error("❌ Error fetching branches:", error);
      return [];
    }
  };

  // ✅ Employees (guarded — API method may not exist)
  const fetchEmployees = async () => {
    try {
      if (typeof employeeAPI.getEmployees !== "function") {
        console.warn("⚠️ employeeAPI.getEmployees is not available — skipping");
        return [];
      }
      const response = await employeeAPI.getEmployees(ORG_ID);
      const list =
        response?.paramObjectsMap?.employeeVO ||
        response?.data?.paramObjectsMap?.employeeVO ||
        response?.paramObjectsMap?.employees ||
        response?.data?.paramObjectsMap?.employees ||
        (Array.isArray(response) ? response : []);
      return list;
    } catch (error) {
      console.error("❌ Error fetching employees:", error);
      return [];
    }
  };

  // ✅ Departments
  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAllDepartments(ORG_ID);
      const list =
        response?.paramObjectsMap?.departmentVOs ||
        response?.data?.paramObjectsMap?.departmentVOs ||
        [];
      return list.filter((d) => d.active !== "Inactive" && d.cancel !== "T");
    } catch (error) {
      console.error("❌ Error fetching departments:", error);
      return [];
    }
  };

  // ✅ Designations
  const fetchDesignations = async () => {
    try {
      const response = await designationAPI.getAllDesignations(ORG_ID);
      const list =
        response?.paramObjectsMap?.designationVO ||
        response?.data?.paramObjectsMap?.designationVO ||
        [];
      return list.filter((d) => d.active !== "Inactive" && d.cancel !== "T");
    } catch (error) {
      console.error("❌ Error fetching designations:", error);
      return [];
    }
  };

  // ============================
  // FORM INITIALIZATION
  // ============================
  const initializeForm = () => {
    if (!editData) return;

    console.log("🔄 Initializing form with editData:", editData);

    const selectedBranch = branches.find((br) => br.branch === editData.branch);

    setForm({
      id: editData.id || 0,
      employeeCode: editData.employeeCode || "",
      employeeName: editData.employeeName || "",
      department: editData.department || "",
      designation: editData.designation || "",
      gender: editData.gender || "",
      branch: editData.branch || "",
      branchCode: selectedBranch
        ? selectedBranch.branchCode
        : editData.branchCode || "",
      dateOfBirth: editData.dateOfBirth || "",
      joiningdate: editData.joiningdate || editData.joiningDate || "",
      active: editData.active === "Active" || editData.active === true || true,
    });
  };

  // ============================
  // CHANGE HANDLERS
  // ============================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "branch") {
      const selectedBranch = branches.find((br) => br.branch === value);
      setForm((prev) => ({
        ...prev,
        [name]: value,
        branchCode: selectedBranch ? selectedBranch.branchCode : "",
      }));
      return;
    }

    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name, value) => {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if ((name === "employeeCode" || name === "employeeName") && value) {
      setForm((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    }
  };

  // ============================
  // VALIDATION
  // ============================
  const validateForm = () => {
    const errors = {};

    if (!form.employeeCode?.trim())
      errors.employeeCode = "Employee Code is required";
    if (!form.employeeName?.trim())
      errors.employeeName = "Employee Name is required";
    if (!form.gender?.trim()) errors.gender = "Gender is required";
    if (!form.branch?.trim()) errors.branch = "Branch is required";
    if (!form.department?.trim()) errors.department = "Department is required";
    if (!form.designation?.trim())
      errors.designation = "Designation is required";
    if (!form.dateOfBirth) errors.dateOfBirth = "Date of Birth is required";
    if (!form.joiningdate) errors.joiningdate = "Date of Join is required";

    if (form.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(form.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      if (age < 18) {
        errors.dateOfBirth = "Employee must be at least 18 years old";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ============================
  // SAVE
  // ============================
  const handleSave = async () => {
    if (!validateForm()) {
      const firstErrorField = Object.keys(fieldErrors)[0];
      if (firstErrorField) {
        const fieldLabel = fieldLabels[firstErrorField] || firstErrorField;
        addToast(`${fieldLabel}: ${fieldErrors[firstErrorField]}`, "error");
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ Build payload — include id ONLY when editing
      const payload = {
        employeeCode: form.employeeCode,
        employeeName: form.employeeName,
        department: form.department,
        designation: form.designation,
        gender: form.gender,
        branch: form.branch,
        branchCode: form.branchCode,
        dateOfBirth: form.dateOfBirth,
        joiningdate: form.joiningdate,
        active: form.active,
        orgId: ORG_ID,
        createdBy: loginUserName,
      };

      // Only include id when it's an update (editData exists AND form.id is truthy)
      if (editData && form.id) {
        payload.id = form.id;
      }

      console.log("📤 Saving Employee Payload:", payload);

      const response = await employeeAPI.saveEmployee(payload);
      console.log("📥 Save Response:", response);

      if (response.status) {
        const successMessage = form.id
          ? "Employee updated successfully!"
          : "Employee created successfully!";
        addToast(successMessage, "success");

        if (onSaveSuccess) onSaveSuccess(form.id ? "updated" : "created");
        onBack();
      } else {
        const errorMessage =
          response.paramObjectsMap?.errorMessage || "Failed to save employee";
        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      const errorMessage =
        error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.message ||
        "Save failed! Try again.";
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================
  // CLEAR / EDIT / UPLOAD
  // ============================
  const handleClear = () => {
    setForm({
      id: 0,
      employeeCode: "",
      employeeName: "",
      department: "",
      designation: "",
      gender: "",
      branch: "",
      branchCode: "",
      dateOfBirth: "",
      joiningdate: "",
      active: true,
    });
    setFieldErrors({});
  };

  const handleEditEmployee = (employee) => {
    const selectedBranch = branches.find((br) => br.branch === employee.branch);
    setForm({
      id: employee.id || 0,
      employeeCode: employee.employeeCode || "",
      employeeName: employee.employeeName || "",
      department: employee.department || "",
      designation: employee.designation || "",
      gender: employee.gender || "",
      branch: employee.branch || "",
      branchCode: selectedBranch
        ? selectedBranch.branchCode
        : employee.branchCode || "",
      dateOfBirth: employee.dateOfBirth || "",
      joiningdate: employee.joiningdate || employee.joiningDate || "",
      active: employee.active === "Active" || employee.active === true || true,
    });
    setViewMode("form");
  };

  const handleBulkUploadOpen = () => setUploadOpen(true);
  const handleBulkUploadClose = () => setUploadOpen(false);
  const handleFileUpload = (file) => {
    console.log("File to upload:", file);
  };
  const handleSubmitUpload = async () => {
    try {
      addToast("Bulk upload functionality to be implemented", "info");
      handleBulkUploadClose();
    } catch (error) {
      console.error("Upload error:", error);
      addToast("Upload failed", "error");
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "form" ? "list" : "form");
    if (viewMode === "list") {
      handleClear();
    }
  };

  // ============================
  // LIST VIEW
  // ============================
  if (viewMode === "list") {
    return (
      <EmployeeMasterList
        onAddNew={() => {
          setViewMode("form");
          handleClear();
        }}
        onEdit={handleEditEmployee}
        onBack={onBack}
      />
    );
  }

  // ============================
  // FORM VIEW
  // ============================
  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {form.id ? "Edit Employee" : "Create Employee"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {form.id
                ? "Update employee information"
                : "Add new employee to the system"}
            </p>
          </div>
        </div>
        <button
          onClick={toggleViewMode}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
        >
          <List className="h-4 w-4" />
          List View
        </button>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={handleClear}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors"
        >
          <X className="h-3 w-3" />
          Clear
        </button>

        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-3 w-3" />
          {isSubmitting ? "Saving..." : form.id ? "Update" : "Save"}
        </button>

        <button
          onClick={handleBulkUploadOpen}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
        >
          <Upload className="h-3 w-3" />
          Upload
        </button>

        <button className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors">
          <Download className="h-3 w-3" />
          Download
        </button>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-2">
          <button
            onClick={() => setActiveTab("basic")}
            className={`px-3 py-2 rounded-t-md text-xs font-medium transition-colors whitespace-nowrap border-b-2 ${activeTab === "basic"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          >
            Employee Information
          </button>
        </div>

        {activeTab === "basic" && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="employeeCode"
                  value={form.employeeCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.employeeCode
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                    }`}
                />
                {fieldErrors.employeeCode && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.employeeCode}
                  </p>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="employeeName"
                  value={form.employeeName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.employeeName
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                    }`}
                />
                {fieldErrors.employeeName && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.employeeName}
                  </p>
                )}
              </div>

              {/* Department (from API) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={form.department}
                  onChange={(e) =>
                    handleSelectChange("department", e.target.value)
                  }
                  className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.department
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                    }`}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.departmentName}>
                      {dept.departmentName}
                    </option>
                  ))}
                </select>
                {fieldErrors.department && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.department}
                  </p>
                )}
              </div>

              {/* Designation (from API) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Designation <span className="text-red-500">*</span>
                </label>
                <select
                  name="designation"
                  value={form.designation}
                  onChange={(e) =>
                    handleSelectChange("designation", e.target.value)
                  }
                  className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.designation
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                    }`}
                >
                  <option value="">Select Designation</option>
                  {designations.map((desig) => (
                    <option key={desig.id} value={desig.designation}>
                      {desig.designation}
                    </option>
                  ))}
                </select>
                {fieldErrors.designation && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.designation}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={(e) => handleSelectChange("gender", e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.gender
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                    }`}
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                {fieldErrors.gender && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.gender}
                  </p>
                )}
              </div>

              {/* Branch (from API) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Branch <span className="text-red-500">*</span>
                </label>
                <select
                  name="branch"
                  value={form.branch}
                  onChange={(e) => handleSelectChange("branch", e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.branch
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                    }`}
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option
                      key={branch.id || branch.branch}
                      value={branch.branch}
                    >
                      {branch.branch}
                    </option>
                  ))}
                </select>
                {fieldErrors.branch && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.branch}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.dateOfBirth
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                    }`}
                />
                {fieldErrors.dateOfBirth && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.dateOfBirth}
                  </p>
                )}
              </div>

              {/* Date of Join */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date of Join <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="joiningdate"
                  value={form.joiningdate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.joiningdate
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                    }`}
                />
                {fieldErrors.joiningdate && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.joiningdate}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Active */}
              <div className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BULK UPLOAD MODAL */}
      {uploadOpen && (
        <CommonBulkUpload
          open={uploadOpen}
          handleClose={handleBulkUploadClose}
          title="Upload Employee Files"
          uploadText="Upload employee file"
          onSubmit={handleSubmitUpload}
          handleFileUpload={handleFileUpload}
          apiUrl={`warehousemastercontroller/EmployeeUpload?orgId=${ORG_ID}&createdBy=${loginUserName}`}
          screen="Employee"
        />
      )}
    </div>
  );
};

export default EmployeeForm;