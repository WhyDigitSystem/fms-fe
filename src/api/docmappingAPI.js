import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8085";

export const documentMappingAPI = {
  // Get all document type mappings
  getAllDocumentTypeMappings: async (orgId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/getAllDocumentTypeMapping`,
        {
          params: { orgId },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching document type mappings:", error);
      throw error;
    }
  },

  // Get all branches
  getAllBranches: async (orgId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/branch`,
        {
          params: { orgid: orgId },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching branches:", error);
      throw error;
    }
  },

  // Get all financial years
  getAllFinYears: async (orgId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/commonmaster/getAllAciveFInYear`,
        {
          params: { orgId },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching financial years:", error);
      throw error;
    }
  },

  // Get pending document type mappings
  getPendingMappings: async (params) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/getPendingDocumentTypeMapping`,
        {
          params,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching pending mappings:", error);
      throw error;
    }
  },

  // Create or update document type mapping
  saveDocumentTypeMapping: async (payload) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/warehousemastercontroller/createDocumentTypeMapping`,
        payload
      );
      return response;
    } catch (error) {
      console.error("Error saving document type mapping:", error);
      throw error;
    }
  },

  // Delete document type mapping
  deleteDocumentTypeMapping: async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/warehousemastercontroller/deleteDocumentTypeMapping/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting document type mapping:", error);
      throw error;
    }
  },

  // Bulk upload document type mappings
  bulkUploadDocumentTypeMappings: async (formData) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/warehousemastercontroller/DocTypeMappingUpload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading document type mappings:", error);
      throw error;
    }
  },
};
