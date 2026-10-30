import { Check, Globe, X } from "lucide-react";
import { useEffect, useState } from "react";
import { GlobalParameterAPI } from "../../api/globalParameter";

const GlobalSelectionDropdown = () => {
  const [financialYears, setFinancialYears] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [clients, setClients] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [currentGlobalParams, setCurrentGlobalParams] = useState(null);

  const [loading, setLoading] = useState({
    globalParams: false,
    financialYears: false,
    customers: false,
    branches: false,
    clients: false,
    warehouses: false,
    saving: false,
  });

  const [error, setError] = useState({
    globalParams: null,
    financialYears: null,
    customers: null,
    branches: null,
    clients: null,
    warehouses: null,
    saving: null,
  });

  const [success, setSuccess] = useState(false);

  const [selections, setSelections] = useState({
    financialYear: "",
    branch: "",
    customer: "",
    client: "",
    warehouse: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));

  // ---------------------------------------------------------------
  // Fetch current global parameters
  // ---------------------------------------------------------------
  const fetchCurrentGlobalParameters = async () => {
    setLoading((prev) => ({ ...prev, globalParams: true }));
    setError((prev) => ({ ...prev, globalParams: null }));
    try {
      const globalParams = await GlobalParameterAPI.getCurrentGlobalParameters(
        user.userData.orgId,
        user.userData.usersId
      );
      setCurrentGlobalParams(globalParams);

      if (globalParams) {
        // Backend may return ids (new) or codes/strings (legacy). Support both.
        const fyId = globalParams.financialYear ?? globalParams.finYearId;
        const branchId = globalParams.branch ?? globalParams.branchId;

        const fy = financialYears.find(
          (y) => String(y.id) === String(fyId) || String(y.finYear) === String(fyId)
        );
        const br = branches.find(
          (b) =>
            String(b.branchId) === String(branchId) ||
            String(b.branchCode) === String(branchId)
        );

        setSelections({
          financialYear: fy ? String(fy.finYear) : globalParams.finYear || "",
          branch: br ? br.branchCode : globalParams.branchcode || "",
          customer: globalParams.customer || "",
          client: globalParams.client || "",
          warehouse: globalParams.warehouse || "",
        });

        localStorage.setItem("globalParams", JSON.stringify(globalParams));
        console.log("Current global parameters loaded:", globalParams);
      }
    } catch (err) {
      setError((prev) => ({ ...prev, globalParams: err.message }));
      console.error("Error fetching current global parameters:", err);
    } finally {
      setLoading((prev) => ({ ...prev, globalParams: false }));
    }
  };

  // ---------------------------------------------------------------
  // Fetch financial years
  // ---------------------------------------------------------------
  const fetchFinancialYears = async () => {
    setLoading((prev) => ({ ...prev, financialYears: true }));
    setError((prev) => ({ ...prev, financialYears: null }));
    try {
      const raw = await GlobalParameterAPI.getFinancialYears(user.userData.orgId);

      // Support {paramObjectsMap:{financialYearVO:[...]}} | data.… | flat array
      const list =
        raw?.paramObjectsMap?.financialYearVO ||
        raw?.paramObjectsMap?.financialYearsVO ||
        raw?.data?.paramObjectsMap?.financialYearVO ||
        (Array.isArray(raw) ? raw : []);

      setFinancialYears(list);

      if (!currentGlobalParams && list.length > 0) {
        const current = list.find((y) => y.currentFinYear) || list[0];
        setSelections((prev) => ({
          ...prev,
          financialYear: String(current.finYear),
        }));
      }
    } catch (err) {
      setError((prev) => ({ ...prev, financialYears: err.message }));
      console.error("Error fetching financial years:", err);
    } finally {
      setLoading((prev) => ({ ...prev, financialYears: false }));
    }
  };

  // ---------------------------------------------------------------
  // Fetch branches (normalize to { branchId, branchCode, branch })
  // ---------------------------------------------------------------
  const fetchBranches = async () => {
    setLoading((prev) => ({ ...prev, branches: true }));
    setError((prev) => ({ ...prev, branches: null }));
    try {
      const raw = await GlobalParameterAPI.getBranches(
        user.userData.orgId,
        user.userData.userName
      );

      // Support the new "GlopalParameters" key (backend typo) + legacy shapes
      const list =
        raw?.paramObjectsMap?.GlopalParameters ||
        raw?.paramObjectsMap?.globalParameters ||
        raw?.paramObjectsMap?.branchVO ||
        raw?.data?.paramObjectsMap?.GlopalParameters ||
        raw?.data?.paramObjectsMap?.branchVO ||
        (Array.isArray(raw) ? raw : []);

      // Normalize EVERY row to the same shape
      const normalized = list.map((b) => ({
        branchId: b.branchId ?? b.id ?? null,
        branchCode: b.branchCode ?? b.branchcode ?? "",
        branch: b.branch ?? b.branchName ?? "",
      }));

      setBranches(normalized);

      if (!currentGlobalParams && normalized.length > 0) {
        setSelections((prev) => ({
          ...prev,
          branch: normalized[0].branchCode,
        }));
      }
    } catch (err) {
      setError((prev) => ({ ...prev, branches: err.message }));
      console.error("Error fetching branches:", err);
    } finally {
      setLoading((prev) => ({ ...prev, branches: false }));
    }
  };

  // ---------------------------------------------------------------
  // Dependent data fetchers (kept — currently UI is commented out)
  // ---------------------------------------------------------------
  const fetchCustomers = async (branchcode) => {
    if (!branchcode) {
      setCustomers([]);
      setSelections((prev) => ({ ...prev, customer: "", client: "", warehouse: "" }));
      return;
    }
    setLoading((prev) => ({ ...prev, customers: true }));
    setError((prev) => ({ ...prev, customers: null }));
    try {
      const data = await GlobalParameterAPI.getCustomer(
        user.userData.orgId,
        branchcode,
        user.userData.userName
      );
      setCustomers(data || []);
      if (!currentGlobalParams || currentGlobalParams.branchcode !== branchcode) {
        if (data && data.length > 0) {
          setSelections((prev) => ({ ...prev, customer: data[0].customer || "" }));
        } else {
          setSelections((prev) => ({ ...prev, customer: "", client: "", warehouse: "" }));
        }
      }
    } catch (err) {
      setError((prev) => ({ ...prev, customers: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, customers: false }));
    }
  };

  const fetchClients = async (branchcode, customer) => {
    if (!branchcode || !customer) {
      setClients([]);
      setSelections((prev) => ({ ...prev, client: "" }));
      return;
    }
    setLoading((prev) => ({ ...prev, clients: true }));
    setError((prev) => ({ ...prev, clients: null }));
    try {
      const data = await GlobalParameterAPI.getClients(
        user.userData.orgId,
        branchcode,
        user.userData.userName,
        customer
      );
      setClients(data || []);
      if (
        !currentGlobalParams ||
        currentGlobalParams.branchcode !== branchcode ||
        currentGlobalParams.customer !== customer
      ) {
        if (data && data.length > 0) {
          setSelections((prev) => ({ ...prev, client: data[0].client || "" }));
        } else {
          setSelections((prev) => ({ ...prev, client: "" }));
        }
      }
    } catch (err) {
      setError((prev) => ({ ...prev, clients: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, clients: false }));
    }
  };

  const fetchWarehouses = async (branchcode) => {
    if (!branchcode) {
      setWarehouses([]);
      setSelections((prev) => ({ ...prev, warehouse: "" }));
      return;
    }
    setLoading((prev) => ({ ...prev, warehouses: true }));
    setError((prev) => ({ ...prev, warehouses: null }));
    try {
      const data = await GlobalParameterAPI.getWarehouses(
        user.userData.orgId,
        branchcode
      );
      setWarehouses(data || []);
      if (!currentGlobalParams || currentGlobalParams.branchcode !== branchcode) {
        if (data && data.length > 0) {
          setSelections((prev) => ({
            ...prev,
            warehouse: data[0].Warehouse || data[0].warehouse || "",
          }));
        } else {
          setSelections((prev) => ({ ...prev, warehouse: "" }));
        }
      }
    } catch (err) {
      setError((prev) => ({ ...prev, warehouses: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, warehouses: false }));
    }
  };

  // ---------------------------------------------------------------
  // Save global parameters
  // ---------------------------------------------------------------
  const handleApplyChanges = async () => {
    if (!selections.financialYear || !selections.branch) {
      setError((prev) => ({ ...prev, saving: "Please fill all required fields" }));
      return;
    }

    setLoading((prev) => ({ ...prev, saving: true }));
    setError((prev) => ({ ...prev, saving: null }));
    setSuccess(false);

    try {
      const selectedBranch = branches.find(
        (item) => item.branchCode === selections.branch
      );
      const selectedFY = financialYears.find(
        (item) => String(item.finYear) === String(selections.financialYear)
      );

      const payload = {
        branch: selectedBranch?.branchId ?? 0,      // ✅ numeric branchId
        financialYear: selectedFY?.id ?? 0,         // ✅ numeric FY id
        orgId: Number(user?.userData?.orgId) || 0,
        userid: String(user?.userData?.usersId ?? ""),
      };

      const payloadSave = {
        branch: selectedBranch?.branch ?? 0,      // ✅ numeric branchId
        financialYear: selectedFY?.finYear ?? 0,         // ✅ numeric FY id
        orgId: Number(user?.userData?.orgId) || 0,
        userid: String(user?.userData?.usersId ?? ""),
      };

      console.log("Saving Payload:", payload);

      const response = await GlobalParameterAPI.saveGlobalParameters(payload);

      if (response.status) {
        // Human-readable values for other screens
        localStorage.setItem("branch", selectedBranch?.branch || "");
        localStorage.setItem("branchcode", selections.branch);
        localStorage.setItem("finYear", selections.financialYear);
        localStorage.setItem("customer", selections.customer);
        localStorage.setItem("client", selections.client);
        localStorage.setItem("warehouse", selections.warehouse);
        // IDs for anything that needs them
        localStorage.setItem("branchId", String(selectedBranch?.branchId ?? ""));
        localStorage.setItem("financialYearId", String(selectedFY?.id ?? ""));

        localStorage.setItem("globalParams", JSON.stringify(payload));
        localStorage.setItem("globalParam", JSON.stringify(payloadSave));

        setCurrentGlobalParams(payload);
        setSuccess(true);

        console.log("Updated localStorage:", payload);

        setTimeout(() => {
          window.location.reload();
        }, 300);
      } else {
        throw new Error(response.message || "Failed to save global parameters");
      }
    } catch (err) {
      setError((prev) => ({ ...prev, saving: err.message }));
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, saving: false }));
    }
  };

  // ---------------------------------------------------------------
  // Initial data: FY → Branches → Current Params
  // (order matters so prefill can resolve ids → display codes)
  // ---------------------------------------------------------------
  useEffect(() => {
    const initializeData = async () => {
      await fetchFinancialYears();
      await fetchBranches();
      await fetchCurrentGlobalParameters();
    };
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dependent data on branch change (UI currently commented)
  useEffect(() => {
    if (selections.branch) {
      fetchCustomers(selections.branch);
      fetchWarehouses(selections.branch);
    } else {
      setCustomers([]);
      setWarehouses([]);
      setSelections((prev) => ({ ...prev, customer: "", client: "", warehouse: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections.branch]);

  // Dependent data on customer change (UI currently commented)
  useEffect(() => {
    if (selections.branch && selections.customer) {
      fetchClients(selections.branch, selections.customer);
    } else {
      setClients([]);
      setSelections((prev) => ({ ...prev, client: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections.branch, selections.customer]);

  // ---------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------
  const handleSelectionChange = (key, value) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
    if (success) setSuccess(false);
    if (error.saving) setError((prev) => ({ ...prev, saving: null }));
  };

  const formatFinancialYear = (finYear) => {
    if (finYear == null) return "";
    return `${finYear}`;
  };

  const getCustomerName = (c) =>
    c.customer || c.customerName || c.name || `Customer ${c.id}`;
  const getCustomerValue = (c) =>
    c.customer || c.customerCode || c.id?.toString() || "";

  const getBranchName = (b) =>
    b.branch || b.branchName || b.branchCode || `Branch ${b.branchId}`;
  const getBranchValue = (b) => b.branchCode || String(b.branchId ?? "");

  const getClientName = (c) =>
    c.client || c.clientName || c.name || `Client ${c.id}`;
  const getClientValue = (c) =>
    c.client || c.clientCode || c.id?.toString() || "";

  const getWarehouseName = (w) =>
    w.Warehouse || w.warehouse || w.name || `Warehouse ${w.id}`;
  const getWarehouseValue = (w) =>
    w.Warehouse || w.warehouse || w.id?.toString() || "";

  // ---------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------
  return (
    <div className="relative group">
      <button
        className="p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 flex items-center space-x-2"
        aria-label="Global selections"
      >
        <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      </button>

      <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-4 space-y-4">
          {/* Loading state for global parameters */}
          {loading.globalParams && (
            <div className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-center">
              Loading current settings...
            </div>
          )}

          {/* Error state for global parameters */}
          {error.globalParams && (
            <div className="w-full px-3 py-2 text-sm border border-yellow-300 dark:border-yellow-600 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-center">
              Unable to load current settings
            </div>
          )}

          {/* Financial Year Dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Financial Year
            </label>
            {loading.financialYears ? (
              <div className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                Loading financial years...
              </div>
            ) : error.financialYears ? (
              <div className="w-full px-3 py-2 text-sm border border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                Error: {error.financialYears}
                <button
                  onClick={fetchFinancialYears}
                  className="ml-2 text-xs underline hover:text-red-700 dark:hover:text-red-300"
                >
                  Retry
                </button>
              </div>
            ) : (
              <select
                value={selections.financialYear}
                onChange={(e) => handleSelectionChange("financialYear", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Financial Year</option>
                {financialYears.map((year) => (
                  <option
                    key={year.id ?? year.finYear}
                    value={year.finYear}
                    className={
                      year.currentFinYear
                        ? "font-semibold bg-blue-50 dark:bg-blue-900/30"
                        : ""
                    }
                  >
                    {formatFinancialYear(year.finYear)}
                    {year.currentFinYear ? "" : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Branch Dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Branch
            </label>
            {loading.branches ? (
              <div className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                Loading branches...
              </div>
            ) : error.branches ? (
              <div className="w-full px-3 py-2 text-sm border border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                Error: {error.branches}
                <button
                  onClick={fetchBranches}
                  className="ml-2 text-xs underline hover:text-red-700 dark:hover:text-red-300"
                >
                  Retry
                </button>
              </div>
            ) : (
              <select
                value={selections.branch}
                onChange={(e) => handleSelectionChange("branch", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option
                    key={branch.branchId ?? branch.branchCode}
                    value={getBranchValue(branch)}
                  >
                    {getBranchName(branch)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Success Message */}
          {success && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-600 dark:text-green-400">
                Global parameters saved successfully!
              </span>
            </div>
          )}

          {/* Error Message */}
          {error.saving && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-600 dark:text-red-400">
                {error.saving}
              </span>
            </div>
          )}

          {/* Apply Changes */}
          <button
            onClick={handleApplyChanges}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
          >
            {loading.saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              "Apply Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalSelectionDropdown;