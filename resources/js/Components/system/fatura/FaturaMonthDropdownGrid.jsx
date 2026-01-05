import React, { useState, useRef, useEffect } from 'react'
import ScrollArea from '@/Components/common/ScrollArea'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function FaturaMonthDropdownGrid({ months = [], value, onChange }) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef(null)
  const panelRef = useRef(null)

  const selected = months.find((m) => m.month_key === value) || months[0] || null

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  if (!months || months.length === 0) return null

  const handleSelect = (key) => {
    if (onChange) {
      onChange(key)
    }
    setOpen(false)
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
				className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-[11px] lg:text-xs 2xl:text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
     >
        <span className="inline-flex flex-col text-left">
					<span className="text-[11px] lg:text-xs 2xl:text-xs font-medium text-gray-900 dark:text-gray-100">
            {selected ? selected.month_label : 'Selecione um mês'}
            {selected && selected.is_paid ? ' (paga)' : ''}
          </span>
        </span>
        <svg
          className={classNames(
            'h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform',
            open ? 'rotate-180' : 'rotate-0',
          )}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.25 7.5L10 12.25L14.75 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          ref={panelRef}
					className="absolute right-0 z-20 mt-2 w-64 sm:w-80 2xl:w-80 origin-top-right rounded-2xl bg-white p-3 shadow-xl ring-1 ring-black/5 dark:bg-[#050505] dark:ring-black/40"
        >

					<ScrollArea maxHeightClassName="max-h-56 2xl:max-h-56">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mr-2">
              {months.map((month) => {
                const isSelected = month.month_key === (selected && selected.month_key)
                const isPaid = month.is_paid

                return (
                  <button
                    key={month.month_key}
                    type="button"
                    onClick={() => handleSelect(month.month_key)}
                    className={classNames(
                      'flex flex-col items-start rounded-xl border px-2.5 py-2 text-left transition-colors',
                      'hover:border-rose-400 hover:bg-rose-50/60 dark:hover:border-rose-500/70 dark:hover:bg-rose-900/20',
                      isSelected
                        ? 'border-rose-500 bg-rose-50 dark:border-rose-500/80 dark:bg-rose-900/30'
                        : 'border-gray-200 bg-gray-50/60 dark:border-gray-800 dark:bg-[#050505]',
                    )}
                  >
								<span className="text-sm 2xl:text-sm font-medium text-gray-800 dark:text-gray-100 leading-tight">
                      {month.month_label}
                    </span>
                    {/* <span
                      className={classNames(
                        'mt-1 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                        isPaid
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-300',
                      )}
                    >
                      {isPaid ? 'Paga' : 'Pendente'}
                    </span> */}
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
