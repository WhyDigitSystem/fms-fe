import React, { useEffect, useState } from 'react';
import {
  LifeBuoy,
  Plus,
  ListChecks,
  X,
  Clock,
  Check,
  User,
  HelpCircle
} from 'lucide-react';
import axios from 'axios';
import AllTicketsTab from './AllTicketsTab';
import RaiseTicketTab from './RaiseTicketTab';
import apiClient from '../../../api/apiClient';
import { useSelector } from 'react-redux';

const getStatusChip = (status) => {
  switch (status) {
    case 'Open':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
          <Clock size={14} />
          Open
        </span>
      );
    case 'Closed':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
          <Check size={14} />
          Closed
        </span>
      );
    case 'In Progress':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
          <User size={14} />
          In Progress
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border border-gray-300 text-gray-700 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800">
          Unknown
        </span>
      );
  }
};

const SupportTickets = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [ticket, setTicket] = useState({
    subject: '',
    description: '',
    status: 'Open',
    image: null,
    errors: {
      subject: false,
      description: false
    }
  });

  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [email, setEmail] = useState(localStorage.getItem('email'));
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [adminTickets, setAdminTickets] = useState([]);

  const { user } = useSelector((state) => state.auth);
  const orgId = user.orgId;
  const name = user.name;
  const organizationName = user.organizationName;
  const usersId = user.usersId;

  useEffect(() => {
    getTicketsByUser();
    getTicketsByOrgId();
  }, []);

  const handleToggle = () => setOpen(!open);

  const handleTabChange = (newTab) => setTab(newTab);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setTicket((prev) => ({
      ...prev,
      [name]: name === 'image' ? (files ? files[0] : null) : value,
      errors: {
        ...prev.errors,
        [name]: false
      }
    }));
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: "", message: "" }), 3000);
  };

  const handleRowClick = (params) => {
    setSelectedTicket(params);
    setDetailDialog(true);
  };

  const handleAssign = (id, assignedTo) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, assignedTo } : t)));
  };

  const handleStatusChange = (id, status) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const getTicketsByUser = async () => {
    try {
      const response = await apiClient.get(`/api/ticketcontroller/getTicketByUserName?userName=${name}&orgId=${orgId}`);

      if (response.status === true) {
        setTickets(response.paramObjectsMap.ticketVO);
        return response.paramObjectsMap?.ticketVO || [];
      } else {
        showNotification('error', response.paramObjectsMap?.ticketVO.errorMessage || 'Failed to fetch tickets');
        return [];
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return [];
    }
  };

  const getTicketsByOrgId = async () => {
    try {
      const response = await apiClient.get(`/api/ticketcontroller/getTicketByOrgId?orgId=${orgId}`);

      if (response.status === true) {
        setAdminTickets(response.paramObjectsMap.ticketVO);
        return response.paramObjectsMap?.ticketVO || [];
      } else {
        showNotification('error', response.paramObjectsMap?.ticketVO.errorMessage || 'Failed to fetch tickets');
        return [];
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return [];
    }
  };

  const handleSubmit = async () => {
    const errors = {
      subject: !ticket.subject.trim(),
      description: !ticket.description.trim()
    };

    if (errors.subject || errors.description) {
      setTicket((prev) => ({
        ...prev,
        errors
      }));
      return;
    }

    const payload = {
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      userName: name,
      orgId: orgId,
      createdBy: name,
      email: email,
    };

    try {
      setIsLoading(true);

      const response = await apiClient.put('/api/ticketcontroller/createUpdateTicket', payload);

      if (response.status === true && response.paramObjectsMap?.ticketVO?.id) {
        const ticketId = response.paramObjectsMap.ticketVO.id;
        showNotification('success', 'Ticket created successfully');
        getTicketsByUser();
        getTicketsByOrgId();

        if (ticket.image) {
          const formData = new FormData();
          formData.append('file', ticket.image);

          const uploadUrl = `${import.meta.env.VITE_API_URL}/api/ticketcontroller/uploadTicketScreenShotInBloob?id=${ticketId}`;

          const uploadResponse = await axios.post(uploadUrl, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          if (!uploadResponse.data.status === true) {
            showNotification('error', uploadResponse.data.paramObjectsMap?.errorMessage || 'Image upload failed');
          }
        }

        setTicket({
          subject: '',
          description: '',
          image: null,
          errors: {
            subject: false,
            description: false
          }
        });
      } else {
        showNotification('error', response.paramObjectsMap?.errorMessage || 'Ticket save failed');
      }
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    {
      label: 'Raise Ticket',
      icon: <Plus size={18} />
    },
    {
      label: 'All Tickets',
      icon: <ListChecks size={18} />
    }
  ];

  return (
    <>
      {notification.message && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${notification.type === "error"
            ? "bg-red-100 text-red-800 border border-red-200"
            : notification.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-blue-100 text-blue-800 border border-blue-200"
            }`}
        >
          {notification.message}
        </div>
      )}
      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-8 z-50 p-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
        title="Need help? Raise a support ticket"
      >
        <HelpCircle size={24} className="group-hover:scale-110 transition-transform" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-start justify-center min-h-screen px-4 pt-10 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" onClick={handleToggle} />

            {/* <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 rounded-2xl shadow-xl"> */}
            <div className="inline-block w-full h-full max-w-2xl  max-h-[100vh] my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HelpCircle size={24} className="text-white" />
                    <h3 className="text-xl font-semibold text-white">Support Center</h3>
                  </div>
                  <button
                    onClick={handleToggle}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex px-6">
                  {tabs.map((t, index) => (
                    <button
                      key={t.label}
                      onClick={() => handleTabChange(index)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === index
                        ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              {/* <div className="px-6 py-4"> */}
              <div className="px-6 py-4 overflow-y-auto flex-1">
                {tab === 0 && (
                  <RaiseTicketTab
                    ticket={ticket}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    isLoading={isLoading}
                  />
                )}
                {tab === 1 && (
                  <AllTicketsTab
                    tickets={loginUserName === 'EBSPL/ITADMIN' ? adminTickets : tickets}
                    onRowClick={handleRowClick}
                    getAllTickets={getTicketsByOrgId}
                    loginUserName={loginUserName}
                  />
                )}
              </div>

              {/* Footer */}
              {tab === 1 && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-center">
                    <button
                      onClick={handleToggle}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportTickets;
export { getStatusChip };