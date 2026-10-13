// src/api/itAdmin/newEntry.js
import apiClient from "../api/apiClient";

export const companyAPI = {
    // Create a new company
    createCompany: async (payload) => {
        try {
            const response = await apiClient.post("/api/commonmaster/company", payload);
            return response;
        } catch (error) {
            console.error("Error creating company:", error);
            throw error;
        }
    },

    // Update an existing company
    updateCompany: async (payload) => {
        try {
            const response = await apiClient.put("/api/commonmaster/updateCompany", payload);
            return response;
        } catch (error) {
            console.error("Error updating company:", error);
            throw error;
        }
    },

    // Get all companies
    getAllCompanies: async (orgId) => {
        try {
            const response = await apiClient.get("/api/commonmaster/company", {
                params: { orgId: orgId }
            });
            return response;
        } catch (error) {
            console.error("Error fetching companies:", error);
            throw error;
        }
    },

    // Get company by ID
    getCompanyById: async (id) => {
        try {
            const response = await apiClient.get(`/api/commonmaster/company/${id}`);
            return response;
        } catch (error) {
            console.error("Error fetching company by ID:", error);
            throw error;
        }
    },

    // Delete a company
    deleteCompany: async (id) => {
        try {
            const response = await apiClient.delete(`/api/commonmaster/company/${id}`);
            return response;
        } catch (error) {
            console.error("Error deleting company:", error);
            throw error;
        }
    },

    // Get company by code
    getCompanyByCode: async (companyCode) => {
        try {
            const response = await apiClient.get("/api/commonmaster/company/code", {
                params: { companyCode: companyCode }
            });
            return response;
        } catch (error) {
            console.error("Error fetching company by code:", error);
            throw error;
        }
    },

    // Get company by name
    getCompanyByName: async (companyName) => {
        try {
            const response = await apiClient.get("/api/commonmaster/company/name", {
                params: { companyName: companyName }
            });
            return response;
        } catch (error) {
            console.error("Error fetching company by name:", error);
            throw error;
        }
    },

    // Get company by admin email
    getCompanyByEmail: async (email) => {
        try {
            const response = await apiClient.get("/api/commonmaster/company/email", {
                params: { email: email }
            });
            return response;
        } catch (error) {
            console.error("Error fetching company by email:", error);
            throw error;
        }
    },

    // Get company statistics
    getCompanyStats: async (orgId) => {
        try {
            const response = await apiClient.get("/api/commonmaster/company/stats", {
                params: { orgId: orgId }
            });
            return response;
        } catch (error) {
            console.error("Error fetching company statistics:", error);
            throw error;
        }
    },

    // Bulk upload companies
    bulkUploadCompanies: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post("/api/commonmaster/company/bulk", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response;
        } catch (error) {
            console.error("Error bulk uploading companies:", error);
            throw error;
        }
    },

    // Export companies
    exportCompanies: async (orgId) => {
        try {
            const response = await apiClient.get("/api/commonmaster/company/export", {
                params: { orgId: orgId },
                responseType: 'blob', // For file download
            });
            return response;
        } catch (error) {
            console.error("Error exporting companies:", error);
            throw error;
        }
    },

    // Toggle company status (Activate/Deactivate)
    toggleCompanyStatus: async (id, active) => {
        try {
            const response = await apiClient.patch(`/api/commonmaster/company/${id}/status`, {
                active: active
            });
            return response;
        } catch (error) {
            console.error("Error toggling company status:", error);
            throw error;
        }
    }
};