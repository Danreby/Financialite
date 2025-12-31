import React from "react";
import ScrollArea from "@/Components/common/ScrollArea";
import TransactionRow from "@/Components/system/transactions/TransactionRow";

export default function TransactionsList({ transactions = [], onEdit, onDelete }) {
  if (!transactions.length) {
    return (
      <p className="px-3 py-4 text-base sm:text-lg text-gray-500 dark:text-gray-400">
        Nenhuma transação pendente encontrada.
      </p>
    );
  }

  return (
    <ScrollArea className="divide-y divide-gray-100 dark:divide-gray-800">
      {transactions.map((tx) => (
        <TransactionRow
          key={tx.id}
          transaction={tx}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ScrollArea>
  );
}
