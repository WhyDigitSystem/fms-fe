import apiClient from "./apiClient";

const screensAPI = {
    // Add to your masterAPI object
    getScreens: async (orgId) => {
        const response = await apiClient.get(`/api/commonmaster/allScreenNames`);
        return response;
    },

    getScreenById: async (id) => {
        const response = await apiClient.get(`/api/commonmaster/screenNamesById?id=${id}`);
        return response;
    },

    saveScreen: async (payload) => {
        const response = await apiClient.put(`/api/commonmaster/createUpdateScreenNames`, payload);
        return response;
    },

    createScreen: async (payload) => {
        // If you need separate create/update methods
        return await screensAPI.saveScreen(payload);
    },

    updateScreen: async (id, payload) => {
        // If you need separate create/update methods
        return await screensAPI.saveScreen(payload);
    }

};

export default screensAPI;