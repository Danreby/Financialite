import React from 'react'

export default function StatCard({ title, value, delta }) {
  return (
    <div className="rounded-2xl bg-white p-3 lg:p-3 dark:border-red-950/50 border-gray-50/90 border shadow-md ring-1 ring-black/5 dark:bg-gradient-to-b dark:from-[#0b0b0b] dark:to-[#0f0f0f] dark:ring-black/30">
      <div className="text-xs lg:text-xs text-gray-600 dark:text-gray-400">{title}</div>
      <div className="mt-1.5 flex items-baseline justify-between gap-3">
        <div className="text-lg lg:text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</div>
        <div className={`text-[11px] lg:text-xs font-medium ${delta && delta.startsWith('-') ? 'text-red-400' : 'text-emerald-400'}`}>{delta}</div>
      </div>
    </div>
  )
}
