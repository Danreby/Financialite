import React from "react";
import ScrollArea from "@/Components/common/ScrollArea";
import TransactionRow from "@/Components/system/transactions/TransactionRow";

export default function TransactionsList({ transactions = [], onEdit, onDelete, onShowDetails }) {
  if (!transactions.length) {
    return (
			<p className="px-3 py-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        Nenhuma transação pendente encontrada.
      </p>
    );
  }

  return (
		<ScrollArea
			maxHeightClassName="max-h-[500px] md:max-h-[540px] lg:max-h-[580px] 2xl:max-h-[580px]"
			className="divide-y divide-gray-100 dark:divide-gray-800"
		>
      {transactions.map((tx) => (
        <TransactionRow
          key={tx.id}
          transaction={tx}
          onEdit={onEdit}
          onDelete={onDelete}
          onShowDetails={onShowDetails}
        />
      ))}
    </ScrollArea>
  );
}
