import React from "react";
import Modal from "@/Components/common/Modal";
import ScrollArea from "@/Components/common/ScrollArea";
import { formatCurrencyBRL } from "@/Lib/formatters";

export default function ReportsPeriodModal({ isOpen, onClose, period, onSelectTransaction }) {
  if (!period) return null;

  const { label, total_credit, total_debit, total_amount, transactions = [] } = period;

  const paidCount = transactions.filter((tx) => tx.status === "paid").length;
  const overdueCount = transactions.filter((tx) => tx.status === "overdue").length;
  const openCount = transactions.length - paidCount - overdueCount;
  const shouldScroll = transactions.length > 10;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl" title={`Fatura de ${label}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryPill label="Total do período" value={formatCurrencyBRL(total_amount)} emphasize />
          <SummaryPill label="Total crédito" value={formatCurrencyBRL(total_credit)} tone="credit" />
          <SummaryPill label="Total débito" value={formatCurrencyBRL(total_debit)} tone="debit" />
          <SummaryPill
            label="Status"
            value={`${paidCount} pagos • ${openCount} em aberto${overdueCount ? ` • ${overdueCount} vencidos` : ""}`}
          />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-black/5 dark:border-gray-800 dark:bg-[#080808] dark:ring-white/5">
          <div className="flex items-center justify-between px-3 py-2 sm:px-4">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">Transações do período</h3>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">{transactions.length} item(s)</p>
            </div>
            {shouldScroll && (
              <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                Rolagem ativada (mais de 10 registros)
              </span>
            )}
          </div>

          {transactions.length === 0 ? (
            <p className="px-4 pb-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">Nenhuma transação encontrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className={shouldScroll ? "max-h-[440px] md:max-h-[520px] lg:max-h-[560px] overflow-y-auto" : ""}>
                <table className="min-w-full text-[11px] sm:text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      <th className="px-3 py-2 text-left">Título</th>
                      <th className="px-3 py-2 text-left">Tipo</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-right">Valor período</th>
                      <th className="px-3 py-2 text-right">Valor total</th>
                      <th className="px-3 py-2 text-left">Parcela</th>
                      <th className="px-3 py-2 text-left">Banco</th>
                      <th className="px-3 py-2 text-left">Categoria</th>
                      <th className="px-3 py-2 text-left">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {transactions.map((tx) => {
                      const periodValue = tx.type === "credit" ? tx.installment_amount ?? tx.amount : tx.amount;
                      const installmentLabel =
                        tx.total_installments && tx.total_installments > 1 && (tx.display_installment || 1)
                          ? `${tx.display_installment || 1}/${tx.total_installments}`
                          : "-";
                      const statusLabel = tx.status === "paid" ? "Pago" : tx.status === "overdue" ? "Vencido" : "Em aberto";
                      const typeLabel = tx.type === "credit" ? "Crédito" : "Débito";

                      return (
                        <tr
                          key={tx.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-900/40 cursor-pointer"
                          onClick={() => onSelectTransaction?.(tx)}
                        >
                          <td className="px-3 py-2 text-gray-900 dark:text-gray-100 whitespace-nowrap">{tx.title}</td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-200 whitespace-nowrap">{typeLabel}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={
                                "rounded-full px-2.5 py-0.5 text-[10px] font-semibold " +
                                (tx.status === "paid"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                  : tx.status === "overdue"
                                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300")
                              }
                            >
                              {statusLabel}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-rose-600 dark:text-rose-400 whitespace-nowrap">
                            {formatCurrencyBRL(periodValue)}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-900 dark:text-gray-100 whitespace-nowrap">
                            {formatCurrencyBRL(tx.amount)}
                          </td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-200 whitespace-nowrap">{installmentLabel}</td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-200 whitespace-nowrap">
                            {tx.bank_name || "-"}
                          </td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-200 whitespace-nowrap">
                            {tx.category_name || "-"}
                          </td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-200 whitespace-nowrap">
                            {formatDate(tx.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function SummaryPill({ label, value, tone, emphasize = false }) {
  const toneClasses =
    tone === "credit"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "debit"
      ? "text-rose-600 dark:text-rose-400"
      : "text-gray-900 dark:text-gray-100";

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2 shadow-sm dark:border-gray-800 dark:bg-gray-900/60">
      <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
        {label}
      </p>
      <p className={`text-sm sm:text-base font-bold ${emphasize ? "text-gray-900 dark:text-gray-100" : toneClasses}`}>
        {value}
      </p>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
