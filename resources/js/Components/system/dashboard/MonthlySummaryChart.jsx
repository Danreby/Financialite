import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js'
import { formatCurrencyBRL } from '@/Lib/formatters'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

export default function MonthlySummaryChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-black/5 dark:bg-[#0b0b0b] dark:ring-black/30">
        <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Gastos mensais
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Ainda não há dados suficientes para exibir o gráfico.
        </p>
      </div>
    )
  }

  const labels = data.map((item) => item.month_label)
  const values = data.map((item) => Number(item.expenses_paid || 0))

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Total gasto no mês',
        data: values,
        tension: 0.35,
        fill: true,
        borderColor: 'rgba(244, 63, 94, 1)',
        backgroundColor: 'rgba(244, 63, 94, 0.15)',
        pointRadius: 4,
        pointHoverRadius: 5,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: 'rgba(244, 63, 94, 1)',
        pointBorderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y || 0
            return `Total gasto: ${formatCurrencyBRL(value)}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 10,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.2)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 10,
          },
          callback: (value) => {
            return formatCurrencyBRL(value)
          },
        },
      },
    },
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-black/5 dark:bg-[#0b0b0b] dark:ring-black/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100">
          Gastos mensais
        </h2>
        <span className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">
          Últimos 6 meses
        </span>
      </div>

      <div className="h-64 w-full lg:h-72">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}
