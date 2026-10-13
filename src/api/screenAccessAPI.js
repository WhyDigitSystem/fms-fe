import apiClient from "./apiClient";

export const getAllActiveScreens = async () => {
    try {
        const response = await apiClient.get(`/api/commonmaster/allScreenNames`);
        console.log('API Response:', response);

        if (response.status === true) {
            const screensData = response.paramObjectsMap.screenNamesVO
                .filter((row) => row.active === 'Active')
                .map(({ id, screenCode, screenName }) => ({ id, screenCode, screenName }));

            return screensData;
        } else {
            console.error('API Error:', response);
            return response;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return error;
    }
};

export const getAllActiveRoles = async (orgId) => {
    try {
        const response = await apiClient.get(`/api/auth/allRolesByOrgId?orgId=${orgId}`);
        console.log('API Response:', response);

        if (response.status === true) {
            const rolesData = response.paramObjectsMap.rolesVO
                .filter((row) => row.active === 'Active')
                .map(({ id, role }) => ({ id, role }));

            return rolesData;
        } else {
            console.error('API Error:', response);
            return response;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return error;
    }
};

export const getScreenPermissions = async (orgId, role) => {
    try {
        const response = await apiClient.get(`/api/roles/getRolesPermissionHeaderByRoleandOrgid?orgid=${orgId}&role=${role}`);
        console.log('API Response:', response);
        return response;
    } catch (error) {
        console.error('Error fetching data:', error);
        return error;
    }
};

export const saveScreenPermissions = async (payload) => {
    try {
        const response = await apiClient.put(`/api/roles/createUpdateRoleScreenPermission`, payload);
        console.log('API Response:', response);
        return response;
    } catch (error) {
        console.error('Error saving data:', error);
        return error;
    }
};

export default {
    getAllActiveScreens,
    getAllActiveRoles,
    getScreenPermissions,
    saveScreenPermissions
};