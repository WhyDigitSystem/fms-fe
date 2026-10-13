import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8085";

export const finYearAPI = {
  // Get all financial years
  getAllFinYears: async (orgId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/commonmaster/getAllFInYearByOrgId`,
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

  // Get active financial years only
  getActiveFinYears: async (orgId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/commonmaster/getAllAciveFInYear`,
        {
          params: { orgId },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching active financial years:", error);
      throw error;
    }
  },

  // Create or update financial year
  saveFinYear: async (payload) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/commonmaster/createUpdateFinYear`,
        payload
      );
      return response;
    } catch (error) {
      console.error("Error saving financial year:", error);
      throw error;
    }
  },

  // Delete financial year
  deleteFinYear: async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/commonmaster/deleteFinYear/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting financial year:", error);
      throw error;
    }
  },

  // Bulk upload financial years
  bulkUploadFinYears: async (formData) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/commonmaster/FinYearUpload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading financial years:", error);
      throw error;
    }
  },
};
