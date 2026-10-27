import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8085";

export const docTypeAPI = {
  // ============================================================
  // ✅ NEW: Document Type Master endpoints
  // ============================================================

  // Get all document type masters by org id
  getAllDocumentTypeMaster: async (orgId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/commonmaster/getAllDocumentTypeMasterByOrgId`,
        { params: { orgId } }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching document type masters:", error);
      throw error;
    }
  },

  // Get a single document type master by id
  getDocumentTypeMasterById: async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/commonmaster/getDocumentTypeMasterById`,
        { params: { id } }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching document type master by id:", error);
      throw error;
    }
  },

  // Create or update via commonmaster controller
  saveDocumentTypeMaster: async (payload) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/commonmaster/createUpdateDocumentTypeMaster`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error saving document type master:", error);
      throw error;
    }
  },

  // ============================================================
  // Legacy / shared endpoints
  // ============================================================

  // Get all document types (legacy)
  getAllDocumentTypes: async (orgId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/getAllDocumentType`,
        { params: { orgid: orgId } }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching document types:", error);
      throw error;
    }
  },

  // Get all screens
  getAllScreens: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/commonmaster/allScreenNames`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching screens:", error);
      throw error;
    }
  },

  // Get all clients
  getAllClients: async (orgId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/getClientAndClientCodeByOrgId`,
        { params: { orgId } }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
  },

  // Create or update (legacy endpoint)
  saveDocumentType: async (payload) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/warehousemastercontroller/createUpdateDocumentType`,
        payload
      );
      return response;
    } catch (error) {
      console.error("Error saving document type:", error);
      throw error;
    }
  },

  // Delete document type
  deleteDocumentType: async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/warehousemastercontroller/deleteDocumentType/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting document type:", error);
      throw error;
    }
  },

  // Bulk upload document types
  bulkUploadDocumentTypes: async (formData) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/warehousemastercontroller/DocTypeUpload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading document types:", error);
      throw error;
    }
  },
};