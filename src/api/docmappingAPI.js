import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8085";

export const documentMappingAPI = {
  // ============================================================
  // ✅ NEW: Document Type Mapping Master endpoints
  // ============================================================

  // Get all document type mappings by branch + org
  getDocumentTypeMappingByOrgId: async (branchId, orgId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/commonmaster/getDocumentTypeMappingByOrgId`,
        { params: { branch: branchId, orgId } }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching document type mappings:", error);
      throw error;
    }
  },

  // Get single mapping by id
  getDocumentTypeMappingById: async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/commonmaster/getDocumentTypeMappingById`,
        { params: { id } }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching document type mapping by id:", error);
      throw error;
    }
  },

  // Create or update via commonmaster controller
  saveDocumentTypeMappingMaster: async (payload) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/commonmaster/updateCreateDocumentTypeMapping`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error saving document type mapping (master):", error);
      throw error;
    }
  },

  // ============================================================
  // Legacy / shared endpoints
  // ============================================================

  getAllDocumentTypeMappings: async (orgId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/getAllDocumentTypeMapping`,
        { params: { orgId } }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching document type mappings:", error);
      throw error;
    }
  },

  getAllBranches: async (orgId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/warehousemastercontroller/branch`,
        { params: { orgid: orgId } }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching branches:", error);
      throw error;
    }
  },

  getAllFinYears: async (orgId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/commonmaster/getAllAciveFInYear`,
        { params: { orgId } }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching financial years:", error);
      throw error;
    }
  },

  getPendingMappings: async (params) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/commonmaster/getPendingDocumentTypeMapping`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching pending mappings:", error);
      throw error;
    }
  },

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

  bulkUploadDocumentTypeMappings: async (formData) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/warehousemastercontroller/DocTypeMappingUpload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading document type mappings:", error);
      throw error;
    }
  },
};