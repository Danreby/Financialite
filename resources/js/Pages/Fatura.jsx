import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FaturaMonthSection from '@/Components/system/fatura/FaturaMonthSection';
import FaturaMonthCarousel from '@/Components/system/fatura/FaturaMonthCarousel';
import Modal from '@/Components/common/Modal';
import FaturaPendingExportButton from '@/Components/system/fatura/FaturaPendingExportButton';
import PrimaryButton from '@/Components/common/buttons/PrimaryButton';
import SecondaryButton from '@/Components/common/buttons/SecondaryButton';

function FaturaFilters({ bankAccounts, categories, filters, onChange }) {
	const selectedBankId = filters?.bank_user_id ?? '';
	const selectedCategoryId = filters?.category_id ?? '';

	const handleBankChange = (event) => {
		const value = event.target.value || undefined;
		onChange({
			bank_user_id: value,
			category_id: selectedCategoryId || undefined,
		});
	};

	const handleCategoryChange = (event) => {
		const value = event.target.value || undefined;
		onChange({
			bank_user_id: selectedBankId || undefined,
			category_id: value,
		});
	};

	return (
		<div className="flex flex-wrap items-center gap-4 text-sm">
			<div className="flex items-center gap-3">
				<label className="text-xs lg:text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
					Filtrar por banco
				</label>
				<select
					value={selectedBankId || ''}
					onChange={handleBankChange}
					className="min-w-[200px] lg:min-w-[240px] rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs lg:text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
				>
					<option value="">Todos os bancos</option>
					{bankAccounts.map((account) => (
						<option key={account.id} value={account.id}>
							{account.name}
							{account.due_day
								? ` - vence todo dia ${account.due_day}`
								: ''}
						</option>
					))}
				</select>
			</div>

			<div className="flex items-center gap-3">
				<label className="text-xs lg:text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
					Filtrar por categoria
				</label>
				<select
					value={selectedCategoryId || ''}
					onChange={handleCategoryChange}
					className="min-w-[200px] lg:min-w-[240px] rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs lg:text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
				>
					<option value="">Todas as categorias</option>
					{categories.map((category) => (
						<option key={category.id} value={category.id}>
							{category.name}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}


function monthKeyToIndex(key) {
	if (!key || typeof key !== 'string') return 0;
	const [yearStr, monthStr] = key.split('-');
	const year = parseInt(yearStr, 10) || 0;
	const month = parseInt(monthStr, 10) || 0;
	return year * 12 + (month - 1);
}

function getClosestMonthKey(monthlyGroups, currentMonthKey) {
	if (!monthlyGroups || monthlyGroups.length === 0) return null;

	if (currentMonthKey) {
		const hasCurrent = monthlyGroups.some((g) => g.month_key === currentMonthKey);
		if (hasCurrent) return currentMonthKey;

		const targetIndex = monthKeyToIndex(currentMonthKey);
		let best = monthlyGroups[0];
		let bestDiff = Math.abs(monthKeyToIndex(best.month_key) - targetIndex);

		for (const group of monthlyGroups) {
			const diff = Math.abs(monthKeyToIndex(group.month_key) - targetIndex);
			if (diff < bestDiff) {
				best = group;
				bestDiff = diff;
			}
		}

		return best.month_key;
	}

	return monthlyGroups[0].month_key;
}

export default function Fatura({ monthlyGroups = [], bankAccounts = [], categories = [], filters = {}, currentMonthKey = null }) {
	const selectedBankId = filters?.bank_user_id ?? '';
	const [selectedMonthKey, setSelectedMonthKey] = useState(() =>
		getClosestMonthKey(monthlyGroups, currentMonthKey),
	);
	const [isDueDayModalOpen, setIsDueDayModalOpen] = useState(false);
	const [dueDayInput, setDueDayInput] = useState('');
	const [isUpdatingDueDay, setIsUpdatingDueDay] = useState(false);

	const handleIntegerKeyDown = (event) => {
		const allowedKeys = [
			"Backspace",
			"Tab",
			"ArrowLeft",
			"ArrowRight",
			"Delete",
			"Home",
			"End",
		];

		if (allowedKeys.includes(event.key)) return;

		if (!/^[0-9]$/.test(event.key)) {
			event.preventDefault();
		}
	};

	useEffect(() => {
		if (!monthlyGroups || monthlyGroups.length === 0) {
			setSelectedMonthKey(null);
			return;
		}

		const exists = monthlyGroups.some((g) => g.month_key === selectedMonthKey);
		if (!exists) {
			const closest = getClosestMonthKey(monthlyGroups, currentMonthKey);
			setSelectedMonthKey(closest);
		}
	}, [monthlyGroups, selectedMonthKey, currentMonthKey]);

	const handleFiltersChange = (nextFilters) => {
		router.get(route('faturas.index'), nextFilters, {
			preserveState: true,
			preserveScroll: true,
		});
	};

	const selectedAccount =
		bankAccounts && bankAccounts.length > 0 && selectedBankId
			? bankAccounts.find((account) => String(account.id) === String(selectedBankId))
			: null;

	const handleChangeMonth = (monthKey) => {
		setSelectedMonthKey(monthKey);
	};

	const handleOpenDueDayModal = () => {
		if (!selectedAccount) return;
		setDueDayInput(selectedAccount.due_day ? String(selectedAccount.due_day) : '');
		setIsDueDayModalOpen(true);
	};

	const handleSubmitDueDay = async (event) => {
		event.preventDefault();
		if (!selectedAccount || isUpdatingDueDay) return;

		const parsed = parseInt(dueDayInput, 10);
		if (Number.isNaN(parsed) || parsed < 1 || parsed > 31) {
			toast.error('Informe um dia de vencimento entre 1 e 31.');
			return;
		}

		setIsUpdatingDueDay(true);
		toast.dismiss();

		try {
			await axios.patch(route('banks.update-due-day', selectedAccount.id), {
				due_day: parsed,
			});

			toast.success('Dia de vencimento atualizado com sucesso.');
			setIsDueDayModalOpen(false);
			router.reload({ only: ['bankAccounts'] });
		} catch (error) {
			console.error(error);
			toast.error('Não foi possível atualizar o dia de vencimento.');
		} finally {
			setIsUpdatingDueDay(false);
		}
	};

	const handlePaidMonth = () => {
		if (!monthlyGroups || monthlyGroups.length === 0 || !selectedGroup) {
			router.reload({ only: ['monthlyGroups'], preserveState: true });
			return;
		}

		const currentIndex = monthlyGroups.findIndex(
			(group) => group.month_key === selectedGroup.month_key,
		);

		const previousIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
		const nextGroup = monthlyGroups[previousIndex] || selectedGroup;

		setSelectedMonthKey(nextGroup.month_key);
		router.reload({ only: ['monthlyGroups'], preserveState: true });
	};

	const selectedGroup =
		monthlyGroups && monthlyGroups.length > 0
			? monthlyGroups.find((g) => g.month_key === selectedMonthKey) || monthlyGroups[0]
			: null;

	const logicalCurrentKey = getClosestMonthKey(monthlyGroups, currentMonthKey);

	return (
		<AuthenticatedLayout>
			<Head title="Faturas" />

			<div className="w-full max-w-[1600px] mx-auto space-y-5 sm:space-y-6 lg:space-y-7">
				<header className="pt-1 sm:pt-2 space-y-3 sm:space-y-4">
					<div>
						<h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1 dark:text-gray-100">
							Faturas
						</h1>
						<p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
							Visualize suas despesas agrupadas por mês.
						</p>
					</div>

					<div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
						<FaturaFilters
							bankAccounts={bankAccounts}
							categories={categories}
							filters={filters}
							onChange={handleFiltersChange}
						/>
						<div className="flex justify-start md:justify-end">
							<FaturaPendingExportButton monthlyGroups={monthlyGroups} />
						</div>
					</div>

						{selectedAccount && (
							<div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-gray-600 dark:text-gray-300">
							<span>
								Dia de vencimento:{' '}
								{selectedAccount.due_day
									? `todo dia ${selectedAccount.due_day}`
									: 'ainda não definido'}
							</span>
							<SecondaryButton
								type="button"
								onClick={handleOpenDueDayModal}
								className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-600 border border-rose-500 hover:bg-rose-50 dark:border-rose-500/70 dark:text-rose-300 dark:hover:bg-rose-900/20"
							>
								Definir dia de vencimento
							</SecondaryButton>
						</div>
					)}
				</header>

				<div className="space-y-4 sm:space-y-5 pb-6 sm:pb-8">
					{(!monthlyGroups || monthlyGroups.length === 0) && (
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Nenhuma fatura encontrada para o filtro atual.
						</p>
					)}

					{monthlyGroups && monthlyGroups.length > 0 && (
						<>
							<FaturaMonthCarousel
									months={monthlyGroups}
									selectedMonthKey={selectedGroup?.month_key}
									onChangeMonth={handleChangeMonth}
									{...selectedGroup}
							/>

							{selectedGroup && (
								<FaturaMonthSection
										key={selectedGroup.month_key}
										{...selectedGroup}
										month_key={selectedGroup.month_key}
										bankUserId={selectedBankId || null}
										due_day={selectedAccount?.due_day ?? null}
										onPaid={handlePaidMonth}
											isCurrentPending={
												logicalCurrentKey &&
												selectedGroup.month_key === logicalCurrentKey &&
												!selectedGroup.is_paid
											}
								/>
							)}
						</>
					)}
				</div>

				<Modal
					isOpen={isDueDayModalOpen}
					onClose={() => !isUpdatingDueDay && setIsDueDayModalOpen(false)}
					maxWidth="sm"
					title="Definir dia de vencimento"
				>
					<form className="space-y-4" onSubmit={handleSubmitDueDay} noValidate>
						<div className="flex flex-col gap-1">
							<label className="text-xs font-medium text-gray-700 dark:text-gray-200">
								Dia de vencimento do cartão (1 a 31)
							</label>
							<input
								type="number"
								min={1}
								max={31}
								inputMode="numeric"
								onKeyDown={handleIntegerKeyDown}
								value={dueDayInput}
								onChange={(e) => setDueDayInput(e.target.value)}
								className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm shadow-sm dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
							/>
						</div>

						<div className="flex items-center justify-end gap-3 pt-2 text-xs">
							<SecondaryButton
								type="button"
								onClick={() => !isUpdatingDueDay && setIsDueDayModalOpen(false)}
								className="rounded-lg px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
							>
								Cancelar
							</SecondaryButton>
							<PrimaryButton
								type="submit"
								disabled={isUpdatingDueDay}
								className="rounded-lg px-4 py-2 font-semibold uppercase tracking-wide disabled:cursor-not-allowed"
							>
								{isUpdatingDueDay ? 'Salvando...' : 'Salvar dia'}
							</PrimaryButton>
						</div>
					</form>
				</Modal>
			</div>
		</AuthenticatedLayout>
	);
}
