import React from "react";

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

function formatDayLabel(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleDateString("pt-BR", { month: "short" });
  return `${day} ${month}`;
}

export default function FaturaItemRow({
  title,
  description,
  amount,
  type,
  status,
  created_at,
  bank_name,
  total_installments,
  current_installment,
  display_installment,
  is_recurring,
}) {
  const isCredit = type === "credit";
  const isDebit = type === "debit";
  const amountSign = "-";
  const amountColor = "text-rose-500 dark:text-rose-400";

  const totalInstallmentsNumber = Math.max(Number(total_installments || 1), 1);
  const rawAmountNumber = Number(amount || 0) || 0;
  const displayedAmount =
    totalInstallmentsNumber > 1 ? rawAmountNumber / totalInstallmentsNumber : rawAmountNumber;

  const dayLabel = formatDayLabel(created_at);

  const statusLabel =
    status === "paid"
      ? "Pago"
      : status === "overdue"
      ? "Vencido"
      : "Em aberto";

  const statusColor =
    status === "paid"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
      : status === "overdue"
      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

  const effectiveInstallmentNumber =
    total_installments && total_installments > 1
      ? display_installment || current_installment || 1
      : null;

  const installmentLabel =
    total_installments && total_installments > 1 && effectiveInstallmentNumber
      ? `${effectiveInstallmentNumber}/${total_installments}`
      : null;

  return (
    <div className="flex items-center justify-between gap-3 px-2 sm:px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/60 transition">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="h-8 w-8 lg:h-9 lg:w-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <span
            className={`h-2 w-2 rounded-full ${
              isDebit || isCredit
                ? "bg-rose-500"
                : "bg-gray-400"
            }`}
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm lg:text-base font-medium text-gray-900 dark:text-gray-100">
              {title}
            </p>
            {installmentLabel && (
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                {installmentLabel}
              </span>
            )}
            {is_recurring && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                Recorrente
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] lg:text-xs text-gray-500 dark:text-gray-400">
            {bank_name && <span>{bank_name}</span>}
            {description && <span className="truncate max-w-xs">• {description}</span>}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className={`text-sm lg:text-base font-semibold ${amountColor}`}>
          {amountSign}
          {formatCurrency(displayedAmount)}
        </span>
          <div className="flex items-center gap-2 text-[11px] lg:text-xs text-gray-500 dark:text-gray-400">
          {dayLabel && <span>{dayLabel}</span>}
          <span className={`rounded-full px-2 py-0.5 text-[10px] ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
