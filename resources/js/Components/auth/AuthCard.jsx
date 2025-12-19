import React from 'react'

export default function AuthCard({ children }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0b0b0b] via-[#0b0b0b] to-[#0f0f0f] p-6 shadow-xl ring-1 ring-black/30 sm:rounded-3xl">
      <div className="absolute inset-0 pointer-events-none border border-black/10 mix-blend-overlay opacity-30" />

      <div className="relative">
        {children}
      </div>
    </div>
  )
}
