<?php

namespace App\Http\Controllers;

use App\Models\Fatura;
use App\Models\BankUser;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Force a fixed page size of 5 to avoid clients bypassing pagination
        $perPage = 5;

        $filters = [
            'type' => $request->get('type'),
            'bank_user_id' => $request->get('bank_user_id'),
            'category_id' => $request->get('category_id'),
        ];

        $recurringParam = $request->get('recurring');
        if ($recurringParam === 'recurring') {
            $filters['is_recurring'] = true;
        } elseif ($recurringParam === 'non_recurring') {
            $filters['is_recurring'] = false;
        }

        $search = trim((string) $request->get('search', ''));

        $transactions = Fatura::with(['bankUser.bank', 'category'])
            ->forUser($user->id)
            ->notStatus('paid')
            ->filter($filters)
            ->when($search !== '', function ($q) use ($search) {
                $q->where('title', 'like', "%$search%");
            })
            // Alphabetical ordering by title
            ->orderBy('title', 'asc')
            ->paginate($perPage, ['*'], 'transactions_page')
            ->withQueryString()
            ->through(function (Fatura $fatura) {
                return [
                    'id' => $fatura->id,
                    'title' => $fatura->title,
                    'description' => $fatura->description,
                    'amount' => (float) $fatura->amount,
                    'type' => $fatura->type,
                    'status' => $fatura->status,
                    'created_at' => $fatura->created_at,
                    'total_installments' => $fatura->total_installments,
                    'current_installment' => $fatura->current_installment,
                    'is_recurring' => (bool) $fatura->is_recurring,
                    'bank_user_id' => $fatura->bank_user_id,
                    'bank_name' => optional($fatura->bankUser->bank ?? null)->name ?? null,
                    'category_id' => $fatura->category_id,
                    'category_name' => $fatura->category->name ?? null,
                ];
            });

        $bankAccounts = BankUser::with('bank')
            ->where('user_id', $user->id)
            ->get()
            ->map(function ($bankUser) {
                return [
                    'id' => $bankUser->id,
                    'name' => $bankUser->bank?->name ?? ('Conta #' . $bankUser->id),
                ];
            })
            ->sortBy('name')
            ->values()
            ->all();

        $categories = Category::where('user_id', $user->id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Transacao', [
            'transactions' => $transactions,
            'bankAccounts' => $bankAccounts,
            'categories' => $categories,
            'filters' => [
                'type' => $filters['type'] ?? null,
                'bank_user_id' => $filters['bank_user_id'] ?? null,
                'category_id' => $filters['category_id'] ?? null,
                'recurring' => $recurringParam,
                'search' => $search,
            ],
        ]);
    }
}
