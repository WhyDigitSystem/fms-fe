// CreateCompanyListview.jsx
import { Pencil, Plus, Search, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { companyAPI } from "../../../api/newEntry";

const CreateCompanyListview = ({ onAddNew, onEdit }) => {
    const [search, setSearch] = useState("");
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");

    const ORG_ID = localStorage.getItem('orgId');

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const response = await companyAPI.getAllCompanies(ORG_ID);
            console.log("Company List API →", response);

            if (response.status === true) {
                setList(response.paramObjectsMap.companyVO || []);
            } else {
                setList([]);
            }
        } catch (err) {
            console.error("Error loading companies:", err);
            setList([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter by search and status
    const filtered = list.filter((company) => {
        // Search filter
        const searchMatch =
            company.companyCode?.toLowerCase().includes(search.toLowerCase()) ||
            company.companyName?.toLowerCase().includes(search.toLowerCase()) ||
            company.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
            company.email?.toLowerCase().includes(search.toLowerCase()) ||
            company.employeeCode?.toLowerCase().includes(search.toLowerCase());

        // Status filter
        let statusMatch = true;
        if (statusFilter === "active") {
            statusMatch = company.active === true || company.active === "Active";
        } else if (statusFilter === "inactive") {
            statusMatch = company.active !== true && company.active !== "Active";
        }

        return searchMatch && statusMatch;
    });

    // Calculate statistics
    const activeCount = list.filter(
        (item) => item.active === true || item.active === "Active"
    ).length;
    const inactiveCount = list.length - activeCount;

    return (
        <div className="max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Company Master
                </h1>

                <button
                    onClick={onAddNew}
                    className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 
          rounded-md text-xs hover:bg-purple-700 transition"
                >
                    <Plus className="h-4 w-4" /> Add
                </button>
            </div>

            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {/* Search Box */}
                <div
                    className="
          flex-1 bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700
          rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm
        "
                >
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Code, Name, Admin, Email..."
                        className="bg-transparent text-sm w-full outline-none text-gray-800 dark:text-gray-200"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Status Filter */}
                <div className="sm:w-48">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg 
            bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm
            focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                </div>
            </div>

            {/* Statistics Bar */}
            <div className="flex flex-wrap gap-4 mb-4 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                    Total: <span className="font-semibold text-gray-900 dark:text-white">{list.length}</span>
                </span>
                <span className="text-green-600 dark:text-green-400">
                    Active: <span className="font-semibold">{activeCount}</span>
                </span>
                <span className="text-red-600 dark:text-red-400">
                    Inactive: <span className="font-semibold">{inactiveCount}</span>
                </span>
                {statusFilter !== "all" && (
                    <span className="text-blue-600 dark:text-blue-400">
                        Filtered: <span className="font-semibold">{filtered.length}</span>
                    </span>
                )}
            </div>

            {/* Loading Indicator */}
            {loading && (
                <div className="text-center py-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Loading companies...
                    </p>
                </div>
            )}

            {/* Table */}
            {!loading && (
                <div
                    className="
          rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 
          shadow-sm
        "
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            {/* Header */}
                            <thead>
                                <tr className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                                    <th className="p-2 text-left w-14">S.No</th>
                                    <th className="p-2 text-left font-medium">Company Code</th>
                                    <th className="p-2 text-left font-medium">Company Name</th>
                                    <th className="p-2 text-left font-medium">Admin Name</th>
                                    <th className="p-2 text-left font-medium">Email</th>
                                    <th className="p-2 text-left font-medium">Employee Code</th>
                                    <th className="p-2 text-left font-medium">Status</th>
                                    <th className="p-2 text-center font-medium">Action</th>
                                </tr>
                            </thead>

                            {/* Rows */}
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            No companies found
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((company, i) => (
                                        <tr
                                            key={company.id || i}
                                            className="border-t border-gray-200 dark:border-gray-700 
                      bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200
                      hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <td className="p-2">{i + 1}</td>
                                            <td className="p-2 font-mono text-xs font-medium">
                                                {company.companyCode || "-"}
                                            </td>
                                            <td className="p-2 font-medium">
                                                {company.companyName || "-"}
                                            </td>
                                            <td className="p-2">{company.employeeName || "-"}</td>
                                            <td className="p-2 text-blue-600 dark:text-blue-400">
                                                {company.email || "-"}
                                            </td>
                                            <td className="p-2 font-mono text-xs">
                                                {company.employeeCode || "-"}
                                            </td>
                                            <td className="p-2">
                                                <span
                                                    className={`px-2 py-0.5 rounded-md text-xs font-medium 
                          ${company.active === true || company.active === "Active"
                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                                        }`}
                                                >
                                                    {company.active === true || company.active === "Active" ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="p-2 flex justify-center gap-3">
                                                <Pencil
                                                    className="h-4 w-4 text-blue-500 hover:text-blue-600 cursor-pointer transition-colors"
                                                    onClick={() => onEdit(company)}
                                                    title="Edit"
                                                />
                                                <Eye
                                                    className="h-4 w-4 text-gray-500 hover:text-gray-600 cursor-pointer transition-colors"
                                                    onClick={() => console.log("View company:", company)}
                                                    title="View"
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Footer with record count */}
            {!loading && filtered.length > 0 && (
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-right">
                    Showing {filtered.length} of {list.length} records
                </div>
            )}
        </div>
    );
};

export default CreateCompanyListview;