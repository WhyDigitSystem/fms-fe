import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as XLSX from "xlsx";
import { configAPI } from "../../../api/configAPI";

const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;

const isActive = (value) =>
  value === true || value === 1 || value === "Active" || value === "Y";

export default function ConfigMasterList({ onAdd, onEdit, refreshTrigger }) {
  const [configs, setConfigs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const loadConfigs = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await configAPI.getAll(ORG_ID, BRANCH_ID);

      const data = Array.isArray(response) ? response : [];

      setConfigs(
        [...data].sort((a, b) => Number(b.id || 0) - Number(a.id || 0)),
      );
    } catch (error) {
      console.error("Failed to load configurations:", error);
      setConfigs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, [refreshTrigger]);

  const filteredConfigs = configs.filter((item) => {
    const query = search.toLowerCase().trim();

    return (
      String(item.company || "")
        .toLowerCase()
        .includes(query) ||
      (item.configModes || []).some((row) =>
        String(row.mode || "")
          .toLowerCase()
          .includes(query),
      ) ||
      (item.configServices || []).some((row) =>
        String(row.mode || "")
          .toLowerCase()
          .includes(query),
      ) ||
      (item.configProducts || []).some((row) =>
        String(row.mode || "")
          .toLowerCase()
          .includes(query),
      )
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredConfigs.length / itemsPerPage),
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedConfigs = filteredConfigs.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage,
  );

  const exportToExcel = () => {
    const rows = filteredConfigs.map((item, index) => ({
      "S.No": index + 1,
      "Company Name": item.company || "",
      Branch:
        typeof item.branch === "object"
          ? item.branch?.branch || ""
          : item.branch || "",
      Modes: (item.configModes || [])
        .map((row) => row.mode)
        .filter(Boolean)
        .join(", "),
      Services: (item.configServices || [])
        .map((row) => row.mode)
        .filter(Boolean)
        .join(", "),
      Products: (item.configProducts || [])
        .map((row) => row.mode)
        .filter(Boolean)
        .join(", "),
      Status: isActive(item.active) ? "Active" : "Inactive",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Configurations");

    XLSX.writeFile(workbook, "ConfigMaster.xlsx");
  };

  return (
    <div className="mx-auto max-w-7xl rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Configuration Master
          </h2>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Manage company configurations, modes, services, and products.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => loadConfigs(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-2.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={exportToExcel}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-2.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <Download size={14} />
            Export
          </button>

          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
          >
            <Plus size={15} />
            Add Configuration
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3 flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-800">
        <Search size={15} className="shrink-0 text-gray-400" />

        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search company, modes, services, or products..."
          className="w-full border-0 bg-transparent py-2 text-sm text-gray-800 outline-none focus:ring-0 dark:text-white"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
            <tr>
              <th className="whitespace-nowrap px-3 py-3 font-semibold">
                S.No
              </th>
              <th className="whitespace-nowrap px-3 py-3 font-semibold">
                Company Name
              </th>
              <th className="px-3 py-3 font-semibold">Modes</th>
              <th className="px-3 py-3 font-semibold">Services</th>
              <th className="px-3 py-3 font-semibold">Products</th>
              <th className="whitespace-nowrap px-3 py-3 font-semibold">
                Status
              </th>
              <th className="px-3 py-3 text-center font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  Loading configurations...
                </td>
              </tr>
            ) : paginatedConfigs.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No configurations found.
                </td>
              </tr>
            ) : (
              paginatedConfigs.map((item, index) => (
                <tr
                  key={item.id ?? index}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800/70"
                >
                  <td className="whitespace-nowrap px-3 py-3 text-gray-600 dark:text-gray-300">
                    {(safePage - 1) * itemsPerPage + index + 1}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3 font-medium text-gray-800 dark:text-gray-100">
                    {item.company || "-"}
                  </td>

                  <td className="min-w-36 px-3 py-3 text-gray-600 dark:text-gray-300">
                    {(item.configModes || [])
                      .map((row) => row.mode)
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </td>

                  <td className="min-w-36 px-3 py-3 text-gray-600 dark:text-gray-300">
                    {(item.configServices || [])
                      .map((row) => row.mode)
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </td>

                  <td className="min-w-36 px-3 py-3 text-gray-600 dark:text-gray-300">
                    {(item.configProducts || [])
                      .map((row) => row.mode)
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        isActive(item.active)
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {isActive(item.active) ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      title="Edit configuration"
                      className="inline-flex items-center justify-center rounded p-1.5 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
                    >
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
        <span>
          Showing{" "}
          {filteredConfigs.length === 0 ? 0 : (safePage - 1) * itemsPerPage + 1}{" "}
          to {Math.min(safePage * itemsPerPage, filteredConfigs.length)} of{" "}
          {filteredConfigs.length} configurations
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={safePage === 1}
            aria-label="Previous page"
            className="rounded border border-gray-300 p-1.5 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <ChevronLeft size={14} />
          </button>

          <span>
            Page {safePage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={safePage === totalPages}
            aria-label="Next page"
            className="rounded border border-gray-300 p-1.5 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
