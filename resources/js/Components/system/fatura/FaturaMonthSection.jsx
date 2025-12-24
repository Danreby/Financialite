import React, { useMemo, useState } from "react";
import FaturaItemRow from "@/Components/system/fatura/FaturaItemRow";
import FaturaPayModal from "@/Components/system/fatura/FaturaPayModal";
import PrimaryButton from "@/Components/common/buttons/PrimaryButton";
import ScrollArea from "@/Components/common/ScrollArea";
import BareButton from "@/Components/common/buttons/BareButton";
import Tooltip from "@/Components/common/Tooltip";

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
  isCurrentPending = false,
}) {
  const [showPayModal, setShowPayModal] = useState(false);
  const [sortField, setSortField] = useState("date"); // "date" | "amount"
  const [sortDirection, setSortDirection] = useState("desc"); // "asc" | "desc"

  const sortedItems = useMemo(() => {
    const cloned = [...items];

    cloned.sort((a, b) => {
      if (sortField === "date") {
        const da = a.created_at ? new Date(a.created_at) : null;
        const db = b.created_at ? new Date(b.created_at) : null;
        const va = da && !Number.isNaN(da.getTime()) ? da.getTime() : 0;
        const vb = db && !Number.isNaN(db.getTime()) ? db.getTime() : 0;
        return sortDirection === "asc" ? va - vb : vb - va;
      }

      if (sortField === "amount") {
        const va = Number(a.amount) || 0;
        const vb = Number(b.amount) || 0;
        return sortDirection === "asc" ? va - vb : vb - va;
      }

      return 0;
    });

    return cloned;
  }, [items, sortField, sortDirection]);

  return (
  <section className="space-y-3 sm:space-y-4 lg:space-y-5">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 flex justify-start items-center gap-3 sm:gap-4">
          <div className="inline-flex flex-col items-start rounded-2xl sm:rounded-full px-4 py-2 sm:px-6 sm:py-3 bg-transparent">
            {due_day && (
              <p className="mt-0.5 text-[11px] sm:text-[12px] lg:text-sm text-gray-500 dark:text-gray-400">
                Vencimento do cartão: todo dia <span className="font-semibold">{due_day}</span>
              </p>
            )}
            <p className="mt-1 text-[11px] sm:text-xs lg:text-sm text-gray-500 dark:text-gray-400">
              Total de despesas do mês:
              <span className="ml-1 font-semibold text-rose-600 dark:text-rose-400">
                {formatCurrency(total_spent)}
              </span>
            </p>
          </div>
        </div>
        {isCurrentPending && (
          <PrimaryButton
            type="button"
            onClick={() => setShowPayModal(true)}
            className="shrink-0 rounded-full px-3 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wide focus:ring-rose-500 focus:ring-offset-2 dark:ring-offset-[#050505] w-full sm:w-auto"
          >
            Pagar
          </PrimaryButton>
        )}
      </div>

      <div className="rounded-2xl bg-white px-2 py-1 sm:px-3 sm:py-2 lg:px-4 lg:py-3 shadow-sm ring-1 ring-black/5 dark:bg-[#080808] dark:ring-white/5 shadow-gray-500 dark:shadow-gray-900">
        {items.length === 0 ? (
          <p className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
            Nenhuma transação neste mês.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between px-3 pt-2 pb-1 text-[11px] text-gray-500 dark:text-gray-400">
              <span className="font-semibold uppercase tracking-wide">Ordenar</span>
              <div className="flex items-center gap-2">
                <BareButton
                  type="button"
                  onClick={() => setSortField("date")}
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                    sortField === "date"
                      ? "border-[#7b1818] bg-[#7b1818] text-white shadow-sm dark:border-rose-500 dark:bg-rose-500"
                      : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-[#050505] dark:text-gray-200 dark:hover:bg-gray-800"
                  }`}
                >
                  Data
                </BareButton>
                <BareButton
                  type="button"
                  onClick={() => setSortField("amount")}
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                    sortField === "amount"
                      ? "border-[#7b1818] bg-[#7b1818] text-white shadow-sm dark:border-rose-500 dark:bg-rose-500"
                      : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-[#050505] dark:text-gray-200 dark:hover:bg-gray-800"
                  }`}
                >
                  Valor
                </BareButton>
                <Tooltip
                  label={
                    sortDirection === "desc"
                      ? "Do mais recente/mais caro para o mais antigo/mais barato"
                      : "Do mais antigo/mais barato para o mais recente/mais caro"
                  }
                >
                  <BareButton
                    type="button"
                    onClick={() =>
                      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"))
                    }
                    className="inline-flex items-center rounded-full border border-gray-300 bg-white px-2 py-1 text-[11px] font-medium text-gray-600 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-[#050505] dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    {sortDirection === "desc" ? "▼" : "▲"}
                  </BareButton>
                </Tooltip>
              </div>
            </div>
            <ScrollArea className="divide-y divide-gray-100 dark:divide-gray-800">
              {sortedItems.map((item) => (
                <FaturaItemRow key={item.id} {...item} />
              ))}
            </ScrollArea>
          </>
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
