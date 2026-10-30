import apiClient from "./apiClient";

const listOfValuesAPI = {
  getListOfValuesByOrgId: async (branchId, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getListOfValuesByOrgId?branchId=${branchId}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.listOfValues || [];
    } catch (error) {
      console.error("Error fetching List Of Values:", error);
      throw error;
    }
  },

  // Backend endpoint: GET /api/commonmaster/getListValuesGroup
  // Returns the value-level rows of a LOV list by its description, as
  // [{ valuesDescription, id }, ...] under paramObjectsMap.listValues.
  getListValuesGroup: async (listDescription, orgId) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getListValuesGroup", {
        params: { listDescription, orgId },
      });
      return res?.paramObjectsMap?.listValues || [];
    } catch (error) {
      console.error(
        `Error fetching list values group "${listDescription}":`,
        error,
      );
      throw error;
    }
  },
};

export default listOfValuesAPI;
