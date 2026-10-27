import apiClient from "./apiClient";

export const currencyAPI = {
  // ✅ Get all currencies for the list
  getAllCurrencies: async (orgId) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getAllCurrencyByOrgId", {
        params: { orgid: orgId },
      });
      const body = res?.data ?? res;
      return body?.paramObjectsMap?.currencyVO || [];
    } catch (error) {
      console.error("❌ Error fetching currencies:", error);
      throw error;
    }
  },

  // ✅ Get single currency by ID for editing
  getCurrencyById: async (currencyId) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getCurrencyById", {
        params: { currencyid: currencyId },
      });
      const body = res?.data ?? res;
      return body?.paramObjectsMap?.currencyVO || null;
    } catch (error) {
      console.error("❌ Error fetching currency by id:", error);
      throw error;
    }
  },

  // Get country dropdown
  getCountries: async (orgId) => {
    try {
      const res = await apiClient.get("/api/commonmaster/country", {
        params: { orgid: orgId },
      });
      const body = res?.data ?? res;
      return body?.paramObjectsMap?.countryVO || [];
    } catch (error) {
      console.error("❌ Error fetching countries:", error);
      throw error;
    }
  },

  // Create or update
  createUpdateCurrency: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/createUpdateCurrency",
        payload
      );
      return res?.data ?? res;
    } catch (error) {
      console.error("❌ Error saving currency:", error);
      throw error;
    }
  },
};

export default currencyAPI;