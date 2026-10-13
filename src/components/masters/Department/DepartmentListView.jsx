import { Pencil, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { departmentAPI } from "../../../api/departmentAPI";

const DepartmentListView = ({ onAddNew, onEdit }) => {
    const [search, setSearch] = useState("");
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    const ORG_ID = parseInt(localStorage.getItem("orgId"));

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await departmentAPI.getAllDepartments(ORG_ID);
            console.log("Department List API →", response);

            if (response?.status === true) {
                const departments = response.paramObjectsMap?.departmentVOs || [];
                setList(departments);
            } else {
                setList([]);
            }
        } catch (err) {
            console.error("Error loading departments:", err);
            setList([]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = list.filter((dept) =>
        dept.departmentName?.toLowerCase().includes(search.toLowerCase()) ||
        dept.code?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 p-4 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Department Master
                </h1>

                <button
                    onClick={onAddNew}
                    className="flex items-center gap-1.5 bg-purple-600 dark:bg-purple-500 text-white px-3 py-1.5 
          rounded-md text-xs hover:bg-purple-700 dark:hover:bg-purple-600 transition"
                >
                    <Plus className="h-4 w-4" /> Add
                </button>
            </div>

            {/* Search Box */}
            <div
                className="
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700
        rounded-lg px-3 py-2 flex items-center gap-2 mb-4 shadow-sm
      "
            >
                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                    type="text"
                    placeholder="Search by Code or Department Name..."
                    className="bg-transparent text-sm w-full outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Loading Indicator */}
            {loading && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Loading departments…
                </p>
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
                                    <th className="p-2 text-left font-medium">Code</th>
                                    <th className="p-2 text-left font-medium">Department Name</th>
                                    <th className="p-2 text-left font-medium">Status</th>
                                    <th className="p-2 text-center font-medium">Action</th>
                                </tr>
                            </thead>

                            {/* Rows */}
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-4 text-center text-gray-500 dark:text-gray-400">
                                            No departments found
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((dept, i) => (
                                        <tr
                                            key={dept.id}
                                            className="border-t border-gray-200 dark:border-gray-700 
                      bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200
                      hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                        >
                                            <td className="p-2">{i + 1}</td>
                                            <td className="p-2 font-medium">{dept.code || "-"}</td>
                                            <td className="p-2">{dept.departmentName || "-"}</td>
                                            <td className="p-2">
                                                <span
                                                    className={`px-2 py-0.5 rounded-md text-xs font-medium 
                            ${dept.active === "Active" || dept.active === true
                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                                        }`}
                                                >
                                                    {dept.active === "Active" || dept.active === true ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="p-2 flex justify-center">
                                                <Pencil
                                                    className="h-4 w-4 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 cursor-pointer transition"
                                                    onClick={() => onEdit(dept)}
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
        </div>
    );
};

export default DepartmentListView;