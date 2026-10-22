import {
  ArrowLeft,
  Pencil,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { stateAPI } from "../../../api/stateAPI";

const StateMasterList = ({ onAddNew, onEdit, onBack }) => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const ORG_ID = parseInt(localStorage.getItem("orgId"));

  useEffect(() => {
    loadStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStates = async () => {
    try {
      setLoading(true);
      const response = await stateAPI.getAllStates(ORG_ID); // new endpoint
      setList(Array.isArray(response) ? response : []);
    } catch (e) {
      console.error("Failed to load states", e);
    } finally {
      setLoading(false);
    }
  };

  // Country display helper — handles object or string shape
  const getCountryName = (state) => {
    if (!state) return "";
    if (typeof state.country === "string") return state.country;
    return state.country?.country || state.country?.countryName || "";
  };

  // Normalize active flag ("Active" string OR boolean true)
  const isActive = (state) =>
    state?.active === "Active" || state?.active === true;

  // Filter states based on search
  const filtered = list.filter((state) => {
    const country = getCountryName(state);
    const q = search.toLowerCase();
    return (
      state.stateName?.toLowerCase().includes(q) ||
      state.stateCode?.toLowerCase().includes(q) ||
      String(state.stateNumber || "")
        .toLowerCase()
        .includes(q) ||
      country.toLowerCase().includes(q) ||
      state.region?.toLowerCase().includes(q)
    );
  });

  // Pagination calculations
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filtered.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <ArrowLeft
            className="h-5 w-5 cursor-pointer text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
            onClick={onBack}
          />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            State Master
          </h1>
        </div>

        <button
          onClick={onAddNew}
          className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 rounded-md text-xs hover:bg-purple-700 transition"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {/* Search Box */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2 mb-4 shadow-sm">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search states, countries, or regions…"
          className="bg-transparent text-sm w-full outline-none text-gray-800 dark:text-gray-200"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Header with Show Selector */}
      <div className="flex justify-between items-center mb-3">
        {!loading && filtered.length > 0 && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{" "}
            {totalItems} states
            {search && ` for "${search}"`}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
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
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
          Loading states…
        </p>
      )}

      {/* Table */}
      {!loading && (
        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                <th className="p-2 text-left w-14">S.No</th>
                <th className="p-2 text-left font-medium">State Code</th>
                <th className="p-2 text-left font-medium">State Name</th>
                <th className="p-2 text-left font-medium">State Number</th>
                <th className="p-2 text-left font-medium">Country</th>
                <th className="p-2 text-left font-medium">Region</th>
                <th className="p-2 text-left font-medium">Status</th>
                <th className="p-2 text-center font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((state, i) => (
                <tr
                  key={state.id}
                  className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                >
                  <td className="p-2">{startIndex + i + 1}</td>
                  <td className="p-2">{state.stateCode}</td>
                  <td className="p-2">{state.stateName}</td>
                  <td className="p-2">{state.stateNumber}</td>
                  <td className="p-2">{getCountryName(state)}</td>
                  <td className="p-2">{state.region}</td>

                  <td className="p-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-medium ${isActive(state)
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                    >
                      {isActive(state) ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-2 flex justify-center">
                    <Pencil
                      className="h-4 w-4 text-blue-500 hover:text-blue-600 cursor-pointer transition"
                      onClick={() => onEdit(state)}
                    />
                  </td>
                </tr>
              ))}

              {currentItems.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {search
                      ? "No states found matching your search"
                      : "No states found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-2.5 py-1 border text-xs rounded transition-colors ${currentPage === page
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
              >
                {page}
              </button>
            ))}

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

export default StateMasterList;