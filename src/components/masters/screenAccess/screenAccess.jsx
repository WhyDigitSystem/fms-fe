import { useState, useEffect } from "react";
import {
    RefreshCw,
    Search,
    Info,
    Save,
    X
} from "lucide-react";
import { useToast } from "../../Toast/ToastContext";
import { getAllActiveScreens, getAllActiveRoles, getScreenPermissions, saveScreenPermissions } from "../../../api/screenAccessAPI";

const ScreenAccess = () => {
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [screenList, setScreenList] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [filteredPermissions, setFilteredPermissions] = useState([]);
    const [roleList, setRoleList] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [confirmReset, setConfirmReset] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editId, setEditId] = useState("");
    const { addToast } = useToast();

    const orgId = localStorage.getItem("orgId");

    useEffect(() => {
        getAllScreens();
        getAllRoles();
    }, []);

    useEffect(() => {
        if (role) {
            getScreenAccess();
        }
    }, [role]);

    const getAllScreens = async () => {
        try {
            const screensData = await getAllActiveScreens();
            setScreenList(screensData);
            const initialPermissions = screensData.map((screen) => ({
                module: screen.screenName,
                screenCode: screen.screenCode,
                canRead: false,
                canWrite: false,
                canDelete: false
            }));
            setPermissions(initialPermissions);
            setFilteredPermissions(initialPermissions);
        } catch (error) {
            console.error("Error fetching screens:", error);
            addToast("Failed to load screens", "error");
        }
    };

    const getAllRoles = async () => {
        try {
            const roleData = await getAllActiveRoles(orgId);
            setRoleList(roleData.sort((a, b) => a.role.localeCompare(b.role)));
        } catch (error) {
            console.error("Error fetching roles:", error);
            addToast("Failed to load roles", "error");
        }
    };

    const handleRoleChange = (event) => {
        const selectedRole = event.target.value;
        setRole(selectedRole);
        setLoading(true);
    };

    const handleCheckboxChange = (screenCode, type) => {
        const updatedPermissions = permissions.map((item) =>
            item.screenCode === screenCode ? { ...item, [type]: !item[type] } : item
        );

        setPermissions(updatedPermissions);
        setFilteredPermissions(filterPermissions(updatedPermissions, searchText));
    };

    const handleSelectAll = (type) => {
        const allChecked = filteredPermissions.every((item) => item[type]);
        const updatedPermissions = permissions.map((item) =>
            filteredPermissions.some((f) => f.screenCode === item.screenCode)
                ? { ...item, [type]: !allChecked }
                : item
        );
        setPermissions(updatedPermissions);
        setFilteredPermissions(filterPermissions(updatedPermissions, searchText));
    };

    const handleSave = async () => {
        setIsSubmitting(true);

        const payload = {
            active: true,
            createdBy: localStorage.getItem("userName") || "admin",
            orgId: orgId,
            ...(editId && { id: editId }),
            role: role,
            rolesPermissionDTO: permissions.map((item) => ({
                canDelete: item.canDelete,
                canRead: item.canRead,
                canWrite: item.canWrite,
                screenId: item.screenCode,
                screenName: item.module
            }))
        };

        try {
            const response = await saveScreenPermissions(payload);

            if (response?.status === true || response?.statusFlag === "Ok") {
                addToast(
                    editId ? "Screen Access Updated Successfully" : "Screen Access Created Successfully",
                    "success"
                );
                setRole("");
                setPermissions([]);
                setFilteredPermissions([]);
            } else {
                const errorMessage =
                    response?.paramObjectsMap?.errorMessage ||
                    response?.paramObjectsMap?.message ||
                    response?.message ||
                    "Failed to save permissions";
                addToast(errorMessage, "error");
            }
        } catch (error) {
            console.error("Error saving permissions:", error);
            addToast("Failed to save permissions. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getScreenAccess = async () => {
        try {
            setLoading(true);
            const response = await getScreenPermissions(orgId, role);

            const userList = response?.paramObjectsMap?.userVO;
            let apiPermissions = [];

            if (Array.isArray(userList) && userList.length > 0) {
                const user = userList[0];
                setEditId(user.id);

                const permissionList = user.rolesPermissionVO || [];

                // Create a map of permissions by screenCode
                const permissionMap = new Map();
                permissionList.forEach((perm) => {
                    permissionMap.set(perm.screenId, {
                        canRead: !!perm.canRead,
                        canWrite: !!perm.canWrite,
                        canDelete: !!perm.canDelete
                    });
                });

                // Merge API permissions with master screen list
                apiPermissions = screenList.map((screen) => {
                    const apiPerm = permissionMap.get(screen.screenCode);
                    return {
                        module: screen.screenName,
                        screenCode: screen.screenCode,
                        canRead: apiPerm ? apiPerm.canRead : false,
                        canWrite: apiPerm ? apiPerm.canWrite : false,
                        canDelete: apiPerm ? apiPerm.canDelete : false
                    };
                });
            } else {
                // No API data - use default false values
                apiPermissions = screenList.map((screen) => ({
                    module: screen.screenName,
                    screenCode: screen.screenCode,
                    canRead: false,
                    canWrite: false,
                    canDelete: false
                }));
                setEditId("");
            }

            setPermissions(apiPermissions);
            setFilteredPermissions(filterPermissions(apiPermissions, searchText));
        } catch (error) {
            console.error("Error fetching permissions:", error);
            addToast("Failed to fetch permissions", "error");
        } finally {
            setLoading(false);
        }
    };

    const confirmResetPermissions = () => setConfirmReset(true);

    const handleResetConfirm = () => {
        const resetPermissions = permissions.map((item) => ({
            ...item,
            canRead: false,
            canWrite: false,
            canDelete: false
        }));
        setPermissions(resetPermissions);
        setFilteredPermissions(filterPermissions(resetPermissions, searchText));
        setConfirmReset(false);
        addToast("Permissions reset successfully!", "info");
    };

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchText(value);
        setFilteredPermissions(filterPermissions(permissions, value));
    };

    const filterPermissions = (permissionsList, searchValue) =>
        permissionsList.filter((item) =>
            item.module.toLowerCase().includes(searchValue.toLowerCase())
        );

    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="p-4">
                    {/* Header and Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                        {/* Role Select */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Select Role
                            </label>
                            <select
                                value={role}
                                onChange={handleRoleChange}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 
                  rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            >
                                <option value="">Select Role</option>
                                {roleList.map((r) => (
                                    <option key={r.role} value={r.role}>
                                        {r.role.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Search Input */}
                        {role && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Search Screens
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search screens..."
                                            value={searchText}
                                            onChange={handleSearchChange}
                                            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 
                        rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="sm:col-span-2 flex items-end gap-2 justify-end">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSubmitting}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 
                      text-white text-sm rounded-md transition-colors disabled:opacity-50 
                      disabled:cursor-not-allowed"
                                    >
                                        <Save className="h-4 w-4" />
                                        {isSubmitting ? "Saving..." : "Save"}
                                    </button>
                                    <button
                                        onClick={confirmResetPermissions}
                                        disabled={isSubmitting}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 
                      hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 
                      text-sm rounded-md transition-colors disabled:opacity-50"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Reset
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Content Area */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                        </div>
                    ) : role ? (
                        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="max-h-[500px] overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                                                Screen Name
                                            </th>
                                            {["canRead", "canWrite", "canDelete"].map((type) => (
                                                <th key={type} className="px-3 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                filteredPermissions.length > 0 &&
                                                                filteredPermissions.every((p) => p[type])
                                                            }
                                                            onChange={() => handleSelectAll(type)}
                                                            className="h-3.5 w-3.5 rounded border-gray-300 dark:border-gray-600 
                                text-blue-600 dark:text-blue-400 focus:ring-blue-500 
                                dark:focus:ring-blue-400 cursor-pointer"
                                                        />
                                                        <span>{type.replace("can", "")}</span>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredPermissions.map((item) => (
                                            <tr
                                                key={item.screenCode}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                            >
                                                <td className="px-3 py-1.5 text-gray-800 dark:text-gray-200">
                                                    {item.module}
                                                </td>
                                                {["canRead", "canWrite", "canDelete"].map((type) => (
                                                    <td key={type} className="px-3 py-1.5 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={item[type]}
                                                            onChange={() =>
                                                                handleCheckboxChange(item.screenCode, type)
                                                            }
                                                            className={`h-3.5 w-3.5 rounded border-gray-300 dark:border-gray-600 
                                focus:ring-2 cursor-pointer
                                ${type === "canRead"
                                                                    ? "text-blue-600 dark:text-blue-400 focus:ring-blue-500"
                                                                    : type === "canWrite"
                                                                        ? "text-green-600 dark:text-green-400 focus:ring-green-500"
                                                                        : "text-red-600 dark:text-red-400 focus:ring-red-500"
                                                                }`}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center py-8">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-700 to-teal-900 
                dark:from-teal-800 dark:to-teal-950 rounded-lg text-white">
                                <Info className="h-5 w-5" />
                                <span className="font-medium">Please select a role to begin.</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reset Confirmation Dialog */}
            {confirmReset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Reset Permissions
                            </h3>
                            <button
                                onClick={() => setConfirmReset(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to reset all permissions to default (unchecked)?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setConfirmReset(false)}
                                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 
                  rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 
                  dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResetConfirm}
                                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 
                  text-white rounded-md transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScreenAccess;