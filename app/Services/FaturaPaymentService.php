<?php

namespace App\Services;

use App\Models\BankUser;
use App\Models\Fatura;
use App\Models\Transacao;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Facades\DB;

class FaturaPaymentService
{
    public function __construct(private FaturaBillingService $billing)
    {
    }

    public function payMonthForUser(Authenticatable $user, string $monthKey, ?BankUser $bankUser): float
    {
        $bankUserId = $bankUser?->id;

        $query = Transacao::with('bankUser')
            ->forUser($user->id)
            ->forBankUser($bankUserId)
            ->notStatus('paid');

        $allFaturas = $query->get();

        $targetMonth = now()->createFromFormat('Y-m', $monthKey)->startOfMonth();

        $faturas = $allFaturas->filter(function (Transacao $transacao) use ($targetMonth) {
            return $this->billing->faturaAppliesToMonth($transacao, $targetMonth);
        });

        if ($faturas->isEmpty()) {
            return 0.0;
        }

        return DB::transaction(function () use ($faturas, $user, $bankUserId, $monthKey) {
            $totalPaidThisRun = 0.0;

            foreach ($faturas as $transacao) {
                $totalPaidThisRun += $this->billing->applyPaymentForMonth($transacao);
                $transacao->save();
            }

            if ($totalPaidThisRun > 0) {
                $paid = Fatura::firstOrNew([
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
}
