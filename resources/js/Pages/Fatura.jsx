import React from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FaturaMonthSection from '@/Components/system/fatura/FaturaMonthSection';

export default function Fatura({ monthlyGroups = [], bankAccounts = [], filters = {} }) {
	const selectedBankId = filters?.bank_user_id ?? '';

	const handleBankChange = (event) => {
		const value = event.target.value || undefined;
		router.get(route('faturas.index'), { bank_user_id: value }, {
			preserveState: true,
			preserveScroll: true,
		});
	};

	return (
		<AuthenticatedLayout>
			<Head title="Faturas" />

			<div className="max-w-5xl mx-auto space-y-6">
				<header className="pt-2 space-y-4">
					<div>
						<h1 className="text-2xl font-semibold text-gray-900 mb-1 dark:text-gray-100">
							Faturas
						</h1>
						<p className="text-sm text-gray-600 dark:text-gray-300">
							Visualize suas despesas agrupadas por mês.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-3 text-sm">
						<label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
							Filtrar por banco
						</label>
						<select
							value={selectedBankId || ''}
							onChange={handleBankChange}
							className="min-w-[200px] rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
						>
							<option value="">Todos os bancos</option>
							{bankAccounts.map((account) => (
								<option key={account.id} value={account.id}>
									{account.name}
								</option>
							))}
						</select>
					</div>
				</header>

				<div className="space-y-5 pb-8">
					{(!monthlyGroups || monthlyGroups.length === 0) && (
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Nenhuma fatura encontrada para o filtro atual.
						</p>
					)}

					{monthlyGroups &&
						monthlyGroups.map((group) => (
							<FaturaMonthSection key={group.month_key} {...group} />
						))}
				</div>
			</div>
		</AuthenticatedLayout>
	);
}
