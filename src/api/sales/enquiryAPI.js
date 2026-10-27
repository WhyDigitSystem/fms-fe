import apiClient from "../apiClient";

export const EnquiryAPI = {

    getEnquiryByOrgId: async (branchId, orgId) => {
        try {
            const res = await apiClient.get("/api/sales/getEnquiryByOrgId", {
                params: { branch: branchId, orgId },
            });
            const body = res?.data ?? res;
            return body?.paramObjectsMap?.enquiryResponseVO ?? [];
        } catch (error) {
            console.error("❌ Error fetching enquiries:", error);
            throw error;
        }
    },

    getEnquiryById: async (id) => {
        try {
            const res = await apiClient.get("/api/sales/getEnquiryById", {
                params: { id },
            });
            const body = res?.data ?? res;
            return body?.paramObjectsMap?.enquiryResponseVO ?? null;
        } catch (error) {
            console.error("❌ Error fetching enquiry by id:", error);
            throw error;
        }
    },

    getEnquiryDocId: async (orgId) => {
        try {
            const res = await apiClient.get("/api/sales/getEnquiryDocId", {
                params: { orgId },
            });
            return res?.paramObjectsMap?.enquiryDocId ?? "";
        } catch (error) {
            console.error("❌ Error fetching enquiry DocId:", error);
            throw error;
        }
    },

    createUpdateEnquiry: async (payload) => {
        try {
            const res = await apiClient.put("/api/sales/createUpdateEnquiry", payload);
            return res?.data ?? res;
        } catch (error) {
            console.error("❌ Error saving enquiry:", error);
            throw error;
        }
    },
};

export default EnquiryAPI;