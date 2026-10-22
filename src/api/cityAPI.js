import apiClient from "./apiClient";

export const masterAPI = {
  // ---------------------------------------------------------------
  // GET ALL cities for an org
  // GET /api/commonmaster/getAllCityByOrgId?orgid=...
  // Returns: cityVO[] (array)
  // ---------------------------------------------------------------
  getAllCities: async (orgid) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getAllCityByOrgId",
        { params: { orgid } }
      );
      return res?.paramObjectsMap?.cityVO ?? [];
    } catch (error) {
      console.error("Error fetching cities:", error);
      throw error;
    }
  },

  // Backward-compat alias (in case any other file calls getCities)
  getCities: async (orgid) => masterAPI.getAllCities(orgid),

  // ---------------------------------------------------------------
  // GET city by id
  // GET /api/commonmaster/cityById?cityid=...
  // Returns: cityVO (object, not array)
  // ---------------------------------------------------------------
  getCityById: async (cityid) => {
    try {
      const res = await apiClient.get("/api/commonmaster/cityById", {
        params: { cityid },
      });
      return res?.paramObjectsMap?.cityVO ?? null;
    } catch (error) {
      console.error("Error fetching city:", error);
      throw error;
    }
  },

  // ---------------------------------------------------------------
  // GET cities by state (kept — not in this task but used elsewhere)
  // ---------------------------------------------------------------
  getCitiesByState: async (orgid, state) => {
    try {
      const res = await apiClient.get("/api/commonmaster/city/state", {
        params: { orgid, state },
      });
      return res?.paramObjectsMap?.cityVO ?? (Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error fetching cities by state:", error);
      throw error;
    }
  },

  // ---------------------------------------------------------------
  // GET states by country id
  // GET /api/commonmaster/getStateByCountry?country=<id>&orgid=<id>
  // ---------------------------------------------------------------
  getStateByCountry: async (countryId, orgid) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getStateByCountry",
        { params: { country: countryId, orgid } }
      );
      return res?.paramObjectsMap?.stateVO ?? (Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error fetching states by country:", error);
      throw error;
    }
  },

  // Legacy alias
  getState: async (orgid, countryId) =>
    masterAPI.getStateByCountry(countryId, orgid),

  // ---------------------------------------------------------------
  // CREATE / UPDATE city
  // ---------------------------------------------------------------
  saveCity: async (payload) => {
    try {
      console.log("📤 Saving city:", payload);
      const response = await apiClient.put(
        "/api/commonmaster/createUpdateCity",
        payload
      );
      return response?.data ?? response;
    } catch (error) {
      console.error("❌ Error saving city:", error);
      throw error;
    }
  },

  // ---------------------------------------------------------------
  // Countries
  // ---------------------------------------------------------------
  getCountries: async (orgid) => {
    try {
      const res = await apiClient.get("/api/commonmaster/country", {
        params: { orgid },
      });
      return res?.paramObjectsMap?.countryVO ?? [];
    } catch (error) {
      console.error("❌ Error fetching countries:", error);
      throw error;
    }
  },
};

export default masterAPI;