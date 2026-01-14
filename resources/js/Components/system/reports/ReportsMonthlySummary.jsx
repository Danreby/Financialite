import React from "react";

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

export default function ReportsMonthlySummary({ items = [], onSelectPeriod }) {
  if (!items || items.length === 0) {
    return (
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        Nenhuma transação encontrada para os filtros atuais.
      </p>
    );
  }

  return (
    <div className="mt-2 rounded-2xl bg-white p-3 sm:p-3 lg:p-4 shadow-sm ring-1 ring-black/5 dark:bg-[#080808] dark:ring-white/5">
      <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Resumo por mês / ano
      </h2>
      <div className="overflow-x-auto">
        <div className="max-h-[320px] md:max-h-[360px] lg:max-h-[400px] 2xl:max-h-[400px] overflow-y-auto">
          <table className="min-w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 text-[11px] sm:text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <th className="py-2 pr-3 text-left">Mês / Ano</th>
              <th className="py-2 px-3 text-right">Total geral</th>
              <th className="py-2 px-3 text-right">Total crédito</th>
              <th className="py-2 px-3 text-right">Total débito</th>
              <th className="py-2 pl-3 text-right">Qtd. transações</th>
              {onSelectPeriod && <th className="py-2 pl-3 text-right">Detalhar</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr
                key={row.year_month || row.month_label}
                className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/40"
              >
                <td className="py-1.5 pr-3 text-left text-gray-800 dark:text-gray-100 whitespace-nowrap">
                  {row.month_label || row.year_month || "Sem data"}
                </td>
                <td className="py-1.5 px-3 text-right text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  {formatCurrency(row.total_amount)}
                </td>
                <td className="py-1.5 px-3 text-right text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  {formatCurrency(row.total_credit)}
                </td>
                <td className="py-1.5 px-3 text-right text-rose-600 dark:text-rose-400 whitespace-nowrap">
                  {formatCurrency(row.total_debit)}
                </td>
                <td className="py-1.5 pl-3 text-right text-gray-700 dark:text-gray-200 whitespace-nowrap">
                  {row.count}
                </td>
                {onSelectPeriod && (
                  <td className="py-1.5 pl-3 pr-2 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectPeriod(row.year_month)}
                      className="inline-flex items-center rounded-full border border-rose-500 px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/70 dark:text-rose-300 dark:hover:bg-rose-900/20"
                    >
                      Ver período
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
