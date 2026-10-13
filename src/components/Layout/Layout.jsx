import React from 'react'
import { useSelector } from 'react-redux'
import Header from './Header'
import Sidebar from './Sidebar'
import SupportTickets from './SupportCenter'

const Layout = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth)
  const { sidebarOpen } = useSelector((state) => state.ui)

  // If not authenticated, just show the children (login page)
  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">{children}</div>
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className={`flex-1 flex flex-col overflow-hidden ${!sidebarOpen ? 'lg:ml-0' : ''}`}>
        <Header />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        <SupportTickets />
      </div>
    </div>
  )
}

export default Layout