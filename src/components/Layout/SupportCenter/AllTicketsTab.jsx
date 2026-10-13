import React, { useState } from 'react';
import {
  Search,
  Eye,
  Filter,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import CommentSection from './HelperComponent/CommentSection';
import TicketInfo from './HelperComponent/TicketInfo';
import { getStatusChip } from './index';
import apiClient from '../../../api/apiClient';
import { useSelector } from 'react-redux';

const AllTicketsTab = ({ tickets, onRowClick, getAllTickets, loginUserName }) => {
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isSearchExpanded, setSearchExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);

  const { user } = useSelector((state) => state.auth);
  const orgId = user.orgId;

  const handleOpenDialog = async (ticket) => {
    setSelectedTicket(ticket);
    await getComments(ticket.id);
    setComment('');
    setOpenDialog(true);
    onRowClick && onRowClick(ticket);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTicket(null);
    setComment('');
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: "", message: "" }), 3000);
  };

  const getComments = async (id) => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`api/ticketcontroller/getCommentsByTicketId?orgId=${orgId}&ticketId=${id}`);

      if (response.status === true && Array.isArray(response.paramObjectsMap?.commentsVO)) {
        setComments(response.paramObjectsMap.commentsVO);
      } else {
        showNotification('error', 'No comments found or error in response');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      showNotification('error', 'Failed to fetch comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (comment, editingId) => {
    if (!comment.trim()) {
      showNotification('error', 'Please enter a comment');
      return;
    }

    const payload = {
      comments: comment,
      ticketId: selectedTicket?.id,
      createdBy: loginUserName,
      ...(editingId && { id: editingId }),
      orgId: orgId,
      userName: loginUserName
    };

    try {
      setIsLoading(true);
      const response = await apiClient.put('ticketcontroller/updateCreateComments', payload);

      if (response.status === true) {
        showNotification('success', editingId ? 'Comment updated' : 'Comment added');
        await getComments(selectedTicket?.id);
        setComment('');
      } else {
        showNotification('error', response.paramObjectsMap?.errorMessage || 'Failed to save comment');
      }
    } catch (error) {
      console.error('Comment submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus, rowData) => {
    try {
      const response = await apiClient.put(
        `ticketcontroller/updateTicketStatus?orgId=${parseInt(orgId)}&userName=${loginUserName}&status=${newStatus}&ticketId=${rowData.id}`
      );

      if (response.status === true) {
        showNotification('success', 'Ticket status updated');
        getAllTickets();
      } else {
        showNotification('error', response.paramObjectsMap?.errorMessage || 'Update failed');
      }
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      setIsLoading(true);
      const response = await apiClient.delete(`ticketcontroller/deleteCommentsById?id=${id}`);

      if (response.status) {
        await getComments(selectedTicket?.id);
      } else {
        showNotification('error', 'Error in response');
      }
    } catch (error) {
      showNotification('error', 'Failed to fetch comments');
    } finally {
      setIsLoading(false);
    }
  };

  const transformedTickets = tickets.map((t) => ({
    ...t,
    // Format date if needed
  }));

  const filteredTickets = transformedTickets.filter(
    (ticket) =>
      ticket.subject?.toLowerCase().includes(search.toLowerCase()) ||
      ticket.status?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTicketsNew = filteredTickets.filter((ticket) =>
    statusFilter === 'All'
      ? true
      : statusFilter === 'Open'
        ? ticket.status === 'Open' || ticket.status === 'InProgress'
        : ticket.status === statusFilter
  );

  // Pagination
  const totalPages = Math.ceil(filteredTicketsNew.length / rowsPerPage);
  const paginatedTickets = filteredTicketsNew.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="w-full">
      {/* Notification */}
      {notification.message && (
        <div className="fixed top-4 right-4 z-50 animate-slide-down">
          <div className={`px-4 py-3 rounded-lg shadow-lg border ${notification.type === "error"
            ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
            : notification.type === "success"
              ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
              : "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
            }`}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          All Tickets
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Button */}
          <button
            onClick={() => setStatusFilter(statusFilter === 'All' ? 'Open' : 'All')}
            className={`p-2 rounded-lg transition-all duration-200 ${statusFilter !== 'All'
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 ring-2 ring-blue-200 dark:ring-blue-800'
              : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            title="Toggle filter"
          >
            <Filter size={18} />
          </button>

          {/* Status Filter Dropdown */}
          {statusFilter !== 'All' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="InProgress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          )}

          {/* Search */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchExpanded(!isSearchExpanded)}
              className={`p-2 rounded-lg transition-all duration-200 ${isSearchExpanded
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              title="Search tickets"
            >
              <Search size={18} />
            </button>

            {isSearchExpanded && (
              <div className="relative animate-fade-in">
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-3 pr-8 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 transition-all"
                  autoFocus
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                {loginUserName === 'EBSPL/ITADMIN' && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created On</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedTickets.length > 0 ? (
                paginatedTickets.map((ticket, index) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {ticket.subject}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 max-w-xs">
                        {ticket.description}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {loginUserName === 'EBSPL/ITADMIN' ? (
                        <select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(e.target.value, ticket)}
                          className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                          <option value="Open">Open</option>
                          <option value="InProgress">In Progress</option>
                          <option value="Closed">Closed</option>
                        </select>
                      ) : (
                        getStatusChip(ticket.status)
                      )}
                    </td>
                    {loginUserName === 'EBSPL/ITADMIN' && (
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {ticket.userName}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {ticket.commonDate?.createdon
                          ? ticket.commonDate.createdon.split(' ')[0]
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenDialog(ticket)}
                        className="p-2 text-blue-600 dark:text-blue-400 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={loginUserName === 'EBSPL/ITADMIN' ? 7 : 6}
                    className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Search size={32} className="text-gray-300 dark:text-gray-600 mb-2" />
                      <p>No tickets found</p>
                      {(search || statusFilter !== 'All') && (
                        <button
                          onClick={() => {
                            setSearch('');
                            setStatusFilter('All');
                          }}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTicketsNew.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-medium text-gray-900 dark:text-white">
                {((currentPage - 1) * rowsPerPage) + 1}
              </span> to{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                {Math.min(currentPage * rowsPerPage, filteredTicketsNew.length)}
              </span> of{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                {filteredTicketsNew.length}
              </span> entries
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 text-sm font-medium rounded-lg transition-all ${currentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Details Dialog */}
      {openDialog && selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity"
              onClick={handleCloseDialog}
            />

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Ticket Details
                  </h3>
                  <button
                    onClick={handleCloseDialog}
                    className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-6">
                    <TicketInfo selectedTicket={selectedTicket} />
                    <CommentSection
                      commentsVO={comments}
                      currentUser={loginUserName}
                      onSubmitComment={handleSubmitComment}
                      onGetComments={getComments}
                      onEditComment={handleSubmitComment}
                      onDeleteComment={handleDeleteComment}
                    />
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-end">
                    <button
                      onClick={handleCloseDialog}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTicketsTab;