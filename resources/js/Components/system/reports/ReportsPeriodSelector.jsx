import React from "react";
import PrimaryButton from "@/Components/common/buttons/PrimaryButton";

export default function ReportsPeriodSelector({
  periods = [],
  selectedKey,
  onChange,
  onOpen,
  isLoading = false,
}) {
  const hasPeriods = periods && periods.length > 0;
  const safeValue = selectedKey || (hasPeriods ? periods[periods.length - 1]?.key : "");

  return (
    <div className="rounded-2xl bg-white p-3 shadow-md ring-1 ring-black/5 dark:bg-[#0b0b0b] dark:ring-black/30 sm:p-3 lg:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
            Fatura por período
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
            Escolha um mês/ano para visualizar a fatura e todas as transações daquele período.
          </p>
        </div>
        {isLoading && (
          <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">Carregando...</span>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          value={safeValue}
          onChange={(event) => onChange?.(event.target.value)}
          disabled={!hasPeriods || isLoading}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100 sm:min-w-[230px]"
        >
          {hasPeriods ? (
            periods.map((period) => (
              <option key={period.key} value={period.key}>
                {period.label} — {period.count} transações
              </option>
            ))
          ) : (
            <option value="">Nenhum período disponível</option>
          )}
        </select>

        <PrimaryButton
          type="button"
          onClick={() => onOpen?.(safeValue)}
          disabled={!hasPeriods || !safeValue || isLoading}
          className="rounded-full px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wide w-full sm:w-auto"
        >
          Ver fatura e transações
        </PrimaryButton>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
        <p>
          Períodos detectados: <span className="font-semibold text-gray-900 dark:text-gray-100">{periods.length}</span>
        </p>
        <p className="sm:text-right">
          Último período: {hasPeriods ? periods[periods.length - 1]?.label : "-"}
        </p>
      </div>
    </div>
  );
}
