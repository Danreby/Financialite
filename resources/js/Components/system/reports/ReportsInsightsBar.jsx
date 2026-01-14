import React from "react";
import { formatCurrencyBRL } from "@/Lib/formatters";

export default function ReportsInsightsBar({ insights }) {
  const items = [
    {
      label: "Saldo líquido (pagos)",
      value: formatCurrencyBRL(insights.netBalance || 0),
      helper: "Receitas pagas - despesas pagas",
    },
    {
      label: "Ticket médio",
      value: insights.averageTicket ? formatCurrencyBRL(insights.averageTicket) : "-",
      helper: "Valor médio por transação no período filtrado",
    },
    {
      label: "Mês de maior gasto",
      value: insights.topExpenseLabel || "-",
      helper: insights.topExpenseValue ? formatCurrencyBRL(insights.topExpenseValue) : "Sem histórico",
    },
  ];

  return (
    <div className="rounded-2xl bg-white p-3 shadow-md ring-1 ring-black/5 dark:bg-[#0b0b0b] dark:ring-black/30 sm:p-3 lg:p-4">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Insights rápidos</h2>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2 shadow-sm dark:border-gray-800 dark:bg-gray-900/60"
          >
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
              {item.label}
            </p>
            <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100">{item.value}</p>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">{item.helper}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
