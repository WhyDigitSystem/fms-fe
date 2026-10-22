import apiClient from "./apiClient";

export const stateAPI = {
  // ---------------------------------------------------------------
  // GET ALL states for an org
  // GET /api/commonmaster/getAllStateByOrgId?orgid=...
  // Returns: stateVO[] (array)
  // ---------------------------------------------------------------
  getAllStates: async (orgid) => {
    const res = await apiClient.get("/api/commonmaster/getAllStateByOrgId", {
      params: { orgid },
    });
    return res?.paramObjectsMap?.stateVO ?? [];
  },

  // ---------------------------------------------------------------
  // GET a single state by id
  // GET /api/commonmaster/getStateById?stateid=...
  // Returns: stateVO (object, not array)
  // ---------------------------------------------------------------
  getStateById: async (stateid) => {
    const res = await apiClient.get("/api/commonmaster/getStateById", {
      params: { stateid },
    });
    return res?.paramObjectsMap?.stateVO ?? null;
  },

  // ---------------------------------------------------------------
  // Countries
  // ---------------------------------------------------------------
  getCountries: async (orgid) => {
    const res = await apiClient.get("/api/commonmaster/country", {
      params: { orgid },
    });
    return res?.paramObjectsMap?.countryVO ?? [];
  },

  // ---------------------------------------------------------------
  // States by country
  // ---------------------------------------------------------------
  getStatesByCountry: async (orgid, country) => {
    const res = await apiClient.get("/api/commonmaster/state/country", {
      params: { orgid, country },
    });
    return res?.paramObjectsMap?.stateVO ?? [];
  },

  // ---------------------------------------------------------------
  // Create / Update
  // ---------------------------------------------------------------
  createState: async (payload) => {
    try {
      const response = await apiClient.put(
        "/api/commonmaster/createUpdateState",
        payload
      );
      return response?.data ?? response;
    } catch (error) {
      console.error("❌ Error creating state:", error);
      throw error;
    }
  },
};

export default stateAPI;