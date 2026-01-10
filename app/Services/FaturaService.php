<?php

namespace App\Services;

use App\Models\Fatura;
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
}
