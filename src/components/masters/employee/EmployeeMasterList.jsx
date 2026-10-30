import { ArrowLeft, Pencil, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { employeeAPI } from "../../../api/employeeAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import { designationAPI } from "../../../api/designationAPI";
import apiClient from "../../../api/apiClient";

// Safe extractors — API may return either an id/string or a full object
const toId = (v) => (v && typeof v === "object" ? (v.id ?? "") : (v ?? ""));

const pickName = (v, fields = []) => {
  if (v == null) return "";

  if (typeof v !== "object") return String(v);

  for (const f of fields) {
    const val = v[f];

    if (val != null && ["string", "number", "boolean"].includes(typeof val)) {
      return String(val);
    }
  }

  for (const [k, val] of Object.entries(v)) {
    if (
      val != null &&
      ["string", "number", "boolean"].includes(typeof val) &&
      !/(^id$|Id$|_id$)/i.test(k)
    ) {
      return String(val);
    }
  }

  return "";
};

const EmployeeMasterList = ({ onAddNew, onEdit, onBack }) => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const ORG_ID = parseInt(localStorage.getItem("orgId")) || 1000000001;

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);

      const [empRes, branchRes, deptRes, desigRes] = await Promise.allSettled([
        employeeAPI.getEmployees(ORG_ID),
        apiClient.get(`/api/warehousemastercontroller/branch?orgid=${ORG_ID}`),
        departmentAPI.getAllDepartments(ORG_ID),
        designationAPI.getAllDesignations(ORG_ID),
      ]);

      if (empRes.status === "fulfilled") {
        const r = empRes.value;

        const arr = Array.isArray(r)
          ? r
          : r?.paramObjectsMap?.employeeVO ||
            r?.data?.paramObjectsMap?.employeeVO ||
            r?.paramObjectsMap?.employees ||
            r?.data?.paramObjectsMap?.employees ||
            [];

        setList(arr);
      } else {
        console.error("Failed to load employees", empRes.reason);
        setList([]);
      }

      if (branchRes.status === "fulfilled") {
        const r = branchRes.value;

        const arr =
          r?.paramObjectsMap?.branchVO ||
          r?.data?.paramObjectsMap?.branchVO ||
          [];

        setBranches(arr);
      }

      if (deptRes.status === "fulfilled") {
        const r = deptRes.value;

        const arr =
          r?.paramObjectsMap?.departmentVOs ||
          r?.data?.paramObjectsMap?.departmentVOs ||
          [];

        setDepartments(arr);
      }

      if (desigRes.status === "fulfilled") {
        const r = desigRes.value;

        const arr =
          r?.paramObjectsMap?.designationVO ||
          r?.data?.paramObjectsMap?.designationVO ||
          [];

        setDesignations(arr);
      }
    } catch (err) {
      console.error("Error loading employee master:", err);
    } finally {
      setLoading(false);
    }
  };

  // Resolve branch name
  const branchName = (v) => {
    if (v && typeof v === "object") {
      return pickName(v, ["branch", "branchName", "name"]) || toId(v);
    }

    const b = branches.find((x) => String(x.id) === String(v));

    return b ? b.branch || b.branchName : v;
  };

  // Resolve department name
  const deptName = (v) => {
    if (v && typeof v === "object") {
      return pickName(v, ["department", "departmentName", "name"]) || toId(v);
    }

    const d = departments.find((x) => String(x.id) === String(v));

    return d ? d.department || d.departmentName : v;
  };

  // Resolve designation name
  const desigName = (v) => {
    if (v && typeof v === "object") {
      return pickName(v, ["designation", "designationName", "name"]) || toId(v);
    }

    const d = designations.find((x) => String(x.id) === String(v));

    return d ? d.designation || d.designationName : v;
  };

  const filtered = list.filter((employee) => {
    const s = search.toLowerCase();

    return (
      String(employee.employeeName || "")
        .toLowerCase()
        .includes(s) ||
      String(employee.employeeCode || "")
        .toLowerCase()
        .includes(s) ||
      String(branchName(employee.branch) || "")
        .toLowerCase()
        .includes(s)
    );
  });

  return (
    <div className="max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 p-4 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack || (() => window.history.back())}
            className="flex items-center justify-center h-8 w-8 rounded-md
              border border-gray-200 dark:border-gray-700
              text-gray-600 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-800
              hover:text-gray-900 dark:hover:text-white transition"
            title="Back"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Employee Master
          </h1>
        </div>

        <button
          type="button"
          onClick={onAddNew}
          className="flex items-center gap-1.5 bg-blue-600 text-white
            px-3 py-1.5 rounded-md text-sm
            hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          Add Employee
        </button>
      </div>

      {/* Search Box */}
      <div
        className="bg-white dark:bg-gray-800 border border-gray-200
        dark:border-gray-700 rounded-lg px-3 py-2 flex items-center
        gap-2 mb-4 shadow-sm"
      >
        <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />

        <input
          type="text"
          placeholder="Search employees by name, code, or branch..."
          className="bg-transparent text-sm w-full outline-none
            text-gray-800 dark:text-gray-200
            placeholder-gray-400 dark:placeholder-gray-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
          Loading employees...
        </p>
      )}

      {/* Employee Table */}
      {!loading && (
        <div
          className="rounded-lg overflow-hidden border border-gray-200
          dark:border-gray-700 shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="bg-gray-100 dark:bg-gray-800
                  text-xs text-gray-600 dark:text-gray-300"
                >
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

              <tbody>
                {filtered.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-t border-gray-200 dark:border-gray-700
                      bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200
                      hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    <td className="p-3 font-medium">
                      {employee.employeeCode || "-"}
                    </td>

                    <td className="p-3">{employee.employeeName || "-"}</td>

                    <td className="p-3 capitalize">
                      {String(employee.gender || "").toLowerCase() || "-"}
                    </td>

                    <td className="p-3">
                      {branchName(employee.branch) || "-"}
                    </td>

                    <td className="p-3">
                      {deptName(employee.department) || "-"}
                    </td>

                    <td className="p-3">
                      {desigName(employee.designation) || "-"}
                    </td>

                    <td className="p-3">
                      {employee.joiningDate || employee.joiningdate || "-"}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          employee.active === "Active" ||
                          employee.active === true
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {employee.active === "Active" ||
                        employee.active === true
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => onEdit(employee)}
                        className="inline-flex items-center justify-center
                          gap-1 text-blue-600 hover:text-blue-700
                          dark:text-blue-400 dark:hover:text-blue-300 transition"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="p-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      {search
                        ? "No employees found matching your search"
                        : "No employees found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeMasterList;
