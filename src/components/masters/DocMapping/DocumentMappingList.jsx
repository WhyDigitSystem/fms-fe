import React, { useState, useEffect } from "react";
import { Plus, Edit, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { documentMappingAPI } from "../../../api/docmappingAPI";
import { useToast } from "../../Toast/ToastContext";

const DocumentMappingList = ({ onAddNew, onEdit, orgId }) => {
  const [loading, setLoading] = useState(true);
  const [mappingList, setMappingList] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadMappings();
  }, []);

  const loadMappings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await documentMappingAPI.getAllDocumentTypeMappings(orgId);
      
      if (response?.status) {
        const mappedData = response.paramObjectsMap.documentTypeMappingVO?.map(item => ({
          ...item,
          key: item.id,
          active: item.active === "Active" || item.active === true,
        })) || [];
        setMappingList(mappedData);
      } else {
        setMappingList([]);
      }
    } catch (error) {
      console.error("Failed to load document type mappings", error);
      setError("Failed to load document type mappings. Please try again.");
      setMappingList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document type mapping?")) {
      return;
    }

    try {
      await documentMappingAPI.deleteDocumentTypeMapping(id);
      addToast("Document type mapping deleted successfully", "success");
      loadMappings();
    } catch (error) {
      console.error("Failed to delete document type mapping", error);
      addToast("Failed to delete document type mapping", "error");
    }
  };

  // Filter mappings based on search
  const filtered = mappingList.filter((mapping) => {
    const searchTerm = search.toLowerCase();
    return (
      mapping?.branch?.toLowerCase().includes(searchTerm) ||
      mapping?.finYear?.toLowerCase().includes(searchTerm)
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
    <div 
      className="max-w-6xl mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen"
    >
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Document Type Mapping Master</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            List of all document type mappings
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 
          rounded-md text-xs hover:bg-purple-700 transition disabled:opacity-50"
          disabled={loading}
        >
          <Plus className="h-4 w-4" /> Add New
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded">
          {error}
          <button 
            onClick={loadMappings}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search Box */}
      <div className="mb-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm">
          <input
            type="text"
            placeholder="Search by branch or financial year..."
            className="bg-transparent text-sm w-full outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {/* Table Header with Show Selector */}
      <div className="flex justify-between items-center mb-3">
        {/* Results Info */}
        {!loading && totalItems > 0 && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1}-{endIndex} of {totalItems} mappings
            {search && ` for "${search}"`}
          </div>
        )}

        {/* Show Selector */}
        {!loading && totalItems > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
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
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 py-8">
          Loading document type mappings...
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 shadow-sm mb-4">
          <table className="w-full text-sm">
            {/* Header */}
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-xs">
                <th className="p-3 text-left font-medium">Branch</th>
                <th className="p-3 text-left font-medium">Financial Year</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-center font-medium">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {currentItems.map((mapping, i) => (
                <tr
                  key={mapping.id || i}
                  className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <td className="p-3">{mapping.branch || "-"}</td>
                  <td className="p-3">{mapping.finYear || "-"}</td>

                  {/* Status */}
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium 
                        ${
                          mapping.active
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
                            : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
                        }`}
                    >
                      {mapping.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onEdit(mapping)}
                        className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition"
                        disabled={loading}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(mapping.id)}
                        className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition"
                        disabled={loading}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Empty State */}
              {currentItems.length === 0 && !loading && !error && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {search ? "No mappings found matching your search" : "No document type mappings available"}
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
              className="p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentMappingList;