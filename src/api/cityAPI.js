import apiClient from "./apiClient";

export const masterAPI = {
  getCities: async (orgid) => {
    try {
      const res = await apiClient.get("/api/commonmaster/city", {
        params: { orgid: orgid },
      });
      return res?.data || res?.paramObjectsMap?.cityVO || res || [];
    } catch (error) {
      console.error("Error fetching cities:", error);
      throw error;
    }
  },

  getCityById: async (cityId) => {
    try {
      const res = await apiClient.get(`/api/commonmaster/city/${cityId}`);
      return res?.data || res?.paramObjectsMap?.cityVO || res || null;
    } catch (error) {
      console.error("Error fetching city:", error);
      throw error;
    }
  },

  getCitiesByState: async (orgid, state) => {
    try {
      const res = await apiClient.get("/api/commonmaster/city/state", {
        params: { orgid, state },
      });
      return res?.data || res?.paramObjectsMap?.cityVO || res || [];
    } catch (error) {
      console.error("Error fetching cities by state:", error);
      throw error;
    }
  },

  // Unified create/update function
  saveCity: async (payload) => {
    try {
      console.log("📤 Saving city with payload:", payload);
      const response = await apiClient.post(
        "/api/commonmaster/createUpdateCity",
        payload
      );
      console.log("📥 Save response:", response);
      return response?.data || response;
    } catch (error) {
      console.error("❌ Error saving city:", error);
      throw error;
    }
  },

  getCountries: async (orgid) => {
    try {
      const res = await apiClient.get("/api/commonmaster/country", {
        params: { orgid },
      });
      return res?.paramObjectsMap?.countryVO || [];
    } catch (error) {
      console.error("❌ Error fetching countries:", error);
      throw error;
    }
  },

  getState: async (orgid, country) => {
    try {
      const res = await apiClient.get("/api/commonmaster/state/country", {
        params: { orgid, country },
      });
      return res?.paramObjectsMap?.stateVO || [];
    } catch (error) {
      console.error("❌ Error fetching states:", error);
      throw error;
    }
  },
};

export default masterAPI;