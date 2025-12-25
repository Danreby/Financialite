import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "@/Components/common/Modal";
import PrimaryButton from "@/Components/common/buttons/PrimaryButton";
import SecondaryButton from "@/Components/common/buttons/SecondaryButton";
import BareButton from "@/Components/common/buttons/BareButton";

export default function EditTransactionModal({
  isOpen,
  onClose,
  transaction,
  bankAccounts = [],
  categories = [],
  onUpdated,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [bankUserId, setBankUserId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState("debit");
  const [totalInstallments, setTotalInstallments] = useState("1");
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleIntegerKeyDown = (event) => {
    const allowedKeys = [
      "Backspace",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
      "Home",
      "End",
    ];

    if (allowedKeys.includes(event.key)) return;

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  };

  const handleDecimalKeyDown = (event) => {
    const allowedKeys = [
      "Backspace",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
      "Home",
      "End",
    ];

    if (allowedKeys.includes(event.key)) return;

    if (event.key === "," || event.key === ".") return;

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  };

  useEffect(() => {
    if (!transaction) return;
    setTitle(transaction.title || "");
    setDescription(transaction.description || "");
    setAmount(String(transaction.amount ?? ""));
    setBankUserId(transaction.bank_user_id ? String(transaction.bank_user_id) : "");
    setCategoryId(transaction.category_id ? String(transaction.category_id) : "");
    setType(transaction.type || "debit");
    setTotalInstallments(
      transaction.total_installments ? String(transaction.total_installments) : "1"
    );
    setIsRecurring(Boolean(transaction.is_recurring));
  }, [transaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transaction || isSubmitting) return;

    toast.dismiss();

    if (!title.trim()) {
      toast.error("Informe o título da transação.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }

    setIsSubmitting(true);

    try {
      const isDebit = type === "debit";
      const effectiveRecurring = isDebit ? false : isRecurring;
      const normalizedInstallments = isDebit
        ? 1
        : effectiveRecurring
        ? 1
        : Math.max(Number(totalInstallments) || 1, 1);

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        amount: Number(amount),
        type,
        total_installments: normalizedInstallments,
        is_recurring: effectiveRecurring ? 1 : 0,
        bank_user_id: bankUserId || null,
        category_id: categoryId || null,
      };

      const response = await axios.put(route("faturas.update", transaction.id), payload);

      toast.success("Transação atualizada com sucesso.");
      if (onUpdated) onUpdated(response.data);
      if (onClose) onClose();
    } catch (error) {
      console.error(error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Erro ao atualizar transação.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!transaction) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg" title="Editar transação">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Título
            </label>
            <input
              type="text"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm shadow-sm dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
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
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                min="0.01"
                step="0.01"
                onKeyDown={handleDecimalKeyDown}
                className="flex-1 border-0 bg-transparent p-2 text-sm outline-none focus:ring-0 dark:text-gray-100"
                min="0.01"
                step="0.01"
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
                  name="edit_type"
                  value="debit"
                  checked={type === "debit"}
                  onChange={(e) => setType(e.target.value)}
                  className="h-3 w-3 appearance-none rounded-full border border-gray-400 checked:border-[#7b1818] checked:bg-[#7b1818] dark:border-gray-600"
                />
                <span>Débito</span>
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1 text-gray-700 transition hover:bg-white hover:shadow-sm dark:text-gray-200 dark:hover:bg-gray-800">
                <input
                  type="radio"
                  name="edit_type"
                  value="credit"
                  checked={type === "credit"}
                  onChange={(e) => setType(e.target.value)}
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
              type="number"
              min="1"
              max="360"
              value={totalInstallments}
              onChange={(e) => setTotalInstallments(e.target.value)}
              inputMode="numeric"
              onKeyDown={handleIntegerKeyDown}
              className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm shadow-sm dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100 disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:text-gray-500 disabled:dark:text-gray-400"
              disabled={isRecurring || type === "debit"}
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              maxLength={255}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm shadow-sm dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
            />
          </div>

          <div className="flex items-center justify-between md:col-span-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Transação recorrente
            </span>
            <BareButton
              type="button"
              onClick={() => {
                if (type === "debit") return;
                setIsRecurring((prev) => !prev);
              }}
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
            </BareButton>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Categoria
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm shadow-sm dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
            >
              <option value="">Sem categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Conta / Banco
            </label>
            <select
              value={bankUserId}
              onChange={(e) => setBankUserId(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm shadow-sm dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
            >
              <option value="">Sem conta vinculada</option>
              {bankAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          <SecondaryButton
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancelar
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
