import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import PrimaryButton from '@/Components/common/buttons/PrimaryButton';
import FaturaForm from '@/Components/system/FaturaForm';
import BankForm from '@/Components/system/BankForm';
import CategoryForm from '@/Components/system/CategoryForm';
import FaturaImportModal from '@/Components/system/fatura/import/FaturaImportModal';

export default function QuickActions({ bankAccounts = [], categories = [] }) {
  const [showFaturaForm, setShowFaturaForm] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
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
      <div className="rounded-2xl border dark:border-red-950/50 border-gray-50/90 bg-white p-5 shadow-md ring-1 ring-black/5 dark:bg-[#0b0b0b] dark:ring-black/30">
        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 dark:text-gray-100">Ações rápidas</h3>

        <div className="flex flex-col gap-3">
          <PrimaryButton className="w-full text-white" onClick={() => setShowFaturaForm(true)}>
            Nova Transação
          </PrimaryButton>
          <PrimaryButton
            className="w-full text-white"
            style={{ background: '#3a0f0f' }}
            onClick={() => setShowBankForm(true)}
          >
            Adicionar Banco
          </PrimaryButton>
          <PrimaryButton
            className="w-full text-white"
            style={{ background: '#222' }}
            onClick={() => setShowCategoryForm(true)}
          >
            Adicionar Categoria
          </PrimaryButton>
          <PrimaryButton
            className="w-full text-white"
            style={{ background: '#111827' }}
            onClick={() => router.visit(route('transactions.index'))}
          >
            Ver Transações Pendentes
          </PrimaryButton>
          <PrimaryButton
            className="w-full text-white"
            style={{ background: '#0f766e' }}
            onClick={() => router.visit(route('reports.index'))}
          >
            Ir para Relatórios
          </PrimaryButton>
          <PrimaryButton
            className="w-full text-white"
            style={{ background: '#1d4ed8' }}
            onClick={() => router.visit(route('faturas.index'))}
          >
            Ver Faturas do Cartão
          </PrimaryButton>
          <PrimaryButton
            className="w-full text-white"
            style={{ background: '#4b5563' }}
            onClick={() => setShowImportModal(true)}
          >
            Importar Faturas via Excel
          </PrimaryButton>
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
        categories={localCategories}
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

      <FaturaImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImported={() => {
          //
        }}
      />
    </>
  );
}
