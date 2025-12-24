import React, { useEffect, useRef, useState } from 'react'
import { Link } from '@inertiajs/react'
import BareButton from '@/Components/common/buttons/BareButton'

export default function Topbar({ user, sidebarOpen, setSidebarOpen }) {
  const [isDark, setIsDark] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

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

  useEffect(() => {
    if (!userMenuOpen) return

    const handleClickOutside = (event) => {
      if (!userMenuRef.current) return
      if (!userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

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
    <div className="flex items-center justify-between mt-2 px-3 py-3 sm:px-4 sm:py-4 bg-white text-gray-900 shadow-md ring-1 ring-black/5 dark:bg-[#0b0b0b] dark:text-gray-100 dark:ring-black/30">
      <div className="flex items-center gap-3">
        {/* <BareButton
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-white dark:text-gray-300 dark:hover:bg-gray-900/40 dark:focus:ring-offset-[#0b0b0b] md:hidden"
          aria-label="Alternar menu lateral"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </BareButton> */}
      </div>

      <div className="flex items-center gap-3">
        <Link href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Ajuda</Link>

        <BareButton
          type="button"
          onClick={toggleTheme}
          className="h-8 px-3 rounded-full text-xs font-medium border border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-100 dark:border-gray-500 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
          aria-label="Alternar tema claro/escuro"
        >
          {isDark ? 'Light' : 'Dark'}
        </BareButton>

        <div className="relative" ref={userMenuRef}>
          <BareButton
            type="button"
            onClick={toggleUserMenu}
            className="h-8 w-8 rounded-full bg-gradient-to-br from-[#3a0f0f] to-transparent flex items-center justify-center text-sm font-semibold text-white ring-1 ring-black/10 hover:ring-black/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-haspopup="true"
            aria-expanded={userMenuOpen}
          >
              {initials}
          </BareButton>

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
