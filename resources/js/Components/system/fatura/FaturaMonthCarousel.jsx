import React from "react";

export default function FaturaMonthCarousel({
  months = [],
  selectedMonthKey,
  onChangeMonth,
}) {
  if (!months || months.length === 0) return null;

  const currentIndex = months.findIndex((m) => m.month_key === selectedMonthKey);
  const effectiveIndex = currentIndex === -1 ? 0 : currentIndex;

  const canPrev = effectiveIndex < months.length - 1; // meses anteriores (mais antigos)
  const canNext = effectiveIndex > 0; // meses mais recentes

  const handlePrev = () => {
    if (!canPrev) return;
    const next = months[effectiveIndex + 1];
    if (next) onChangeMonth(next.month_key);
  };

  const handleNext = () => {
    if (!canNext) return;
    const next = months[effectiveIndex - 1];
    if (next) onChangeMonth(next.month_key);
  };

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-black/5 dark:bg-[#050505] dark:ring-white/5">
      <button
        type="button"
        onClick={handlePrev}
        disabled={!canPrev}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-200 dark:hover:bg-gray-900"
      >
        
      </button>

      <div className="flex-1 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2">
          {months.map((month) => {
            const isActive = month.month_key === selectedMonthKey;
            return (
              <button
                key={month.month_key}
                type="button"
                onClick={() => onChangeMonth(month.month_key)}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition border ${
                  isActive
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400/70 dark:bg-emerald-900/40 dark:text-emerald-200"
                    : "border-transparent bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                {month.month_label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={!canNext}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-200 dark:hover:bg-gray-900"
      >
        
      </button>
    </div>
  );
}
