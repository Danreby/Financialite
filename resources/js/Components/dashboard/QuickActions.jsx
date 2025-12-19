import React from 'react'
import PrimaryButton from '@/Components/PrimaryButton'

export default function QuickActions() {
  return (
    <div className="rounded-2xl bg-[#0b0b0b] p-4 shadow-md ring-1 ring-black/30">
      <h3 className="text-sm font-semibold text-gray-100 mb-3">Ações rápidas</h3>

      <div className="flex flex-col gap-3">
        <PrimaryButton className="w-full">Nova transação</PrimaryButton>
        <PrimaryButton className="w-full" style={{ background: '#3a0f0f' }}>Adicionar conta</PrimaryButton>
        <PrimaryButton className="w-full" style={{ background: '#222' }}>Importar CSV</PrimaryButton>
      </div>
    </div>
  )
}
