import Modal from "../common/Modal";
import PrimaryButton from "@/Components/common/buttons/PrimaryButton";

export default function FaturaForm({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl" title="Nova transação">
      <form className="space-y-4">
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
            <input
              name="amount"
              type="number"
              className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
              placeholder="Valor da transação"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Tipo
            </label>
            <select
              name="type"
              className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
            >
              <option value="">Selecione</option>
              <option value="credit">Crédito</option>
              <option value="debit">Débito</option>
            </select>
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

          <div className="flex items-center gap-2 md:col-span-2">
            <input
              id="is_recurring"
              name="is_recurring"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-[#7b1818] focus:ring-[#7b1818] dark:border-gray-700 dark:bg-[#0f0f0f]"
            />
            <label
              htmlFor="is_recurring"
              className="text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Transação recorrente
            </label>
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