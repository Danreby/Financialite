import React from 'react'
import { Link } from '@inertiajs/react'
import ApplicationLogo from '@/Components/ApplicationLogo'

export default function GuestLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-900 dark:bg-[#070707] dark:text-gray-100">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -left-32 -top-24 h-96 w-96 rounded-full opacity-10 blur-3xl" style={{ background: '#7b1818' }} />
        <div className="absolute -right-40 bottom-8 h-80 w-80 rounded-full opacity-8 blur-3xl" style={{ background: '#2a2a2a' }} />
      </div>

      <div className="w-full px-6 sm:px-0">
        <div className="flex justify-center mb-6">
          <Link href="/" aria-label="Voltar para home">
            <ApplicationLogo className="h-16 w-16" />
          </Link>
        </div>

        <div className="flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  )
}
