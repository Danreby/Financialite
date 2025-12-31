import React, { useEffect, useMemo, useState } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { toast } from "react-toastify";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TransactionsExportButton from "@/Components/system/transactions/TransactionsExportButton";
import StatCard from "@/Components/system/dashboard/StatCard";
import ReportsMonthlySummary from "@/Components/system/reports/ReportsMonthlySummary";
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
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		let isMounted = true;
		const load = async () => {
			setIsLoading(true);
			try {
				const [statsResponse, exportResponse] = await Promise.all([
					axios.get(route("faturas.stats"), {
						params: {
							bank_user_id: selectedBankId || undefined,
							category_id: selectedCategoryId || undefined,
						},
					}),
					axios.get(route("faturas.export_data"), {
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

				const raw = Array.isArray(exportResponse.data) ? exportResponse.data : [];
				const grouped = raw.reduce((acc, item) => {
					const key = item.year_month || "sem-data";
					if (!acc[key]) {
						acc[key] = {
							year_month: item.year_month || null,
							month_label: item.month_label || item.year_month || "Sem data",
							total_amount: 0,
							total_credit: 0,
							total_debit: 0,
							count: 0,
						};
					}

					const amount = Number(item.amount || 0);
					acc[key].total_amount += amount;
					if (item.type === "credit") {
						acc[key].total_credit += amount;
					} else if (item.type === "debit") {
						acc[key].total_debit += amount;
					}
					acc[key].count += 1;
					return acc;
				}, {});

				const sorted = Object.values(grouped).sort((a, b) => {
					const ka = a.year_month || "";
					const kb = b.year_month || "";
					return ka.localeCompare(kb);
				});

				setMonthlySummary(sorted);
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

	return (
		<AuthenticatedLayout>
			<Head title="Relatórios" />

			<div className="w-full max-w-[1600px] mx-auto px-3 py-4 space-y-6 sm:px-4 sm:py-5 lg:px-8 lg:py-7">
				<header className="space-y-2 pt-1 sm:pt-2">
					<h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-gray-100">
						Relatórios
					</h1>
					<p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300">
						Acompanhe todas as suas transações em faturas, veja um resumo financeiro por período,
						filtre por conta e categoria e exporte um arquivo Excel completo.
					</p>
				</header>

				<section className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-black/5 dark:bg-[#0b0b0b] dark:ring-black/30 sm:p-5 lg:p-6 space-y-4">
					<div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
							<div className="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
								<select
									value={selectedBankId}
									onChange={(e) => setSelectedBankId(e.target.value)}
									className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm sm:text-base shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100 sm:min-w-[240px]"
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
									className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm sm:text-base shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-gray-700 dark:bg-[#0f0f0f] dark:text-gray-100 sm:min-w-[240px]"
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

				<section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
					<ReportsMonthlySummary items={monthlySummary} />
				</section>
			</div>
		</AuthenticatedLayout>
	);
}
