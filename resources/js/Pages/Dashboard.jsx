import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Head } from '@inertiajs/react'
import { motion } from 'framer-motion'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import StatCard from '@/Components/system/dashboard/StatCard'
import QuickActions from '@/Components/system/dashboard/QuickActions'

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value || 0)
}

function formatDateLabel(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(date)
}

export default function Dashboard({ bankAccounts = [], categories = [] }) {
  const [currentFilters, setCurrentFilters] = useState({})
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [data, setData] = useState(null)
  const [recentFaturas, setRecentFaturas] = useState([])

  const [stats, setStats] = useState([
    { id: 1, title: 'Saldo Disponível', value: formatCurrency(0), delta: '+0%' },
    { id: 2, title: 'Gastos do mês', value: formatCurrency(0), delta: '+0%' },
    { id: 3, title: 'Receitas do mês', value: formatCurrency(0), delta: '+0%' },
    { id: 4, title: 'Contas ativas', value: '0', delta: '+0' },
  ])

  const handleBankFilterChange = (event) => {
    const value = event.target.value || undefined
    setCurrentFilters((prev) => ({
      ...prev,
      bank_user_id: value,
    }))
    setPage(1)
  }

  useEffect(() => {
    (async () => {
      try {
        const [faturasResponse, statsResponse] = await Promise.all([
          axios.get(route('faturas.index'), { params: { ...currentFilters, page } }),
	      axios.get(route('faturas.stats'), { params: { ...currentFilters } }),
        ])

        const payload = faturasResponse.data || {}
        setData(payload)

        const faturas = payload.data || []
        setRecentFaturas(faturas)

        const statsPayload = statsResponse.data || {}

        const totalIncome = Number(statsPayload.total_income || 0)
        const totalExpenses = Number(statsPayload.total_expenses || 0)
        const pendingIncome = Number(statsPayload.pending_income || 0)
        const pendingExpenses = Number(statsPayload.pending_expenses || 0)
        const overdueCount = Number(statsPayload.overdue_count || 0)

        const currentMonthPendingBill = Number(statsPayload.current_month_pending_bill || 0)
        const currentMonthLabel = statsPayload.current_month_label || 'Mês atual'

        const saldoDisponivel = totalIncome - totalExpenses

        setStats([
          {
            id: 1,
            title: 'Fatura atual pendente',
            value: formatCurrency(currentMonthPendingBill),
            delta: currentMonthLabel,
          },
          {
            id: 2,
            title: 'Despesas pendentes',
            value: formatCurrency(pendingExpenses),
            delta: '',
          },
          {
            id: 3,
            title: 'Receitas pagas',
            value: formatCurrency(totalIncome),
            delta: '',
          },
          {
            id: 4,
            title: 'Faturas vencidas',
            value: String(overdueCount),
            delta: '',
          },
        ])
      } catch (error) {
        console.error(error)
      }
    })()
  }, [currentFilters, page, reloadKey])

  return (
    <AuthenticatedLayout>
      <Head title="Dashboard" />

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-[1600px] mx-auto"
      >
        <div className="flex flex-col gap-3 mb-6 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Visão geral
          </h1>

          <div className="flex items-center gap-3 text-sm">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Banco do dashboard
            </label>
            <select
              value={currentFilters.bank_user_id || ''}
              onChange={handleBankFilterChange}
              className="min-w-[220px] rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
            >
              <option value="">Todos os bancos</option>
              {bankAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                  {account.due_day ? ` - vence dia ${account.due_day}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              delta={stat.delta}
            />
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-white p-4 shadow-md ring-1 ring-black/5 dark:bg-[#0b0b0b] dark:ring-black/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Transações recentes
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">Últimos lançamentos</span>
            </div>

            <div className="space-y-3">
              {recentFaturas && recentFaturas.length > 0 ? (
                recentFaturas.slice(0, 5).map((fatura) => {
                  const isDebit = fatura.type === 'debit'
                  const labelDate = formatDateLabel(fatura.created_at)
                  const bankName = fatura.bank_user?.bank?.name
                  const categoryName = fatura.category?.name
                  const typeLabel = isDebit ? 'Débito' : 'Crédito'
                  const subtitleParts = [typeLabel]
                  if (bankName) subtitleParts.push(bankName)
                  if (categoryName) subtitleParts.push(categoryName)
                  if (labelDate) subtitleParts.push(labelDate)

                  return (
                    <Transaction
                      key={fatura.id}
                      title={fatura.title}
                      subtitle={subtitleParts.join(' • ')}
                      value={`${formatCurrency(fatura.amount)}`}
                      negative={isDebit}
                    />
                  )
                })
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Nenhuma transação recente encontrada.
                </p>
              )}
            </div>
          </div>

          <QuickActions bankAccounts={bankAccounts} categories={categories} />
        </div>
      </motion.div>
    </AuthenticatedLayout>
  )
}

function Transaction({ title, subtitle, value, negative }) {
  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-900/30">
      <div>
        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{title}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</div>
      </div>
      <div className="text-sm font-semibold text-red-400">
        {value}
      </div>
    </div>
  )
}
