import { Pencil, Plus, Search, Download, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { userAPI } from "../../../api/userAPI";

const UserList = ({ onAddNew, onEdit, refreshTrigger }) => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const ORG_ID = parseInt(localStorage.getItem("orgId"));

  useEffect(() => {
    console.log("🔄 useEffect triggered, refreshTrigger:", refreshTrigger);
    fetchUsers();
  }, [refreshTrigger]);

  const fetchUsers = async () => {
    console.log("🚀 fetchUsers function called");

    try {
      setLoading(true);

      console.log("🔍 [DEBUG] Fetching users with orgId:", ORG_ID);

      console.log("📡 Making API call...");
      const users = await userAPI.getUsers(ORG_ID);

      console.log("✅ API Response received");
      console.log("📊 Users received:", users);
      console.log("📊 Is array:", Array.isArray(users));
      console.log("📊 Length:", users?.length);

      if (users && Array.isArray(users)) {
        console.log(`✅ Processing ${users.length} users`);
        const sortedUsers = users.sort((a, b) => (b.id || 0) - (a.id || 0));
        setList(sortedUsers);
        console.log("✅ List state updated with", sortedUsers.length, "users");
      } else {
        console.warn("⚠️ No users array in response:", users);
        setList([]);
      }
    } catch (err) {
      console.error("❌ Error loading users:", err);
      console.error("❌ Error details:", err.response?.data || err.message);
      setList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log("🏁 fetchUsers completed");
    }
  };

  // Add this useEffect to monitor list state changes
  useEffect(() => {
    console.log("📈 List state updated:", list.length, "users");
    if (list.length > 0) {
      console.log("📝 First user in list:", list[0]);
    }
  }, [list]);

  const handleRefresh = () => {
    console.log("🔄 Manual refresh triggered");
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
        "Email": user.email || "-",
        "User Type": user.userType || "-",
        "Mobile No": user.mobileNo || "-",
        "Active": user.active ? "Yes" : "No",
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
  const filtered = list.filter(
    (user) =>
      user.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
      user.userName?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.userType?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filtered.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle items per page change
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

  console.log("📊 Current state - List:", list.length, "Filtered:", filtered.length);

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          User Management
        </h1>

        <div className="flex gap-2">
          <button
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
            onClick={handleExcelDownload}
            disabled={list.length === 0}
            className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 
            rounded-md text-xs hover:bg-green-700 transition disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Export
          </button>

          <button
            onClick={onAddNew}
            className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 
            rounded-md text-xs hover:bg-purple-700 transition"
          >
            <Plus className="h-4 w-4" /> Add User
          </button>
        </div>
      </div>

      {/* Search Box */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2 mb-4 shadow-sm">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Employee Name, User Code, or Email…"
          className="bg-transparent text-sm w-full outline-none text-gray-800 dark:text-gray-200"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        {search && (
          <span className="text-xs text-gray-500">
            {filtered.length} results
          </span>
        )}
      </div>

      {/* Results Count and Items Per Page */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {startIndex + 1}-{Math.min(endIndex, filtered.length)} of {filtered.length} users
          {search && ` for "${search}"`}
        </div>
        
        {/* Items per page selector */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                     rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            Loading users…
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
          <table className="w-full text-sm">
            {/* Header */}
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                <th className="p-2 text-left w-14">S.No</th>
                <th className="p-2 text-left font-medium">Employee Name</th>
                <th className="p-2 text-left font-medium">User Code</th>
                <th className="p-2 text-left font-medium">Email</th>
                <th className="p-2 text-left font-medium">User Type</th>
                <th className="p-2 text-left font-medium">Active</th>
                <th className="p-2 text-center font-medium">Action</th>
              </tr>
            </thead>

            {/* Rows */}
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
                    <td className="p-2 font-medium">{user.employeeName || "-"}</td>
                    <td className="p-2">{user.userName || "-"}</td>
                    <td className="p-2">{user.email || "-"}</td>
                    <td className="p-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-md text-xs font-medium">
                        {user.userType || "-"}
                      </span>
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-medium 
                          ${
                            user.active
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                      >
                        {user.active ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-2 flex justify-center gap-3">
                      <button
                        onClick={() => onEdit(user)}
                        className="p-1 text-blue-500 hover:text-blue-600 transition-colors"
                        title="Edit user"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
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
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          {/* Results info */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of {filtered.length} entries
          </div>

          {/* Pagination controls */}
          <div className="flex items-center gap-2">
            {/* Previous button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 
                       dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 
                       text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {/* Page numbers */}
            <div className="flex gap-1">
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 
                       dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 
                       text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
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