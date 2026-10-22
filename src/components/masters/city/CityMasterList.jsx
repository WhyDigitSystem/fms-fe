import {
  ArrowLeft,
  Pencil,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import masterAPI from "../../../api/cityAPI";

const CityMasterList = ({ onAddNew, onEdit, onBack }) => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const ORG_ID = parseInt(localStorage.getItem("orgId"));

  useEffect(() => {
    loadCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCities = async () => {
    try {
      setLoading(true);
      setError(null);
      // ✅ new endpoint (getAllCityByOrgId)
      const response = await masterAPI.getAllCities(ORG_ID);
      setList(Array.isArray(response) ? response : []);
    } catch (e) {
      console.error("Failed to load cities", e);
      setError("Failed to load cities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Object-or-string helpers
  const getCountryName = (city) => {
    if (!city?.country) return "";
    if (typeof city.country === "string") return city.country;
    return city.country.country || city.country.countryName || "";
  };

  const getStateName = (city) => {
    if (!city?.state) return "";
    if (typeof city.state === "string") return city.state;
    return city.state.stateName || city.state.state || "";
  };

  const isActive = (city) =>
    city?.active === "Active" || city?.active === true;

  // Filter
  const filtered = list.filter((city) => {
    const q = search.toLowerCase();
    return (
      (city?.cityName || "").toLowerCase().includes(q) ||
      (city?.cityCode || "").toLowerCase().includes(q) ||
      getCountryName(city).toLowerCase().includes(q) ||
      getStateName(city).toLowerCase().includes(q)
    );
  });

  // Pagination
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filtered.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
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
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

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
            <span className="text-lg font-semibold">City Master</span>
          </button>
        </div>

        <button
          onClick={onAddNew}
          className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 rounded-md text-xs hover:bg-purple-700 transition disabled:opacity-50"
          disabled={loading}
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button
            onClick={loadCities}
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
          placeholder="Search cities, countries, states, or codes…"
          className="bg-transparent text-sm w-full outline-none text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Header strip */}
      <div className="flex justify-between items-center mb-3">
        {!loading && totalItems > 0 && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1}-{endIndex} of {totalItems} cities
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

      {loading && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
          Loading cities…
        </div>
      )}

      {!loading && error && filtered.length === 0 && (
        <div className="text-center text-sm text-red-500 dark:text-red-400 py-8">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                <th className="p-2 text-left w-14">S.No</th>
                <th className="p-2 text-left font-medium">City Code</th>
                <th className="p-2 text-left font-medium">City Name</th>
                <th className="p-2 text-left font-medium">Country</th>
                <th className="p-2 text-left font-medium">State</th>
                <th className="p-2 text-left font-medium">Status</th>
                <th className="p-2 text-center font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((city, i) => (
                <tr
                  key={city.id || i}
                  className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                >
                  <td className="p-2">{startIndex + i + 1}</td>
                  <td className="p-2">{city.cityCode || "-"}</td>
                  <td className="p-2">{city.cityName || "-"}</td>
                  <td className="p-2">{getCountryName(city) || "-"}</td>
                  <td className="p-2">{getStateName(city) || "-"}</td>

                  <td className="p-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-medium ${isActive(city)
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                    >
                      {isActive(city) ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-2 flex justify-center">
                    <button
                      onClick={() => onEdit(city)}
                      className="p-1 text-blue-500 hover:text-blue-600 transition"
                      disabled={loading}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {currentItems.length === 0 && !loading && !error && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {search
                      ? "No cities found matching your search"
                      : "No cities available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && totalItems > 0 && (
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

export default CityMasterList;