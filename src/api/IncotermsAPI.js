import apiClient from "./apiClient";

export const IncotermsAPI = {
    // ✅ Get All Incoterms
    getIncotermsByOrgId: async (orgId) => {
        try {
            const res = await apiClient.get("/api/basicmaster/getIncotermByOrgId", {
                params: { orgId },
            });
            const body = res?.data ?? res;
            return body?.paramObjectsMap?.incotermVO || [];
        } catch (error) {
            console.error("❌ Error fetching Incoterms:", error);
            throw error;
        }
    },

    // ✅ Get Incoterm by ID
    getIncotermById: async (id) => {
        try {
            const res = await apiClient.get("/api/basicmaster/getIncotermById", {
                params: { id },
            });
            const body = res?.data ?? res;
            return body?.paramObjectsMap?.incotermVO || null;
        } catch (error) {
            console.error("❌ Error fetching Incoterm by ID:", error);
            throw error;
        }
    },

    // ✅ Create / Update Incoterm
    createUpdateIncoterm: async (payload) => {
        try {
            const res = await apiClient.put("/api/basicmaster/createUpdateIncoterm", payload);
            return res?.data ?? res;
        } catch (error) {
            console.error("❌ Error saving Incoterm:", error);
            throw error;
        }
    },
};

export default IncotermsAPI;