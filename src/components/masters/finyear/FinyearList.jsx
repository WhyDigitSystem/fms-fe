import React, { useState, useEffect } from "react";
import { ArrowLeft, Pencil, Plus, Search, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import { finYearAPI } from "../../../api/finyearAPI";
import { useToast } from "../../Toast/ToastContext";

const FinYearList = ({ onAddNew, onEdit, onBack }) => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const { addToast } = useToast();

  useEffect(() => {
    loadFinYears();
  }, []);

  const loadFinYears = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await finYearAPI.getAllFinYears(ORG_ID);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        setList(response);
      } else if (response?.paramObjectsMap?.financialYearVOs) {
        setList(response.paramObjectsMap.financialYearVOs);
      } else if (response?.data) {
        setList(response.data);
      } else {
        setList([]);
        console.warn("Unexpected API response format:", response);
      }
    } catch (e) {
      console.error("Failed to load financial years", e);
      setError("Failed to load financial years. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this financial year?")) {
      return;
    }

    try {
      await finYearAPI.deleteFinYear(id);
      addToast("Financial year deleted successfully", "success");
      loadFinYears();
    } catch (error) {
      console.error("Failed to delete financial year", error);
      addToast("Failed to delete financial year", "error");
    }
  };

  // Filter financial years based on search with safe access
  const filtered = list.filter((finYear) => {
    const searchTerm = search.toLowerCase();
    return (
      finYear?.finYear?.toString().toLowerCase().includes(searchTerm) ||
      finYear?.finYearId?.toString().toLowerCase().includes(searchTerm) ||
      finYear?.finYearIdentifier?.toLowerCase().includes(searchTerm)
    );
  });

  // Pagination calculations
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filtered.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (totalPages <= 1) return [1];
    
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 p-4">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-lg font-semibold">Financial Year Master</span>
          </button>
        </div>

        <button
          onClick={onAddNew}
          className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 
          rounded-md text-xs hover:bg-purple-700 transition disabled:opacity-50"
          disabled={loading}
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button 
            onClick={loadFinYears}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search Box */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2 mb-4 shadow-sm">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by year, ID, or identifier…"
          className="bg-transparent text-sm w-full outline-none text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Table Header with Show Selector */}
      <div className="flex justify-between items-center mb-3">
        {/* Results Info */}
        {!loading && totalItems > 0 && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1}-{endIndex} of {totalItems} financial years
            {search && ` for "${search}"`}
          </div>
        )}

        {/* Show Selector - Top Right */}
        {!loading && totalItems > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span>entries</span>
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
          Loading financial years…
        </div>
      )}

      {/* Error State */}
      {!loading && error && filtered.length === 0 && (
        <div className="text-center text-sm text-red-500 dark:text-red-400 py-8">
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
          <table className="w-full text-sm">
            {/* Header */}
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                <th className="p-2 text-left w-14">S.No</th>
                <th className="p-2 text-left font-medium">Financial Year</th>
                <th className="p-2 text-left font-medium">Year ID</th>
                <th className="p-2 text-left font-medium">Identifier</th>
                <th className="p-2 text-left font-medium">Start Date</th>
                <th className="p-2 text-left font-medium">End Date</th>
                <th className="p-2 text-left font-medium">Current</th>
                <th className="p-2 text-left font-medium">Active</th>
                <th className="p-2 text-left font-medium">Closed</th>
                <th className="p-2 text-center font-medium">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {currentItems.map((finYear, i) => (
                <tr
                  key={finYear.id || i}
                  className="border-t border-gray-200 dark:border-gray-700 
                  bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200
                  hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                >
                  <td className="p-2">{startIndex + i + 1}</td>
                  <td className="p-2">{finYear.finYear || "-"}</td>
                  <td className="p-2">{finYear.finYearId || "-"}</td>
                  <td className="p-2">{finYear.finYearIdentifier || "-"}</td>
                  <td className="p-2">
                    {finYear.startDate ? dayjs(finYear.startDate).format("DD-MM-YYYY") : "-"}
                  </td>
                  <td className="p-2">
                    {finYear.endDate ? dayjs(finYear.endDate).format("DD-MM-YYYY") : "-"}
                  </td>

                  {/* Current */}
                  <td className="p-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-medium 
                        ${
                          finYear.currentFinYear === true || finYear.currentFinYear === "true"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
                        }`}
                    >
                      {finYear.currentFinYear === true || finYear.currentFinYear === "true" ? "Yes" : "No"}
                    </span>
                  </td>

                  {/* Active */}
                  <td className="p-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-medium 
                        ${
                          finYear.active === true || finYear.active === "Active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                    >
                      {finYear.active === true || finYear.active === "Active" ? "Yes" : "No"}
                    </span>
                  </td>

                  {/* Closed */}
                  <td className="p-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-medium 
                        ${
                          finYear.closed === true || finYear.closed === "true"
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
                        }`}
                    >
                      {finYear.closed === true || finYear.closed === "true" ? "Yes" : "No"}
                    </span>
                  </td>

                  <td className="p-2 flex justify-center gap-1">
                    <button
                      onClick={() => onEdit(finYear)}
                      className="p-1 text-blue-500 hover:text-blue-600 transition"
                      disabled={loading}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(finYear.id)}
                      className="p-1 text-red-500 hover:text-red-600 transition"
                      disabled={loading}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Empty State */}
              {currentItems.length === 0 && !loading && !error && (
                <tr>
                  <td
                    colSpan={10}
                    className="p-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {search ? "No financial years found matching your search" : "No financial years available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls - Bottom */}
      {!loading && !error && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          {/* Page info */}
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center gap-1">
            {/* Previous button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-2.5 py-1 border text-xs rounded transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinYearList;