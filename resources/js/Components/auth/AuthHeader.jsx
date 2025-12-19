import React from 'react'
import ApplicationLogo from '@/Components/ApplicationLogo'

export default function AuthHeader({ title, subtitle }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <div className="p-2 rounded-xl bg-gradient-to-br from-[#3a0f0f] to-transparent">
        <ApplicationLogo className="h-10 w-10" />
      </div>

      <div>
        <h1 className="text-lg font-semibold leading-tight text-white">{title}</h1>
        <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
      </div>
    </div>
  )
}
