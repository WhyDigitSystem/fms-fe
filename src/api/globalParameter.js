import apiClient from "./apiClient";

export const GlobalParameterAPI = {
  getFinancialYears: async (orgId) => {
    const res = await apiClient.get("/api/commonmaster/getAllAciveFInYear", {
      params: { orgId },
    });
    return res?.paramObjectsMap?.financialYearVOs ?? [];
  },

  getBranches: async (orgid, userName) => {
    const res = await apiClient.get(
      "/api/commonmaster/globalparamBranchByUserName",
      {
        params: { orgid, userName },
      }
    );
    return res?.paramObjectsMap?.GlopalParameters ?? [];
  },

  getCustomer: async (orgid, branchcode, userName) => {
    const res = await apiClient.get(
      "/api/commonmaster/globalparamCustomerByUserName",
      {
        params: { orgid, branchcode, userName },
      }
    );
    return res?.paramObjectsMap?.GlopalParameterCustomer ?? [];
  },
  getClients: async (orgid, branchcode, userName, customer) => {
    const res = await apiClient.get(
      "/api/commonmaster/globalparamClientByUserName",
      {
        params: { orgid, branchcode, userName, customer },
      }
    );
    return res?.paramObjectsMap?.GlopalParameterClient ?? [];
  },
  getWarehouses: async (orgid, branchcode) => {
    const res = await apiClient.get(
      "/api/warehousemastercontroller/warehouse/branch",
      {
        params: { orgid, branchcode },
      }
    );
    return res?.paramObjectsMap?.Warehouse;
  },

  getCurrentGlobalParameters: async (orgid, userId) => {
    const res = await apiClient.get("/api/commonmaster/globalparam/username", {
      params: { orgid, userId },
    });
    return res?.paramObjectsMap?.globalParam;
    
  },

  saveGlobalParameters: async (data) => {
    const res = await apiClient.put("/api/commonmaster/globalparam", data);
    return res;
  },
};
