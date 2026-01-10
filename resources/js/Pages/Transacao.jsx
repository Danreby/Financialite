
import React, { useEffect, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import { toast } from "react-toastify";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TransactionsList from "@/Components/system/transactions/TransactionsList";
import EditTransactionModal from "@/Components/system/transactions/EditTransactionModal";
// import TransactionsExportButton from "@/Components/system/transactions/TransactionsExportButton";
import SecondaryButton from "@/Components/common/buttons/SecondaryButton";
import PrimaryButton from "@/Components/common/buttons/PrimaryButton";
import DangerButton from "@/Components/common/buttons/DangerButton";
import Modal from "@/Components/common/Modal";
import Pagination from "@/Components/common/Pagination";

export default function Transacao({ transactions, bankAccounts = [], categories = [], filters = {} }) {
	const initialTransactions = Array.isArray(transactions?.data)
		? transactions.data
		: Array.isArray(transactions)
			? transactions
			: [];

	const [selectedBankId, setSelectedBankId] = useState(String(filters?.bank_user_id ?? ""));
	const [selectedCategoryId, setSelectedCategoryId] = useState(String(filters?.category_id ?? ""));
	const [selectedType, setSelectedType] = useState(String(filters?.type ?? ""));
	const [recurringFilter, setRecurringFilter] = useState(String(filters?.recurring ?? ""));
	const [searchTerm, setSearchTerm] = useState(String(filters?.search ?? ""));
	// Server enforces 5 items per page; no client override
	const [editingTransaction, setEditingTransaction] = useState(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
	const [transactionToDelete, setTransactionToDelete] = useState(null);
	const [isDeletingId, setIsDeletingId] = useState(null);

	// Server-side filtering: react to filter changes
	useEffect(() => {
		const timeout = setTimeout(() => {
			router.get(route('transactions.index'), {
				bank_user_id: selectedBankId || undefined,
				category_id: selectedCategoryId || undefined,
				type: selectedType || undefined,
				recurring: recurringFilter || undefined,
				search: searchTerm || undefined,
			}, {
				preserveState: true,
				preserveScroll: true,
				replace: true,
			});
		}, 300);

		return () => clearTimeout(timeout);
	}, [selectedBankId, selectedCategoryId, selectedType, recurringFilter, searchTerm]);

	// No client-side filtering: rely on server-side sorted/paginated data

	const handleEdit = (tx) => {
		setEditingTransaction(tx);
		setIsEditModalOpen(true);
	};

	const handleUpdated = () => {
		// Refresh current page data to reflect changes
		router.get(route('transactions.index'), {
			bank_user_id: selectedBankId || undefined,
			category_id: selectedCategoryId || undefined,
			type: selectedType || undefined,
			recurring: recurringFilter || undefined,
			search: searchTerm || undefined,
		}, { preserveState: true, preserveScroll: true, replace: true });
	};

	const handleDelete = async (tx) => {
		if (!tx || isDeletingId) return;
		setTransactionToDelete(tx);
		setIsDeleteConfirmOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!transactionToDelete || isDeletingId) return;

		setIsDeletingId(transactionToDelete.id);
		toast.dismiss();

		try {
			await axios.delete(route("faturas.destroy", transactionToDelete.id));
			toast.success("Transação removida com sucesso.");
			// Refresh current page after deletion
			router.get(route('transactions.index'), {
				bank_user_id: selectedBankId || undefined,
				category_id: selectedCategoryId || undefined,
				type: selectedType || undefined,
				recurring: recurringFilter || undefined,
				search: searchTerm || undefined,
			}, { preserveState: true, preserveScroll: true, replace: true });
		} catch (error) {
			console.error(error);
			if (error.response?.data?.message) {
				toast.error(error.response.data.message);
			} else {
				toast.error("Erro ao remover transação.");
			}
		} finally {
			setIsDeletingId(null);
			setIsDeleteConfirmOpen(false);
			setTransactionToDelete(null);
		}
	};

	return (
		<AuthenticatedLayout>
			<Head title="Transações" />

			<div className="w-full max-w-[1450px] 2xl:max-w-[1500px] mx-auto px-3 py-2 space-y-3 sm:px-4 sm:py-3 lg:px-5 lg:py-4">
				<header className="space-y-1 pt-1 sm:pt-1.5">
					<h1 className="text-xl sm:text-2xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100">
						Transações pendentes
					</h1>
					<p className="text-xs sm:text-sm lg:text-sm text-gray-600 dark:text-gray-300">
						Visualize, edite ou remova transações que ainda não foram pagas.
					</p>
				</header>

				<section className="rounded-2xl bg-white p-3 shadow-md ring-1 ring-black/5 dark:bg-[#0b0b0b] dark:ring-black/30 sm:p-3 lg:p-3">
					<div className="mb-3 flex flex-col gap-2 text-xs sm:flex-wrap sm:flex-row sm:items-center sm:justify-between">
						<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2 sm:w-auto w-full">
							<input
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100 sm:w-52"
								placeholder="Título da transação"
							/>
						</div>

						<div className="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
							<select
								value={selectedBankId}
								onChange={(e) => setSelectedBankId(e.target.value)}
								className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100 sm:min-w-[190px]"
							>
								<option value="">Todos</option>
								{bankAccounts.map((account) => (
									<option key={account.id} value={account.id}>
										{account.name}
									</option>
								))}
							</select>
						</div>

						<div className="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
							<select
								value={selectedType}
								onChange={(e) => setSelectedType(e.target.value)}
								className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100 sm:min-w-[170px]"
							>
								<option value="">Débito e crédito</option>
								<option value="debit">Apenas débito</option>
								<option value="credit">Apenas crédito</option>
							</select>
						</div>

						<div className="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
							<select
								value={recurringFilter}
								onChange={(e) => setRecurringFilter(e.target.value)}
								className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100 sm:min-w-[170px]"
							>
								<option value="">Todas</option>
								<option value="recurring">Somente recorrentes</option>
								<option value="non_recurring">Somente não recorrentes</option>
							</select>
						</div>

						<div className="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
							<select
								value={selectedCategoryId}
								onChange={(e) => setSelectedCategoryId(e.target.value)}
								className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100 sm:min-w-[190px]"
							>
								<option value="">Todas</option>
								{categories.map((category) => (
									<option key={category.id} value={category.id}>
										{category.name}
									</option>
								))}
							</select>
						</div>

						<SecondaryButton
							type="button"
							onClick={() => {
								setSelectedBankId("");
								setSelectedCategoryId("");
								setSelectedType("");
								setRecurringFilter("");
								setSearchTerm("");
							}}
							className="w-full justify-center rounded-full px-4 py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 sm:w-auto"
						>
							Limpar filtros
						</SecondaryButton>
					</div>

					<TransactionsList
						transactions={initialTransactions}
						onEdit={handleEdit}
						onDelete={handleDelete}
					/>

					<Pagination links={transactions?.links || []} />
				</section>
			</div>

			<EditTransactionModal
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				transaction={editingTransaction}
				bankAccounts={bankAccounts}
				categories={categories}
				onUpdated={handleUpdated}
			/>

			<Modal
				isOpen={isDeleteConfirmOpen}
				onClose={() => {
					if (isDeletingId) return;
					setIsDeleteConfirmOpen(false);
					setTransactionToDelete(null);
				}}
				title="Remover transação"
				maxWidth="sm"
			>
				<p className="text-sm text-gray-600 dark:text-gray-300">
					Tem certeza que deseja remover a transação
					{" "}
					<span className="font-semibold">
						{transactionToDelete?.title ?? "selecionada"}
					</span>
					?
				</p>
				<p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
					Essa ação é permanente e não poderá ser desfeita.
				</p>

				<div className="mt-5 flex items-center justify-end gap-3">
					<SecondaryButton
						type="button"
						onClick={() => {
							if (isDeletingId) return;
							setIsDeleteConfirmOpen(false);
							setTransactionToDelete(null);
						}}
						className="rounded-lg px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
					>
						Cancelar
					</SecondaryButton>
					<DangerButton
						type="button"
						onClick={handleConfirmDelete}
						disabled={Boolean(isDeletingId)}
						className="rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wide"
					>
						{isDeletingId ? "Removendo..." : "Remover"}
					</DangerButton>
				</div>
			</Modal>
		</AuthenticatedLayout>
	);
}

