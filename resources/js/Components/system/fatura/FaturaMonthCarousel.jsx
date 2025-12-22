import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FaturaMonthCarousel({
  months = [],
  selectedMonthKey,
  onChangeMonth,
}) {
  if (!months || months.length === 0) return null;

  const currentIndex = months.findIndex((m) => m.month_key === selectedMonthKey);
  const effectiveIndex = currentIndex === -1 ? 0 : currentIndex;

  const current = months[effectiveIndex];
  const prev = months[effectiveIndex + 1] || null;
  const next = months[effectiveIndex - 1] || null;

  const isPaid = current?.is_paid;

  const canPrev = !!prev;
  const canNext = !!next;

  const handlePrev = () => {
    if (!canPrev) return;
    onChangeMonth(prev.month_key);
  };

  const handleNext = () => {
    if (!canNext) return;
    onChangeMonth(next.month_key);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 40 : -40,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 260, damping: 25 },
    },
    exit: (direction) => ({
      x: direction < 0 ? 40 : -40,
      opacity: 0,
      scale: 0.96,
      transition: { duration: 0.18 },
    }),
  };

  const direction = 0;

  return (
    <div className="flex items-center justify-center gap-4">
      {prev && (
        <button
          type="button"
          onClick={handlePrev}
          className="rounded-full px-3 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900"
        >
          {prev.month_label}
        </button>
      )}

      <AnimatePresence custom={direction} initial={false} mode="wait">
        <motion.div
          key={current.month_key}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className={`inline-flex flex-col items-center rounded-full px-6 py-3 shadow-sm ring-1 bg-gradient-to-r dark:bg-gradient-to-r ${
            isPaid
              ? "from-emerald-50 via-white to-emerald-50 ring-emerald-200 dark:from-[#052e26] dark:via-[#050505] dark:to-[#052e26] dark:ring-emerald-900/50"
              : "from-rose-50 via-white to-rose-50 ring-rose-100 dark:from-[#150709] dark:via-[#0b0b0b] dark:to-[#150709] dark:ring-rose-900/40"
          }`}
        >
            {isPaid ? (
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Paga
            </span>
            ) : (<div></div>
            )}
          <span
            className={`mt-1 text-2xl md:text-3xl font-bold tracking-tight ${
              isPaid
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-gray-900 dark:text-gray-50"
            }`}
          >
            {current.month_label}
          </span>
        </motion.div>
      </AnimatePresence>

      {next && (
        <button
          type="button"
          onClick={handleNext}
          className="rounded-full px-3 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900"
        >
          {next.month_label}
        </button>
      )}
    </div>
  );
}
