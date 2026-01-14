import React, { useEffect, useMemo, useState } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { toast } from "react-toastify";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TransactionsExportButton from "@/Components/system/transactions/TransactionsExportButton";
import StatCard from "@/Components/system/dashboard/StatCard";
import ReportsMonthlySummary from "@/Components/system/reports/ReportsMonthlySummary";
import ReportsPeriodSelector from "@/Components/system/reports/ReportsPeriodSelector";
import ReportsPeriodModal from "@/Components/system/reports/ReportsPeriodModal";
import ReportsInsightsBar from "@/Components/system/reports/ReportsInsightsBar";
import FaturaDetailModal from "@/Components/system/fatura/FaturaDetailModal";
import { formatCurrencyBRL } from "@/Lib/formatters";

export default function Relatorio({ bankAccounts = [], categories = [] }) {
	const [selectedBankId, setSelectedBankId] = useState("");
	const [selectedCategoryId, setSelectedCategoryId] = useState("");
	const [stats, setStats] = useState({
		total_income: 0,
		total_expenses: 0,
		pending_income: 0,
		pending_expenses: 0,
		current_month_debit_total: 0,
		overdue_count: 0,
	});
	const [monthlySummary, setMonthlySummary] = useState([]);
	const [periodGroups, setPeriodGroups] = useState([]);
	const [selectedPeriodKey, setSelectedPeriodKey] = useState("");
	const [selectedTransaction, setSelectedTransaction] = useState(null);
	const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		let isMounted = true;
		const load = async () => {
			setIsLoading(true);
			try {
				const [statsResponse, exportResponse] = await Promise.all([
					axios.get(route("transacoes.stats"), {
						params: {
							bank_user_id: selectedBankId || undefined,
							category_id: selectedCategoryId || undefined,
						},
					}),
					axios.get(route("transacoes.export_data"), {
						params: {
							bank_user_id: selectedBankId || undefined,
							category_id: selectedCategoryId || undefined,
						},
					}),
				]);

				if (!isMounted) return;

				const payload = statsResponse.data || {};
				setStats({
					total_income: Number(payload.total_income || 0),
					total_expenses: Number(payload.total_expenses || 0),
					pending_income: Number(payload.pending_income || 0),
					pending_expenses: Number(payload.pending_expenses || 0),
					current_month_debit_total: Number(payload.current_month_debit_total || 0),
					overdue_count: Number(payload.overdue_count || 0),
				});

				const normalizeTransaction = (item) => {
					const periodKey = item.invoice_month || item.year_month || "sem-data";
					const periodLabel = item.invoice_month_label || item.month_label || "Sem data";

					return {
						...item,
						period_key: periodKey,
						period_label: periodLabel,
						bank_name: item.bank_user?.bank?.name || "Sem banco",
						category_name: item.category?.name || "Sem categoria",
						display_installment: item.display_installment || item.current_installment,
						installment_amount: Number(item.installment_amount ?? item.amount ?? 0),
						amount: Number(item.amount || 0),
					};
				};

				const raw = Array.isArray(exportResponse.data) ? exportResponse.data : [];
				const normalized = raw.map(normalizeTransaction);

				const grouped = normalized.reduce((acc, item) => {
					const key = item.period_key;
					if (!acc[key]) {
						acc[key] = {
							key,
							label: item.period_label,
							total_amount: 0,
							total_credit: 0,
							total_debit: 0,
							count: 0,
							transactions: [],
						};
					}

					const debitAmount = item.type === "debit" ? item.amount || 0 : 0;
					const creditInstallment = item.type === "credit" ? item.installment_amount || 0 : 0;

					acc[key].total_debit += debitAmount;
					acc[key].total_credit += creditInstallment;
					acc[key].total_amount = acc[key].total_credit + acc[key].total_debit;
					acc[key].count += 1;
					acc[key].transactions.push(item);
					return acc;
				}, {});

				const sortedGroups = Object.values(grouped).sort((a, b) => (a.key || "").localeCompare(b.key || ""));

				setPeriodGroups(sortedGroups);
				setMonthlySummary(
					sortedGroups.map((group) => ({
						year_month: group.key,
						month_label: group.label,
						total_amount: group.total_amount,
						total_credit: group.total_credit,
						total_debit: group.total_debit,
						count: group.count,
					}))
				);

				const fallbackKey = sortedGroups[sortedGroups.length - 1]?.key || "";
				setSelectedPeriodKey((prev) => (sortedGroups.some((group) => group.key === prev) ? prev : fallbackKey));
			} catch (error) {
				console.error(error);
				if (error.response?.data?.message) {
					toast.error(error.response.data.message);
				} else {
					toast.error("Não foi possível carregar os dados do relatório.");
				}
			} finally {
				if (isMounted) setIsLoading(false);
			}
		};

		load();

		return () => {
			isMounted = false;
		};
	}, [selectedBankId, selectedCategoryId]);

	const selectedPeriod = useMemo(
		() => periodGroups.find((group) => group.key === selectedPeriodKey) || null,
		[periodGroups, selectedPeriodKey],
	);

	const insights = useMemo(() => {
		const totalAmount = periodGroups.reduce((sum, group) => sum + (group.total_amount || 0), 0);
		const totalCount = periodGroups.reduce(
			(sum, group) => sum + (Array.isArray(group.transactions) ? group.transactions.length : 0),
			0,
		);
		const averageTicket = totalCount > 0 ? totalAmount / totalCount : 0;
		const topExpense = [...periodGroups].sort((a, b) => (b.total_amount || 0) - (a.total_amount || 0))[0];

		return {
			netBalance: (stats.total_income || 0) - (stats.total_expenses || 0),
			averageTicket,
			topExpenseLabel: topExpense?.label || "",
			topExpenseValue: topExpense?.total_amount || 0,
		};
	}, [periodGroups, stats.total_expenses, stats.total_income]);

	const handleOpenPeriodModal = (key) => {
		const resolved = key || selectedPeriodKey || periodGroups[periodGroups.length - 1]?.key || "";
		if (!resolved) return;
		setSelectedPeriodKey(resolved);
		setIsPeriodModalOpen(true);
	};

	const handleClosePeriodModal = () => {
		setIsPeriodModalOpen(false);
	};

	const handleSelectTransaction = (transaction) => {
		setSelectedTransaction(transaction);
	};

	return (
		<AuthenticatedLayout>
			<Head title="Relatórios" />

			<div className="w-full max-w-[1450px] 2xl:max-w-[1500px] mx-auto px-3 py-3 space-y-4 sm:px-4 sm:py-4 lg:px-6 lg:py-5">
				<header className="space-y-1.5 pt-0.5 sm:pt-1">
					<h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-gray-100">
						Relatórios
					</h1>
					<p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300 max-w-3xl">
						Acompanhe todas as suas transações em faturas, veja um resumo financeiro por período,
						filtre por conta e categoria e exporte um arquivo Excel completo.
					</p>
				</header>

				<section className="rounded-2xl bg-white p-3 shadow-md ring-1 ring-black/5 dark:bg-[#0b0b0b] dark:ring-black/30 sm:p-3 lg:p-4 space-y-3">
					<div className="flex flex-col gap-2 text-xs sm:text-sm sm:flex-row sm:items-center sm:justify-between">
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
							<div className="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
								<select
									value={selectedBankId}
									onChange={(e) => setSelectedBankId(e.target.value)}
									className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100 sm:min-w-[200px]"
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
									value={selectedCategoryId}
									onChange={(e) => setSelectedCategoryId(e.target.value)}
									className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100 sm:min-w-[200px]"
								>
									<option value="">Todas</option>
									{categories.map((category) => (
										<option key={category.id} value={category.id}>
											{category.name}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="flex justify-end w-full sm:w-auto">
							<TransactionsExportButton
								filters={{
									bank_user_id: selectedBankId || undefined,
									category_id: selectedCategoryId || undefined,
								}}
							/>
						</div>
					</div>
				</section>

				<section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
					<ReportsPeriodSelector
						periods={periodGroups}
						selectedKey={selectedPeriodKey}
						onChange={setSelectedPeriodKey}
						onOpen={handleOpenPeriodModal}
						isLoading={isLoading}
					/>
					<ReportsInsightsBar insights={insights} />
				</section>

				<section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					<StatCard title="Receitas pagas" value={formatCurrencyBRL(stats.total_income)} />
					<StatCard title="Despesas pagas" value={formatCurrencyBRL(stats.total_expenses)} />
					<StatCard title="Receitas pendentes" value={formatCurrencyBRL(stats.pending_income)} />
					<StatCard title="Despesas pendentes" value={formatCurrencyBRL(stats.pending_expenses)} />
					<StatCard
						title="Transações no débito (mês atual)"
						value={formatCurrencyBRL(stats.current_month_debit_total)}
					/>
					<StatCard title="Faturas vencidas" value={stats.overdue_count} />
				</section>

				<section className="space-y-3">
					<div className="flex items-center justify-between gap-2">
						<h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
							Resumo por mês / ano
						</h2>
						{isLoading && (
							<span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
								Carregando dados...
							</span>
						)}
					</div>
					<ReportsMonthlySummary items={monthlySummary} onSelectPeriod={handleOpenPeriodModal} />
				</section>

					<ReportsPeriodModal
						isOpen={isPeriodModalOpen}
						onClose={handleClosePeriodModal}
						period={selectedPeriod}
						onSelectTransaction={handleSelectTransaction}
					/>

					<FaturaDetailModal
						isOpen={!!selectedTransaction}
						onClose={() => setSelectedTransaction(null)}
						item={selectedTransaction}
					/>
			</div>
		</AuthenticatedLayout>
	);
}