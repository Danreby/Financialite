import React from 'react'
import { Head } from '@inertiajs/react'
import { motion } from 'framer-motion'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import StatCard from '@/Components/dashboard/StatCard'
import QuickActions from '@/Components/dashboard/QuickActions'

export default function Dashboard() {
  const stats = [
    { id: 1, title: 'Saldo Disponível', value: 'R$ 12.450,75', delta: '+5.4%' },
    { id: 2, title: 'Gastos do mês', value: 'R$ 2.980,10', delta: '-2.1%' },
    { id: 3, title: 'Receitas do mês', value: 'R$ 6.200,00', delta: '+8.9%' },
    { id: 4, title: 'Contas ativas', value: '4', delta: '+0' },
  ]

  return (
    <AuthenticatedLayout>
      <Head title="Dashboard" />

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-[1600px] mx-auto"
      >
        <h1 className="text-2xl font-semibold text-gray-100 mb-6">
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
          <div className="lg:col-span-2 rounded-2xl bg-[#0b0b0b] p-4 shadow-md ring-1 ring-black/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-100">
                Transações recentes
              </h2>
              <span className="text-xs text-gray-400">Últimos lançamentos</span>
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
    <div className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-900/30">
      <div>
        <div className="text-sm font-medium text-gray-200">{title}</div>
        <div className="text-xs text-gray-400">{subtitle}</div>
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
