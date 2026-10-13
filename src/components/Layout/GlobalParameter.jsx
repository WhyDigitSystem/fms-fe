import { Check, ChevronDown, Globe, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GlobalParameterAPI } from '../../api/globalParameter';


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
    saving: false
  });
  const [error, setError] = useState({
    globalParams: null,
    financialYears: null,
    customers: null,
    branches: null,
    clients: null,
    warehouses: null,
    saving: null
  });
  const [success, setSuccess] = useState(false);
  const [selections, setSelections] = useState({
    financialYear: '',
    branch: '',
    customer: '',
    client: '',
    warehouse: ''
  });

  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch current global parameters
  const fetchCurrentGlobalParameters = async () => {
    setLoading(prev => ({ ...prev, globalParams: true }));
    setError(prev => ({ ...prev, globalParams: null }));
    try {
      const globalParams = await GlobalParameterAPI.getCurrentGlobalParameters(user.userData.orgId, user.userData.usersId);
      setCurrentGlobalParams(globalParams);

      if (globalParams) {
        // Set the current selections from global parameters
        setSelections({
          financialYear: globalParams.finYear || '',
          branch: globalParams.branchcode || '',
          customer: globalParams.customer || '',
          client: globalParams.client || '',
          warehouse: globalParams.warehouse || ''
        });
        // localStorage.setItem("globalParams",globalParams);
        localStorage.setItem("globalParams", JSON.stringify(globalParams));

        console.log('Current global parameters loaded:', globalParams);
      }
    } catch (err) {
      setError(prev => ({ ...prev, globalParams: err.message }));
      console.error('Error fetching current global parameters:', err);
    } finally {
      setLoading(prev => ({ ...prev, globalParams: false }));
    }
  };

  // Fetch financial years
  const fetchFinancialYears = async () => {
    setLoading(prev => ({ ...prev, financialYears: true }));
    setError(prev => ({ ...prev, financialYears: null }));
    try {
      const financialYearData = await GlobalParameterAPI.getFinancialYears(user.userData.orgId);
      setFinancialYears(financialYearData);

      // Only set default if we don't have current global params
      if (!currentGlobalParams) {
        const currentFinYear = financialYearData.find(year => year.currentFinYear);
        if (currentFinYear) {
          setSelections(prev => ({
            ...prev,
            financialYear: currentFinYear.finYear.toString()
          }));
        } else if (financialYearData.length > 0) {
          setSelections(prev => ({
            ...prev,
            financialYear: financialYearData[0].finYear.toString()
          }));
        }
      }
    } catch (err) {
      setError(prev => ({ ...prev, financialYears: err.message }));
      console.error('Error fetching financial years:', err);
    } finally {
      setLoading(prev => ({ ...prev, financialYears: false }));
    }
  };

  // Fetch branches
  const fetchBranches = async () => {
    setLoading(prev => ({ ...prev, branches: true }));
    setError(prev => ({ ...prev, branches: null }));
    try {
      const branchData = await GlobalParameterAPI.getBranches(user.userData.orgId, user.userData.userName);
      setBranches(branchData);

      // Only set default if we don't have current global params
      if (!currentGlobalParams && branchData.length > 0) {
        setSelections(prev => ({
          ...prev,
          branch: branchData[0].branchcode || ''
        }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, branches: err.message }));
      console.error('Error fetching branches:', err);
    } finally {
      setLoading(prev => ({ ...prev, branches: false }));
    }
  };

  // Fetch customers based on selected branch
  const fetchCustomers = async (branchcode) => {
    if (!branchcode) {
      setCustomers([]);
      setSelections(prev => ({ ...prev, customer: '', client: '', warehouse: '' }));
      return;
    }

    setLoading(prev => ({ ...prev, customers: true }));
    setError(prev => ({ ...prev, customers: null }));
    try {
      const customerData = await GlobalParameterAPI.getCustomer(user.userData.orgId, branchcode, user.userData.userName);
      setCustomers(customerData);

      // Only set default if we don't have current global params for this branch
      if (!currentGlobalParams || currentGlobalParams.branchcode !== branchcode) {
        if (customerData.length > 0) {
          setSelections(prev => ({
            ...prev,
            customer: customerData[0].customer || ''
          }));
        } else {
          setSelections(prev => ({ ...prev, customer: '', client: '', warehouse: '' }));
        }
      }
    } catch (err) {
      setError(prev => ({ ...prev, customers: err.message }));
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(prev => ({ ...prev, customers: false }));
    }
  };

  // Fetch clients based on selected branch and customer
  const fetchClients = async (branchcode, customer) => {
    if (!branchcode || !customer) {
      setClients([]);
      setSelections(prev => ({ ...prev, client: '' }));
      return;
    }

    setLoading(prev => ({ ...prev, clients: true }));
    setError(prev => ({ ...prev, clients: null }));
    try {
      const clientData = await GlobalParameterAPI.getClients(user.userData.orgId, branchcode, user.userData.userName, customer);
      setClients(clientData);

      // Only set default if we don't have current global params for this branch and customer
      if (!currentGlobalParams ||
        currentGlobalParams.branchcode !== branchcode ||
        currentGlobalParams.customer !== customer) {
        if (clientData.length > 0) {
          setSelections(prev => ({
            ...prev,
            client: clientData[0].client || ''
          }));
        } else {
          setSelections(prev => ({ ...prev, client: '' }));
        }
      }
    } catch (err) {
      setError(prev => ({ ...prev, clients: err.message }));
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(prev => ({ ...prev, clients: false }));
    }
  };

  // Fetch warehouses based on selected branch
  const fetchWarehouses = async (branchcode) => {
    if (!branchcode) {
      setWarehouses([]);
      setSelections(prev => ({ ...prev, warehouse: '' }));
      return;
    }

    setLoading(prev => ({ ...prev, warehouses: true }));
    setError(prev => ({ ...prev, warehouses: null }));
    try {
      const warehouseData = await GlobalParameterAPI.getWarehouses(user.userData.orgId, branchcode);
      setWarehouses(warehouseData);

      // Only set default if we don't have current global params for this branch
      if (!currentGlobalParams || currentGlobalParams.branchcode !== branchcode) {
        if (warehouseData.length > 0) {
          setSelections(prev => ({
            ...prev,
            warehouse: warehouseData[0].Warehouse || ''
          }));
        } else {
          setSelections(prev => ({ ...prev, warehouse: '' }));
        }
      }
    } catch (err) {
      setError(prev => ({ ...prev, warehouses: err.message }));
      console.error('Error fetching warehouses:', err);
    } finally {
      setLoading(prev => ({ ...prev, warehouses: false }));
    }
  };

  // Save global parameters
  const handleApplyChanges = async () => {
    if (
      !selections.financialYear ||
      !selections.branch ||
      !selections.customer ||
      !selections.client ||
      !selections.warehouse
    ) {
      setError(prev => ({ ...prev, saving: "Please fill all required fields" }));
      return;
    }

    setLoading(prev => ({ ...prev, saving: true }));
    setError(prev => ({ ...prev, saving: null }));
    setSuccess(false);

    try {
      const selectedBranch = branches.find(
        item => item.branchcode === selections.branch
      );

      const payload = {
        branch: selectedBranch?.branch || "",
        branchcode: selections.branch,
        customer: selections.customer,
        client: selections.client,
        finYear: selections.financialYear,
        warehouse: selections.warehouse,
        userid: user.userData.usersId,
        orgId: user.userData.orgId,
      };

      console.log("Saving Payload:", payload);

      const response = await GlobalParameterAPI.saveGlobalParameters(payload);

      if (response.status) {

        // Update localStorage
        localStorage.setItem("branch", payload.branch);
        localStorage.setItem("branchcode", payload.branchcode);
        localStorage.setItem("customer", payload.customer);
        localStorage.setItem("client", payload.client);
        localStorage.setItem("finYear", payload.finYear);
        localStorage.setItem("warehouse", payload.warehouse);

        // Optional: store everything together
        localStorage.setItem("globalParams", JSON.stringify(payload));

        setCurrentGlobalParams(payload);
        setSuccess(true);

        console.log("Updated localStorage:", payload);
        window.location.reload(true);

        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(response.message || "Failed to save global parameters");
      }
    } catch (err) {
      setError(prev => ({ ...prev, saving: err.message }));
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  // Initial data fetch - first get current global params, then other data
  useEffect(() => {
    const initializeData = async () => {
      await fetchCurrentGlobalParameters();
      await fetchFinancialYears();
      await fetchBranches();
    };
    initializeData();
  }, []);

  // Fetch dependent data when branch is set (from current global params or user selection)
  useEffect(() => {
    if (selections.branch) {
      fetchCustomers(selections.branch);
      fetchWarehouses(selections.branch);
    } else {
      setCustomers([]);
      setWarehouses([]);
      setSelections(prev => ({ ...prev, customer: '', client: '', warehouse: '' }));
    }
  }, [selections.branch]);

  // Fetch clients when customer changes
  useEffect(() => {
    if (selections.branch && selections.customer) {
      fetchClients(selections.branch, selections.customer);
    } else {
      setClients([]);
      setSelections(prev => ({ ...prev, client: '' }));
    }
  }, [selections.branch, selections.customer]);

  const handleSelectionChange = (key, value) => {
    setSelections(prev => ({
      ...prev,
      [key]: value
    }));
    // Clear success message when user changes selection
    if (success) setSuccess(false);
    if (error.saving) setError(prev => ({ ...prev, saving: null }));
  };

  const formatFinancialYear = (finYear) => {
    return `${finYear}-${parseInt(finYear) + 1}`;
  };

  const getCustomerName = (customer) => {
    return customer.customer || customer.customerName || customer.name || `Customer ${customer.id}`;
  };

  const getCustomerValue = (customer) => {
    return customer.customer || customer.customerCode || customer.id?.toString() || '';
  };

  const getBranchName = (branch) => {
    return branch.branch || branch.branchName || branch.branchcode || `Branch ${branch.branchcode}`;
  };

  const getBranchValue = (branch) => {
    return branch.branchcode || branch.id?.toString() || '';
  };

  const getClientName = (client) => {
    return client.client || client.clientName || client.name || `Client ${client.id}`;
  };

  const getClientValue = (client) => {
    return client.client || client.clientCode || client.id?.toString() || '';
  };

  const getWarehouseName = (warehouse) => {
    return warehouse.Warehouse || warehouse.warehouse || warehouse.name || `Warehouse ${warehouse.id}`;
  };

  const getWarehouseValue = (warehouse) => {
    return warehouse.Warehouse || warehouse.warehouse || warehouse.id?.toString() || '';
  };

  // Show current settings in the dropdown header
  const getCurrentSettingsText = () => {
    if (loading.globalParams) return "Loading current settings...";
    if (currentGlobalParams) {
      return `Current: ${currentGlobalParams.branch} - ${currentGlobalParams.customer}`;
    }
    return "Global Selections";
  };

  return (
    <div className="relative group">
      <button
        className="p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 flex items-center space-x-2"
        aria-label="Global selections"
      >
        <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        {/* <ChevronDown className="h-4 w-4 text-gray-400" /> */}
      </button>

      <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-4 space-y-4">
          {/* <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {getCurrentSettingsText()}
          </div> */}

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
                onChange={(e) => handleSelectionChange('financialYear', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Financial Year</option>
                {financialYears.map((year) => (
                  <option
                    key={year.id}
                    value={year.finYear}
                    className={year.currentFinYear ? 'font-semibold bg-blue-50 dark:bg-blue-900/30' : ''}
                  >
                    {formatFinancialYear(year.finYear)}
                    {year.currentFinYear}
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
                onChange={(e) => handleSelectionChange('branch', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option
                    key={getBranchValue(branch)}
                    value={getBranchValue(branch)}
                  >
                    {getBranchName(branch)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Customer Dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Customer
            </label>
            {loading.customers ? (
              <div className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                Loading customers...
              </div>
            ) : error.customers ? (
              <div className="w-full px-3 py-2 text-sm border border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                Error: {error.customers}
                <button
                  onClick={() => fetchCustomers(selections.branch)}
                  className="ml-2 text-xs underline hover:text-red-700 dark:hover:text-red-300"
                >
                  Retry
                </button>
              </div>
            ) : (
              <select
                value={selections.customer}
                onChange={(e) => handleSelectionChange('customer', e.target.value)}
                disabled={!selections.branch}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">
                  {!selections.branch ? 'Select branch first' : 'Select Customer'}
                </option>
                {customers.map((customer) => (
                  <option
                    key={getCustomerValue(customer)}
                    value={getCustomerValue(customer)}
                  >
                    {getCustomerName(customer)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Client Dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Client
            </label>
            {loading.clients ? (
              <div className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                Loading clients...
              </div>
            ) : error.clients ? (
              <div className="w-full px-3 py-2 text-sm border border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                Error: {error.clients}
                <button
                  onClick={() => fetchClients(selections.branch, selections.customer)}
                  className="ml-2 text-xs underline hover:text-red-700 dark:hover:text-red-300"
                >
                  Retry
                </button>
              </div>
            ) : (
              <select
                value={selections.client}
                onChange={(e) => handleSelectionChange('client', e.target.value)}
                disabled={!selections.branch || !selections.customer}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">
                  {!selections.branch ? 'Select branch first' :
                    !selections.customer ? 'Select customer first' : 'Select Client'}
                </option>
                {clients.map((client) => (
                  <option
                    key={getClientValue(client)}
                    value={getClientValue(client)}
                  >
                    {getClientName(client)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Warehouse Dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Warehouse
            </label>
            {loading.warehouses ? (
              <div className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                Loading warehouses...
              </div>
            ) : error.warehouses ? (
              <div className="w-full px-3 py-2 text-sm border border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                Error: {error.warehouses}
                <button
                  onClick={() => fetchWarehouses(selections.branch)}
                  className="ml-2 text-xs underline hover:text-red-700 dark:hover:text-red-300"
                >
                  Retry
                </button>
              </div>
            ) : (
              <select
                value={selections.warehouse}
                onChange={(e) => handleSelectionChange('warehouse', e.target.value)}
                disabled={!selections.branch}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">
                  {!selections.branch ? 'Select branch first' : 'Select Warehouse'}
                </option>
                {warehouses.map((warehouse) => (
                  <option
                    key={getWarehouseValue(warehouse)}
                    value={getWarehouseValue(warehouse)}
                  >
                    {getWarehouseName(warehouse)}
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

          {/* Change Button */}
          <button
            onClick={handleApplyChanges}
            // disabled={loading.globalParams || loading.financialYears || loading.customers || loading.branches || loading.clients || loading.warehouses || loading.saving || 
            //          !selections.financialYear || !selections.customer || !selections.branch || !selections.client || !selections.warehouse}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
          >
            {loading.saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Apply Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalSelectionDropdown;