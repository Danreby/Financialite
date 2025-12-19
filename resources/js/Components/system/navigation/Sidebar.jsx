import React from 'react'
import { motion } from 'framer-motion'
import { Link } from '@inertiajs/react'
import NavIcon from '@/Components/common/icons/NavIcon'

export default function Sidebar({ open = true, setOpen = () => {} }) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: open ? 260 : 64 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex-shrink-0 h-100 bg-gradient-to-b from-[#070707] to-[#0b0b0b] border-r border-gray-800 mt-2 shadow-md ring-1 ring-black/30 overflow-hidden"
      style={{ minWidth: open ? 260 : 64 }}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-4">
          <div className={`flex items-center gap-3 ${open ? 'opacity-100' : 'justify-center'}`}>
            <div className="h-10 w-10 rounded-md bg-[#0f0f0f] flex items-center justify-center ring-1 ring-black/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M3 7h18M3 12h18M3 17h18" stroke="#7b1818" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {open && <span className="text-sm font-semibold text-gray-100">Finanças</span>}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-md hover:bg-gray-900/30 focus:outline-none"
            aria-label="Toggle sidebar"
            type="button"
          >
            <svg className="h-5 w-5 text-gray-300" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <nav className="mt-3 flex-1 px-2 space-y-1">
          <NavItem open={open} href={route('dashboard')} label="Resumo" />
          <NavItem type={4} open={open} href={route('faturas.index')} label="Fatura" />
          <NavItem type={6} open={open} href={route('accounts.index')} label="Contas" />
          <NavItem open={open} href={route('transactions.index')} label="Transações" />
          <NavItem open={open} href={route('reports.index')} label="Relatórios" />
        </nav>

        <nav className='justify-end'>
          <NavItem type={1} open={open} href={route('settings')} label="Configurações" />
        </nav>

        <div className="px-3 py-4">
          {open ? (
            <div className="text-xs text-gray-400">© {new Date().getFullYear()} Finanças</div>
          ) : (
            <div className="text-center text-xs text-gray-400">©{new Date().getFullYear()}</div>
          )}
        </div>
      </div>
    </motion.aside>
  )
}

function NavItem({ type = 3, size = 16, color, open, href, label }) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-gray-900/30`}
    >
      <div className="h-8 w-8 rounded-md bg-[#0f0f0f] flex items-center justify-center ring-1 ring-black/20" aria-hidden>
        <NavIcon type={type} size={size} color={color}/>
      </div>
      {open && <span className="truncate">{label}</span>}
    </Link>
  )
}
