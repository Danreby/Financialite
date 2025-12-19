import React from 'react'
import { Link } from '@inertiajs/react'

export default function Topbar({ sidebarOpen, setSidebarOpen }) {
  return (
    <div className="flex items-center justify-between mt-2 p-4 bg-[#0b0b0b] shadow-md ring-1 ring-black/30">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md hover:bg-gray-900/30 focus:outline-none"
          aria-label="Toggle sidebar"
          type="button"
        >
          <svg className="h-5 w-5 text-gray-300" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h1 className="text-lg font-semibold text-gray-100">Resumo</h1>
      </div>

      <div className="flex items-center gap-3">
        <Link href="#" className="text-sm text-gray-300">Ajuda</Link>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#3a0f0f] to-transparent flex items-center justify-center text-sm text-white">BS</div>
      </div>
    </div>
  )
}
