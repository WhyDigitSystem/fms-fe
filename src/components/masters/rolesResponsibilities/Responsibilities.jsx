import {
    Save,
    X,
    Search,
    List,
    ChevronLeft,
    ChevronRight,
    Pencil
} from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "../../Toast/ToastContext";
import { getAllActiveScreens } from "../../../utils/CommonFunctions";
import apiClient from "../../../api/apiClient";

const Responsibilities = () => {
    const [listView, setListView] = useState(false);
    const [listViewData, setListViewData] = useState([]);
    const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
    const [isLoading, setIsLoading] = useState(false);
    const [editId, setEditId] = useState("");
    const [screenList, setScreenList] = useState([]);
    const [loginUserName, setLoginUserName] = useState(localStorage.getItem("userName"));
    const [selectedScreens, setSelectedScreens] = useState([]);
    const { addToast } = useToast();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [search, setSearch] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        orgId: orgId,
        active: true
    });

    const [fieldErrors, setFieldErrors] = useState({
        name: false,
        selectedScreens: ""
    });

    useEffect(() => {
        getAllResponsibilities();
        getAllScreens();
    }, [listView]);

    const handleClear = () => {
        setFormData({
            name: "",
            active: true
        });
        setSelectedScreens([]);
        setFieldErrors({
            name: false,
            selectedScreens: ""
        });
        setEditId("");
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const nameRegex = /^[A-Za-z ]*$/;

        if (name === "name" && !nameRegex.test(value)) {
            setFieldErrors({ ...fieldErrors, [name]: "Invalid Format" });
        } else {
            setFormData({
                ...formData,
                [name]: name === "active" ? checked : value.toUpperCase()
            });
            setFieldErrors({ ...fieldErrors, [name]: "" });
        }
    };

    const handleMultiSelectChange = (value) => {
        setSelectedScreens(value);
    };

    const getAllScreens = async () => {
        try {
            const screensData = await getAllActiveScreens(orgId);
            setScreenList(screensData);
        } catch (error) {
            console.error("Error fetching screens:", error);
        }
    };

    const getAllResponsibilities = async () => {
        try {
            const response = await apiClient.get(`/api/auth/allResponsibilityByOrgId?orgId=${orgId}`);
            setListViewData(response.paramObjectsMap.responsibilityVO);
        } catch (err) {
            console.log("error", err);
        }
    };

    const getResponsibilityById = async (row) => {
        setEditId(row.id);
        try {
            const response = await apiClient.get(`/api/auth/responsibilityById?id=${row.id}`);
            if (response) {
                const particularResponsibility = response.paramObjectsMap.responsibilityVO;
                const particularResScreens = particularResponsibility.screensVO.map((k) => k.screenName);
                setFormData({
                    name: particularResponsibility.responsibility,
                    active: particularResponsibility.active === "Active" ? true : false
                });
                setSelectedScreens(particularResScreens);
                setListView(false);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleSave = async () => {
        const errors = {};
        if (!formData.name) {
            errors.name = "Name is required";
        }
        if (selectedScreens.length <= 0) {
            errors.selectedScreens = "Screens is required";
        }

        if (Object.keys(errors).length === 0) {
            setIsLoading(true);

            const screenVo = selectedScreens.map((row) => ({
                screenName: row.toLowerCase()
            }));

            const saveFormData = {
                ...(editId && { id: editId }),
                active: formData.active,
                responsibility: formData.name,
                orgId: orgId,
                createdby: loginUserName,
                screensDTO: screenVo
            };

            try {
                const response = await apiClient.put(`/api/auth/createUpdateResponsibility`, saveFormData);
                if (response.status === true) {
                    addToast("success", editId ? "Responsibility Updated Successfully" : "Responsibility created successfully");
                    handleClear();
                    getAllResponsibilities();
                } else {
                    addToast("error", response.paramObjectsMap.errorMessage || "Responsibility creation failed");
                }
            } catch (err) {
                console.log("error", err);
                addToast("error", "Responsibility creation failed");
            } finally {
                setIsLoading(false);
            }
        } else {
            setFieldErrors(errors);
        }
    };

    // Filter data based on search
    const filteredData = listViewData.filter((item) =>
        item.responsibility?.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination calculations
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentItems = filteredData.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getPageNumbers = () => {
        if (totalPages <= 1) return [1];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    return (
        <div>
            {/* Action Buttons */}
            <div className="flex gap-2 mb-4 flex-wrap">
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="h-3 w-3" />
                    {isLoading ? "Saving..." : "Save"}
                </button>
                <button
                    onClick={handleClear}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors"
                >
                    <X className="h-3 w-3" />
                    Clear
                </button>
                <button
                    onClick={() => setListView(!listView)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
                >
                    <List className="h-3 w-3" />
                    {listView ? "Form View" : "List View"}
                </button>
            </div>

            {listView ? (
                // List View
                <div>
                    {/* Search Box */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2 mb-4 shadow-sm">
                        <Search className="h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search responsibilities..."
                            className="bg-transparent text-sm w-full outline-none text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">#</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Responsibility</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Screens</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {currentItems.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{startIndex + index + 1}</td>
                                        <td className="px-3 py-2 text-sm text-gray-800 dark:text-gray-200">{item.responsibility}</td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                                            {item.screensVO?.map((s) => s.screenName).join(", ") || "-"}
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.active === "Active" || item.active === true
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                                }`}>
                                                {item.active === "Active" || item.active === true ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <button
                                                onClick={() => getResponsibilityById(item)}
                                                className="p-1 text-blue-500 hover:text-blue-600 transition"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {currentItems.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                                            No responsibilities found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalItems > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                Showing {startIndex + 1}-{endIndex} of {totalItems}
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-1 border rounded disabled:opacity-50"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                {getPageNumbers().map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-2.5 py-1 text-xs border rounded ${currentPage === page
                                                ? "bg-blue-600 border-blue-600 text-white"
                                                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-1 border rounded disabled:opacity-50"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                // Form View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Responsibility Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter responsibility name"
                            className="w-full px-3 py-2 text-sm border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {fieldErrors.name && (
                            <p className="mt-1 text-sm text-red-500">{fieldErrors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Screens *
                        </label>
                        <select
                            multiple
                            value={selectedScreens}
                            onChange={(e) => {
                                const options = Array.from(e.target.selectedOptions, (option) => option.value);
                                handleMultiSelectChange(options);
                            }}
                            className="w-full px-3 py-2 text-sm border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                        >
                            {screenList.map((item) => (
                                <option key={item.id} value={item.screenName}>
                                    {item.screenName}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.selectedScreens && (
                            <p className="mt-1 text-sm text-red-500">{fieldErrors.selectedScreens}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2 p-1">
                        <input
                            type="checkbox"
                            name="active"
                            checked={formData.active}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Active
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Responsibilities;