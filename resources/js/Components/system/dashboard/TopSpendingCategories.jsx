import React from 'react'
import { formatCurrencyBRL } from '@/Lib/formatters'

export default function TopSpendingCategories({ data = [], label = 'Mês vigente' }) {
  const topSix = Array.isArray(data)
    ? [...data].sort((a, b) => Number(b.total || 0) - Number(a.total || 0)).slice(0, 6)
    : []

  const totalTop = topSix.reduce((acc, item) => acc + Number(item.total || 0), 0)

  const prepared = topSix.map((item) => {
    const share = totalTop > 0 ? Math.round((Number(item.total || 0) / totalTop) * 100) : 0
    return {
      ...item,
      share,
    }
  })

  return (
    <div className="rounded-2xl border dark:border-red-950/50 border-gray-50/90 bg-white p-4 shadow-md ring-1 ring-black/5 dark:bg-[#0b0b0b] dark:ring-black/30">
      <h2 className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Maiores Gastos — {label}
      </h2>

      {(!prepared || prepared.length === 0) && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Ainda não há gastos para este mês.
        </p>
      )}

      {prepared && prepared.length > 0 && (
        <ul className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {prepared.map((item) => (
            <li key={item.category_id ?? 'none'} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900 dark:text-gray-200">
                  {item.category_name || 'Sem categoria'}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {formatCurrencyBRL(item.total || 0)}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-rose-400/90 dark:bg-rose-500/90"
                  style={{ width: `${item.share || 0}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
