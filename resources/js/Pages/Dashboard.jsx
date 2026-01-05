import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Head } from '@inertiajs/react'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import StatCard from '@/Components/system/dashboard/StatCard'
import QuickActions from '@/Components/system/dashboard/QuickActions'
import MonthlySummaryChart from '@/Components/system/dashboard/MonthlySummaryChart'
import TopSpendingCategories from '@/Components/system/dashboard/TopSpendingCategories'
import { formatCurrencyBRL } from '@/Lib/formatters'
import FaturaDetailModal from '@/Components/system/fatura/FaturaDetailModal'
import ScrollArea from '@/Components/common/ScrollArea'

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
  const [monthlySummary, setMonthlySummary] = useState([])
  const [topSpendingCategories, setTopSpendingCategories] = useState([])
  const [selectedFaturaItem, setSelectedFaturaItem] = useState(null)

  const [stats, setStats] = useState([
    { id: 1, title: 'Saldo Disponível', value: formatCurrencyBRL(0), delta: '+0%' },
    { id: 2, title: 'Gastos do mês', value: formatCurrencyBRL(0), delta: '+0%' },
    { id: 3, title: 'Receitas do mês', value: formatCurrencyBRL(0), delta: '+0%' },
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
        const currentMonthDebitTotal = Number(statsPayload.current_month_debit_total || 0)
        const overdueCount = Number(statsPayload.overdue_count || 0)

        const monthlySummaryPayload = Array.isArray(statsPayload.monthly_summary)
          ? statsPayload.monthly_summary
          : []

        const topSpendingPayload = Array.isArray(statsPayload.top_spending_categories)
          ? statsPayload.top_spending_categories
          : []

        const currentMonthPendingBill = Number(statsPayload.current_month_pending_bill || 0)
        const currentMonthLabel = statsPayload.current_month_label || 'Mês atual'

        setStats([
          {
            id: 1,
            title: 'Fatura atual pendente',
            value: formatCurrencyBRL(currentMonthPendingBill),
            delta: currentMonthLabel,
          },
          {
            id: 2,
            title: 'Transações no débito',
            value: formatCurrencyBRL(currentMonthDebitTotal),
            delta: '',
          },
          {
            id: 3,
            title: 'Receitas pagas',
            value: formatCurrencyBRL(totalIncome),
            delta: '',
          },
          {
            id: 4,
            title: 'Faturas vencidas',
            value: String(overdueCount),
            delta: '',
          },
        ])

        setMonthlySummary(monthlySummaryPayload)

        const totalTopSpending = topSpendingPayload.reduce(
          (acc, item) => acc + Number(item.total || 0),
          0,
        )

        const normalizedTopSpending = totalTopSpending > 0
          ? topSpendingPayload.map((item) => ({
              ...item,
              share: Math.max(
                5,
                Math.round((Number(item.total || 0) / totalTopSpending) * 100),
              ),
            }))
          : topSpendingPayload

        setTopSpendingCategories(normalizedTopSpending)
      } catch (error) {
        console.error(error)
        if (error.response?.data?.message) {
          toast.error(error.response.data.message)
        } else {
          toast.error('Não foi possível carregar os dados do dashboard.')
        }
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
        className="max-w-[1600px] mx-auto pb-6"
      >
        <div className="flex flex-col gap-3 mb-6 md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Visão geral
          </h1>

          <div className="flex items-center gap-2 text-sm lg:text-base">
            <label className="text-xs lg:text-sm font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
              Banco do dashboard
            </label>
            <select
              value={currentFilters.bank_user_id || ''}
              onChange={handleBankFilterChange}
              className="min-w-[260px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {stats.map((stat) => (
            <StatCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              delta={stat.delta}
            />
          ))}
        </div>

        <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7">
          <div className="lg:col-span-2 border dark:border-red-950/50 border-gray-50/90 rounded-2xl bg-white p-4 shadow-md ring-1 ring-black/5 dark:bg-[#0b0b0b] dark:ring-black/30">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100">
                Transações recentes
              </h2>
              <span className="text-xs text-gray-600 dark:text-gray-400">Últimos lançamentos</span>
            </div>

            <ScrollArea maxHeightClassName="max-h-[260px]" className="space-y-3 pr-1">
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

                  const handleClick = () => {
                    setSelectedFaturaItem({
                      title: fatura.title,
                      description: fatura.description,
                      amount: fatura.amount,
                      type: fatura.type,
                      status: fatura.status,
                      created_at: fatura.created_at,
                      paid_date: fatura.paid_date,
                      total_installments: fatura.total_installments,
                      current_installment: fatura.current_installment,
                      display_installment: null,
                      is_recurring: fatura.is_recurring,
                      bank_name: bankName,
                      category_name: categoryName,
                    })
                  }

                  return (
                    <Transaction
                      key={fatura.id}
                      title={fatura.title}
                      subtitle={subtitleParts.join(' • ')}
                      value={`${formatCurrencyBRL(fatura.amount)}`}
                      negative={isDebit}
                      onClick={handleClick}
                    />
                  )
                })
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nenhuma transação recente encontrada.
                </p>
              )}
            </ScrollArea>
          </div>

          <QuickActions bankAccounts={bankAccounts} categories={categories} />
        </div>

        <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7">
          <div className="lg:col-span-2 border rounded-2xl dark:border-red-950/50 border-gray-50/90">
            <MonthlySummaryChart data={monthlySummary} />
          </div>

          <TopSpendingCategories data={topSpendingCategories} />
        </div>

        <FaturaDetailModal
          isOpen={!!selectedFaturaItem}
          onClose={() => setSelectedFaturaItem(null)}
          item={selectedFaturaItem}
        />
      </motion.div>
    </AuthenticatedLayout>
  )
}

function Transaction({ title, subtitle, value, negative, onClick }) {
  return (
    <div
      className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-900/30 cursor-pointer"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div>
        <div className="text-sm lg:text-base font-medium text-gray-900 dark:text-gray-200">{title}</div>
        <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">{subtitle}</div>
      </div>
      <div className="text-sm lg:text-base font-semibold text-red-400">
        {value}
      </div>
    </div>
  )
}
