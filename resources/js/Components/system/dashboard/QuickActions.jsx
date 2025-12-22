import React, { useEffect, useState } from 'react';
import PrimaryButton from '@/Components/common/buttons/PrimaryButton';
import FaturaForm from '@/Components/system/FaturaForm';
import BankForm from '@/Components/system/BankForm';
import CategoryForm from '@/Components/system/CategoryForm';

export default function QuickActions({ bankAccounts = [], categories = [] }) {
  const [showFaturaForm, setShowFaturaForm] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [localBankAccounts, setLocalBankAccounts] = useState(bankAccounts);
  const [localCategories, setLocalCategories] = useState(categories);

  useEffect(() => {
    setLocalBankAccounts(bankAccounts);
  }, [bankAccounts]);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  return (
    <>
      <div className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-black/5 dark:bg-[#0b0b0b] dark:ring-black/30">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 dark:text-gray-100">Ações rápidas</h3>

        <div className="flex flex-col gap-3">
          <PrimaryButton className="w-full" onClick={() => setShowFaturaForm(true)}>
            Nova Transação
          </PrimaryButton>
          <PrimaryButton
            className="w-full"
            style={{ background: '#3a0f0f' }}
            onClick={() => setShowBankForm(true)}
          >
            Adicionar Banco
          </PrimaryButton>
          <PrimaryButton
            className="w-full"
            style={{ background: '#222' }}
            onClick={() => setShowCategoryForm(true)}
          >
            Adicionar Categoria
          </PrimaryButton>
          <PrimaryButton className="w-full" style={{ background: '#222' }}>Importar CSV</PrimaryButton>
        </div>
      </div>

      <FaturaForm
        isOpen={showFaturaForm}
        onClose={() => setShowFaturaForm(false)}
        bankAccounts={localBankAccounts}
        categories={localCategories}
      />

      <BankForm
        isOpen={showBankForm}
        onClose={() => setShowBankForm(false)}
        onSuccess={(bankUser) => {
          if (!bankUser || !bankUser.id) return;
          const name = bankUser.bank?.name || `Conta #${bankUser.id}`;
          setLocalBankAccounts((prev) => {
            if (prev.some((acc) => acc.id === bankUser.id)) {
              return prev;
            }
            return [...prev, { id: bankUser.id, name }];
          });
        }}
      />

      <CategoryForm
        isOpen={showCategoryForm}
        onClose={() => setShowCategoryForm(false)}
        onSuccess={(category) => {
          if (!category || !category.id) return;
          if (!category.name) return;

          setLocalCategories((prev) => {
            if (prev.some((c) => c.id === category.id)) {
              return prev;
            }
            return [...prev, { id: category.id, name: category.name }];
          });
        }}
      />
    </>
  );
}
