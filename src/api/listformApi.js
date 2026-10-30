import apiClient from "./apiClient";

export const listformApi = {

  getList: async (branchId,orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getListOfValuesByOrgId?branchId=${branchId}&orgId=${orgId}`
      );
      return res?.paramObjectsMap?.listOfValues || [];
    } catch (error) {
      console.error("Error fetching countries:", error);
      throw error;
    }
  },

  getListById: async (id) => {
    try {
      const res = await apiClient.get(`/api/commonmaster/getListOfValuesById?id=${id}`);
      return res?.paramObjectsMap?.listOfValuesVO || null;
    } catch (error) {
      console.error("Error fetching country by ID:", error);
      throw error;
    }
  },

  createUpdateListofValues: async (data) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateListOfValues",
        data,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating List Of Values:", error);
      throw error;
    }
  },
};

export default listformApi;