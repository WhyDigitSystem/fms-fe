import apiClient from "./apiClient";

export const customerMasterAPI = {
  // ---------------------------------------------------------------
  // GET customers by branch + org
  // GET /api/basicmaster/getByCustomerByBranchAndOrgId?branchId=..&orgId=..
  // Returns: plain array of customer objects
  // ---------------------------------------------------------------
  getCustomers: async (branchId, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/basicmaster/getByCustomerByBranchAndOrgId",
        { params: { branchId, orgId } },
      );
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      return [];
    } catch (error) {
      console.error("❌ Error fetching customers:", error);
      throw error;
    }
  },

  // ---------------------------------------------------------------
  // CREATE / UPDATE customer
  // PUT /api/basicmaster/createUpdateCustomer
  // Returns: { customerVO: {...}, message: "Customer Creation Successfully" }
  // ---------------------------------------------------------------
  saveCustomer: async (payload) => {
    try {
      console.log("📤 Saving customer:", payload);
      const response = await apiClient.put(
        "/api/basicmaster/createUpdateCustomer",
        payload,
      );
      return response?.data ?? response;
    } catch (error) {
      console.error("❌ Error saving customer:", error);
      throw error;
    }
  },
};

export default customerMasterAPI;
