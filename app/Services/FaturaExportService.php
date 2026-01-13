<?php

namespace App\Services;

use App\Models\Transacao;
use Illuminate\Support\Collection;

class FaturaExportService
{
    public function __construct(private FaturaBillingService $billing)
    {
    }

    public function exportForUser(int $userId, ?int $bankUserId = null, ?int $categoryId = null): Collection
    {
        $query = Transacao::with(['bankUser.bank', 'category'])
            ->forUser($userId)
            ->forBankUser($bankUserId)
            ->when($categoryId, function ($q, $categoryId) {
                $q->where('category_id', $categoryId);
            })
            ->orderBy('created_at', 'desc');

        return $query->get()->map(fn (Transacao $transacao) => $this->mapForExport($transacao));
    }

    private function mapForExport(Transacao $fatura): array
    {
        $createdAt = $fatura->created_at;
        $yearMonth = $createdAt ? $createdAt->format('Y-m') : null;
        $monthLabel = $createdAt ? ucfirst($createdAt->translatedFormat('F Y')) : null;
        $createdAtFormatted = $createdAt ? $createdAt->format('d/m/Y H:i') : null;

        if ($fatura->type === 'credit') {
            $invoiceMonthKey = $this->billing->resolveBillingMonthKey($fatura);
            $invoiceCarbon = now()->createFromFormat('Y-m', $invoiceMonthKey)->startOfMonth();
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
}
