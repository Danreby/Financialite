import React from "react";

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ReportsTransactionRow({ transaction, onSelect }) {
  const {
    title,
    description,
    type,
    status,
    bank_name,
    category_name,
    installment_amount,
    amount,
    total_installments,
    display_installment,
    is_recurring,
    created_at,
  } = transaction || {};

  const valueForPeriod = type === "credit" ? installment_amount ?? amount : amount;
  const isCredit = type === "credit";
  const statusColor =
    status === "paid"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
      : status === "overdue"
      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

  const installmentLabel =
    total_installments && total_installments > 1 && (display_installment || 1)
      ? `${display_installment || 1}/${total_installments}`
      : null;

  const statusLabel = status === "paid" ? "Pago" : status === "overdue" ? "Vencido" : "Em aberto";

  return (
    <div
      className="flex items-start justify-between gap-3 rounded-xl px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition cursor-pointer"
      onClick={() => onSelect?.(transaction)}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={(event) => {
        if (!onSelect) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(transaction);
        }
      }}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </p>
          {installmentLabel && (
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
              {installmentLabel}
            </span>
          )}
          {is_recurring && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              Recorrente
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
          {bank_name && <span>{bank_name}</span>}
          {category_name && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-200">
              {category_name}
            </span>
          )}
          {description && <span className="truncate max-w-xs">• {description}</span>}
        </div>
        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
          <span>{isCredit ? "Crédito" : "Débito"}</span>
          <span className={`rounded-full px-2 py-0.5 ${statusColor}`}>{statusLabel}</span>
          <span>{formatDate(created_at)}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span className={`text-sm sm:text-base font-semibold ${isCredit ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}`}>
          {formatCurrency(valueForPeriod)}
        </span>
        <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
          Valor original: {formatCurrency(amount)}
        </span>
      </div>
    </div>
  );
}
