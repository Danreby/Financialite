import React, { useEffect, useState } from 'react'
import { Link } from '@inertiajs/react'

export default function Topbar({ sidebarOpen, setSidebarOpen }) {
  const [isDark, setIsDark] = useState(false)

  // Inicializa tema baseado em localStorage ou preferência do sistema
  useEffect(() => {
    if (typeof window === 'undefined') return

    const stored = window.localStorage.getItem('theme')
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

    const shouldUseDark = stored === 'dark' || (!stored && prefersDark)
    setIsDark(shouldUseDark)

    if (shouldUseDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Aplica/remover classe `dark` e persiste preferência
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (isDark) {
      document.documentElement.classList.add('dark')
      window.localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      window.localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const toggleTheme = () => setIsDark((prev) => !prev)

  return (
    <div className="flex items-center justify-between mt-2 p-4 bg-white text-gray-900 shadow-md ring-1 ring-black/5 dark:bg-[#0b0b0b] dark:text-gray-100 dark:ring-black/30">
      <div className="flex items-center gap-3">
        {/* <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md hover:bg-gray-900/30 focus:outline-none"
          aria-label="Toggle sidebar"
          type="button"
        >
          <svg className="h-5 w-5 text-gray-300" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h1 className="text-lg font-semibold text-gray-100">Dashboard</h1> */}
      </div>

      <div className="flex items-center gap-3">
        <Link href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Ajuda</Link>

        <button
          type="button"
          onClick={toggleTheme}
          className="h-8 px-3 rounded-full text-xs font-medium border border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-100 dark:border-gray-500 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
          aria-label="Alternar tema claro/escuro"
        >
          {isDark ? 'Light' : 'Dark'}
        </button>

        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#3a0f0f] to-transparent flex items-center justify-center text-sm text-white">BS</div>
      </div>
    </div>
  )
}
