import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Pencil,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { docTypeAPI } from "../../../api/doctypeAPI";
import { useToast } from "../../Toast/ToastContext";

const DocTypeList = ({ onAddNew, onEdit, onBack }) => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const ORG_ID = parseInt(localStorage.getItem("orgId")) || 1000000001;
  const { addToast } = useToast();

  useEffect(() => {
    loadDocTypes();
  }, []);

  const loadDocTypes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await docTypeAPI.getAllDocumentTypeMaster(ORG_ID);
      const body = response?.data ?? response;

      const rows =
        body?.paramObjectsMap?.documentTypeMasterList ||
        body?.paramObjectsMap?.documentTypeMasterVo ||
        [];

      setList(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.error("Failed to load document types", e);
      setError("Failed to load document types. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this document type?")
    ) {
      return;
    }

    try {
      await docTypeAPI.deleteDocumentType(id);
      addToast("Document type deleted successfully", "success");
      loadDocTypes();
    } catch (error) {
      console.error("Failed to delete document type", error);
      addToast("Failed to delete document type", "error");
    }
  };

  // Filter
  const filtered = list.filter((docType) => {
    const searchTerm = search.toLowerCase();

    return (
      docType?.screenCode?.toLowerCase().includes(searchTerm) ||
      docType?.screenName?.toLowerCase().includes(searchTerm) ||
      docType?.docCode?.toLowerCase().includes(searchTerm) ||
      docType?.description?.toLowerCase().includes(searchTerm)
    );
  });

  // Pagination calculations
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const currentItems = filtered.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

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

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Active status helper
  const isActive = (row) =>
    row?.active === true || row?.active === "Active" || row?.active === 1;

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button
            type="button"
            onClick={onBack}
            title="Back"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="h-5 w-5" />

            <span className="text-lg font-semibold">Document Type Master</span>
          </button>
        </div>

        {/* Add Button */}
        <button
          type="button"
          onClick={onAddNew}
          className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 rounded-md text-xs hover:bg-purple-700 transition disabled:opacity-50"
          disabled={loading}
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}

          <button
            type="button"
            onClick={loadDocTypes}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2 mb-4 shadow-sm">
        <Search className="h-4 w-4 text-gray-400" />

        <input
          type="text"
          placeholder="Search by screen code, screen name, document code, or description..."
          className="bg-transparent text-sm w-full outline-none text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Show Selector */}
      <div className="flex justify-between items-center mb-3">
        {!loading && totalItems > 0 && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1}-{endIndex} of {totalItems} document types
            {search && ` for "${search}"`}
          </div>
        )}

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

      {/* Loading */}
      {loading && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
          Loading document types...
        </div>
      )}

      {/* Error Message */}
      {!loading && error && filtered.length === 0 && (
        <div className="text-center text-sm text-red-500 dark:text-red-400 py-8">
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                <th className="p-2 text-left w-14">S.No</th>

                <th className="p-2 text-left font-medium">Screen Code</th>

                <th className="p-2 text-left font-medium">Screen Name</th>

                <th className="p-2 text-left font-medium">Document Code</th>

                <th className="p-2 text-left font-medium">Description</th>

                <th className="p-2 text-center font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((docType, i) => (
                <tr
                  key={docType.id || i}
                  className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                >
                  <td className="p-2">{startIndex + i + 1}</td>

                  <td className="p-2">{docType.screenCode || "-"}</td>

                  <td className="p-2">{docType.screenName || "-"}</td>

                  <td className="p-2">{docType.docCode || "-"}</td>

                  <td className="p-2">
                    <div
                      className="max-w-xs truncate"
                      title={docType.description}
                    >
                      {docType.description || "-"}
                    </div>
                  </td>

                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => onEdit(docType)}
                      className="p-1 text-blue-500 hover:text-blue-600 transition"
                      disabled={loading}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {currentItems.length === 0 && !loading && !error && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {search
                      ? "No document types found matching your search"
                      : "No document types available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>

            {getPageNumbers().map((page) => (
              <button
                type="button"
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-2.5 py-1 border text-xs rounded transition-colors ${
                  currentPage === page
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
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

export default DocTypeList;
