<?php

namespace App\Services;

use App\Models\BankUser;
use App\Models\Fatura;
use App\Models\Paid;
use Carbon\Carbon;
use Illuminate\Contracts\Auth\Authenticatable;
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

        return DB::transaction(function () use ($data) {
            return Fatura::create($data);
        });
    }

    public function updateForUser(Fatura $fatura, array $data): Fatura
    {
        return DB::transaction(function () use ($fatura, $data) {
            $fatura->update($data);
            return $fatura->refresh();
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

        return $result->sortByDesc('month_key')->values()->all();
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

        $candidateKey = $candidate->format('Y-m');

        if ($paidByMonth) {
            for ($i = 0; $i < 24; $i++) {
                if (!$paidByMonth->has($candidateKey)) {
                    break;
                }

                $candidate = $candidate->copy()->addMonth();
                $candidateKey = $candidate->format('Y-m');
            }
        }

        return $candidateKey;
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
}
