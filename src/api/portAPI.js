import apiClient from "./apiClient";

export const portAPI = {
  // Get all ports by organization and branch
  getAll: async (orgId, branch) => {
    try {
      const response = await apiClient.get(
        "/api/basicmaster/getPortByOrgIdAndBranch",
        {
          params: { orgId, branch },
        },
      );

      return (
        response?.data?.paramObjectsMap?.portResponseVO ??
        response?.paramObjectsMap?.portResponseVO ??
        []
      );
    } catch (error) {
      console.error("Error fetching ports:", error);
      throw error;
    }
  },

  // Get port by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get("/api/basicmaster/getPortById", {
        params: { id },
      });

      return (
        response?.data?.paramObjectsMap?.portResponseVO ??
        response?.paramObjectsMap?.portResponseVO ??
        null
      );
    } catch (error) {
      console.error("Error fetching port:", error);
      throw error;
    }
  },

  // Create or update port
  save: async (payload) => {
    try {
      const response = await apiClient.put(
        "/api/basicmaster/createUpdatePort",
        payload,
      );

      return response?.data ?? response;
    } catch (error) {
      console.error("Error saving port:", error);
      throw error;
    }
  },
};

export default portAPI;
