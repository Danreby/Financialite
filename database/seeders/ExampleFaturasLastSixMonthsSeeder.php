<?php

namespace Database\Seeders;

use App\Models\BankUser;
use App\Models\Category;
use App\Models\Fatura;
use App\Models\Paid;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ExampleFaturasLastSixMonthsSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();

        if (!$user) {
            return;
        }

        $bankUser = BankUser::forUser($user->id)->first();

        if (!$bankUser) {
            return;
        }

        $categories = Category::forUser($user->id)->get();

        if ($categories->isEmpty()) {
            return;
        }

        $today = Carbon::today();

        for ($i = 5; $i >= 0; $i--) {
            $monthDate = $today->copy()->subMonths($i)->startOfMonth();
            $monthKey = $monthDate->format('Y-m');
            $isPastMonth = $monthDate->lt($today->copy()->startOfMonth());

            $monthlyPaidTotal = 0;

            $debitExamples = [
                'Supermercado',
                'Transporte',
                'Restaurante',
            ];

            foreach ($debitExamples as $label) {
                $category = $categories->random();
                $createdAt = $monthDate->copy()->addDays(rand(0, 25));
                $amount = rand(50, 400);

                $fatura = Fatura::create([
                    'title' => $label . ' ' . $createdAt->translatedFormat('M/Y'),
                    'description' => null,
                    'amount' => $amount,
                    'type' => 'debit',
                    'status' => 'paid',
                    'paid_date' => $createdAt->copy()->addDays(rand(0, 3))->toDateString(),
                    'total_installments' => 1,
                    'current_installment' => 1,
                    'is_recurring' => false,
                    'user_id' => $user->id,
                    'bank_user_id' => $bankUser->id,
                    'category_id' => $category->id,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                $monthlyPaidTotal += $fatura->amount;
            }

            $creditExamples = [
                'Compras online',
                'Eletrônicos',
                'Roupas',
            ];

            foreach ($creditExamples as $label) {
                $category = $categories->random();
                $createdAt = $monthDate->copy()->addDays(rand(2, 25));
                $amount = rand(100, 1200);

                $status = $isPastMonth ? 'paid' : 'unpaid';
                $paidDate = $isPastMonth
                    ? $createdAt->copy()->addDays(rand(5, 15))->toDateString()
                    : null;

                $totalInstallments = rand(1, 6);

                $fatura = Fatura::create([
                    'title' => $label . ' ' . $createdAt->translatedFormat('M/Y'),
                    'description' => null,
                    'amount' => $amount,
                    'type' => 'credit',
                    'status' => $status,
                    'paid_date' => $paidDate,
                    'total_installments' => $totalInstallments,
                    'current_installment' => $isPastMonth ? $totalInstallments : 0,
                    'is_recurring' => false,
                    'user_id' => $user->id,
                    'bank_user_id' => $bankUser->id,
                    'category_id' => $category->id,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                if ($status === 'paid') {
                    $monthlyPaidTotal += $fatura->amount;
                }
            }

            if ($isPastMonth && $monthlyPaidTotal > 0) {
                Paid::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'month_key' => $monthKey,
                        'bank_user_id' => $bankUser->id,
                    ],
                    [
                        'paid_at' => $monthDate->copy()->endOfMonth()->toDateString(),
                        'total_paid' => $monthlyPaidTotal,
                    ],
                );
            }
        }
    }
}
