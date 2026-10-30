import {
  ArrowLeft,
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
import customerMasterAPI from "../../../api/customerMasterAPI";

const CustomerList = ({ onAddNew, onEdit, refreshTrigger, onBack }) => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const ORG_ID = parseInt(localStorage.getItem("orgId"), 10);
  const BRANCH_ID = parseInt(localStorage.getItem("branchId"), 10);

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const customers = await customerMasterAPI.getCustomers(BRANCH_ID, ORG_ID);

      if (Array.isArray(customers)) {
        const sorted = [...customers].sort((a, b) => (b.id || 0) - (a.id || 0));
        setList(sorted);
      } else {
        setList([]);
      }
    } catch (err) {
      console.error("Error loading customers:", err);
      console.error("Error details:", err.response?.data || err.message);
      setList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchCustomers();
  };

  const isActive = (c) => c.active === "Active" || c.active === true;

  const getCity = (c) => c.customerAddresses?.[0]?.city?.city || "-";

  // Excel Download
  const handleExcelDownload = () => {
    if (list.length === 0) {
      alert("No data to export");
      return;
    }
    try {
      const excelData = list.map((c) => ({
        "Customer Name": c.customerName || "-",
        "Customer Type": c.customerType || "-",
        "Industry Type": c.industryType || "-",
        GSTIN: c.gstin || "-",
        PAN: c.pan || "-",
        Branch: c.branch?.branch || "-",
        City: getCity(c),
        "Contact Name": c.customerAddresses?.[0]?.contactName || "-",
        Mobile: c.customerAddresses?.[0]?.mobile || "-",
        Email: c.customerAddresses?.[0]?.email || "-",
        Active: isActive(c) ? "Yes" : "No",
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Customers");
      const fileName = `Customers_Export_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Error exporting data");
    }
  };

  // Search filter
  const filtered = list.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.customerName?.toLowerCase().includes(term) ||
      c.customerType?.toLowerCase().includes(term) ||
      c.industryType?.toLowerCase().includes(term) ||
      c.gstin?.toLowerCase().includes(term) ||
      c.pan?.toLowerCase().includes(term)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filtered.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  const handleBack = () => {
    if (onBack) onBack();
    else window.history.back();
  };

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center justify-center h-8 w-8 shrink-0 rounded-md
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
            Customer
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 bg-gray-600 text-white px-3 py-1.5
              rounded-md text-xs hover:bg-gray-700 transition disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            onClick={handleExcelDownload}
            disabled={list.length === 0}
            className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5
              rounded-md text-xs hover:bg-green-700 transition disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>

          <button
            type="button"
            onClick={onAddNew}
            className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5
              rounded-md text-xs hover:bg-purple-700 transition"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Search Box */}
      <div
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
        rounded-lg px-3 py-2 flex items-center gap-2 mb-4 shadow-sm"
      >
        <Search className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Customer Name, Type, GSTIN or PAN..."
          className="bg-transparent text-sm w-full outline-none text-gray-800 dark:text-gray-200"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        {search && (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {filtered.length} results
          </span>
        )}
      </div>

      {/* Results count + items per page */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filtered.length > 0 ? startIndex + 1 : 0}-
          {Math.min(endIndex, filtered.length)} of {filtered.length} customers
          {search && ` for "${search}"`}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300
              dark:border-gray-600 rounded px-2 py-1 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span>per page</span>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-500 dark:text-gray-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Loading customers...
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="rounded-lg overflow-x-auto border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                <th className="p-2 text-left w-14">S.No</th>
                <th className="p-2 text-left font-medium">Customer Name</th>
                <th className="p-2 text-left font-medium">Type</th>
                <th className="p-2 text-left font-medium">Industry</th>
                <th className="p-2 text-left font-medium">GSTIN</th>
                <th className="p-2 text-left font-medium">PAN</th>
                <th className="p-2 text-left font-medium">City</th>
                <th className="p-2 text-left font-medium">Active</th>
                <th className="p-2 text-center font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((c, i) => (
                  <tr
                    key={c.id || i}
                    className="border-t border-gray-200 dark:border-gray-700
                      bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200
                      hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="p-2">{startIndex + i + 1}</td>
                    <td className="p-2 font-medium">{c.customerName || "-"}</td>
                    <td className="p-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-md text-xs font-medium">
                        {c.customerType || "-"}
                      </span>
                    </td>
                    <td className="p-2">{c.industryType || "-"}</td>
                    <td className="p-2">{c.gstin || "-"}</td>
                    <td className="p-2">{c.pan || "-"}</td>
                    <td className="p-2">{getCity(c)}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                          isActive(c)
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {isActive(c) ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => onEdit(c)}
                          className="p-1 text-blue-500 hover:text-blue-600 transition-colors"
                          title="Edit customer"
                          aria-label={`Edit ${c.customerName || "customer"}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="p-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    {list.length === 0
                      ? "No customers found"
                      : "No customers match your search"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of{" "}
            {filtered.length} entries
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm
                border border-gray-300 dark:border-gray-600 rounded-md
                bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                hover:bg-gray-50 dark:hover:bg-gray-700
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex gap-1">
              {getPageNumbers().map((page) => (
                <button
                  type="button"
                  key={page}
                  onClick={() => handlePageChange(page)}
                  aria-current={currentPage === page ? "page" : undefined}
                  className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                    currentPage === page
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm
                border border-gray-300 dark:border-gray-600 rounded-md
                bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                hover:bg-gray-50 dark:hover:bg-gray-700
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
