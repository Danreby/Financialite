import React from "react";
import PrimaryButton from "@/Components/common/buttons/PrimaryButton";
import SecondaryButton from "@/Components/common/buttons/SecondaryButton";
import DangerButton from "@/Components/common/buttons/DangerButton";
import Tooltip from "@/Components/common/Tooltip";
import RemoveIcon from "@/Components/common/icons/RemoveIcon";
import EditIcon from "@/Components/common/icons/EditIcon";

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TransactionRow({ transaction, onEdit, onDelete }) {
  const {
    title,
    description,
    amount,
    status,
    created_at,
    bank_name,
    category_name,
    total_installments,
  } = transaction;

  const totalInstallmentsNumber = Math.max(Number(total_installments || 1), 1);
  const installmentsLabel =
    totalInstallmentsNumber > 1 ? `${totalInstallmentsNumber}x` : null;

  return (
    <div className="flex flex-col gap-3 rounded-lg px-3 lg:px-4 py-2 lg:py-3 hover:bg-gray-50 dark:hover:bg-gray-900/60 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm lg:text-base font-medium text-gray-900 dark:text-gray-100">
            {title}
          </p>
          {status && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {status === "overdue" ? "Vencida" : status === "unpaid" ? "Em aberto" : status}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] lg:text-xs text-gray-500 dark:text-gray-400">
          {bank_name && (
            <span>
              {bank_name}
              {installmentsLabel && ` • ${installmentsLabel}`}
            </span>
          )}
          {category_name && <span>• {category_name}</span>}
          {description && <span className="truncate max-w-xs">• {description}</span>}
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between gap-3 sm:mt-0 sm:gap-4">
        <div className="flex flex-col items-end text-right">
          <span className="text-sm lg:text-base font-semibold text-rose-500 dark:text-rose-400">
            -{formatCurrency(amount)}
          </span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            {formatDate(created_at)}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs">
          <Tooltip label="Editar transação">
            <SecondaryButton
              type="button"
              onClick={() => onEdit && onEdit(transaction)}
              className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
            >
              <EditIcon type={1} size={20} />
            </SecondaryButton>
          </Tooltip>
          <Tooltip label="Remover transação">
            <DangerButton
              type="button"
              onClick={() => onDelete && onDelete(transaction)}
              className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
            >
              <RemoveIcon type={1} size={20} />
            </DangerButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
