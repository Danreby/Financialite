import { useState } from "react";
import { toast } from "react-toastify";
import Modal from "../common/Modal";
import PrimaryButton from "@/Components/common/buttons/PrimaryButton";

export default function FaturaForm({ isOpen, onClose }) {
  const [isRecurring, setIsRecurring] = useState(false);
  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title")?.toString().trim();
    const amount = formData.get("amount")?.toString().trim();
    const type = formData.get("type")?.toString().trim();
    const formElement = event.currentTarget;

    toast.dismiss();

    if (!title) {
      toast.error("Informe o título da transação.");
      formElement.elements.namedItem("title")?.focus();
      return;
    }

    if (!amount) {
      toast.error("Informe o valor da transação.");
      formElement.elements.namedItem("amount")?.focus();
      return;
    }

    if (!type) {
      toast.error("Selecione o tipo: débito ou crédito.");
      const debitRadio = formElement.querySelector('input[name="type"][value="debit"]');
      debitRadio?.focus();
      return;
    }

    toast.success("Transação validada com sucesso (exemplo).");
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl" title="Nova transação">
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Título
            </label>
            <input
              name="title"
              type="text"
              className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
              placeholder="Título da transação"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Descrição
            </label>
            <input
              name="description"
              type="text"
              className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
              placeholder="Descrição da transação"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Valor
            </label>
            <div className="flex items-center rounded-md border border-gray-300 bg-white text-sm shadow-sm dark:border-gray-700 dark:bg-[#0f0f0f]">
              <span className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
                R$
              </span>
              <input
                name="amount"
                type="number"
                className="flex-1 border-0 bg-transparent p-2 text-sm outline-none focus:ring-0 dark:text-gray-100"
                placeholder="Valor da transação"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Tipo
            </label>
            <div className="inline-flex items-center gap-2 rounded-full p-1 text-xs font-medium">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1 text-gray-700 transition hover:bg-white hover:shadow-sm dark:text-gray-200 dark:hover:bg-gray-800">
                <input
                  type="radio"
                  name="type"
                  value="debit"
                  className="h-3 w-3 appearance-none rounded-full border border-gray-400 checked:border-[#7b1818] checked:bg-[#7b1818] dark:border-gray-600"
                />
                <span>Débito</span>
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1 text-gray-700 transition hover:bg-white hover:shadow-sm dark:text-gray-200 dark:hover:bg-gray-800">
                <input
                  type="radio"
                  name="type"
                  value="credit"
                  className="h-3 w-3 appearance-none rounded-full border border-gray-400 checked:border-emerald-600 checked:bg-emerald-600 dark:border-gray-600"
                />
                <span>Crédito</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Parcelas
            </label>
            <input
              name="total_installments"
              type="number"
              min="1"
              className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Transação recorrente
            </span>
            <button
              type="button"
              onClick={() => setIsRecurring((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#7b1818] focus:ring-offset-2 ${
                isRecurring
                  ? "bg-[#7b1818] shadow-lg shadow-[#7b1818]/40"
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                  isRecurring ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
            <input
              type="hidden"
              name="is_recurring"
              value={isRecurring ? 1 : 0}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
          <PrimaryButton type="submit">
            Salvar
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}