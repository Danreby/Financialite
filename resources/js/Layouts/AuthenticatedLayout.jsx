// FILE: src/Layouts/AuthenticatedLayout.jsx
import { useState } from 'react'
import { usePage } from '@inertiajs/react'
import Sidebar from '@/Components/system/navigation/Sidebar'
import Topbar from '@/Components/system/navigation/Topbar'
import NotificationSidebar from '@/Components/system/notification/NotificationSidebar'

export default function AuthenticatedLayout({ children }) {
  const user = usePage().props.auth.user
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.innerWidth >= 1024
  })

  const [notificationsOpen, setNotificationsOpen] = useState(false)

  return (
	<div className="h-screen flex overflow-hidden bg-gray-100 text-gray-900 dark:bg-[#070707] dark:text-gray-100">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          user={user}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onToggleNotifications={() => setNotificationsOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 lg:px-6 bg-gray-50 dark:bg-[#070707]">
          {children}
        </main>
      </div>

      <NotificationSidebar
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  )
}
