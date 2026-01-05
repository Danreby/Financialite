import React from "react";
import FaturaMonthDropdownGrid from "@/Components/system/fatura/FaturaMonthDropdownGrid";

export default function FaturaFiltersBar({
  bankAccounts = [],
  categories = [],
  filters = {},
  months = [],
  monthValue,
  onFiltersChange,
  onMonthChange,
}) {
  const selectedBankId = filters?.bank_user_id ?? "";
  const selectedCategoryId = filters?.category_id ?? "";

  const handleBankChange = (event) => {
    const value = event.target.value || undefined;
    if (onFiltersChange) {
      onFiltersChange({
        bank_user_id: value,
        category_id: selectedCategoryId || undefined,
      });
    }
  };

  const handleCategoryChange = (event) => {
    const value = event.target.value || undefined;
    if (onFiltersChange) {
      onFiltersChange({
        bank_user_id: selectedBankId || undefined,
        category_id: value,
      });
    }
  };

  const handleMonthChange = (key) => {
    if (!key || !onMonthChange) return;
    onMonthChange(key);
  };

  return (
		<div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm lg:text-sm 2xl:text-sm">
      <select
        value={selectedBankId || ""}
        onChange={handleBankChange}
				className="min-w-[190px] sm:min-w-[210px] lg:min-w-[230px] 2xl:min-w-[230px] rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs sm:text-sm 2xl:text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
      >
        <option value="">Todos os bancos</option>
        {bankAccounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name}
            {account.due_day ? ` - vence todo dia ${account.due_day}` : ""}
          </option>
        ))}
      </select>

      <select
        value={selectedCategoryId || ""}
        onChange={handleCategoryChange}
				className="min-w-[190px] sm:min-w-[210px] lg:min-w-[230px] 2xl:min-w-[230px] rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs sm:text-sm 2xl:text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
      >
        <option value="">Todas as categorias</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {months && months.length > 0 && (
        <FaturaMonthDropdownGrid
          months={months}
          value={monthValue}
          onChange={handleMonthChange}
        />
      )}
    </div>
  );
}
