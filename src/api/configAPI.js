import apiClient from "./apiClient";

export const configAPI = {
  getAll: async (orgId, branch) => {
    const res = await apiClient.get(
      "/api/basicmaster/getConfigbyOrgIdandBranch",
      { params: { orgId, branch } },
    );

    return res?.paramObjectsMap?.configResponseVO ?? [];
  },

  getById: async (id) => {
    const res = await apiClient.get("/api/basicmaster/getConfigById", {
      params: { id },
    });

    return res?.paramObjectsMap?.configResponseVO ?? null;
  },

  save: async (payload) => {
    const res = await apiClient.put(
      "/api/basicmaster/createUpdateConfig",
      payload,
    );

    return res?.data ?? res;
  },
};

export default configAPI;
