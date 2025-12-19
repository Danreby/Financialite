// FILE: src/Layouts/AuthenticatedLayout.jsx
import { useState } from 'react'
import { usePage } from '@inertiajs/react'
import Sidebar from '@/Components/system/navigation/Sidebar'
import Topbar from '@/Components/system/navigation/Topbar'

export default function AuthenticatedLayout({ children }) {
  const user = usePage().props.auth.user
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-900 dark:bg-[#070707] dark:text-gray-100">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          user={user}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#070707]">
          {children}
        </main>
      </div>
    </div>
  )
}
