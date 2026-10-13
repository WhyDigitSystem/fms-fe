import apiClient from "./apiClient";

export const settingsAPI = {
  //user Management
  getUser: (payload) => apiClient.get("/api/auth/getAllUsersList", payload),

   createApprovalUserList: (payload) => apiClient.put("/api/auth/createApprovalUserList", null, {
    params: payload
  }),
};
