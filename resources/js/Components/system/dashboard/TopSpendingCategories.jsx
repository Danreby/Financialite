import React from 'react'
import { formatCurrencyBRL } from '@/Lib/formatters'

export default function TopSpendingCategories({ data = [] }) {
  return (
    <div className="rounded-2xl border dark:border-red-950/50 border-gray-50/90 bg-white p-5 shadow-md ring-1 ring-black/5 dark:bg-[#0b0b0b] dark:ring-black/30">
      <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Maiores categorias de gasto (mês)
      </h2>

      {(!data || data.length === 0) && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Ainda não há gastos pagos neste mês.
        </p>
      )}

      {data && data.length > 0 && (
        <ul className="space-y-3">
          {data.map((item) => (
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
