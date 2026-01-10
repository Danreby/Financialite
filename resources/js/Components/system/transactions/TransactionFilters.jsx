import React from "react";
import SecondaryButton from "@/Components/common/buttons/SecondaryButton";
import FaturaMonthDropdownGrid from "@/Components/system/fatura/FaturaMonthDropdownGrid";

export default function TransactionFilters({
  searchTerm,
  onSearchChange,
  months = [],
  selectedMonthKey,
  onMonthChange,
  orderOptions = [],
  selectedOrder,
  onOrderChange,
  bankAccounts = [],
  selectedBankId,
  onBankChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  recurringFilter,
  onRecurringChange,
  categories = [],
  selectedCategoryId,
  onCategoryChange,
  onClear,
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full sm:w-56 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
            placeholder="Buscar por título"
          />
          {months && months.length > 0 && (
            <div className="sm:ml-1">
              <FaturaMonthDropdownGrid
                months={months}
                value={selectedMonthKey || months[0]?.month_key || ""}
                onChange={(key) => onMonthChange?.(key || "")}
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <div className="flex flex-wrap gap-1 rounded-xl border border-gray-200 px-2.5 py-1.5 dark:border-gray-800">
            <span className="text-[11px] font-semibold uppercase text-gray-600 dark:text-gray-300 mr-1 mt-1">
              Ordenar:
            </span>
            {orderOptions.map((opt) => {
              const isSelected = selectedOrder?.startsWith(opt.key);
              const currentDir = isSelected && selectedOrder.endsWith("_asc") ? "asc" : "desc";
              const nextDir = isSelected && currentDir === "desc" ? "asc" : "desc";
              const arrow = isSelected ? (currentDir === "asc" ? "▲" : "▼") : "";
              const dynamicLabel = (() => {
                if (opt.key === "title") {
                  return isSelected && currentDir === "desc" ? "Z-A" : "A-Z";
                }
                return opt.label;
              })();

              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onOrderChange?.(`${opt.key}_${nextDir}`)}
                  className={
                    "rounded-lg px-2.5 py-1 text-[11px] sm:text-xs font-semibold transition " +
                    (isSelected
                      ? "bg-rose-500 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#111] dark:text-gray-200 dark:hover:bg-gray-800")
                  }
                >
                  {dynamicLabel} {arrow}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Banco</label>
            <select
              value={selectedBankId}
              onChange={(e) => onBankChange?.(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
            >
              <option value="">Todos</option>
              {bankAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Tipo</label>
            <select
              value={selectedType}
              onChange={(e) => onTypeChange?.(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
            >
              <option value="">Débito e crédito</option>
              <option value="debit">Apenas débito</option>
              <option value="credit">Apenas crédito</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange?.(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
            >
              <option value="">Pendentes e pagas</option>
              <option value="unpaid">Apenas pendentes</option>
              <option value="paid">Apenas pagas</option>
              <option value="overdue">Apenas vencidas</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[170px]">
            <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Recorrência</label>
            <select
              value={recurringFilter}
              onChange={(e) => onRecurringChange?.(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
            >
              <option value="">Todas</option>
              <option value="recurring">Somente recorrentes</option>
              <option value="non_recurring">Somente não recorrentes</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[190px]">
            <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Categoria</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => onCategoryChange?.(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
            >
              <option value="">Todas</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <SecondaryButton
          type="button"
          onClick={onClear}
          className="rounded-full px-4 py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Limpar filtros
        </SecondaryButton>
      </div>
    </div>
  );
}
