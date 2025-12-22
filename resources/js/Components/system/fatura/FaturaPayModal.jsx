import React, { useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "@/Components/common/Modal";
import PrimaryButton from "@/Components/common/buttons/PrimaryButton";

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

export default function FaturaPayModal({
  isOpen,
  onClose,
  monthKey,
  monthLabel,
  items = [],
  bankUserId = null,
  onPaid,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingItems = useMemo(
    () => items.filter((item) => item.status !== "paid"),
    [items]
  );

  const totalToPay = useMemo(() => {
    return pendingItems.reduce((sum, item) => {
      const totalInstallments = item.total_installments || 1;
      const installmentAmount = (item.amount || 0) / totalInstallments;
      return sum + installmentAmount;
    }, 0);
  }, [pendingItems]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    toast.dismiss();

    try {
      const payload = {
        month: monthKey,
      };
      if (bankUserId) {
        payload.bank_user_id = bankUserId;
      }

      await axios.post(route("faturas.pay_month"), payload);

      toast.success("Pagamentos do mês registrados com sucesso.");
      setIsSubmitting(false);
      if (onPaid) onPaid();
      if (onClose) onClose();
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);

      if (error.response && error.response.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Erro ao registrar pagamentos do mês.");
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={`Pagar fatura de ${monthLabel}`}
    >
      <div className="space-y-4 text-sm">
        {pendingItems.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">
            Não há pendências para este mês.
          </p>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-300">
              Você está prestes a registrar o pagamento das pendências deste mês.
            </p>

            <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs shadow-sm dark:border-gray-800 dark:bg-[#050505]">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Pendências do mês
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {pendingItems.map((item) => {
                  const totalInstallments = item.total_installments || 1;
                  const currentInstallment = item.current_installment || 1;
                  const installmentAmount = (item.amount || 0) / totalInstallments;
                  const remainingInstallments = Math.max(
                    totalInstallments - currentInstallment + 1,
                    1
                  );

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-2 py-1.5 text-gray-700 dark:bg-gray-900 dark:text-gray-200"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                          Parcela atual: {currentInstallment}/{totalInstallments} •
                          Valor da parcela: {formatCurrency(installmentAmount)}
                        </p>
                      </div>
                      <div className="text-right text-[11px] text-gray-500 dark:text-gray-400">
                        <p>Restantes: {remainingInstallments}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-dashed border-gray-200 pt-2 text-[11px] dark:border-gray-700">
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  Total a pagar agora
                </span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {formatCurrency(totalToPay)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Observação: faturas parceladas só serão marcadas como "pagas" quando
              todas as parcelas forem quitadas.
            </p>
          </>
        )}
      </div>

      <div className="mt-5 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancelar
        </button>
        <PrimaryButton
          type="button"
          disabled={isSubmitting || pendingItems.length === 0}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Registrando..." : "Confirmar pagamento"}
        </PrimaryButton>
      </div>
    </Modal>
  );
}
