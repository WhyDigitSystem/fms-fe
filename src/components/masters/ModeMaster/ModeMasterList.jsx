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
import { modeMasterAPI } from "../../../api/modeMasterAPI";

const ORG_ID = Number(localStorage.getItem("orgId")) || 0;

const isActive = (item) =>
  item?.active === true ||
  item?.active === "Active" ||
  item?.active === "Y" ||
  item?.active === 1;

export default function ModeMasterList({
  onAdd,
  onEdit,
  onBack,
  refreshTrigger,
}) {
  const [modes, setModes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const loadModes = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const result = await modeMasterAPI.getAll(ORG_ID);

      setModes(
        [...result].sort((a, b) => Number(b.id || 0) - Number(a.id || 0)),
      );
    } catch (error) {
      console.error("Failed to load modes:", error);
      setModes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadModes();
  }, [refreshTrigger]);

  const filteredModes = modes.filter((item) => {
    const query = search.toLowerCase().trim();

    return (
      String(item.modeCode || "")
        .toLowerCase()
        .includes(query) ||
      String(item.modeName || "")
        .toLowerCase()
        .includes(query) ||
      String(item.description || "")
        .toLowerCase()
        .includes(query)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredModes.length / itemsPerPage),
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedModes = filteredModes.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage,
  );

  const exportToExcel = () => {
    const rows = filteredModes.map((item, index) => ({
      "S.No": index + 1,
      "Mode Code": item.modeCode || "",
      "Mode Name": item.modeName || "",
      Description: item.description || "",
      Status: isActive(item) ? "Active" : "Inactive",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Modes");
    XLSX.writeFile(workbook, "ModeMaster.xlsx");
  };

  return (
    <div className="mx-auto max-w-6xl rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Back Button */}
          <button
            type="button"
            onClick={onBack}
            title="Back"
            className="rounded-md p-1.5 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Mode Master
            </h2>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Manage transport mode codes, names, and descriptions
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => loadModes(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-2.5 py-2 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={exportToExcel}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-2.5 py-2 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <Download size={14} />
            Export
          </button>

          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700"
          >
            <Plus size={15} />
            Add Mode
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3 flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-800">
        <Search size={15} className="shrink-0 text-gray-400" />

        <input
          type="text"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search mode code, name, or description..."
          className="w-full border-0 bg-transparent py-2 text-sm text-gray-800 outline-none focus:ring-0 dark:text-white"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
            <tr>
              {[
                "S.No",
                "Mode Code",
                "Mode Name",
                "Description",
                "Status",
                "Action",
              ].map((heading) => (
                <th
                  key={heading}
                  className="whitespace-nowrap px-3 py-2.5 font-semibold"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                  Loading modes...
                </td>
              </tr>
            ) : paginatedModes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                  No modes found.
                </td>
              </tr>
            ) : (
              paginatedModes.map((item, index) => (
                <tr
                  key={item.id ?? item.modeCode ?? index}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800/70"
                >
                  <td className="whitespace-nowrap px-3 py-2.5 text-gray-600 dark:text-gray-300">
                    {(safePage - 1) * itemsPerPage + index + 1}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5 font-medium text-gray-800 dark:text-gray-100">
                    {item.modeCode || "-"}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5 text-gray-700 dark:text-gray-300">
                    {item.modeName || "-"}
                  </td>

                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">
                    {item.description || "-"}
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
                      title="Edit mode"
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
          {filteredModes.length === 0 ? 0 : (safePage - 1) * itemsPerPage + 1}{" "}
          to {Math.min(safePage * itemsPerPage, filteredModes.length)} of{" "}
          {filteredModes.length} modes
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
