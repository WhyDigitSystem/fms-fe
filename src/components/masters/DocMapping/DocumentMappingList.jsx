import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { documentMappingAPI } from "../../../api/docmappingAPI";
import { useToast } from "../../Toast/ToastContext";

// -------------------------------------------------------------
// Normalize mapping row
// -------------------------------------------------------------
const normaliseRow = (item) => {
  const branchObj = item?.branch ?? {};
  const finYearObj = item?.financialYear ?? {};

  return {
    ...item,
    key: item?.id,

    branch: branchObj?.branchName ?? branchObj?.branch ?? "",

    branchCode: branchObj?.branchCode ?? "",

    finYear: finYearObj?.finYear != null ? String(finYearObj.finYear) : "",

    _branch: branchObj,
    _financialYear: finYearObj,

    active:
      item?.active === "Active" || item?.active === true || item?.active === 1,

    details:
      item?.documentTypeMappingDetails ||
      item?.documentTypeMappingDetailsVO ||
      [],
  };
};

// -------------------------------------------------------------
// Document Mapping List
// -------------------------------------------------------------
const DocumentMappingList = ({ onAddNew, onEdit, onBack, orgId }) => {
  const [loading, setLoading] = useState(true);
  const [mappingList, setMappingList] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [error, setError] = useState(null);

  const { addToast } = useToast();

  // -------------------------------------------------------------
  // Load mappings
  // -------------------------------------------------------------
  useEffect(() => {
    loadMappings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMappings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await documentMappingAPI.getDocumentTypeMappingByOrgId(
        orgId,
        orgId,
      );

      const body = response?.data ?? response;

      const rows =
        body?.paramObjectsMap?.documentTypeMappingResponseVO ||
        body?.paramObjectsMap?.documentTypeMappingVO ||
        [];

      const list = Array.isArray(rows) ? rows : rows ? [rows] : [];

      setMappingList(list.map(normaliseRow));
    } catch (err) {
      console.error("Failed to load document type mappings", err);

      setError("Failed to load document type mappings. Please try again.");

      setMappingList([]);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Delete
  // -------------------------------------------------------------
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this document type mapping?",
      )
    ) {
      return;
    }

    try {
      await documentMappingAPI.deleteDocumentTypeMapping(id);

      addToast("Document type mapping deleted successfully", "success");

      loadMappings();
    } catch (err) {
      console.error("Failed to delete document type mapping", err);

      addToast("Failed to delete document type mapping", "error");
    }
  };

  // -------------------------------------------------------------
  // Search filter
  // -------------------------------------------------------------
  const filtered = mappingList.filter((mapping) => {
    const term = search.toLowerCase();

    const detailsText = (mapping.details || [])
      .map((d) =>
        [d?.screenName, d?.screenCode, d?.docCode, d?.prefix]
          .filter(Boolean)
          .join(" "),
      )
      .join(" ");

    return (
      mapping?.branch?.toLowerCase().includes(term) ||
      mapping?.branchCode?.toLowerCase().includes(term) ||
      mapping?.finYear?.toLowerCase().includes(term) ||
      detailsText.toLowerCase().includes(term)
    );
  });

  // -------------------------------------------------------------
  // Pagination
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // Page numbers
  // -------------------------------------------------------------
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

  // Reset page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // -------------------------------------------------------------
  // Render
  // -------------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          {/* BACK BUTTON */}
          <button
            onClick={onBack || (() => window.history.back())}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Document Type Mapping Master
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              List of all document type mappings
            </p>
          </div>
        </div>

        {/* ADD NEW */}
        <button
          onClick={onAddNew}
          disabled={loading}
          className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 rounded-md text-xs hover:bg-purple-700 transition disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add New
        </button>
      </div>

      {/* ERROR */}
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

      {/* SEARCH */}
      <div className="mb-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm">
          <Search className="h-4 w-4 text-gray-400" />

          <input
            type="text"
            placeholder="Search by branch, financial year, screen, doc code or prefix..."
            className="bg-transparent text-sm w-full outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {/* SHOW ENTRIES */}
      <div className="flex justify-between items-center mb-3">
        {!loading && totalItems > 0 && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1}-{endIndex} of {totalItems} mappings
            {search && ` for "${search}"`}
          </div>
        )}

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

      {/* LOADING */}
      {loading && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 py-8">
          Loading document type mappings...
        </div>
      )}

      {/* TABLE */}
      {!loading && !error && (
        <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 shadow-sm mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-xs">
                <th className="p-3 text-left font-medium">Branch</th>

                <th className="p-3 text-left font-medium">Financial Year</th>

                <th className="p-3 text-left font-medium">Documents</th>

                <th className="p-3 text-center font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((mapping, i) => (
                <tr
                  key={mapping.id || i}
                  className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <td className="p-3">
                    <div className="font-medium">{mapping.branch || "-"}</div>
                  </td>

                  <td className="p-3">{mapping.finYear || "-"}</td>

                  <td className="p-3">
                    {mapping.details?.length > 0 ? (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {mapping.details.length} document
                        {mapping.details.length > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      {/* EDIT */}
                      <button
                        onClick={() => onEdit(mapping)}
                        className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition"
                        disabled={loading}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      {/* DELETE */}
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

              {currentItems.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {search
                      ? "No mappings found matching your search"
                      : "No document type mappings available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      {!loading && !error && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-2.5 py-1 border text-xs rounded transition-colors ${
                  currentPage === page
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {page}
              </button>
            ))}

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
