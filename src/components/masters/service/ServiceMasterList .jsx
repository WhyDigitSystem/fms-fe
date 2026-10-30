import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Pencil,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as XLSX from "xlsx";
import { serviceAPI } from "../../../api/serviceAPI";

const ORG_ID = Number(localStorage.getItem("orgId"));
const BRANCH_ID = Number(localStorage.getItem("branchId"));

const isActive = (item) =>
  item.active === true || item.active === "Active" || item.active === 1;

export default function ServiceMasterList({
  onAdd,
  onEdit,
  onBack,
  refreshTrigger,
}) {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const loadServices = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await serviceAPI.getAll(ORG_ID, BRANCH_ID);
      const data = Array.isArray(response) ? response : [];

      setServices(
        [...data].sort((a, b) => Number(b.id || 0) - Number(a.id || 0)),
      );
    } catch (error) {
      console.error("Failed to load services:", error);
      setServices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [refreshTrigger]);

  const filteredServices = services.filter((item) => {
    const q = search.toLowerCase();

    return (
      String(item.serviceCode || "")
        .toLowerCase()
        .includes(q) ||
      String(item.serviceDescription || "")
        .toLowerCase()
        .includes(q)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredServices.length / itemsPerPage),
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedServices = filteredServices.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage,
  );

  const exportToExcel = () => {
    const rows = filteredServices.map((item, index) => ({
      "S.No": index + 1,
      "Service Code": item.serviceCode || "",
      Description: item.serviceDescription || "",
      Status: isActive(item) ? "Active" : "Inactive",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Services");
    XLSX.writeFile(workbook, "ServiceMaster.xlsx");
  };

  return (
    <div className="mx-auto max-w-6xl rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
      {/* HEADER */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* BACK BUTTON */}
          <button
            type="button"
            onClick={onBack}
            className="p-1 text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            title="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Service Master
            </h2>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Manage service codes and descriptions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadServices(true)}
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
            Add Service
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="mb-3 flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-800">
        <Search size={15} className="shrink-0 text-gray-400" />

        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search service code or description..."
          className="w-full border-0 bg-transparent py-2 text-sm text-gray-800 outline-none focus:ring-0 dark:text-white"
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
            <tr>
              <th className="whitespace-nowrap px-3 py-2.5 font-semibold">
                S.No
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 font-semibold">
                Service Code
              </th>
              <th className="px-3 py-2.5 font-semibold">Description</th>
              <th className="whitespace-nowrap px-3 py-2.5 font-semibold">
                Status
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 text-center font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  Loading services...
                </td>
              </tr>
            ) : paginatedServices.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No services found.
                </td>
              </tr>
            ) : (
              paginatedServices.map((item, index) => (
                <tr
                  key={item.id ?? item.serviceCode ?? index}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800/70"
                >
                  <td className="whitespace-nowrap px-3 py-2.5 text-gray-600 dark:text-gray-300">
                    {(safePage - 1) * itemsPerPage + index + 1}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5 font-medium text-gray-800 dark:text-gray-100">
                    {item.serviceCode || "-"}
                  </td>

                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">
                    {item.serviceDescription || "-"}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        isActive(item)
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {isActive(item) ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      title="Edit service"
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

      {/* PAGINATION */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
        <span>
          Showing{" "}
          {filteredServices.length === 0
            ? 0
            : (safePage - 1) * itemsPerPage + 1}{" "}
          to {Math.min(safePage * itemsPerPage, filteredServices.length)} of{" "}
          {filteredServices.length} services
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="rounded border border-gray-300 p-1.5 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>

          <span>
            Page {safePage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="rounded border border-gray-300 p-1.5 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
