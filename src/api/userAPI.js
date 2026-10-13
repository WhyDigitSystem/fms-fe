import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8085";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const userAPI = {
  // Get all users
  getUsers: async (orgId) => {
    try {
      const response = await apiClient.get(
        `/api/auth/allUsersByOrgId?orgId=${orgId}`
      );
      return response?.data?.paramObjectsMap?.userVO || [];
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(
        `/api/auth/getUserById?userId=${userId}`
      );
      return response?.data?.paramObjectsMap?.userVO || null;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  // Create/Update user
  saveUser: async (payload) => {
    try {
      const response = await apiClient.put("/api/auth/signup", payload);
      return response.data;
    } catch (error) {
      console.error("Error saving user:", error);
      throw error;
    }
  },

  // Get roles
  getRoles: async (orgId) => {
    try {
      const response = await apiClient.get(
        `/api/auth/allActiveRolesByOrgId?orgId=${orgId}`
      );
      return response?.data?.paramObjectsMap?.rolesVO || [];
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  },

  // Get branches
  getBranches: async (orgId) => {
    try {
      const response = await apiClient.get(
        `/api/warehousemastercontroller/branch?orgid=${orgId}`
      );
      const branches = response?.data?.paramObjectsMap?.branchVO || [];
      return branches.filter((row) => row.active === "Active");
    } catch (error) {
      console.error("Error fetching branches:", error);
      throw error;
    }
  },

  // Get customers
  getCustomers: async (orgId) => {
    try {
      const response = await apiClient.get(
        `/api/warehousemastercontroller/customer?orgid=${orgId}`
      );
      return response?.data?.paramObjectsMap?.CustomerVO || [];
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  },

  // Get clients by customer
  getClientsByCustomer: async (customer, orgId) => {
    try {
      const response = await apiClient.get(
        "/api/warehousemastercontroller/client",
        {
          params: {
            customer,
            orgid: orgId,
          },
        }
      );

      return response?.data?.paramObjectsMap?.clientVO || [];
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
  },

  // Get employees
  getEmployees: async (orgId) => {
    try {
      const response = await apiClient.get(
        `/api/warehousemastercontroller/getAllEmployeeByOrgId?orgId=${orgId}`
      );
      return response?.data?.paramObjectsMap?.employeeVO || [];
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
  },
};
