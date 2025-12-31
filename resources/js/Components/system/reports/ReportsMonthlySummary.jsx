import React from "react";

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

export default function ReportsMonthlySummary({ items = [] }) {
  if (!items || items.length === 0) {
    return (
      <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
        Nenhuma transação encontrada para os filtros atuais.
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-2xl bg-white p-3 sm:p-4 lg:p-6 shadow-sm ring-1 ring-black/5 dark:bg-[#080808] dark:ring-white/5">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Resumo por mês / ano
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm sm:text-base">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 text-xs sm:text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <th className="py-2 pr-3 text-left">Mês / Ano</th>
              <th className="py-2 px-3 text-right">Total geral</th>
              <th className="py-2 px-3 text-right">Total crédito</th>
              <th className="py-2 px-3 text-right">Total débito</th>
              <th className="py-2 pl-3 text-right">Qtd. transações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr
                key={row.year_month || row.month_label}
                className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/40"
              >
                <td className="py-2 pr-3 text-left text-gray-800 dark:text-gray-100 whitespace-nowrap">
                  {row.month_label || row.year_month || "Sem data"}
                </td>
                <td className="py-2 px-3 text-right text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  {formatCurrency(row.total_amount)}
                </td>
                <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  {formatCurrency(row.total_credit)}
                </td>
                <td className="py-2 px-3 text-right text-rose-600 dark:text-rose-400 whitespace-nowrap">
                  {formatCurrency(row.total_debit)}
                </td>
                <td className="py-2 pl-3 text-right text-gray-700 dark:text-gray-200 whitespace-nowrap">
                  {row.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
