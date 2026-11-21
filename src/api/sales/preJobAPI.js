import apiClient from "../apiClient";

export const PreJobAPI = {
    // ✅ Get All Pre-Jobs
    getPreJobByOrgIdAndBranch: async (branchId, orgId) => {
        try {
            const res = await apiClient.get("/api/sales/getPrejobByOrgIdAndBranch", {
                params: { branch: branchId, orgId },
            });
            const body = res?.data ?? res;
            return body?.paramObjectsMap?.prejobVO || [];
        } catch (error) {
            console.error("❌ Error fetching Pre-Jobs:", error);
            throw error;
        }
    },

    // ✅ Get Pre-Job By ID (For Editing)
    getPreJobById: async (id) => {
        try {
            const res = await apiClient.get("/api/sales/getPrejobById", {
                params: { id },
            });
            const body = res?.data ?? res;
            return body?.paramObjectsMap?.prejobVO || null;
        } catch (error) {
            console.error("❌ Error fetching Pre-Job by ID:", error);
            throw error;
        }
    },

    // ✅ Fetch auto-generated Pre-Job DocId
    getPreJobDocId: async (orgId) => {
        try {
            const res = await apiClient.get("/api/sales/getPrejobDocId", {
                params: { orgId },
            });
            const body = res?.data ?? res;
            return body?.paramObjectsMap?.prejobDocId ?? "";
        } catch (error) {
            console.error("❌ Error fetching Pre-Job DocId:", error);
            throw error;
        }
    },

    // ✅ Create / Update Pre-Job
    createUpdatePreJob: async (payload, files = []) => {
        try {
            const formData = new FormData();
            const jsonBlob = new Blob([JSON.stringify(payload)], {
                type: "application/json",
            });
            formData.append("prejob", jsonBlob);

            if (files && files.length > 0) {
                files.forEach((file) => {
                    formData.append("files", file);
                });
            }

            const res = await apiClient.put(
                "/api/sales/createUpdatePrejob",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return res?.data ?? res;
        } catch (error) {
            console.error("❌ Error saving pre-job:", error);
            throw error;
        }
    },
};

export default PreJobAPI;