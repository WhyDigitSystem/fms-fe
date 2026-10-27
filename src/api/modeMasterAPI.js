import apiClient from "./apiClient";

export const modeMasterAPI = {
  // Get all modes by organization ID
  getAll: async (orgId) => {
    try {
      const response = await apiClient.get(
        "/api/commonmaster/getModeMasterByOrgId",
        {
          params: { orgId },
        },
      );

      const result =
        response?.data?.paramObjectsMap?.modeMasterVO ??
        response?.paramObjectsMap?.modeMasterVO ??
        [];

      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("Error fetching modes:", error);
      throw error;
    }
  },

  // Get mode by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(
        "/api/commonmaster/getModeMasterById",
        {
          params: { id },
        },
      );

      return (
        response?.data?.paramObjectsMap?.modeMasterVO ??
        response?.paramObjectsMap?.modeMasterVO ??
        null
      );
    } catch (error) {
      console.error("Error fetching mode:", error);
      throw error;
    }
  },

  // Create or update mode
  save: async (payload) => {
    try {
      const response = await apiClient.put(
        "/api/commonmaster/createUpdateModeMaster",
        payload,
      );

      return response?.data ?? response;
    } catch (error) {
      console.error("Error saving mode:", error);
      throw error;
    }
  },
};

export default modeMasterAPI;
