import apiClient from "./apiClient";

export const stateAPI = {

  getStates: async (orgid) => {
    const res = await apiClient.get("/api/commonmaster/state", {
      params: { orgid },
    });
    return res?.paramObjectsMap?.stateVO ?? [];
  },

  getStateById: async (stateId) => {
    const res = await apiClient.get(`/api/commonmaster/state/${stateId}`);
    return res?.paramObjectsMap?.stateVO ?? [];
  },

  getCountries: async (orgid) => {
    const res = await apiClient.get("/api/commonmaster/country", {
      params: { orgid },
    });
    return res?.paramObjectsMap?.countryVO ?? [];
  },

  getStatesByCountry: async (orgid, country) => {
    const res = await apiClient.get("/api/commonmaster/state/country", {
      params: { orgid, country },
    });
    return res?.paramObjectsMap?.stateVO ?? [];
  },

  createState: async (payload) => {
    try {
      const response = await apiClient.post("/api/commonmaster/state", payload);
      return response?.data || response;
    } catch (error) {
      console.error("❌ Error creating state:", error);
      throw error;
    }
  },

};

export default stateAPI;