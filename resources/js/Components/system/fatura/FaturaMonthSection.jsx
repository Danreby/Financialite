import React, { useState } from "react";
import FaturaItemRow from "@/Components/system/fatura/FaturaItemRow";
import FaturaPayModal from "@/Components/system/fatura/FaturaPayModal";

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
  month_key,
  bankUserId = null,
  onPaid,
  is_paid = false,
  due_day = null,
}) {
  const [showPayModal, setShowPayModal] = useState(false);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 flex justify-start items-center gap-4">
          <div className="inline-flex flex-col items-start rounded-full px-6 py-3">
            {due_day && (
              <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                Vencimento do cartão: todo dia <span className="font-semibold">{due_day}</span>
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Total de despesas do mês:
              <span className="ml-1 font-semibold text-rose-600 dark:text-rose-400">
                {formatCurrency(total_spent)}
              </span>
            </p>
          </div>
        </div>
        {!is_paid && (
          <button
            type="button"
            onClick={() => setShowPayModal(true)}
            className="shrink-0 rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:ring-offset-[#050505]"
          >
            Pagar
          </button>
        )}
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

      <FaturaPayModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        monthKey={month_key}
        monthLabel={month_label}
        items={items}
        bankUserId={bankUserId}
        onPaid={onPaid}
      />
    </section>
  );
}
