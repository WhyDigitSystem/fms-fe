import {
  Pencil,
  Plus,
  Search,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { masterAPI } from "../../../api/customerAPI";

const ProductMasterList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  useEffect(() => {
    loadProducts();
  }, [refreshTrigger]);

  const loadProducts = async () => {
    try {
      setLoading(true);

      // Replace with your actual API method if named differently.
      const response = await masterAPI.getProducts(ORG_ID);

      const sorted = [...(Array.isArray(response) ? response : [])].sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setList(sorted);
    } catch (error) {
      console.error("Failed to load products:", error);
      setList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    loadProducts();
  };

  const handleExcelDownload = () => {
    if (!list.length) {
      alert("No data to export");
      return;
    }

    const excelData = list.map((item) => ({
      "Product Code": item.productCode ?? "",
      Description: item.description ?? "",
      Status:
        item.active === "Active" || item.active === true
          ? "Active"
          : "Inactive",
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Products");

    XLSX.writeFile(
      wb,
      `Products_Export_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const filtered = list.filter((item) =>
    [item.productCode, item.description].some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filtered.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));

    for (let i = start; i <= Math.min(totalPages, start + 4); i++) {
      pages.push(i);
    }

    return pages;
  };

  const isActive = (item) => item.active === "Active" || item.active === true;

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 p-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <h1 className="text-base font-semibold text-gray-900 dark:text-white">
            Product Master
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1 bg-gray-600 text-white px-2.5 py-1.5 rounded-md text-xs hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          <button
            onClick={handleExcelDownload}
            disabled={!list.length}
            className="flex items-center gap-1 bg-green-600 text-white px-2.5 py-1.5 rounded-md text-xs hover:bg-green-700 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>

          <button
            onClick={onAddNew}
            className="flex items-center gap-1 bg-purple-600 text-white px-2.5 py-1.5 rounded-md text-xs hover:bg-purple-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2 mb-4 shadow-sm">
        <Search className="h-3.5 w-3.5 text-gray-400" />

        <input
          type="text"
          placeholder="Search products..."
          className="bg-transparent text-sm w-full outline-none text-gray-800 dark:text-gray-200"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Results controls */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3 text-xs text-gray-600 dark:text-gray-400">
        <span>
          Showing {filtered.length ? startIndex + 1 : 0}–
          {Math.min(endIndex, filtered.length)} of {filtered.length} products
        </span>

        <div className="flex items-center gap-2">
          <span>Show:</span>

          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <span>per page</span>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-8">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto text-gray-500" />
          <p className="text-xs text-gray-500 mt-2">Loading products...</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="rounded-lg overflow-x-auto border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                  <th className="p-2 text-left w-12">S.No</th>
                  <th className="p-2 text-left font-medium">Product Code</th>
                  <th className="p-2 text-left font-medium">Description</th>
                  <th className="p-2 text-left font-medium">Status</th>
                  <th className="p-2 text-center font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {currentItems.map((item, i) => (
                  <tr
                    key={item.id ?? i}
                    className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="p-2">{startIndex + i + 1}</td>
                    <td className="p-2">{item.productCode || "-"}</td>
                    <td className="p-2">{item.description || "-"}</td>

                    <td className="p-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          isActive(item)
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {isActive(item) ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="p-2 text-center">
                      <button
                        onClick={() => onEdit(item)}
                        title="Edit product"
                        className="p-1 text-blue-500 hover:text-blue-600"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-8 text-xs text-gray-500 dark:text-gray-400">
                {list.length === 0
                  ? "No products found"
                  : "No products match your search"}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="flex flex-wrap justify-between items-center gap-3 mt-3 text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filtered.length)} of {filtered.length}{" "}
                entries
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </button>

                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2.5 py-1.5 border rounded ${
                      currentPage === page
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage >= totalPages}
                  className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductMasterList;
