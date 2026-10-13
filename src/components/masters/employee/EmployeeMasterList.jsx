import { ArrowLeft, Pencil, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { employeeAPI } from "../../../api/employeeAPI";

const EmployeeMasterList = ({ onAddNew, onEdit, onBack }) => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const ORG_ID = parseInt(localStorage.getItem("orgId")) || 1000000001;

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getEmployees(ORG_ID);
      setList(response);
    } catch (e) {
      console.error("Failed to load employees", e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = list.filter((employee) =>
    employee.employeeName.toLowerCase().includes(search.toLowerCase()) ||
    employee.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
    employee.branch?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 p-4">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <ArrowLeft
            className="h-5 w-5 cursor-pointer text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
            onClick={onBack}
          />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Employee Master
          </h1>
        </div>

        <button
          onClick={onAddNew}
          className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 
          rounded-md text-sm hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" /> Add Employee
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
        <Search className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search employees by name, code, or branch…"
          className="bg-transparent text-sm w-full outline-none text-gray-800 dark:text-gray-200"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loading Indicator */}
      {loading && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
          Loading employees…
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
          <table className="w-full text-sm">
            {/* Header */}
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                <th className="p-3 text-left font-medium">Employee Code</th>
                <th className="p-3 text-left font-medium">Employee Name</th>
                <th className="p-3 text-left font-medium">Gender</th>
                <th className="p-3 text-left font-medium">Branch</th>
                <th className="p-3 text-left font-medium">Department</th>
                <th className="p-3 text-left font-medium">Designation</th>
                <th className="p-3 text-left font-medium">Joining Date</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-center font-medium">Action</th>
              </tr>
            </thead>

            {/* Rows */}
            <tbody>
              {filtered.map((employee, i) => (
                <tr
                  key={employee.id}
                  className="border-t border-gray-200 dark:border-gray-700 
                  bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200
                  hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                >
                  <td className="p-3 font-medium">{employee.employeeCode}</td>
                  <td className="p-3">{employee.employeeName}</td>
                  <td className="p-3 capitalize">{employee.gender?.toLowerCase()}</td>
                  <td className="p-3">{employee.branch}</td>
                  <td className="p-3">{employee.department}</td>
                  <td className="p-3">{employee.designation}</td>
                  <td className="p-3">{employee.joiningDate}</td>

                  {/* Status */}
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium 
                        ${
                          employee.active === "Active" || employee.active === true
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                    >
                      {employee.active === "Active" || employee.active === true ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-3 flex justify-center">
                    <button
                      onClick={() => onEdit(employee)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}

              {/* Empty State */}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={9}
                    className="p-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {search ? "No employees found matching your search" : "No employees found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeMasterList;