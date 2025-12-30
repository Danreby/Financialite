import React from "react";
import Modal from "@/Components/common/Modal";

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

function formatFullDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export default function FaturaDetailModal({ isOpen, onClose, item }) {
  if (!item) {
    return null;
  }

  const {
    title,
    description,
    amount,
    type,
    status,
    created_at,
    paid_date,
    total_installments,
    current_installment,
    display_installment,
    is_recurring,
    bank_name,
    category_name,
  } = item;

  const totalInstallmentsNumber = Math.max(Number(total_installments || 1), 1);
  const rawAmountNumber = Number(amount || 0) || 0;
  const installmentAmount =
    totalInstallmentsNumber > 1 ? rawAmountNumber / totalInstallmentsNumber : rawAmountNumber;

  const hasInstallments = totalInstallmentsNumber > 1;

  const statusLabel =
    status === "paid"
      ? "Pago"
      : status === "overdue"
      ? "Vencido"
      : "Em aberto";

  const typeLabel = type === "credit" ? "Crédito" : type === "debit" ? "Débito" : "-";

  const effectiveInstallmentNumber =
    total_installments && total_installments > 1
      ? display_installment || current_installment || 1
      : null;

  const installmentLabel =
    total_installments && total_installments > 1 && effectiveInstallmentNumber
      ? `${effectiveInstallmentNumber}/${total_installments}`
      : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md" title="Detalhes da transação">
      <div className="space-y-5 text-base sm:text-lg text-gray-700 dark:text-gray-200">
        <div>
          <p className="text-xs sm:text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Título
          </p>
          <p className="mt-1 text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </p>
          {description && (
            <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Valor total
            </p>
            <p className="text-base sm:text-lg font-semibold text-rose-600 dark:text-rose-400">
              {formatCurrency(rawAmountNumber)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Valor considerado no mês
            </p>
            <p className="text-base sm:text-lg font-semibold text-rose-600 dark:text-rose-400">
              {formatCurrency(installmentAmount)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Tipo
            </p>
            <p className="text-base sm:text-lg">{typeLabel}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Status
            </p>
            <p className="text-base sm:text-lg">{statusLabel}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Banco
            </p>
            <p className="text-base sm:text-lg">{bank_name || "-"}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Categoria
            </p>
            <p className="text-base sm:text-lg">{category_name || "-"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Data da compra
            </p>
            <p className="text-base sm:text-lg">{formatFullDate(created_at)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Data de pagamento
            </p>
            <p className="text-base sm:text-lg">{formatFullDate(paid_date)}</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Parcelamento / recorrência
          </p>
          {is_recurring ? (
            <p className="text-base sm:text-lg">Transação recorrente.</p>
          ) : hasInstallments ? (
            <>
              <p className="text-base sm:text-lg">
                {`Valor por parcela: ${formatCurrency(installmentAmount)}`}
              </p>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                {effectiveInstallmentNumber && (
                  <span className="mr-3">
                    Parcelas: <span className="font-semibold">{effectiveInstallmentNumber}/{totalInstallmentsNumber}</span>
                  </span>
                )}
              </p>
            </>
          ) : (
            <p className="text-base sm:text-lg">Transação única.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
