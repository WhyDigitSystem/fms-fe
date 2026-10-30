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
import { userAPI } from "../../../api/userAPI";

const UserList = ({ onAddNew, onEdit, refreshTrigger, onBack }) => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const ORG_ID = parseInt(localStorage.getItem("orgId"), 10);

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const users = await userAPI.getUsers(ORG_ID);

      if (Array.isArray(users)) {
        const sortedUsers = [...users].sort(
          (a, b) => (b.id || 0) - (a.id || 0),
        );
        setList(sortedUsers);
      } else {
        setList([]);
      }
    } catch (err) {
      console.error("Error loading users:", err);
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
    fetchUsers();
  };

  // Excel Download Function
  const handleExcelDownload = () => {
    if (list.length === 0) {
      alert("No data to export");
      return;
    }

    try {
      const excelData = list.map((user) => ({
        "Employee Name": user.employeeName || "-",
        "User Code": user.userName || "-",
        Email: user.email || "-",
        "User Type": user.userType || "-",
        "Mobile No": user.mobileNo || "-",
        Active: user.active ? "Yes" : "No",
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb, ws, "Users");

      const fileName = `Users_Export_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Error exporting data");
    }
  };

  // Filter users based on search
  const filtered = list.filter((user) => {
    const searchTerm = search.toLowerCase();

    return (
      user.employeeName?.toLowerCase().includes(searchTerm) ||
      user.userName?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm) ||
      user.userType?.toLowerCase().includes(searchTerm)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
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

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));

    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center justify-center h-8 w-8 shrink-0 rounded-md
              border border-gray-200 dark:border-gray-700
              text-gray-600 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-800
              hover:text-gray-900 dark:hover:text-white
              transition"
            title="Back"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            User Management
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Button */}
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

          {/* Export Button */}
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

          {/* Add User Button */}
          <button
            type="button"
            onClick={onAddNew}
            className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5
              rounded-md text-xs hover:bg-purple-700 transition"
          >
            <Plus className="h-4 w-4" />
            Add User
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
          placeholder="Search by Employee Name, User Code, or Email..."
          className="bg-transparent text-sm w-full outline-none
            text-gray-800 dark:text-gray-200"
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

      {/* Results Count and Items Per Page */}
      <div
        className="flex flex-col sm:flex-row sm:justify-between
        sm:items-center gap-3 mb-4"
      >
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filtered.length > 0 ? startIndex + 1 : 0}-
          {Math.min(endIndex, filtered.length)} of {filtered.length} users
          {search && ` for "${search}"`}
        </div>

        {/* Items Per Page Selector */}
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

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-500 dark:text-gray-400" />

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Loading users...
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div
          className="rounded-lg overflow-x-auto border border-gray-200
          dark:border-gray-700 shadow-sm mb-4"
        >
          <table className="w-full min-w-[750px] text-sm">
            <thead>
              <tr
                className="bg-gray-100 dark:bg-gray-800 text-xs
                text-gray-600 dark:text-gray-300"
              >
                <th className="p-2 text-left w-14">S.No</th>
                <th className="p-2 text-left font-medium">Employee Name</th>
                <th className="p-2 text-left font-medium">User Code</th>
                <th className="p-2 text-left font-medium">Email</th>
                <th className="p-2 text-left font-medium">User Type</th>
                <th className="p-2 text-left font-medium">Active</th>
                <th className="p-2 text-center font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((user, i) => (
                  <tr
                    key={user.id || i}
                    className="border-t border-gray-200 dark:border-gray-700
                      bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200
                      hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="p-2">{startIndex + i + 1}</td>

                    <td className="p-2 font-medium">
                      {user.employeeName || "-"}
                    </td>

                    <td className="p-2">{user.userName || "-"}</td>

                    <td className="p-2">{user.email || "-"}</td>

                    <td className="p-2">
                      <span
                        className="px-2 py-1 bg-blue-100 text-blue-700
                        dark:bg-blue-900/30 dark:text-blue-300
                        rounded-md text-xs font-medium"
                      >
                        {user.userType || "-"}
                      </span>
                    </td>

                    <td className="p-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                          user.active
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {user.active ? "Yes" : "No"}
                      </span>
                    </td>

                    <td className="p-2">
                      <div className="flex justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => onEdit(user)}
                          className="p-1 text-blue-500 hover:text-blue-600
                            transition-colors"
                          title="Edit user"
                          aria-label={`Edit ${user.employeeName || "user"}`}
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
                    colSpan={7}
                    className="p-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    {list.length === 0
                      ? "No users found"
                      : "No users match your search"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div
          className="flex flex-col sm:flex-row justify-between
          items-center gap-4 mt-4"
        >
          {/* Results Info */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of{" "}
            {filtered.length} entries
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* Previous Button */}
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

            {/* Page Numbers */}
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

            {/* Next Button */}
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

export default UserList;
