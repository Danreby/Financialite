import React, { useEffect, useState } from "react";
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
import TransactionFilters from "@/Components/system/transactions/TransactionFilters";

export default function Transacao({ transactions, bankAccounts = [], categories = [], months = [], filters = {} }) {
	const initialTransactions = Array.isArray(transactions?.data)
		? transactions.data
		: Array.isArray(transactions)
			? transactions
			: [];

	const [selectedBankId, setSelectedBankId] = useState(String(filters?.bank_user_id ?? ""));
	const [selectedCategoryId, setSelectedCategoryId] = useState(String(filters?.category_id ?? ""));
	const [selectedType, setSelectedType] = useState(String(filters?.type ?? ""));
	const [selectedStatus, setSelectedStatus] = useState(String(filters?.status ?? ""));
	const [recurringFilter, setRecurringFilter] = useState(String(filters?.recurring ?? ""));
	const [searchTerm, setSearchTerm] = useState(String(filters?.search ?? ""));
	const [selectedMonthKey, setSelectedMonthKey] = useState(String(filters?.month_key ?? ""));
	const [selectedOrder, setSelectedOrder] = useState(String(filters?.order ?? "created_desc"));

	const orderOptions = [
		{ key: "created", label: "Data" },
		{ key: "title", label: "A-Z" },
		{ key: "amount", label: "Valor" },
	];
	const [editingTransaction, setEditingTransaction] = useState(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
	const [transactionToDelete, setTransactionToDelete] = useState(null);
	const [isDeletingId, setIsDeletingId] = useState(null);

	useEffect(() => {
		const timeout = setTimeout(() => {
			router.get(route('transactions.index'), {
				bank_user_id: selectedBankId || undefined,
				category_id: selectedCategoryId || undefined,
				type: selectedType || undefined,
				status: selectedStatus || undefined,
				recurring: recurringFilter || undefined,
				search: searchTerm || undefined,
				month_key: selectedMonthKey || undefined,
				order: selectedOrder || undefined,
			}, {
				preserveState: true,
				preserveScroll: true,
				replace: true,
			});
		}, 300);

		return () => clearTimeout(timeout);
	}, [selectedBankId, selectedCategoryId, selectedType, selectedStatus, recurringFilter, searchTerm, selectedMonthKey, selectedOrder]);

	const handleEdit = (tx) => {
		setEditingTransaction(tx);
		setIsEditModalOpen(true);
	};

	const handleUpdated = () => {
		router.get(route('transactions.index'), {
			bank_user_id: selectedBankId || undefined,
			category_id: selectedCategoryId || undefined,
			type: selectedType || undefined,
			status: selectedStatus || undefined,
			recurring: recurringFilter || undefined,
			search: searchTerm || undefined,
			month_key: selectedMonthKey || undefined,
			order: selectedOrder || undefined,
		}, { preserveState: true, preserveScroll: true, replace: true });
	};

	const handleDelete = async (tx) => {
		if (!tx || isDeletingId) return;
		setTransactionToDelete(tx);
		setIsDeleteConfirmOpen(true);
	};

	const clearFilters = () => {
		setSelectedBankId("");
		setSelectedCategoryId("");
		setSelectedType("");
		setSelectedStatus("");
		setRecurringFilter("");
		setSearchTerm("");
		setSelectedMonthKey("");
		setSelectedOrder("created_desc");
	};

	const handleConfirmDelete = async () => {
		if (!transactionToDelete || isDeletingId) return;

		setIsDeletingId(transactionToDelete.id);
		toast.dismiss();

		try {
			await axios.delete(route("faturas.destroy", transactionToDelete.id));
			toast.success("Transação removida com sucesso.");
			router.get(route('transactions.index'), {
				bank_user_id: selectedBankId || undefined,
				category_id: selectedCategoryId || undefined,
				type: selectedType || undefined,
				status: selectedStatus || undefined,
				recurring: recurringFilter || undefined,
				search: searchTerm || undefined,
				month_key: selectedMonthKey || undefined,
				order: selectedOrder || undefined,
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
						Transações
					</h1>
					<p className="text-xs sm:text-sm lg:text-sm text-gray-600 dark:text-gray-300">
						Visualize, edite ou remova transações que ainda não foram pagas.
					</p>
				</header>

				<section className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-black/5 dark:bg-[#0b0b0b] dark:ring-black/30 sm:p-4 lg:p-4">
					<TransactionFilters
						searchTerm={searchTerm}
						onSearchChange={setSearchTerm}
						months={months}
						selectedMonthKey={selectedMonthKey}
						onMonthChange={(value) => setSelectedMonthKey(value)}
						orderOptions={orderOptions}
						selectedOrder={selectedOrder}
						onOrderChange={setSelectedOrder}
						bankAccounts={bankAccounts}
						selectedBankId={selectedBankId}
						onBankChange={setSelectedBankId}
						selectedType={selectedType}
						onTypeChange={setSelectedType}
						selectedStatus={selectedStatus}
						onStatusChange={setSelectedStatus}
						recurringFilter={recurringFilter}
						onRecurringChange={setRecurringFilter}
						categories={categories}
						selectedCategoryId={selectedCategoryId}
						onCategoryChange={setSelectedCategoryId}
						onClear={clearFilters}
					/>

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

