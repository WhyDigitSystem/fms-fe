import React, { useState } from 'react';
import { Eye, Edit2, X } from 'lucide-react';

const AdminTicketsTab = ({ tickets, employees, handleAssign, handleStatusChange, handleRowClick }) => {
  const [selectedTicket, setSelectedTicket] = useState(null);

  const handleViewClick = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleCloseDialog = () => {
    setSelectedTicket(null);
  };

  return (
    <>
      <div className="h-[420px] mt-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Manage Tickets
        </h3>

        {/* Table */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Assigned To</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{ticket.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">{ticket.subject}</td>
                  <td className="px-4 py-3">
                    <select
                      value={ticket.assignedTo || ''}
                      onChange={(e) => handleAssign(ticket.id, e.target.value)}
                      className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Unassigned</option>
                      {employees.map((emp) => (
                        <option key={emp} value={emp}>{emp}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                      className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewClick(ticket)}
                        className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="Edit Ticket"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail Dialog */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" onClick={handleCloseDialog} />
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ticket Details</h3>
                <button
                  onClick={handleCloseDialog}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="px-6 py-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Subject</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTicket.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTicket.description || 'No description available'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Assigned To</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTicket.assignedTo || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTicket.status}</p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCloseDialog}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminTicketsTab;