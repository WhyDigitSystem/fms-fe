import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8085";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log("🚀 [Employee API] Making request:", {
      url: config.url,
      method: config.method,
      data: config.data,
      params: config.params,
    });
    return config;
  },
  (error) => {
    console.error("❌ [Employee API] Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ [Employee API] Response received:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("❌ [Employee API] Response error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export const employeeAPI = {
  // Get all employees
  getEmployees: async (orgId) => {
    try {
      const response = await apiClient.get(
        `/api/warehousemastercontroller/getAllEmployeeByOrgId?orgId=${orgId}`
      );

      console.log("📦 [Employee API] Raw response:", response.data);

      // Extract employees from different possible response structures
      let employees = [];

      if (response?.data?.paramObjectsMap?.employeeVO) {
        console.log("✅ Found employees in paramObjectsMap.employeeVO");
        employees = response.data.paramObjectsMap.employeeVO;
      } else if (response?.data?.employeeVO) {
        console.log("✅ Found employees in data.employeeVO");
        employees = response.data.employeeVO;
      } else if (Array.isArray(response?.data)) {
        console.log("✅ Found employees in data array");
        employees = response.data;
      } else {
        console.warn("⚠️ No employees found in expected structure");
        employees = [];
      }

      console.log("📊 Extracted employees:", employees);
      return employees;
    } catch (error) {
      console.error("❌ Error fetching employees:", error);
      throw error;
    }
  },

  // Get employee by ID
  getEmployeeById: async (employeeId) => {
    try {
      const response = await apiClient.get(
        `/api/warehousemastercontroller/employee/${employeeId}`
      );
      return response?.data?.paramObjectsMap?.employeeVO || null;
    } catch (error) {
      console.error("Error fetching employee:", error);
      throw error;
    }
  },

  // Create/Update employee
  saveEmployee: async (payload) => {
    try {
      const response = await apiClient.put(
        "/api/warehousemastercontroller/createUpdateEmployee",
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error saving employee:", error);
      throw error;
    }
  },

  // Bulk upload employees
  bulkUpload: async (file, orgId, createdBy) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post(
        `/api/warehousemastercontroller/EmployeeUpload?orgId=${orgId}&createdBy=${createdBy}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error in employee bulk upload:", error);
      throw error;
    }
  },
};

export const commonAPI = {
  // Get all active branches
  getBranches: async (orgId) => {
    try {
      const response = await apiClient.get(
        `/api/commonmaster/getAllActiveBranches?orgId=${orgId}`
      );

      console.log("🏢 [Common API] Branches response:", response.data);

      // Extract branches from different possible response structures
      let branches = [];

      if (response?.data?.paramObjectsMap?.branchVOs) {
        console.log("✅ Found branches in paramObjectsMap.branchVOs");
        branches = response.data.paramObjectsMap.branchVOs;
      } else if (response?.data?.branchVOs) {
        console.log("✅ Found branches in data.branchVOs");
        branches = response.data.branchVOs;
      } else if (Array.isArray(response?.data)) {
        console.log("✅ Found branches in data array");
        branches = response.data;
      } else {
        console.warn("⚠️ No branches found in expected structure");
        branches = [];
      }

      console.log("📊 Extracted branches:", branches);
      return branches;
    } catch (error) {
      console.error("❌ Error fetching branches:", error);
      throw error;
    }
  },
};
