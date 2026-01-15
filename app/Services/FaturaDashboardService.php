<?php

namespace App\Services;

use App\Models\BankUser;
use App\Models\Category;
use App\Models\Fatura;
use App\Models\Transacao;
use Carbon\Carbon;
use Illuminate\Contracts\Auth\Authenticatable;

class FaturaDashboardService
{
    public function __construct(private FaturaBillingService $billing)
    {
    }

    public function buildDashboardData(Authenticatable $user, array $filters): array
    {
        $bankUserId = $filters['bank_user_id'] ?? null;
        $categoryId = $filters['category_id'] ?? null;

        $selectedBankUser = null;

        if ($bankUserId) {
            $selectedBankUser = BankUser::forUser($user->id)->findOrFail($bankUserId);
        }

        $baseQuery = Transacao::with(['bankUser.bank', 'user', 'category'])
            ->forUser($user->id)
            ->filter($filters)
            ->orderBy('created_at', 'desc');

        $allFaturas = (clone $baseQuery)
            ->where('type', 'credit')
            ->get();

        $paidByMonth = $this->paidByMonthForUser(
            $user->id,
            $bankUserId,
            array_key_exists('bank_user_id', $filters)
        );

        $monthlyGroups = $this->billing->groupFaturasByMonth($allFaturas, $paidByMonth);

        $currentMonthKey = $this->billing->resolveCurrentBillingMonthKey($selectedBankUser);

        $effective = $this->billing->resolveEffectiveGroup($monthlyGroups, $currentMonthKey);
        $effectiveMonthKey = $effective['month_key'];

        $bankAccounts = BankUser::with('bank')
            ->forUser($user->id)
            ->get()
            ->map(function ($bankUser) {
                return [
                    'id' => $bankUser->id,
                    'name' => $bankUser->bank?->name ?? ('Conta #' . $bankUser->id),
                    'due_day' => $bankUser->due_day,
                ];
            });

        $categories = Category::forUser($user->id)
            ->ordered()
            ->get(['id', 'name']);

        return [
            'base_query' => $baseQuery,
            'monthly_groups' => $monthlyGroups,
            'bank_accounts' => $bankAccounts,
            'current_month_key' => $effectiveMonthKey,
            'categories' => $categories,
        ];
    }

    public function buildStats(Authenticatable $user, ?int $bankUserId, ?int $categoryId, bool $filterBankUser): array
    {
        $selectedBankUser = null;

        if ($bankUserId) {
            $selectedBankUser = BankUser::forUser($user->id)->findOrFail($bankUserId);
        }

        $base = Transacao::forUser($user->id)
            ->forBankUser($bankUserId)
            ->when($categoryId, function ($q, $categoryId) {
                $q->where('category_id', $categoryId);
            });

        $stats = $this->calculateBaseStats($base);

        $today = Carbon::today();
        $monthStart = $today->copy()->startOfMonth();
        $monthEnd = $today->copy()->endOfMonth();
        $last30Start = $today->copy()->subDays(29)->startOfDay();
        $last30End = $today->copy()->endOfDay();
        $seriesStart = $today->copy()->subMonths(5)->startOfMonth();

        $paidByMonth = $this->paidByMonthForUser(
            $user->id,
            $bankUserId,
            $filterBankUser
        );

        $monthlySummary = $this->buildDashboardMonthlySummary(
            $user,
            $bankUserId,
            $categoryId,
            $seriesStart,
            $monthEnd,
            $paidByMonth
        );

        $recentExpenses = (clone $base)
            ->with('category')
            ->whereBetween('created_at', [$last30Start, $last30End])
            ->where(function ($q) {
                // Consider paid debit expenses and credit purchases from the last 30 days
                $q->where(function ($q) {
                    $q->where('type', 'debit')->where('status', 'paid');
                })->orWhere(function ($q) {
                    $q->where('type', 'credit');
                });
            })
            ->get();

        $topSpendingCategories = $recentExpenses
            ->groupBy('category_id')
            ->map(function ($items) {
                $first = $items->first();

                return [
                    'category_id' => $first?->category_id,
                    'category_name' => $first && $first->category ? $first->category->name : 'Sem categoria',
                    'total' => (float) $items->sum('amount'),
                ];
            })
            ->sortByDesc('total')
            ->take(6)
            ->values()
            ->all();

        $currentMonthDebitTotal = Transacao::forUser($user->id)
            ->forBankUser($bankUserId)
            ->when($categoryId, function ($q, $categoryId) {
                $q->where('category_id', $categoryId);
            })
            ->where('type', 'debit')
            ->whereBetween('created_at', [$monthStart, $monthEnd])
            ->sum('amount');

        $allFaturas = Transacao::with('bankUser')
            ->forUser($user->id)
            ->forBankUser($bankUserId)
            ->when($categoryId, function ($q, $categoryId) {
                $q->where('category_id', $categoryId);
            })
            ->where('type', 'credit')
            ->notStatus('paid')
            ->orderBy('created_at', 'desc')
            ->get();

        $monthlyGroups = $this->billing->groupFaturasByMonth($allFaturas, $paidByMonth);

        $currentMonthKey = $this->billing->resolveCurrentBillingMonthKey($selectedBankUser);

        $effective = $this->billing->resolveEffectiveGroup($monthlyGroups, $currentMonthKey);
        $effectiveGroup = $effective['group'];
        $effectiveMonthKey = $effective['month_key'];

        $currentPendingBill = $this->billing->calculatePendingBillFromGroup($effectiveGroup);

        $stats['current_month_key'] = $effectiveMonthKey;
        $stats['current_month_label'] = $effectiveGroup['month_label'] ?? null;
        $stats['current_month_pending_bill'] = (float) $currentPendingBill;
        $stats['current_month_debit_total'] = (float) $currentMonthDebitTotal;
        $stats['monthly_summary'] = $monthlySummary;
        $stats['top_spending_categories'] = $topSpendingCategories;

        return $stats;
    }

