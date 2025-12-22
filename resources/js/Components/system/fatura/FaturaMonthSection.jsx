import React from "react";
import FaturaItemRow from "@/Components/system/fatura/FaturaItemRow";

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

export default function FaturaMonthSection({
  month_label,
  total_spent,
  items = [],
}) {
  return (
    <section className="space-y-3">
      <div className="flex justify-center">
        <div className="inline-flex flex-col items-center rounded-full bg-gradient-to-r from-rose-50 via-white to-rose-50 px-6 py-3 shadow-sm ring-1 ring-rose-100 dark:bg-gradient-to-r dark:from-[#150709] dark:via-[#0b0b0b] dark:to-[#150709] dark:ring-rose-900/40">
          <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            {month_label}
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Total de despesas do mês:
            <span className="ml-1 font-semibold text-rose-600 dark:text-rose-400">
              {formatCurrency(total_spent)}
            </span>
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white px-2 py-1 shadow-sm ring-1 ring-black/5 dark:bg-[#080808] dark:ring-white/5">
        {items.length === 0 ? (
          <p className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
            Nenhuma transação neste mês.
          </p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((item) => (
              <FaturaItemRow key={item.id} {...item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
