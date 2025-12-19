import React, { useState } from 'react';
import PrimaryButton from '@/Components/common/buttons/PrimaryButton';
import FaturaForm from '@/Components/system/FaturaForm';

export default function QuickActions() {
  const [showFaturaForm, setShowFaturaForm] = useState(false);

  return (
    <>
      <div className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-black/5 dark:bg-[#0b0b0b] dark:ring-black/30">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 dark:text-gray-100">Ações rápidas</h3>

        <div className="flex flex-col gap-3">
          <PrimaryButton className="w-full" onClick={() => setShowFaturaForm(true)}>
            Nova transação
          </PrimaryButton>
          <PrimaryButton className="w-full" style={{ background: '#3a0f0f' }}>Adicionar conta</PrimaryButton>
          <PrimaryButton className="w-full" style={{ background: '#222' }}>Importar CSV</PrimaryButton>
        </div>
      </div>

      <FaturaForm
        isOpen={showFaturaForm}
        onClose={() => setShowFaturaForm(false)}
      />
    </>
  );
}
