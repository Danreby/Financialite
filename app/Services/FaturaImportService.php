<?php

namespace App\Services;

use App\Models\BankUser;
use App\Models\Category;
use DomainException;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Facades\DB;

class FaturaImportService
{
    public function __construct(private FaturaService $writer)
    {
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

                $this->writer->createForUser($user, $data);
                $importedCount++;
            }

            return $importedCount;
        });
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
