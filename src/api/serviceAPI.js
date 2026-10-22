import apiClient from "./apiClient";

export const serviceAPI = {
  getAll: async (orgId, branch) => {
    const res = await apiClient.get(
      "/api/basicmaster/getServiceByOrgIdAndBranch",
      {
        params: { orgId, branch },
      },
    );
    return res?.paramObjectsMap?.serviceResponseVO ?? [];
  },

  getById: async (id) => {
    const res = await apiClient.get("/api/basicmaster/getServiceById", {
      params: { id },
    });
    return res?.paramObjectsMap?.serviceResponseVO ?? null;
  },

  save: async (payload) => {
    return await apiClient.put("/api/basicmaster/createUpdateService", payload);
  },
};
