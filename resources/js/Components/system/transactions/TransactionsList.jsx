import React from "react";
import ScrollArea from "@/Components/common/ScrollArea";
import TransactionRow from "@/Components/system/transactions/TransactionRow";

export default function TransactionsList({ transactions = [], onEdit, onDelete }) {
  if (!transactions.length) {
    return (
			<p className="px-3 py-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        Nenhuma transação pendente encontrada.
      </p>
    );
  }

  return (
		<ScrollArea
			maxHeightClassName="max-h-[380px] md:max-h-[420px] lg:max-h-[460px] 2xl:max-h-[460px]"
			className="divide-y divide-gray-100 dark:divide-gray-800"
		>
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
