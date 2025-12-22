import React, { useEffect, useState } from 'react'
import { Link } from '@inertiajs/react'

export default function Topbar({ user, sidebarOpen, setSidebarOpen }) {
  const [isDark, setIsDark] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

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
  const toggleUserMenu = () => setUserMenuOpen((prev) => !prev)

  const initials = (() => {
    if (!user?.name) return 'U'

    const parts = user.name
      .split(' ')
      .filter((part) => part.length > 0)
      .slice(0, 2)

    if (parts.length === 0) return 'U'

    return parts
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
  })()

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

        <div className="relative">
          <button
            type="button"
            onClick={toggleUserMenu}
            className="h-8 w-8 rounded-full bg-gradient-to-br from-[#3a0f0f] to-transparent flex items-center justify-center text-sm font-semibold text-white ring-1 ring-black/10 hover:ring-black/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-haspopup="true"
            aria-expanded={userMenuOpen}
          >
              {initials}
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 dark:bg-[#111] dark:text-gray-100 dark:ring-black/40">
              <Link
                href={route('profile.edit')}
                className="block px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setUserMenuOpen(false)}
              >
                Perfil
              </Link>

              <Link
                href={route('logout')}
                method="post"
                as="button"
                className="block w-full px-3 py-2 text-left text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-800"
                onClick={() => setUserMenuOpen(false)}
              >
                Sair
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
