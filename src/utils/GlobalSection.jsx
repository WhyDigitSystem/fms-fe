import { useEffect, useRef, useState } from 'react';
import { IconWorld } from '@tabler/icons-react';
import { ToastContainer } from 'react-toastify';
import { showToast } from 'utils/toast-component';
import { GlobalParameterAPI } from '../api/globalParameter';

const GlobalSection = () => {
  const [open, setOpen] = useState(false);
  const [finYearValue, setFinYearValue] = useState('');
  const [companyValue, setCompanyValue] = useState('');
  const [customerValue, setCustomerValue] = useState('');
  const [warehouseValue, setWarehouseValue] = useState('');
  const [clientValue, setClientValue] = useState('');
  const [branchValue, setBranchValue] = useState('');
  const [orgId] = useState(parseInt(localStorage.getItem('orgId')) || '');
  const [userId] = useState(localStorage.getItem('usersId'));
  const [userName] = useState(localStorage.getItem('userName') || '');
  const [branchVO, setBranchVO] = useState([]);
  const [finVO, setFinVO] = useState([]);
  const [warehouseVO, setWarehouseVO] = useState([]);
  const [customerVO, setCustomerVO] = useState([]);
  const [clientVO, setClientVO] = useState([]);
  const [branchName, setBranchName] = useState('');
  const [loading, setLoading] = useState(false);

  const anchorRef = useRef(null);

  useEffect(() => {
    if (orgId && userId) {
      initializeData();
    }
  }, [orgId, userId]);

  const initializeData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        getGlobalParameter(),
        getAccessBranch(),
        getFinYear()
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
      showToast('error', 'Failed to load global parameters');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleBranchChange = async (event) => {
    const branchcode = event.target.value;
    const branch = branchVO.find((option) => option.branchcode === branchcode);

    if (branch) {
      setBranchName(branch.branch);
    }

    setBranchValue(branchcode);
    setCustomerValue('');
    setClientValue('');
    setWarehouseValue('');

    // Load dependent data
    if (branchcode) {
      await Promise.all([
        getCustomer(branchcode),
        getWareHouse(branchcode)
      ]);
    }
  };

  const getAccessBranch = async () => {
    try {
      const branches = await GlobalParameterAPI.getBranches(orgId, userName);
      setBranchVO(branches);
    } catch (err) {
      console.error('Error fetching branches:', err);
      showToast('error', 'Failed to load branches');
    }
  };

  const getFinYear = async () => {
    try {
      const financialYears = await GlobalParameterAPI.getFinancialYears(orgId);
      setFinVO(financialYears);
    } catch (err) {
      console.error('Error fetching financial years:', err);
      showToast('error', 'Failed to load financial years');
    }
  };

  const getCustomer = async (branchcode) => {
    try {
      const customers = await GlobalParameterAPI.getCustomer(orgId, branchcode, userName);
      setCustomerVO(customers);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setCustomerVO([]);
    }
  };

  const getClient = async (customer, branchCode) => {
    try {
      const clients = await GlobalParameterAPI.getClients(orgId, branchCode, userName, customer);
      setClientVO(clients);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setClientVO([]);
    }
  };

  const getGlobalParameter = async () => {
    try {
      const globalParameter = await GlobalParameterAPI.getCurrentGlobalParameters(orgId, userId);
      console.log('GlobalParameter', globalParameter)

      if (globalParameter) {
        setCustomerValue(globalParameter.customer || '');
        setClientValue(globalParameter.client || '');
        setFinYearValue(globalParameter.finYear || '');
        setWarehouseValue(globalParameter.warehouse || '');
        setBranchValue(globalParameter.branchcode || '');
        setBranchName(globalParameter.branch || '');

        // Update localStorage
        // localStorage.setItem('customer', globalParameter.customer || '');
        // localStorage.setItem('client', globalParameter.client || '');
        // localStorage.setItem('finYear', globalParameter.finYear || '');
        // localStorage.setItem('warehouse', globalParameter.warehouse || '');
        // localStorage.setItem('branchcode', globalParameter.branchcode || '');
        // localStorage.setItem('branch', globalParameter.branch || '');

        // Load dependent data if branchcode exists
        if (globalParameter.branchcode) {
          await Promise.all([
            getCustomer(globalParameter.branchcode),
            getClient(globalParameter.customer, globalParameter.branchcode),
            getWareHouse(globalParameter.branchcode)
          ]);
        }
      }
    } catch (err) {
      console.error('Error fetching global parameters:', err);
      showToast('error', 'Failed to load global parameters');
    }
  };

  const handleSubmit = async () => {
    if (!branchValue || !finYearValue) {
      showToast('error', 'Please select Branch and Fin Year');
      return;
    }

    const formData = {
      branch: branchName,
      branchcode: branchValue,
      customer: customerValue,
      client: clientValue,
      finYear: finYearValue,
      warehouse: warehouseValue,
      userid: String(userId),
      orgId: orgId
    };

    try {
      setLoading(true);
      await GlobalParameterAPI.saveGlobalParameters(formData);

      // Update localStorage with new values
      Object.keys(formData).forEach(key => {
        if (formData[key] && key !== 'orgId' && key !== 'userid') {
          localStorage.setItem(key, formData[key]);
        }
      });

      showToast('success', 'Global Parameters updated successfully');
      setOpen(false);
    } catch (err) {
      console.error('Error updating global parameters:', err);
      showToast('error', 'Failed to update global parameters');
    } finally {
      setLoading(false);
    }
  };

  const handleFinYearChange = (event) => {
    setFinYearValue(event.target.value);
  };

  const handleClientChange = (event) => {
    setClientValue(event.target.value);
  };

  const handleCustomerChange = async (event) => {
    const customer = event.target.value;
    setCustomerValue(customer);
    setClientValue(''); // Reset client when customer changes

    if (customer && branchValue) {
      await getClient(customer, branchValue);
    }
  };

  const handleWarehouseChange = (event) => {
    setWarehouseValue(event.target.value);
  };

  const getWareHouse = async (branchCode) => {
    try {
      const warehouses = await GlobalParameterAPI.getWarehouses(orgId, branchCode);
      setWarehouseVO(warehouses);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
      setWarehouseVO([]);
    }
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current?.focus();
    }
    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <div className="mr-4">
        <button
          ref={anchorRef}
          onClick={handleToggle}
          disabled={loading}
          className={`
            flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ease-in-out
            bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <IconWorld stroke={1.5} size="1.3rem" />
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleClose}
        />
      )}

      {/* Dropdown Panel */}
      <div
        className={`
          fixed z-50 mt-2 w-80
          transition-all duration-200 ease-in-out
          ${open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
        `}
        style={{
          right: '1rem',
          top: '100%'
        }}
      >
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  Global Parameters {loading && '(Loading...)'}
                </h3>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-4 space-y-4">
            {/* Fin Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fin Year *</label>
              <select
                value={finYearValue}
                onChange={handleFinYearChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-50"
              >
                <option value="">Select Fin Year</option>
                {finVO?.map((option) => (
                  <option key={option.id} value={option.finYear}>
                    {option.finYear}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
              <select
                value={branchValue}
                onChange={handleBranchChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-50"
              >
                <option value="">Select Branch</option>
                {branchVO.map((option) => (
                  <option key={option.branchcode} value={option.branchcode}>
                    {option.branch}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select
                value={customerValue}
                onChange={handleCustomerChange}
                disabled={loading || !branchValue}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-50"
              >
                <option value="">Select Customer</option>
                {customerVO?.map((option) => (
                  <option key={option.customer} value={option.customer}>
                    {option.customer}
                  </option>
                ))}
              </select>
            </div>

            {/* Client */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select
                value={clientValue}
                onChange={handleClientChange}
                disabled={loading || !customerValue}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-50"
              >
                <option value="">Select Client</option>
                {clientVO?.map((option) => (
                  <option key={option.client} value={option.client}>
                    {option.client}
                  </option>
                ))}
              </select>
            </div>

            {/* Warehouse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
              <select
                value={warehouseValue}
                onChange={handleWarehouseChange}
                disabled={loading || !branchValue}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-50"
              >
                <option value="">Select Warehouse</option>
                {warehouseVO?.map((option) => (
                  <option key={option.Warehouse} value={option.Warehouse}>
                    {option.Warehouse}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={loading || !branchValue || !finYearValue}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Change Parameters'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </>
  );
};

export default GlobalSection;