    public function buildDashboardMonthlySummary(
        Authenticatable $user,
        ?int $bankUserId,
        ?int $categoryId,
        Carbon $seriesStart,
        Carbon $seriesEnd,
        $paidByMonth
    ): array {
        $paidByMonth = collect($paidByMonth);

        $debitEntries = Transacao::forUser($user->id)
            ->forBankUser($bankUserId)
            ->when($categoryId, function ($q, $categoryId) {
                $q->where('category_id', $categoryId);
            })
            ->where('type', 'debit')
            ->whereBetween('created_at', [$seriesStart, $seriesEnd])
            ->get();

        $debitByMonth = $debitEntries
            ->groupBy(function (Transacao $transacao) {
                return $transacao->created_at instanceof Carbon
                    ? $transacao->created_at->format('Y-m')
                    : Carbon::parse($transacao->created_at)->format('Y-m');
            })
            ->map(function ($items) {
                return (float) $items->sum('amount');
            });

        $months = [];
        $cursor = $seriesStart->copy()->startOfMonth();
        $end = $seriesEnd->copy()->startOfMonth();

        while ($cursor->lte($end)) {
            $monthKey = $cursor->format('Y-m');
            $carbon = $cursor->copy()->startOfMonth();

            $months[] = [
                'month_key' => $monthKey,
                'month_label' => ucfirst($carbon->translatedFormat('M Y')),
                'invoice_total' => (float) $paidByMonth->get($monthKey, 0.0),
                'debit_total' => (float) $debitByMonth->get($monthKey, 0.0),
            ];

            $cursor->addMonth();
        }

        return $months;
    }

    private function calculateBaseStats($base): array
    {
        return [
            'total_income' => (clone $base)
                ->where('type', 'credit')
                ->where('status', 'paid')
                ->sum('amount'),
            'total_expenses' => (clone $base)
                ->where('type', 'debit')
                ->where('status', 'paid')
                ->sum('amount'),
            'pending_income' => (clone $base)
                ->where('type', 'credit')
                ->where('status', '!=', 'paid')
                ->sum('amount'),
            'pending_expenses' => (clone $base)
                ->where('type', 'debit')
                ->where('status', '!=', 'paid')
                ->sum('amount'),
            'overdue_count' => (clone $base)
                ->where('status', 'overdue')
                ->count(),
        ];
    }

    private function paidByMonthForUser(int $userId, ?int $bankUserId = null, bool $shouldFilterByBankUser = false)
    {
        $query = Fatura::where('user_id', $userId);

        if ($shouldFilterByBankUser) {
            if (is_null($bankUserId)) {
                $query->whereNull('bank_user_id');
            } else {
                $query->where('bank_user_id', $bankUserId);
            }
        }

        return $query->pluck('total_paid', 'month_key');
    }
}
