import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SecondaryButton from "@/Components/common/buttons/SecondaryButton";

export default function FaturaMonthCarousel({
  months = [],
  total_spent,
  selectedMonthKey,
  onChangeMonth,
}) {
  if (!months || months.length === 0) return null;

  const currentIndex = months.findIndex((m) => m.month_key === selectedMonthKey);
  const effectiveIndex = currentIndex === -1 ? 0 : currentIndex;

  const current = months[effectiveIndex];
  const prev = months[effectiveIndex - 1] || null;
  const next = months[effectiveIndex + 1] || null;

  const isPaid = current?.is_paid;

  const canPrev = !!prev;
  const canNext = !!next;

  const [direction, setDirection] = useState(0);

  const handlePrev = () => {
    if (!canPrev) return;
    setDirection(-1);
    onChangeMonth(prev.month_key);
  };

  const handleNext = () => {
    if (!canNext) return;
    setDirection(1);
    onChangeMonth(next.month_key);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
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
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.96,
      transition: { duration: 0.18 },
    }),
  };

  function formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(value || 0);
  }
  
  return (
	<div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-3 lg:gap-4 2xl:gap-4">
      <div className="flex justify-between sm:w-32 sm:justify-end">
        {prev && (
          <SecondaryButton
            type="button"
            onClick={handlePrev}
            className="rounded-full px-3 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900 border-none shadow-none"
          >
            {prev.month_label}
          </SecondaryButton>
        )}
      </div>

      <div className="flex-1 flex justify-center">
        <AnimatePresence custom={direction} initial={false} mode="wait">
          <motion.div
            key={current.month_key}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className={`inline-flex flex-col items-center rounded-full px-4 py-2 sm:px-6 sm:py-2 lg:px-8 lg:py-3 2xl:px-8 2xl:py-3 shadow-sm ring-1 bg-gradient-to-r dark:bg-gradient-to-r ${
              isPaid
                ? "from-emerald-50 via-white to-emerald-50 ring-emerald-200 dark:from-[#052e26] dark:via-[#050505] dark:to-[#052e26] dark:ring-emerald-900/50"
                : "from-rose-50 via-white to-rose-50 ring-rose-100 dark:from-[#150709] dark:via-[#0b0b0b] dark:to-[#150709] dark:ring-rose-900/40"
            }`}
          >
            {isPaid ? (
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Paga
              </span>
            ) : (
              <div />
            )}
            <span
					className={`mt-1 text-lg sm:text-xl md:text-2xl lg:text-3xl 2xl:text-3xl font-bold tracking-tight ${
                isPaid
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-900 dark:text-gray-50"
              }`}
            >
              {current.month_label}
            </span>
				<span className={`font-semibold text-xl sm:text-2xl lg:text-3xl 2xl:text-3xl ${isPaid ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {formatCurrency(total_spent)}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between sm:w-32 sm:justify-start">
        {next && (
          <SecondaryButton
            type="button"
            onClick={handleNext}
					className="rounded-full px-3 py-1 text-[11px] sm:text-xs 2xl:text-sm font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900 border-none shadow-none"
          >
            {next.month_label}
          </SecondaryButton>
        )}
      </div>
    </div>
  );
}
