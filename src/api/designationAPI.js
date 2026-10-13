import apiClient from '../api/apiClient';

export const designationAPI = {
    // Get all designations
    getAllDesignations: async (orgId) => {
        try {
            const response = await apiClient.get(`/api/commonmaster/getAllDesignationByOrgId?orgId=${orgId}`);
            return response;
        } catch (error) {
            console.error('Error fetching designations:', error);
            throw error;
        }
    },

    // Get designation by ID
    getDesignationById: async (id) => {
        try {
            const response = await apiClient.get(`/api/commonmaster/getAllDesignationById?id=${id}`);
            return response;
        } catch (error) {
            console.error('Error fetching designation:', error);
            throw error;
        }
    },

    // Save/Update designation
    saveDesignation: async (payload) => {
        try {
            const response = await apiClient.put(`/api/commonmaster/createUpdateDesignation`, payload);
            return response;
        } catch (error) {
            console.error('Error saving designation:', error);
            throw error;
        }
    },
};