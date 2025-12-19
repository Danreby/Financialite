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

export default function Dashboard() {
  const [currentFilters, setCurrentFilters] = useState({})
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [data, setData] = useState(null)

  const [stats, setStats] = useState([
    { id: 1, title: 'Saldo Disponível', value: formatCurrency(0), delta: '+0%' },
    { id: 2, title: 'Gastos do mês', value: formatCurrency(0), delta: '+0%' },
    { id: 3, title: 'Receitas do mês', value: formatCurrency(0), delta: '+0%' },
    { id: 4, title: 'Contas ativas', value: '0', delta: '+0' },
  ])

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(route("faturas.index"), { params: { ...currentFilters, page } });
        const payload = response.data || {}
        setData(payload)

        const faturas = payload.data || []

        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        let totalDebit = 0
        let totalCredit = 0
        const activeAccounts = new Set()

        faturas.forEach((fatura) => {
          if (!fatura.due_date) return

          const due = new Date(fatura.due_date)
          if (Number.isNaN(due.getTime())) return

          if (due.getMonth() === currentMonth && due.getFullYear() === currentYear) {
            if (fatura.type === 'debit') {
              totalDebit += Number(fatura.amount) || 0
            } else if (fatura.type === 'credit') {
              totalCredit += Number(fatura.amount) || 0
            }
          }

          if (fatura.bank_user && fatura.bank_user.bank) {
            activeAccounts.add(fatura.bank_user.bank.id ?? fatura.bank_user.id)
          }
        })

        const saldoDisponivel = totalCredit - totalDebit

        setStats([
          { id: 1, title: 'Saldo Disponível', value: formatCurrency(saldoDisponivel), delta: '+0%' },
          { id: 2, title: 'Gastos do mês', value: formatCurrency(totalDebit), delta: '+0%' },
          { id: 3, title: 'Receitas do mês', value: formatCurrency(totalCredit), delta: '+0%' },
          { id: 4, title: 'Contas ativas', value: String(activeAccounts.size), delta: '+0' },
        ])
      } catch (error) {
        console.error(error);
      }
    })();
  }, [currentFilters, page, reloadKey]);

  return (
    <AuthenticatedLayout>
      <Head title="Dashboard" />

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-[1600px] mx-auto"
      >
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 dark:text-gray-100">
          Visão geral
        </h1>

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
              <Transaction
                title="Pagamento Mercado"
                subtitle="Cartão • 14 Dez"
                value="- R$ 123,45"
                negative
              />
              <Transaction
                title="Salário"
                subtitle="Transferência • 01 Dez"
                value="+ R$ 5.000,00"
              />
              <Transaction
                title="Assinatura Streaming"
                subtitle="Débito • 10 Dez"
                value="- R$ 29,90"
                negative
              />
            </div>
          </div>

          <QuickActions />
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
      <div
        className={`text-sm font-semibold ${
          negative ? 'text-red-400' : 'text-emerald-400'
        }`}
      >
        {value}
      </div>
    </div>
  )
}
