<?php

namespace App\Services;

use App\Models\BankUser;
use App\Models\Category;
use App\Models\Fatura;
use App\Models\Paid;
use Carbon\Carbon;
use DomainException;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class FaturaService
{
    public function createForUser(Authenticatable $user, array $data): Fatura
    {
        $data['user_id'] = $user->id;
        $data['total_installments'] = max($data['total_installments'] ?? 1, 1);
        $data['current_installment'] = 0;
        $data['status'] = $data['status'] ?? 'unpaid';
        $data['is_recurring'] = $data['is_recurring'] ?? false;

        if ($data['is_recurring']) {
            $data['total_installments'] = 1;
            $data['current_installment'] = 0;
        }

        if (($data['type'] ?? null) === 'debit') {
            $data['status'] = 'paid';
            $data['paid_date'] = Carbon::today()->toDateString();
            $data['total_installments'] = 1;
            $data['current_installment'] = 1;
            $data['is_recurring'] = false;
        }

        return DB::transaction(function () use ($data) {
            return Fatura::create($data);
        });
    }

    public function updateForUser(Fatura $fatura, array $data): Fatura
    {
        return DB::transaction(function () use ($fatura, $data) {
            $fatura->update($data);

            if ($fatura->is_recurring) {
                $fatura->total_installments = 1;
                $fatura->current_installment = 0;
                $fatura->paid_date = null;
                $fatura->save();
            }

            return $fatura->refresh();
        });
    }

    public function exportForUser(int $userId, ?int $bankUserId = null, ?int $categoryId = null): Collection
    {
        $query = Fatura::with(['bankUser.bank', 'category'])
            ->forUser($userId)
            ->forBankUser($bankUserId)
            ->when($categoryId, function ($q, $categoryId) {
                $q->where('category_id', $categoryId);
            })
            ->orderBy('created_at', 'desc');

        return $query->get()->map(fn (Fatura $fatura) => $this->mapForExport($fatura));
    }

    public function importRows(Authenticatable $user, array $rows): int
    {
        return DB::transaction(function () use ($user, $rows) {
            $importedCount = 0;

            foreach ($rows as $index => $row) {
                $bankUserId = $this->resolveBankUserIdByName($user->id, $row['bank_user_name'] ?? null, $index);
                $categoryId = $this->resolveCategoryIdByName($user->id, $row['category_name'] ?? null, $index);

                $data = [
                    'title' => $row['title'],
                    'description' => $row['description'] ?? null,
                    'amount' => $row['amount'],
                    'type' => $row['type'],
                    'status' => $row['status'] ?? null,
                    'total_installments' => $row['total_installments'] ?? null,
                    'current_installment' => $row['current_installment'] ?? null,
                    'is_recurring' => filter_var($row['is_recurring'] ?? false, FILTER_VALIDATE_BOOLEAN),
                    'bank_user_id' => $bankUserId,
                    'category_id' => $categoryId,
                ];

                $this->createForUser($user, $data);
                $importedCount++;
            }

            return $importedCount;
        });
    }

    public function calculateBaseStats($base): array
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

    public function buildDashboardMonthlySummary(
        Authenticatable $user,
        ?int $bankUserId,
        ?int $categoryId,
        Carbon $seriesStart,
        Carbon $seriesEnd,
        $paidByMonth
    ): array {
        $paidByMonth = collect($paidByMonth);

        $debitEntries = Fatura::forUser($user->id)
            ->forBankUser($bankUserId)
            ->when($categoryId, function ($q, $categoryId) {
                $q->where('category_id', $categoryId);
            })
            ->where('type', 'debit')
            ->whereBetween('created_at', [$seriesStart, $seriesEnd])
            ->get();

        $debitByMonth = $debitEntries
            ->groupBy(function (Fatura $fatura) {
                return $fatura->created_at instanceof Carbon
                    ? $fatura->created_at->format('Y-m')
                    : Carbon::parse($fatura->created_at)->format('Y-m');
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

    public function paidByMonthForUser(int $userId, ?int $bankUserId = null, bool $shouldFilterByBankUser = false): Collection
    {
        $query = Paid::where('user_id', $userId);

        if ($shouldFilterByBankUser) {
            if (is_null($bankUserId)) {
                $query->whereNull('bank_user_id');
            } else {
                $query->where('bank_user_id', $bankUserId);
            }
        }

        return $query->pluck('total_paid', 'month_key');
    }

    public function buildDashboardData(Authenticatable $user, array $filters): array
    {
        $bankUserId = $filters['bank_user_id'] ?? null;
        $categoryId = $filters['category_id'] ?? null;

        $selectedBankUser = null;

        if ($bankUserId) {
            $selectedBankUser = BankUser::forUser($user->id)->findOrFail($bankUserId);
        }

        $baseQuery = Fatura::with(['bankUser.bank', 'user', 'category'])
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

        $monthlyGroups = $this->groupFaturasByMonth($allFaturas, $paidByMonth);

        $currentMonthKey = $this->resolveCurrentBillingMonthKey($selectedBankUser, $paidByMonth);

        $effective = $this->resolveEffectiveGroup($monthlyGroups, $currentMonthKey);
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

    public function groupFaturasByMonth($faturas, $paidByMonth = null)
    {
        $entries = collect();

        $projectionEnd = Carbon::today()->copy()->addYear()->startOfMonth();

        foreach ($faturas as $fatura) {
            $totalInstallments = max((int) ($fatura->total_installments ?? 1), 1);
            $isRecurring = (bool) $fatura->is_recurring;

            $firstBillingMonthKey = $this->resolveBillingMonthKey($fatura);
            $month = Carbon::createFromFormat('Y-m', $firstBillingMonthKey)->startOfMonth();

            $installmentIndex = 1;

            while (true) {
                if ($month->gt($projectionEnd)) {
                    break;
                }

                if (!$isRecurring && $installmentIndex > $totalInstallments) {
                    break;
                }

                $monthKey = $month->format('Y-m');

                $entries->push([
                    'fatura' => $fatura,
                    'month_key' => $monthKey,
                    'installment_index' => $installmentIndex,
                ]);

                $month = $month->copy()->addMonth();
                $installmentIndex++;
            }
        }

        $grouped = $entries->groupBy('month_key');

        $result = $grouped->map(function ($items, $yearMonth) use ($paidByMonth) {
            $carbon = Carbon::createFromFormat('Y-m', $yearMonth)->startOfMonth();
            $label = ucfirst($carbon->translatedFormat('F Y'));

            $totalSpent = $items->sum(function ($entry) {
                $fatura = $entry['fatura'];
                $totalInstallments = max((int) ($fatura->total_installments ?? 1), 1);
                return (float) $fatura->amount / $totalInstallments;
            });
            $isPaid = $paidByMonth ? $paidByMonth->has($yearMonth) : false;

            return [
                'month_key' => $yearMonth,
                'month_label' => $label,
                'total_spent' => (float) $totalSpent,
                'is_paid' => $isPaid,
                'items' => $items->map(function ($entry) {
                    $fatura = $entry['fatura'];
                    $installmentIndex = $entry['installment_index'];

                    return [
                        'id' => $fatura->id . '-' . $installmentIndex,
                        'fatura_id' => $fatura->id,
                        'title' => $fatura->title,
                        'description' => $fatura->description,
                        'amount' => (float) $fatura->amount,
                        'type' => $fatura->type,
                        'status' => $fatura->status,
                        'created_at' => $fatura->created_at,
                        'paid_date' => $fatura->paid_date,
                        'total_installments' => $fatura->total_installments,
                        'current_installment' => $fatura->current_installment,
                        'display_installment' => $this->resolveInstallmentNumberForMonth($fatura, $entry['month_key']),
                        'is_recurring' => (bool) $fatura->is_recurring,
                        'bank_name' => optional($fatura->bankUser->bank ?? null)->name ?? null,
                        'category_name' => $fatura->category->name ?? null,
                    ];
                })->values()->all(),
            ];
        });

        return $result->sortBy('month_key')->values()->all();
    }

    public function resolveEffectiveGroup(array $monthlyGroups, string $currentMonthKey): array
    {
        $groupsCollection = collect($monthlyGroups);

        $effectiveGroup = $groupsCollection->firstWhere('month_key', $currentMonthKey);

        if (!$effectiveGroup || ($effectiveGroup['is_paid'] ?? false)) {
            $targetMonth = null;

            try {
                $targetMonth = Carbon::createFromFormat('Y-m', $currentMonthKey)->startOfMonth();
            } catch (\Throwable $e) {
                $targetMonth = Carbon::today()->startOfMonth();
            }

            $unpaidGroups = $groupsCollection->filter(function ($group) {
                return !($group['is_paid'] ?? false);
            });

            if ($unpaidGroups->isNotEmpty()) {
                $effectiveGroup = $unpaidGroups->sortBy(function ($group) use ($targetMonth) {
                    $groupMonth = Carbon::createFromFormat('Y-m', $group['month_key'])->startOfMonth();
                    return $targetMonth->diffInMonths($groupMonth);
                })->first();
            } else {
                $effectiveGroup = null;
            }
        }

        $effectiveMonthKey = $currentMonthKey;

        if ($effectiveGroup && !($effectiveGroup['is_paid'] ?? false)) {
            $effectiveMonthKey = $effectiveGroup['month_key'] ?? $currentMonthKey;
        }

        return [
            'group' => $effectiveGroup,
            'month_key' => $effectiveMonthKey,
        ];
    }

    public function calculatePendingBillFromGroup(?array $group): float
    {
        if (!$group || ($group['is_paid'] ?? false)) {
            return 0.0;
        }

        $pending = 0.0;

        foreach ($group['items'] ?? [] as $item) {
            $totalInstallments = max((int) ($item['total_installments'] ?? 1), 1);
            $amount = (float) ($item['amount'] ?? 0);
            $pending += $amount / $totalInstallments;
        }

        return (float) $pending;
    }

    public function buildStats(Authenticatable $user, ?int $bankUserId, ?int $categoryId, bool $filterBankUser): array
    {
        $selectedBankUser = null;

        if ($bankUserId) {
            $selectedBankUser = BankUser::forUser($user->id)->findOrFail($bankUserId);
        }

        $base = Fatura::forUser($user->id)
            ->forBankUser($bankUserId)
            ->when($categoryId, function ($q, $categoryId) {
                $q->where('category_id', $categoryId);
            });

        $stats = $this->calculateBaseStats($base);

        $today = Carbon::today();
        $monthStart = $today->copy()->startOfMonth();
        $monthEnd = $today->copy()->endOfMonth();
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

        $currentMonthPaidDebits = (clone $base)
            ->with('category')
            ->where('type', 'debit')
            ->where('status', 'paid')
            ->whereBetween('created_at', [$monthStart, $monthEnd])
            ->get();

        $topSpendingCategories = $currentMonthPaidDebits
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
            ->take(5)
            ->values()
            ->all();

        $currentMonthDebitTotal = Fatura::forUser($user->id)
            ->forBankUser($bankUserId)
            ->when($categoryId, function ($q, $categoryId) {
                $q->where('category_id', $categoryId);
            })
            ->where('type', 'debit')
            ->whereBetween('created_at', [$monthStart, $monthEnd])
            ->sum('amount');

        $allFaturas = Fatura::with('bankUser')
            ->forUser($user->id)
            ->forBankUser($bankUserId)
            ->when($categoryId, function ($q, $categoryId) {
                $q->where('category_id', $categoryId);
            })
            ->where('type', 'credit')
            ->notStatus('paid')
            ->orderBy('created_at', 'desc')
            ->get();

        $monthlyGroups = $this->groupFaturasByMonth($allFaturas, $paidByMonth);

        $currentMonthKey = $this->resolveCurrentBillingMonthKey($selectedBankUser, $paidByMonth);

        $effective = $this->resolveEffectiveGroup($monthlyGroups, $currentMonthKey);
        $effectiveGroup = $effective['group'];
        $effectiveMonthKey = $effective['month_key'];

        $currentPendingBill = $this->calculatePendingBillFromGroup($effectiveGroup);

        $stats['current_month_key'] = $effectiveMonthKey;
        $stats['current_month_label'] = $effectiveGroup['month_label'] ?? null;
        $stats['current_month_pending_bill'] = (float) $currentPendingBill;
        $stats['current_month_debit_total'] = (float) $currentMonthDebitTotal;
        $stats['monthly_summary'] = $monthlySummary;
        $stats['top_spending_categories'] = $topSpendingCategories;

        return $stats;
    }

    public function payMonthForUser(Authenticatable $user, string $monthKey, ?BankUser $bankUser): float
    {
        $bankUserId = $bankUser?->id;

        $query = Fatura::with('bankUser')
            ->forUser($user->id)
            ->forBankUser($bankUserId)
            ->notStatus('paid');

        $allFaturas = $query->get();

        $targetMonth = Carbon::createFromFormat('Y-m', $monthKey)->startOfMonth();

        $faturas = $allFaturas->filter(function (Fatura $fatura) use ($targetMonth) {
            return $this->faturaAppliesToMonth($fatura, $targetMonth);
        });

        if ($faturas->isEmpty()) {
            return 0.0;
        }

        return DB::transaction(function () use ($faturas, $user, $bankUserId, $monthKey) {
            $totalPaidThisRun = 0.0;

            foreach ($faturas as $fatura) {
                $totalPaidThisRun += $this->applyPaymentForMonth($fatura);
                $fatura->save();
            }

            if ($totalPaidThisRun > 0) {
                $paid = Paid::firstOrNew([
                    'user_id' => $user->id,
                    'month_key' => $monthKey,
                    'bank_user_id' => $bankUserId,
                ]);

                $paid->total_paid = ($paid->total_paid ?? 0) + $totalPaidThisRun;
                $paid->paid_at = now()->toDateString();
                $paid->save();
            }

            return (float) $totalPaidThisRun;
        });
    }

    public function faturaAppliesToMonth(Fatura $fatura, Carbon $targetMonth): bool
    {
        $totalInstallments = max((int) ($fatura->total_installments ?? 1), 1);

        $firstBillingMonthKey = $this->resolveBillingMonthKey($fatura);
        $first = Carbon::createFromFormat('Y-m', $firstBillingMonthKey)->startOfMonth();

        if ($fatura->is_recurring) {
            return !$targetMonth->lt($first);
        }

        $last = (clone $first)->addMonths($totalInstallments - 1);

        return !$targetMonth->lt($first) && !$targetMonth->gt($last);
    }

    public function resolveBillingMonthKey(Fatura $fatura): string
    {
        $createdAt = $fatura->created_at instanceof Carbon
            ? $fatura->created_at->copy()
            : Carbon::parse($fatura->created_at);

        $dueDay = $fatura->bankUser->due_day ?? null;

        if (!$dueDay) {
            return $createdAt->format('Y-m');
        }

        $cutoffDay = min((int) $dueDay, 28);
        $dayOfPurchase = (int) $createdAt->format('d');

        if ($dayOfPurchase <= $cutoffDay) {
            return $createdAt->format('Y-m');
        }

        return $createdAt->copy()->addMonth()->format('Y-m');
    }

    public function resolveCurrentBillingMonthKey(?BankUser $bankUser = null, $paidByMonth = null): string
    {
        $today = Carbon::today();

        if (!$bankUser || !$bankUser->due_day) {
            $candidate = $today->copy();
        } else {
            $cutoffDay = min((int) $bankUser->due_day, 28);
            $day = (int) $today->format('d');

            $candidate = $day <= $cutoffDay
                ? $today->copy()
                : $today->copy()->addMonth();
        }

        return $candidate->format('Y-m');
    }

    public function applyPaymentForMonth(Fatura $fatura): float
    {
        $totalInstallments = max((int) ($fatura->total_installments ?? 1), 1);
        $installmentAmount = (float) $fatura->amount / $totalInstallments;
        $isRecurring = (bool) $fatura->is_recurring;

        if ($isRecurring) {
            return $installmentAmount;
        }

        if ($totalInstallments <= 1) {
            $fatura->status = 'paid';
            $fatura->paid_date = now()->toDateString();

            return (float) $fatura->amount;
        }

        $currentInstallment = max((int) ($fatura->current_installment ?? 0), 0);

        if ($currentInstallment < $totalInstallments) {
            $currentInstallment++;
            $fatura->current_installment = $currentInstallment;
        }

        if ($currentInstallment >= $totalInstallments) {
            $fatura->status = 'paid';
            $fatura->paid_date = now()->toDateString();
        }

        return $installmentAmount;
    }

    public function resolveInstallmentNumberForMonth(Fatura $fatura, string $yearMonth): ?int
    {
        $totalInstallments = (int) ($fatura->total_installments ?? 1);
        if ($totalInstallments <= 1) {
            return null;
        }

        $firstBillingMonthKey = $this->resolveBillingMonthKey($fatura);
        $first = Carbon::createFromFormat('Y-m', $firstBillingMonthKey)->startOfMonth();
        $current = Carbon::createFromFormat('Y-m', $yearMonth)->startOfMonth();

        if ($current->lt($first)) {
            return null;
        }

        $offset = $first->diffInMonths($current);
        $installment = $offset + 1; 

        if ($installment > $totalInstallments) {
            return $totalInstallments;
        }

        return $installment;
    }

    private function mapForExport(Fatura $fatura): array
    {
        $createdAt = $fatura->created_at ? Carbon::parse($fatura->created_at) : null;
        $yearMonth = $createdAt ? $createdAt->format('Y-m') : null;
        $monthLabel = $createdAt ? ucfirst($createdAt->translatedFormat('F Y')) : null;
        $createdAtFormatted = $createdAt ? $createdAt->format('d/m/Y H:i') : null;

        if ($fatura->type === 'credit') {
            $invoiceMonthKey = $this->resolveBillingMonthKey($fatura);
            $invoiceCarbon = Carbon::createFromFormat('Y-m', $invoiceMonthKey)->startOfMonth();
            $invoiceMonthLabel = ucfirst($invoiceCarbon->translatedFormat('F Y'));
            $installmentAmount = (float) $fatura->amount / max((int) ($fatura->total_installments ?? 1), 1);
        } else {
            $invoiceMonthKey = $yearMonth;
            $invoiceMonthLabel = $monthLabel;
            $installmentAmount = (float) $fatura->amount;
        }

        return [
            'id' => (string) $fatura->id,
            'title' => $fatura->title,
            'description' => $fatura->description,
            'amount' => (float) $fatura->amount,
            'type' => $fatura->type,
            'status' => $fatura->status,
            'created_at' => $fatura->created_at,
            'total_installments' => $fatura->total_installments,
            'current_installment' => $fatura->current_installment,
            'is_recurring' => (bool) $fatura->is_recurring,
            'year_month' => $yearMonth,
            'month_label' => $monthLabel,
            'invoice_month' => $invoiceMonthKey,
            'invoice_month_label' => $invoiceMonthLabel,
            'installment_amount' => (float) $installmentAmount,
            'created_at_formatted' => $createdAtFormatted,
            'bank_user' => [
                'id' => $fatura->bankUser->id ?? null,
                'bank' => [
                    'name' => optional($fatura->bankUser->bank ?? null)->name ?? null,
                ],
            ],
            'category' => [
                'id' => $fatura->category->id ?? null,
                'name' => $fatura->category->name ?? null,
            ],
        ];
    }

    private function resolveBankUserIdByName(int $userId, ?string $bankUserName, int $index): ?int
    {
        if (!$bankUserName) {
            return null;
        }

        $bankUser = BankUser::with('bank')
            ->forUser($userId)
            ->whereHas('bank', function ($q) use ($bankUserName) {
                $q->where('name', $bankUserName);
            })
            ->first();

        if (!$bankUser) {
            throw new DomainException('Conta não encontrada para o nome informado na linha ' . ($index + 2) . ': ' . $bankUserName);
        }

        return $bankUser->id;
    }

    private function resolveCategoryIdByName(int $userId, ?string $categoryName, int $index): ?int
    {
        if (!$categoryName) {
            return null;
        }

        $category = Category::forUser($userId)
            ->where('name', $categoryName)
            ->first();

        if (!$category) {
            throw new DomainException('Categoria não encontrada para o nome informado na linha ' . ($index + 2) . ': ' . $categoryName);
        }

        return $category->id;
    }
}
