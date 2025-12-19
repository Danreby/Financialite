import React from 'react'

export default function StatCard({ title, value, delta }) {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#0b0b0b] to-[#0f0f0f] p-4 shadow-md ring-1 ring-black/30">
      <div className="text-xs text-gray-400">{title}</div>
      <div className="mt-2 flex items-baseline justify-between gap-4">
        <div className="text-2xl font-semibold text-gray-100">{value}</div>
        <div className={`text-sm font-medium ${delta && delta.startsWith('-') ? 'text-red-400' : 'text-emerald-400'}`}>{delta}</div>
      </div>
    </div>
  )
}
