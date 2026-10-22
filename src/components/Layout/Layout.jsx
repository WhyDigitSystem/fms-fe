import React from "react";
import { useSelector } from "react-redux";
import Header from "./Header";
import Sidebar from "./Sidebar";
import SupportTickets from "./SupportCenter";

const Layout = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">{children}</div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header />

      {/* Sidebar and Content */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <main className="min-h-0 flex-1 overflow-y-auto bg-gray-50 px-2 py-2 dark:bg-gray-900">
            {children}
          </main>
        </div>

        {/* Support Tickets */}
        <SupportTickets />
      </div>
    </div>
  );
};

export default Layout;
