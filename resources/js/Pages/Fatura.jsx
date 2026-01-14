import React, { useEffect, useMemo, useState } from 'react';
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
import FaturaFiltersBar from '@/Components/system/fatura/FaturaFiltersBar';


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

function useNumericInput(initialValue = '', min, max) {
	const [value, setValue] = useState(initialValue);

	const handleChange = (event) => {
		let input = event.target.value ?? '';

		input = input.replace(/[^0-9]/g, '');

		if (typeof max === 'number') {
			const maxLength = String(max).length;
			if (input.length > maxLength) {
				input = input.slice(0, maxLength);
			}
		}

		setValue(input);
	};

	const validate = () => {
		if (value === '') return false;
		const numeric = parseInt(value, 10);
		if (Number.isNaN(numeric)) return false;
		if (typeof min === 'number' && numeric < min) return false;
		if (typeof max === 'number' && numeric > max) return false;
		return true;
	};

	return {
		value,
		setValue,
		handleChange,
		isValid: validate(),
		numericValue: value === '' ? null : parseInt(value, 10),
	};
}

export default function Fatura({ monthlyGroups = [], bankAccounts = [], categories = [], filters = {}, currentMonthKey = null }) {
	const normalizedMonthlyGroups = useMemo(() => {
		if (!Array.isArray(monthlyGroups)) return [];

		const byKey = new Map();

		for (const group of monthlyGroups) {
			if (!group || !group.month_key || typeof group.month_key !== 'string') continue;
			if (!byKey.has(group.month_key)) {
				byKey.set(group.month_key, group);
			}
		}

		const result = Array.from(byKey.values());
		result.sort((a, b) => monthKeyToIndex(a.month_key) - monthKeyToIndex(b.month_key));
		return result;
	}, [monthlyGroups]);

	const selectedBankId = filters?.bank_user_id ?? '';
	const [selectedMonthKey, setSelectedMonthKey] = useState(() =>
		getClosestMonthKey(normalizedMonthlyGroups, currentMonthKey),
	);
	const [isDueDayModalOpen, setIsDueDayModalOpen] = useState(false);
	const dueDayField = useNumericInput('', 1, 31);
	const [isUpdatingDueDay, setIsUpdatingDueDay] = useState(false);

	useEffect(() => {
		if (!normalizedMonthlyGroups || normalizedMonthlyGroups.length === 0) {
			setSelectedMonthKey(null);
			return;
		}

		const exists = normalizedMonthlyGroups.some((g) => g.month_key === selectedMonthKey);
		if (!exists) {
			const closest = getClosestMonthKey(normalizedMonthlyGroups, currentMonthKey);
			setSelectedMonthKey(closest);
		}
	}, [normalizedMonthlyGroups, selectedMonthKey, currentMonthKey]);

	const handleFiltersChange = (nextFilters) => {
		router.get(route('transacoes.index'), nextFilters, {
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
		dueDayField.setValue(selectedAccount.due_day ? String(selectedAccount.due_day) : '');
		setIsDueDayModalOpen(true);
	};

	const handleSubmitDueDay = async (event) => {
		event.preventDefault();
		if (!selectedAccount || isUpdatingDueDay) return;

		if (!dueDayField.isValid) {
			toast.error('Informe um dia de vencimento entre 1 e 31.');
			return;
		}

		const parsed = dueDayField.numericValue;

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
		if (!normalizedMonthlyGroups || normalizedMonthlyGroups.length === 0 || !selectedGroup) {
			router.reload({ only: ['monthlyGroups'], preserveState: true });
			return;
		}

		const currentIndex = normalizedMonthlyGroups.findIndex(
			(group) => group.month_key === selectedGroup.month_key,
		);

		const previousIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
		const nextGroup = normalizedMonthlyGroups[previousIndex] || selectedGroup;

		setSelectedMonthKey(nextGroup.month_key);
		router.reload({ only: ['monthlyGroups'], preserveState: true });
	};

	const selectedGroup =
		normalizedMonthlyGroups && normalizedMonthlyGroups.length > 0
			? normalizedMonthlyGroups.find((g) => g.month_key === selectedMonthKey) || normalizedMonthlyGroups[0]
			: null;

	const logicalCurrentKey = getClosestMonthKey(normalizedMonthlyGroups, currentMonthKey);

	return (
		<AuthenticatedLayout>
			<Head title="Faturas" />

			<div className="w-full max-w-[1500px] 2xl:max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-6 space-y-4 sm:space-y-5 lg:space-y-6 2xl:space-y-6">
				<header className="pt-1 sm:pt-2 space-y-3 sm:space-y-4">
					<div>
						<h1 className="text-xl sm:text-2xl lg:text-3xl 2xl:text-3xl font-semibold text-gray-900 mb-1 dark:text-gray-100">
							Faturas
						</h1>
						<p className="text-xs sm:text-sm lg:text-base 2xl:text-base text-gray-600 dark:text-gray-300">
							Visualize suas despesas agrupadas por mês.
						</p>
					</div>

					<div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
						<FaturaFiltersBar
							bankAccounts={bankAccounts}
							categories={categories}
							filters={filters}
							months={normalizedMonthlyGroups}
							monthValue={selectedGroup?.month_key || selectedMonthKey}
							onFiltersChange={handleFiltersChange}
							onMonthChange={handleChangeMonth}
						/>
						<div className="flex justify-start md:justify-end">
							<FaturaPendingExportButton monthlyGroups={monthlyGroups} />
						</div>
					</div>

						{selectedAccount && (
							<div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm 2xl:text-sm text-gray-600 dark:text-gray-300">
							<span>
								Dia de vencimento:{' '}
								{selectedAccount.due_day
									? `todo dia ${selectedAccount.due_day}`
									: 'ainda não definido'}
							</span>
							<SecondaryButton
								type="button"
								onClick={handleOpenDueDayModal}
								className="rounded-full px-4 py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-rose-600 border border-rose-500 hover:bg-rose-50 dark:border-rose-500/70 dark:text-rose-300 dark:hover:bg-rose-900/20"
							>
								Definir dia de vencimento
							</SecondaryButton>
						</div>
						)}
					</header>

					<div className="space-y-3 sm:space-y-4 lg:space-y-5 2xl:space-y-5 pb-4 sm:pb-6 2xl:pb-6">
						{(!normalizedMonthlyGroups || normalizedMonthlyGroups.length === 0) && (
							<p className="text-xs sm:text-sm lg:text-base 2xl:text-base text-gray-500 dark:text-gray-400">
							Nenhuma fatura encontrada para o filtro atual.
						</p>
					)}

						{normalizedMonthlyGroups && normalizedMonthlyGroups.length > 0 && (
						<>
							<FaturaMonthCarousel
									months={normalizedMonthlyGroups}
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
								value={dueDayField.value}
								onChange={dueDayField.handleChange}
								className="w-full rounded-md border border-gray-300 bg-white p-2 text-xs sm:text-sm shadow-sm dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
							/>
						</div>

						<div className="flex items-center justify-end gap-3 pt-2 text-xs sm:text-xs">
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
