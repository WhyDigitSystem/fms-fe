import apiClient from "../apiClient";

export const QuotationAPI = {
  getQuotationByOrgIdAndBranch: async (branchId, orgId) => {
    try {
      const res = await apiClient.get("/api/sales/getQuotationByOrgIdAndBranch", {
        params: { branch: branchId, orgId },
      });
      const body = res?.data ?? res;
      return body?.paramObjectsMap?.quotationVO || [];
    } catch (error) {
      console.error("❌ Error fetching quotations:", error);
      throw error;
    }
  },

  getQuotationById: async (id) => {
    try {
      const res = await apiClient.get("/api/sales/getQuotationById", {
        params: { id },
      });
      const body = res?.data ?? res;
      return body?.paramObjectsMap?.quotationVO || null;
    } catch (error) {
      console.error("❌ Error fetching quotation by id:", error);
      throw error;
    }
  },

  getQuotationDocId: async (orgId) => {
    try {
      const res = await apiClient.get("/api/sales/getQuotationDocId", {
        params: { orgId },
      });
      const body = res?.data ?? res;
      return body?.paramObjectsMap?.quotationDocId ?? "";
    } catch (error) {
      console.error("❌ Error fetching quotation DocId:", error);
      throw error;
    }
  },

  /* ✅ New API for Revision */
  getNextQuotationRevision: async (docId) => {
    try {
      const res = await apiClient.get(
        "/api/sales/getNextQuotationRevision",
        {
          params: { docId },
        }
      );
      const body = res?.data ?? res;
      return {
        docId: body?.paramObjectsMap?.docId ?? "",
        revisionNo: body?.paramObjectsMap?.revisionNo ?? 0,
      };
    } catch (error) {
      console.error("❌ Error fetching next quotation revision:", error);
      throw error;
    }
  },

  createUpdateQuotation: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/sales/createUpdateQuotation",
        payload
      );
      return res?.data ?? res;
    } catch (error) {
      console.error("❌ Error saving quotation:", error);
      throw error;
    }
  },
};

export default QuotationAPI;