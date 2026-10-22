import apiClient from "./apiClient";

export const productAPI = {
  getAll: async (orgId, branch) => {
    const res = await apiClient.get(
      "/api/basicmaster/getProductByOrgIdAndBranch",
      {
        params: { orgId, branch },
      },
    );
    return res?.paramObjectsMap?.productResponseVO ?? [];
  },

  getById: async (id) => {
    const res = await apiClient.get("/api/basicmaster/getProductById", {
      params: { id },
    });
    return res?.paramObjectsMap?.productResponseVO ?? null;
  },

  save: async (payload) => {
    return await apiClient.put("/api/basicmaster/createUpdateProduct", payload);
  },
};
