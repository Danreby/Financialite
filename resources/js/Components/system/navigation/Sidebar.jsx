import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from '@inertiajs/react'
import NavIcon from '@/Components/common/icons/NavIcon'

export default function Sidebar({ open: openProp = true, setOpen: setOpenProp }) {
  const [isOpen, setIsOpen] = useState(Boolean(openProp))

  useEffect(() => {
    setIsOpen(Boolean(openProp))
  }, [openProp])

  const notifyParent = (val) => {
    if (typeof setOpenProp === 'function') setOpenProp(val)
  }

  const toggle = () => {
    const next = !isOpen
    setIsOpen(next)
    notifyParent(next)
  }

  const openIfClosed = () => {
    if (!isOpen) {
      setIsOpen(true)
      notifyParent(true)
    }
  }

  const onLogoKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openIfClosed()
    }
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 260 : 64 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex-shrink-0 h-screen bg-white border-r border-gray-200 mt-2 shadow-md ring-1 ring-black/5 overflow-hidden dark:bg-gradient-to-b dark:from-[#070707] dark:to-[#0b0b0b] dark:border-gray-800 dark:ring-black/30"
      style={{ minWidth: 64 }}
      aria-expanded={isOpen}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-4">
          <div
            role="button"
            tabIndex={0}
            onClick={openIfClosed}
            onKeyDown={onLogoKeyDown}
            aria-label={isOpen ? 'Brand' : 'Abrir sidebar'}
            className={`flex items-center gap-3 ${isOpen ? 'opacity-100' : 'justify-center'} cursor-pointer`}
          >
            <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center ring-1 ring-gray-200 dark:bg-[#0f0f0f] dark:ring-black/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M3 7h18M3 12h18M3 17h18" stroke="#7b1818" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.span
                  key="brand"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.18 }}
                  className="text-sm font-semibold text-gray-900 select-none dark:text-gray-100"
                >
                  Financialite
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            onClick={toggle}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none dark:hover:bg-gray-900/30"
            aria-label={isOpen ? 'Fechar sidebar' : 'Abrir sidebar'}
            aria-pressed={isOpen}
            type="button"
            whileTap={{ scale: 0.95 }}
          >
            <motion.svg
              className="h-5 w-5 text-gray-500 dark:text-gray-300"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
              animate={{ rotate: isOpen ? 0 : 180 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </motion.button>
        </div>

        <nav className="mt-3 flex-1 px-2 space-y-1">
          <NavItem type={8} open={isOpen} href={route('dashboard')} label="Dashboard" />
          <NavItem type={4} open={isOpen} href={route('faturas.index')} label="Fatura" />
          <NavItem type={6} open={isOpen} href={route('accounts.index')} label="Contas" />
          <NavItem type={9} open={isOpen} href={route('transactions.index')} label="Transações" />
          <NavItem type={10} open={isOpen} href={route('reports.index')} label="Relatórios" />
          <NavItem type={7} open={isOpen} href={route('about')} label="Sobre" />
        </nav>

        <nav className="px-2">
          <NavItem type={1} open={isOpen} href={route('settings')} label="Configurações" />
        </nav>

        <div className="px-3 py-4">
          <div className={`text-xs text-gray-500 ${isOpen ? '' : 'text-center'} dark:text-gray-400`}>
            © {new Date().getFullYear()} Finanças
          </div>
        </div>
      </div>
    </motion.aside>
  )
}

function NavItem({ type = 3, size = 16, color, open, href, label }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900/30"
    >
      <div className="h-8 w-8 rounded-md bg-gray-100 flex items-center justify-center ring-1 ring-gray-200 dark:bg-[#0f0f0f] dark:ring-black/20" aria-hidden>
        <NavIcon type={type} size={size} color={color}/>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.span
            key="label"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.14 }}
            className="truncate"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}
