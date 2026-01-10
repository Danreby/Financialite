<?php

namespace App\Services;

use App\Models\BankUser;
use App\Models\Fatura;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class FaturaBillingService
{
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

    public function resolveCurrentBillingMonthKey(?BankUser $bankUser = null): string
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

    public function groupFaturasByMonth($faturas, ?Collection $paidByMonth = null): array
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
}
