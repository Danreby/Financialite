import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Head } from '@inertiajs/react';
import { toast } from 'react-toastify';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/common/Modal';
import PrimaryButton from '@/Components/common/buttons/PrimaryButton';
import SecondaryButton from '@/Components/common/buttons/SecondaryButton';
import DangerButton from '@/Components/common/buttons/DangerButton';
import ScrollArea from '@/Components/common/ScrollArea';

function formatDueDay(dueDay) {
	if (!dueDay) return 'Não definido';
	return `Todo dia ${dueDay}`;
}

export default function Conta({ bankAccounts = [], categories = [] }) {
	const [localBankAccounts, setLocalBankAccounts] = useState(bankAccounts);
	const [localCategories, setLocalCategories] = useState(categories);
	const [saving, setSaving] = useState(false);
	const [isEditBankModalOpen, setIsEditBankModalOpen] = useState(false);
	const [bankBeingEdited, setBankBeingEdited] = useState(null);
	const [bankDueDayInput, setBankDueDayInput] = useState('');
	const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
	const [categoryBeingEdited, setCategoryBeingEdited] = useState(null);
	const [categoryNameInput, setCategoryNameInput] = useState('');
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
	const [confirmTarget, setConfirmTarget] = useState({ type: null, id: null, name: '' });

	useEffect(() => {
		setLocalBankAccounts(bankAccounts);
	}, [bankAccounts]);

	useEffect(() => {
		setLocalCategories(categories);
	}, [categories]);

	const openEditBankModal = (account) => {
		setBankBeingEdited(account);
		setBankDueDayInput(account.due_day ? String(account.due_day) : '');
		setIsEditBankModalOpen(true);
	};

	const handleSubmitEditBank = async (event) => {
		event.preventDefault();
		if (!bankBeingEdited || saving) return;

		const value = bankDueDayInput.trim();
		const parsed = parseInt(value, 10);
		if (Number.isNaN(parsed) || parsed < 1 || parsed > 31) {
			toast.error('Informe um dia de vencimento entre 1 e 31.');
			return;
		}

		setSaving(true);
		try {
			await axios.patch(route('banks.update-due-day', bankBeingEdited.id), { due_day: parsed });
			setLocalBankAccounts((prev) =>
				prev.map((acc) => (acc.id === bankBeingEdited.id ? { ...acc, due_day: parsed } : acc)),
			);
			toast.success('Dia de vencimento atualizado.');
			setIsEditBankModalOpen(false);
			setBankBeingEdited(null);
		} catch (error) {
			console.error(error);
			toast.error('Não foi possível atualizar o dia de vencimento.');
		} finally {
			setSaving(false);
		}
	};

	const openEditCategoryModal = (category) => {
		setCategoryBeingEdited(category);
		setCategoryNameInput(category.name || '');
		setIsEditCategoryModalOpen(true);
	};

	const handleSubmitEditCategory = async (event) => {
		event.preventDefault();
		if (!categoryBeingEdited || saving) return;

		const name = categoryNameInput.trim();
		if (!name) {
			toast.error('O nome da categoria não pode ser vazio.');
			return;
		}

		setSaving(true);
		try {
			const response = await axios.put(route('categories.update', categoryBeingEdited.id), { name });
			const updated = response.data;
			setLocalCategories((prev) =>
				prev.map((cat) => (cat.id === categoryBeingEdited.id ? { ...cat, name: updated.name } : cat)),
			);
			toast.success('Categoria atualizada.');
			setIsEditCategoryModalOpen(false);
			setCategoryBeingEdited(null);
		} catch (error) {
			console.error(error);
			toast.error('Não foi possível atualizar a categoria.');
		} finally {
			setSaving(false);
		}
	};

	const openConfirmDelete = (type, payload) => {
		if (type === 'bank') {
			setConfirmTarget({ type: 'bank', id: payload.bankId, name: payload.name });
		} else if (type === 'category') {
			setConfirmTarget({ type: 'category', id: payload.categoryId, name: payload.name });
		}
		setIsConfirmModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!confirmTarget.type || !confirmTarget.id) {
			setIsConfirmModalOpen(false);
			return;
		}

		setSaving(true);
		try {
			if (confirmTarget.type === 'bank') {
				await axios.delete(route('banks.destroy', confirmTarget.id));
				setLocalBankAccounts((prev) => prev.filter((acc) => acc.bank_id !== confirmTarget.id));
				toast.success('Conta removida com sucesso.');
			}

			if (confirmTarget.type === 'category') {
				await axios.delete(route('categories.destroy', confirmTarget.id));
				setLocalCategories((prev) => prev.filter((cat) => cat.id !== confirmTarget.id));
				toast.success('Categoria removida.');
			}
		} catch (error) {
			console.error(error);
			if (confirmTarget.type === 'bank') {
				toast.error('Não foi possível remover a conta.');
			} else {
				toast.error('Não foi possível remover a categoria.');
			}
		} finally {
			setSaving(false);
			setIsConfirmModalOpen(false);
			setConfirmTarget({ type: null, id: null, name: '' });
		}
	};

	return (
		<AuthenticatedLayout>
			<Head title="Contas" />

			<div className="w-full max-w-[1600px] mx-auto px-3 py-4 space-y-6 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
				<header className="space-y-1">
					<h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 sm:text-2xl">Minhas contas</h1>
					<p className="text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
						Gerencie as contas bancárias vinculadas e as categorias usadas nas suas transações.
					</p>
				</header>

				<section className="rounded-2xl bg-white p-3 shadow-md ring-1 ring-black/5 dark:bg-[#0b0b0b] dark:ring-black/30 sm:p-4">
					<div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
						<h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
							Contas / bancos vinculados
						</h2>
						{saving && (
							<span className="text-xs text-gray-500 dark:text-gray-400">Salvando...</span>
						)}
					</div>

					{localBankAccounts && localBankAccounts.length > 0 ? (
						<ScrollArea className="space-y-2">
							{localBankAccounts.map((account) => (
								<div
									key={account.id}
									className="flex flex-col gap-3 rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm dark:border-gray-800 dark:bg-black sm:flex-row sm:items-center sm:justify-between sm:py-2.5"
								>
									<div>
										<div className="font-medium text-gray-900 dark:text-gray-100">{account.name}</div>
										<div className="text-xs text-gray-500 dark:text-gray-400">
											{formatDueDay(account.due_day)}
										</div>
									</div>
									<div className="flex flex-wrap items-center justify-end gap-2 text-xs sm:flex-nowrap">
										<SecondaryButton
											type="button"
											onClick={() => openEditBankModal(account)}
											className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600 border border-rose-500 hover:bg-rose-50 dark:border-rose-500/70 dark:text-rose-300 dark:hover:bg-rose-900/20"
										>
											Alterar vencimento
										</SecondaryButton>
										<DangerButton
											type="button"
											onClick={() => openConfirmDelete('bank', { bankId: account.bank_id, name: account.name })}
											className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
										>
											Remover
										</DangerButton>
									</div>
								</div>
							))}
						</ScrollArea>
					) : (
						<p className="text-xs text-gray-500 dark:text-gray-400">
							Nenhuma conta vinculada. Use o Dashboard ou as ações rápidas para adicionar um banco.
						</p>
					)}
				</section>

				<section className="rounded-2xl bg-white p-3 shadow-md ring-1 ring-black/5 dark:bg-[#0b0b0b] dark:ring-black/30 sm:p-4">
					<div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
						<h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
							Categorias
						</h2>
						{saving && (
							<span className="text-xs text-gray-500 dark:text-gray-400">Salvando...</span>
						)}
					</div>

					{localCategories && localCategories.length > 0 ? (
						<ScrollArea>
							<ul className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
								{localCategories.map((category) => (
									<li
										key={category.id}
										className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between"
									>
										<span className="text-gray-900 dark:text-gray-100">{category.name}</span>
										<div className="flex flex-wrap items-center justify-end gap-2 text-xs sm:flex-nowrap">
											<SecondaryButton
												type="button"
												onClick={() => openEditCategoryModal(category)}
												className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600 border border-rose-500 hover:bg-rose-50 dark:border-rose-500/70 dark:text-rose-300 dark:hover:bg-rose-900/20"
											>
												Renomear
											</SecondaryButton>
											<DangerButton
												type="button"
												onClick={() => openConfirmDelete('category', { categoryId: category.id, name: category.name })}
												className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
											>
												Remover
											</DangerButton>
										</div>
									</li>
								))}
							</ul>
						</ScrollArea>
					) : (
						<p className="text-xs text-gray-500 dark:text-gray-400">
							Nenhuma categoria cadastrada. Use as ações rápidas para criar novas categorias.
						</p>
					)}
				</section>
			</div>

			<Modal
				isOpen={isEditBankModalOpen}
				onClose={() => {
					if (saving) return;
					setIsEditBankModalOpen(false);
					setBankBeingEdited(null);
				}}
				maxWidth="sm"
				title="Editar vencimento da conta"
			>
				<form className="space-y-4" onSubmit={handleSubmitEditBank} noValidate>
					<p className="text-sm text-gray-600 dark:text-gray-300">
						Conta:{' '}
						<span className="font-medium text-gray-900 dark:text-gray-100">
							{bankBeingEdited?.name || ''}
						</span>
					</p>
					<div className="flex flex-col gap-1">
						<label className="text-sm font-medium text-gray-700 dark:text-gray-200">
							Dia de vencimento (1 a 31)
						</label>
						<input
							type="number"
							min={1}
							max={31}
							value={bankDueDayInput}
							onChange={(e) => setBankDueDayInput(e.target.value)}
							className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm shadow-sm dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
							placeholder="Ex: 10"
						/>
					</div>

					<div className="flex items-center justify-end gap-3 pt-2">
						<SecondaryButton
							type="button"
							onClick={() => {
								if (saving) return;
								setIsEditBankModalOpen(false);
								setBankBeingEdited(null);
							}}
							className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
						>
							Cancelar
						</SecondaryButton>
						<PrimaryButton type="submit" disabled={saving}>
							{saving ? 'Salvando...' : 'Salvar'}
						</PrimaryButton>
					</div>
				</form>
			</Modal>

			<Modal
				isOpen={isEditCategoryModalOpen}
				onClose={() => {
					if (saving) return;
					setIsEditCategoryModalOpen(false);
					setCategoryBeingEdited(null);
				}}
				maxWidth="sm"
				title="Editar categoria"
			>
				<form className="space-y-4" onSubmit={handleSubmitEditCategory} noValidate>
					<div className="flex flex-col gap-1">
						<label className="text-sm font-medium text-gray-700 dark:text-gray-200">
							Nome da categoria
						</label>
						<input
							type="text"
							value={categoryNameInput}
							onChange={(e) => setCategoryNameInput(e.target.value)}
							className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100"
							placeholder="Ex: Mercado, Lazer, Shopping"
						/>
					</div>

					<div className="flex items-center justify-end gap-3 pt-2">
						<SecondaryButton
							type="button"
							onClick={() => {
								if (saving) return;
								setIsEditCategoryModalOpen(false);
								setCategoryBeingEdited(null);
						}}
							className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
						>
							Cancelar
						</SecondaryButton>
						<PrimaryButton type="submit" disabled={saving}>
							{saving ? 'Salvando...' : 'Salvar'}
						</PrimaryButton>
					</div>
				</form>
			</Modal>
,
			<Modal
				isOpen={isConfirmModalOpen}
				onClose={() => {
					if (saving) return;
					setIsConfirmModalOpen(false);
					setConfirmTarget({ type: null, id: null, name: '' });
				}}
				maxWidth="sm"
				title="Confirmar exclusão"
			>
				<div className="space-y-4">
					<p className="text-sm text-gray-600 dark:text-gray-300">
						Tem certeza de que deseja remover{' '}
						<span className="font-semibold text-gray-900 dark:text-gray-100">
							{confirmTarget.name}
						</span>
						?
					</p>
					<p className="text-xs text-gray-500 dark:text-gray-400">
						Essa ação não poderá ser desfeita.
					</p>
					<div className="flex items-center justify-end gap-3 pt-2">
						<SecondaryButton
							type="button"
							onClick={() => {
								if (saving) return;
								setIsConfirmModalOpen(false);
								setConfirmTarget({ type: null, id: null, name: '' });
						}}
							className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
						>
							Cancelar
						</SecondaryButton>
						<DangerButton type="button" onClick={handleConfirmDelete} disabled={saving}>
							{saving ? 'Removendo...' : 'Remover'}
						</DangerButton>
					</div>
				</div>
			</Modal>
		</AuthenticatedLayout>
	);
}

