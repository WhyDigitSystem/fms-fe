import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { FloatingInput, FloatingSelect } from "../../../utils/InputFields";
import { userAPI } from "../../../api/userAPI";
import { useToast } from "../../Toast/ToastContext";
import { encryptPassword } from "../../../utils/encPassword";

const UserForm = ({ editData, onBack, onSaveSuccess }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const loginUserName = localStorage.getItem("userName") || "SYSTEM";

  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Table data states
  const [roleTableData, setRoleTableData] = useState([]);
  const [branchTableData, setBranchTableData] = useState([]);
  const [clientTableData, setClientTableData] = useState([]);
  const [activeTab, setActiveTab] = useState("roles");

  const [form, setForm] = useState({
    id: editData?.id || 0,
    employeeName: editData?.employeeName || "",
    employeeCode: editData?.userName || "",
    nickName: editData?.nickName || "",
    email: editData?.email || "",
    password: "",
    userType: (editData?.userType || "").toUpperCase(),
    mobileNo: editData?.mobileNo || "",
    active: editData?.active ?? true,

    // Additional fields
    orgId: ORG_ID,
    createdBy: loginUserName,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [roleTableErrors, setRoleTableErrors] = useState([]);
  const [branchTableErrors, setBranchTableErrors] = useState([]);
  const [clientTableErrors, setClientTableErrors] = useState([]);

  // Field labels for toast messages
  const fieldLabels = {
    employeeName: "Employee Name",
    employeeCode: "Employee Code",
    nickName: "Nick Name",
    email: "Email",
    userType: "User Type",
    mobileNo: "Mobile Number",
  };

  useEffect(() => {
    const init = async () => {
      await fetchInitialData();
      if (editData) {
        initializeForm();
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id]);

  const fetchInitialData = async () => {
    try {
      console.log("🔄 Fetching initial data for org:", ORG_ID);

      const [rolesResponse, branchesResponse, employeesResponse] =
        await Promise.all([
          userAPI.getRoles(ORG_ID),
          userAPI.getBranches(ORG_ID),
          // userAPI.getCustomers(ORG_ID),
          userAPI.getEmployees(ORG_ID),
        ]);

      console.log("📥 Roles Response:", rolesResponse);
      console.log("📥 Branches Response:", branchesResponse);
      console.log("📥 Employees Response:", employeesResponse);

      // ✅ Correct key is rolesVO (not roleVO)
      const rolesData =
        rolesResponse?.paramObjectsMap?.rolesVO ||
        rolesResponse?.data?.paramObjectsMap?.rolesVO ||
        (Array.isArray(rolesResponse) ? rolesResponse : []) ||
        [];

      const branchesData =
        branchesResponse?.paramObjectsMap?.branchVO ||
        branchesResponse?.data?.paramObjectsMap?.branchVO ||
        (Array.isArray(branchesResponse) ? branchesResponse : []) ||
        [];

      const employeesData =
        employeesResponse?.paramObjectsMap?.employeeVO ||
        employeesResponse?.data?.paramObjectsMap?.employeeVO ||
        (Array.isArray(employeesResponse) ? employeesResponse : []) ||
        [];

      console.log("📊 Processed Roles:", rolesData);
      console.log("📊 Processed Branches:", branchesData);
      console.log("📊 Processed Employees:", employeesData);

      setRoles(rolesData);
      setBranches(branchesData);
      setEmployees(employeesData);

      if (!editData) {
        setRoleTableData([
          { id: Date.now(), role: "", roleId: "", startDate: null, endDate: null },
        ]);
        setRoleTableErrors([{ role: "", startDate: "", endDate: "" }]);
        setBranchTableData([{ id: Date.now(), branchCode: "", branch: "" }]);
        setBranchTableErrors([{ branchCode: "" }]);
        setClientTableData([
          { id: Date.now(), customer: "", client: "", rowClientList: [] },
        ]);
        setClientTableErrors([{ customer: "", client: "" }]);
      }
    } catch (error) {
      console.error("❌ Error fetching initial data:", error);
      addToast("Failed to load initial data", "error");
    }
  };

  const initializeForm = () => {
    if (!editData) return;

    setForm((prev) => ({
      ...prev,
      id: editData.id,
      employeeName: editData.employeeName,
      employeeCode: editData.userName,
      nickName: editData.nickName,
      email: editData.email,
      userType: (editData.userType || "").toUpperCase(),
      mobileNo: editData.mobileNo,
      active: editData.active === "Active" || editData.active === true,
    }));

    // ---- Roles ----
    if (editData.roleAccessVO && editData.roleAccessVO.length > 0) {
      const roleData = editData.roleAccessVO.map((item) => {
        const normalizedRole = (item.role || "").toUpperCase();
        const matchedRole = roles.find(
          (r) => (r.role || "").toUpperCase() === normalizedRole
        );
        return {
          id: item.id || Date.now() + Math.random(),
          role: normalizedRole,
          // Prefer roleId already present in editData; fall back to matched role from list
          roleId: item.roleId ?? matchedRole?.id ?? "",
          startDate: item.startDate ? new Date(item.startDate) : null,
          endDate: item.endDate ? new Date(item.endDate) : null,
        };
      });
      setRoleTableData(roleData);
      setRoleTableErrors(
        roleData.map(() => ({ role: "", startDate: "", endDate: "" }))
      );
    } else {
      setRoleTableData([
        { id: Date.now(), role: "", roleId: "", startDate: null, endDate: null },
      ]);
      setRoleTableErrors([{ role: "", startDate: "", endDate: "" }]);
    }

    // ---- Branches ----
    if (editData.branchAccessibleVO && editData.branchAccessibleVO.length > 0) {
      const branchData = editData.branchAccessibleVO.map((item) => {
        // Shape 3 (new): { branch: { id, branch, branchCode, ... } }
        if (item.branch && typeof item.branch === "object") {
          const code =
            item.branch.branchCode ||
            item.branch.branchcode ||
            branches.find((b) => b.id === item.branch.id)?.branchCode ||
            "";
          const name =
            item.branch.branch ||
            branches.find((b) => b.id === item.branch.id)?.branch ||
            "";
          return {
            id: item.id || Date.now() + Math.random(),
            branchCode: code,
            branch: name,
          };
        }

        // Shape 2: { branch: 1000000001 } (numeric id)
        if (typeof item.branch === "number") {
          const match = branches.find((b) => b.id === item.branch);
          return {
            id: item.id || Date.now() + Math.random(),
            branchCode: match?.branchCode || match?.branchcode || "",
            branch: match?.branch || "",
          };
        }

        // Shape 1: legacy { branch: "BANGALURU", branchcode: "BLR" }
        return {
          id: item.id || Date.now() + Math.random(),
          branchCode: item.branchcode || item.branchCode || "",
          branch: item.branch || "",
        };
      });
      setBranchTableData(branchData);
      setBranchTableErrors(branchData.map(() => ({ branchCode: "" })));
    } else {
      setBranchTableData([{ id: Date.now(), branchCode: "", branch: "" }]);
      setBranchTableErrors([{ branchCode: "" }]);
    }

    // ---- Clients ----
    if (editData.clientAccessVO && editData.clientAccessVO.length > 0) {
      const clientData = editData.clientAccessVO.map((item) => ({
        id: item.id || Date.now() + Math.random(),
        customer: item.customer || "",
        client: item.client || "",
        rowClientList: [],
      }));
      setClientTableData(clientData);
      setClientTableErrors(
        clientData.map(() => ({ customer: "", client: "" }))
      );
    } else {
      setClientTableData([
        { id: Date.now(), customer: "", client: "", rowClientList: [] },
      ]);
      setClientTableErrors([{ customer: "", client: "" }]);
    }
  };

  const handleEmployeeSelect = (employeeName) => {
    if (fieldErrors.employeeName) {
      setFieldErrors((prev) => ({ ...prev, employeeName: "" }));
    }

    const normalized = (employeeName || "").trim().toUpperCase();
    const emp = employees.find(
      (e) => (e.employeeName || "").trim().toUpperCase() === normalized
    );

    if (!emp) {
      setForm((prev) => ({ ...prev, employeeName }));
      return;
    }

    const derivedNickName =
      emp.nickName ||
      (emp.employeeName ? emp.employeeName.split(" ")[0].toLowerCase() : "");

    const derivedEmail =
      emp.email ||
      (emp.employeeCode ? `${emp.employeeCode.toLowerCase()}@company.com` : "");

    const derivedMobile =
      emp.mobileNo || emp.mobile || emp.phoneNo || emp.phone || "";

    setForm((prev) => ({
      ...prev,
      employeeName: emp.employeeName || employeeName,
      employeeCode: emp.employeeCode || "",
      nickName: derivedNickName,
      email: derivedEmail,
      mobileNo: derivedMobile,
    }));
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    const numericRegex = /^[0-9]*$/;
    let errorMessage = "";

    if (name === "active") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    switch (name) {
      case "mobileNo":
        if (value && !numericRegex.test(value)) {
          errorMessage = "Only numbers allowed";
        } else if (value && value.length > 10) {
          errorMessage = "Mobile number must be 10 digits";
        }
        break;
      default:
        break;
    }

    if (errorMessage) {
      setFieldErrors((prev) => ({ ...prev, [name]: errorMessage }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddRoleRow = () => {
    if (roleTableData.length === 0) {
      const newId = Date.now();
      setRoleTableData([
        { id: newId, role: "", roleId: "", startDate: null, endDate: null },
      ]);
      setRoleTableErrors([{ role: "", startDate: "", endDate: "" }]);
      return;
    }
    const lastRow = roleTableData[roleTableData.length - 1];
    if (!lastRow.role || !lastRow.startDate) {
      addToast(
        "Please fill the current role row before adding new one",
        "warning"
      );
      return;
    }
    const newId = Date.now();
    setRoleTableData([
      ...roleTableData,
      { id: newId, role: "", roleId: "", startDate: null, endDate: null },
    ]);
    setRoleTableErrors([
      ...roleTableErrors,
      { role: "", startDate: "", endDate: "" },
    ]);
  };

  const handleAddBranchRow = () => {
    if (branchTableData.length === 0) {
      const newId = Date.now();
      setBranchTableData([{ id: newId, branchCode: "", branch: "" }]);
      setBranchTableErrors([{ branchCode: "" }]);
      return;
    }
    const lastRow = branchTableData[branchTableData.length - 1];
    if (!lastRow.branchCode) {
      addToast(
        "Please fill the current branch row before adding new one",
        "warning"
      );
      return;
    }
    const newId = Date.now();
    setBranchTableData([
      ...branchTableData,
      { id: newId, branchCode: "", branch: "" },
    ]);
    setBranchTableErrors([...branchTableErrors, { branchCode: "" }]);
  };

  const handleAddClientRow = () => {
    if (clientTableData.length === 0) {
      const newId = Date.now();
      setClientTableData([
        { id: newId, customer: "", client: "", rowClientList: [] },
      ]);
      setClientTableErrors([{ customer: "", client: "" }]);
      return;
    }
    const lastRow = clientTableData[clientTableData.length - 1];
    if (!lastRow.customer || !lastRow.client) {
      addToast(
        "Please fill the current client row before adding new one",
        "warning"
      );
      return;
    }
    const newId = Date.now();
    setClientTableData([
      ...clientTableData,
      { id: newId, customer: "", client: "", rowClientList: [] },
    ]);
    setClientTableErrors([...clientTableErrors, { customer: "", client: "" }]);
  };

  const handleSelectChange = (name, value) => {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteRoleRow = (id) => {
    if (roleTableData.length === 1) {
      addToast("At least one role is required", "warning");
      return;
    }
    const index = roleTableData.findIndex((item) => item.id === id);
    setRoleTableData(roleTableData.filter((item) => item.id !== id));
    setRoleTableErrors(roleTableErrors.filter((_, i) => i !== index));
  };

  const handleDeleteBranchRow = (id) => {
    if (branchTableData.length === 1) {
      addToast("At least one branch is required", "warning");
      return;
    }
    const index = branchTableData.findIndex((item) => item.id === id);
    setBranchTableData(branchTableData.filter((item) => item.id !== id));
    setBranchTableErrors(branchTableErrors.filter((_, i) => i !== index));
  };

  const handleDeleteClientRow = (id) => {
    if (clientTableData.length === 1) {
      addToast("At least one client is required", "warning");
      return;
    }
    const index = clientTableData.findIndex((item) => item.id === id);
    setClientTableData(clientTableData.filter((item) => item.id !== id));
    setClientTableErrors(clientTableErrors.filter((_, i) => i !== index));
  };

  // ✅ Role select now uses role.id as its value; resolve name+id together
  const handleRoleChange = (id, field, value) => {
    const index = roleTableData.findIndex((item) => item.id === id);

    if (roleTableErrors[index]?.[field]) {
      const newErrors = [...roleTableErrors];
      newErrors[index] = { ...newErrors[index], [field]: "" };
      setRoleTableErrors(newErrors);
    }

    setRoleTableData((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (field === "role") {
          const match = roles.find((r) => String(r.id) === String(value));
          return {
            ...item,
            roleId: match?.id ?? "",
            role: match?.role ?? "",
          };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const handleBranchChange = (id, field, value) => {
    const index = branchTableData.findIndex((item) => item.id === id);

    if (branchTableErrors[index]?.[field]) {
      const newErrors = [...branchTableErrors];
      newErrors[index] = { ...newErrors[index], [field]: "" };
      setBranchTableErrors(newErrors);
    }

    setBranchTableData((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (field === "branchCode") {
          const match = branches.find(
            (b) => (b.branchCode || b.branchcode) === value
          );
          return {
            ...item,
            branchCode: value,
            branch: match?.branch || "",
          };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const handleClientChange = async (id, field, value) => {
    const index = clientTableData.findIndex((item) => item.id === id);

    if (clientTableErrors[index]?.[field]) {
      const newErrors = [...clientTableErrors];
      newErrors[index] = { ...newErrors[index], [field]: "" };
      setClientTableErrors(newErrors);
    }

    if (field === "customer") {
      try {
        console.log("🔄 Fetching clients for customer:", value);
        const clientsResponse = await userAPI.getClientsByCustomer(
          value,
          ORG_ID
        );
        const clients =
          clientsResponse?.paramObjectsMap?.clientVO ||
          clientsResponse?.data?.paramObjectsMap?.clientVO ||
          (Array.isArray(clientsResponse) ? clientsResponse : []) ||
          [];
        console.log("📥 Clients fetched:", clients);

        setClientTableData((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, customer: value, client: "", rowClientList: clients }
              : item
          )
        );
      } catch (error) {
        console.error("❌ Error fetching clients:", error);
        addToast("Failed to load clients", "error");
      }
    } else {
      setClientTableData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        )
      );
    }
  };

  // ✅ Filter by id, not name
  const getAvailableRoles = (currentId) => {
    const selectedRoleIds = roleTableData
      .filter((item) => item.id !== currentId && item.roleId)
      .map((item) => String(item.roleId));

    return roles.filter((role) => !selectedRoleIds.includes(String(role.id)));
  };

  const getAvailableBranches = (currentId) => {
    const selectedBranches = branchTableData
      .filter((item) => item.id !== currentId && item.branchCode)
      .map((item) => item.branchCode);

    return branches.filter(
      (branch) =>
        !selectedBranches.includes(branch.branchCode || branch.branchcode)
    );
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const validateForm = () => {
    const errors = {};
    const newRoleErrors = [];
    const newBranchErrors = [];

    if (!form.employeeName.trim())
      errors.employeeName = "Employee name is required";
    if (!form.employeeCode.trim())
      errors.employeeCode = "Employee code is required";
    if (!form.nickName.trim()) errors.nickName = "Nick name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    if (!form.userType.trim()) errors.userType = "User type is required";
    if (!form.mobileNo.trim()) errors.mobileNo = "Mobile number is required";

    let roleTableValid = true;
    roleTableData.forEach((row) => {
      const rowErrors = {};
      if (!row.roleId) {
        rowErrors.role = "Role is required";
        roleTableValid = false;
      }
      if (!row.startDate) {
        rowErrors.startDate = "Start date is required";
        roleTableValid = false;
      }
      newRoleErrors.push(rowErrors);
    });

    let branchTableValid = true;
    branchTableData.forEach((row) => {
      const rowErrors = {};
      if (!row.branchCode) {
        rowErrors.branchCode = "Branch code is required";
        branchTableValid = false;
      }
      newBranchErrors.push(rowErrors);
    });

    setFieldErrors(errors);
    setRoleTableErrors(newRoleErrors);
    setBranchTableErrors(newBranchErrors);

    return (
      Object.keys(errors).length === 0 && roleTableValid && branchTableValid
    );
  };

  const handleSave = async () => {
    if (!validateForm()) {
      const firstErrorField = Object.keys(fieldErrors)[0];
      if (firstErrorField) {
        const fieldLabel = fieldLabels[firstErrorField] || firstErrorField;
        addToast(`${fieldLabel}: ${fieldErrors[firstErrorField]}`, "error");
      } else {
        addToast("Please fill all required fields", "error");
      }
      return;
    }

    setIsSubmitting(true);

    // ✅ Build payload
    const payload = {
      employeeName: form.employeeName,
      userName: form.employeeCode,
      nickName: form.nickName,
      email: form.email,
      mobileNo: form.mobileNo,
      userType: form.userType.toUpperCase(),
      active: form.active,
      password: editData ? undefined : encryptPassword(form.password),
      roleAccessDTO: roleTableData
        .filter((row) => row.roleId)
        .map((row) => ({
          role: row.role,
          roleId: parseInt(row.roleId, 10),
          startDate: row.startDate
            ? new Date(row.startDate).toISOString().split("T")[0]
            : null,
          endDate: row.endDate
            ? new Date(row.endDate).toISOString().split("T")[0]
            : null,
        })),
      branchAccessDTOList: branchTableData
        .filter((row) => row.branchCode)
        .map((row) => {
          const match = branches.find(
            (b) => (b.branchCode || b.branchcode) === row.branchCode
          );
          return { branch: match?.id ?? 0 };
        }),
      clientAccessDTOList: clientTableData
        .filter((row) => row.customer || row.client)
        .map((row) => ({
          customer: row.customer,
          client: row.client,
        })),
      orgId: ORG_ID,
      createdBy: loginUserName,
    };

    if (form.id && form.id !== 0) {
      payload.id = form.id;
    }

    console.log("📤 roleTableData:", roleTableData);
    console.log("📤 Saving User Payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await userAPI.saveUser(payload);
      console.log("📥 Save Response:", response);

      const status =
        response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const successMessage =
          response?.paramObjectsMap?.message ||
          (form.id
            ? "User updated successfully!"
            : "User created successfully!");
        addToast(successMessage, "success");
        if (onSaveSuccess) onSaveSuccess(form.id ? "updated" : "created");
        onBack();
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save user";
        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
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

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {editData ? "Edit User" : "Add User"}
        </h2>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        {/* MAIN FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <FloatingSelect
            label="Employee Name *"
            name="employeeName"
            value={form.employeeName}
            onChange={(name, value) => handleEmployeeSelect(value)}
            options={employees.map((emp) => ({
              label: emp.employeeName,
              value: emp.employeeName,
            }))}
            error={fieldErrors.employeeName}
            required
          />

          <FloatingInput
            label="Employee Code *"
            name="employeeCode"
            value={form.employeeCode}
            onChange={handleChange}
            error={fieldErrors.employeeCode}
            required
          />

          <FloatingInput
            label="Nick Name *"
            name="nickName"
            value={form.nickName}
            onChange={handleChange}
            error={fieldErrors.nickName}
            required
          />

          <FloatingSelect
            label="User Type *"
            name="userType"
            value={(form.userType || "").toUpperCase()}
            onChange={(name, value) => handleSelectChange(name, value)}
            options={[
              { label: "ADMIN", value: "ADMIN" },
              { label: "USER", value: "USER" },
            ]}
            error={fieldErrors.userType}
            required
          />

          <FloatingInput
            label="Mobile No *"
            name="mobileNo"
            value={form.mobileNo}
            onChange={handleChange}
            error={fieldErrors.mobileNo}
            required
          />

          <FloatingInput
            label="Email *"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
            required
          />

          {!editData && (
            <FloatingInput
              label="Password *"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          )}

          {/* ACTIVE CHECKBOX */}
          <div className="flex items-center gap-2 p-1">
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

        {/* TABS */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            <button
              onClick={() => setActiveTab("roles")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "roles"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
            >
              Roles ({roleTableData.length})
            </button>
            <button
              onClick={() => setActiveTab("branches")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "branches"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
            >
              Branch Access ({branchTableData.length})
            </button>
          </div>

          {activeTab === "roles" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                  Role Access
                </h3>
                <button
                  onClick={handleAddRoleRow}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-3 w-3" /> Add Role
                </button>
              </div>

              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                      <th className="p-2 text-left w-14">S.No</th>
                      <th className="p-2 text-left font-medium">Role</th>
                      <th className="p-2 text-left font-medium">Start Date</th>
                      <th className="p-2 text-left font-medium">End Date</th>
                      <th className="p-2 text-center font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roleTableData.map((row, index) => (
                      <tr
                        key={row.id}
                        className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="p-2">{index + 1}</td>
                        <td className="p-2">
                          <select
                            value={row.roleId || ""}
                            onChange={(e) =>
                              handleRoleChange(row.id, "role", e.target.value)
                            }
                            className={`w-full bg-white dark:bg-gray-800 border ${roleTableErrors[index]?.role
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                              } rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          >
                            <option value="">Select Role</option>
                            {getAvailableRoles(row.id).map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.role}
                              </option>
                            ))}
                          </select>
                          {roleTableErrors[index]?.role && (
                            <div className="text-red-500 text-xs mt-1">
                              {roleTableErrors[index].role}
                            </div>
                          )}
                        </td>
                        <td className="p-2">
                          <input
                            type="date"
                            value={formatDateForInput(row.startDate)}
                            onChange={(e) =>
                              handleRoleChange(
                                row.id,
                                "startDate",
                                e.target.value ? new Date(e.target.value) : null
                              )
                            }
                            className={`w-full bg-white dark:bg-gray-800 border ${roleTableErrors[index]?.startDate
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                              } rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                          {roleTableErrors[index]?.startDate && (
                            <div className="text-red-500 text-xs mt-1">
                              {roleTableErrors[index].startDate}
                            </div>
                          )}
                        </td>
                        <td className="p-2">
                          <input
                            type="date"
                            value={formatDateForInput(row.endDate)}
                            onChange={(e) =>
                              handleRoleChange(
                                row.id,
                                "endDate",
                                e.target.value ? new Date(e.target.value) : null
                              )
                            }
                            className={`w-full bg-white dark:bg-gray-800 border ${roleTableErrors[index]?.endDate
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                              } rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                          {roleTableErrors[index]?.endDate && (
                            <div className="text-red-500 text-xs mt-1">
                              {roleTableErrors[index].endDate}
                            </div>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleDeleteRoleRow(row.id)}
                            disabled={roleTableData.length === 1}
                            className="p-1 text-red-500 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Remove role"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "branches" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                  Branch Access
                </h3>
                <button
                  onClick={handleAddBranchRow}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-3 w-3" /> Add Branch
                </button>
              </div>

              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                      <th className="p-2 text-left w-14">S.No</th>
                      <th className="p-2 text-left font-medium">Branch Code</th>
                      <th className="p-2 text-left font-medium">Branch Name</th>
                      <th className="p-2 text-center font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branchTableData.map((row, index) => (
                      <tr
                        key={row.id}
                        className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="p-2">{index + 1}</td>
                        <td className="p-2">
                          <select
                            value={row.branchCode}
                            onChange={(e) =>
                              handleBranchChange(
                                row.id,
                                "branchCode",
                                e.target.value
                              )
                            }
                            className={`w-full bg-white dark:bg-gray-800 border ${branchTableErrors[index]?.branchCode
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                              } rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          >
                            <option value="">Select Branch Code</option>
                            {getAvailableBranches(row.id).map((branch) => (
                              <option
                                key={branch.id}
                                value={branch.branchCode || branch.branchcode}
                              >
                                {branch.branchCode || branch.branchcode}
                              </option>
                            ))}
                          </select>
                          {branchTableErrors[index]?.branchCode && (
                            <div className="text-red-500 text-xs mt-1">
                              {branchTableErrors[index].branchCode}
                            </div>
                          )}
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.branch}
                            readOnly
                            className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm text-gray-600 dark:text-gray-300"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleDeleteBranchRow(row.id)}
                            disabled={branchTableData.length === 1}
                            className="p-1 text-red-500 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Remove branch"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : editData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserForm;