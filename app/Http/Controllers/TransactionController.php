<?php

namespace App\Http\Controllers;

use App\Models\Fatura;
use App\Models\BankUser;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $perPage = 5;

        $filters = [
            'type' => $request->get('type'),
            'bank_user_id' => $request->get('bank_user_id'),
            'category_id' => $request->get('category_id'),
            'status' => $request->get('status'),
        ];

        $order = $request->get('order', 'created_desc');

        $monthKey = $request->get('month_key');
        $monthRange = null;
        if ($monthKey) {
            try {
                $monthDate = Carbon::createFromFormat('Y-m', $monthKey)->startOfMonth();
                $monthRange = [
                    $monthDate->copy()->startOfMonth(),
                    $monthDate->copy()->endOfMonth(),
                ];
            } catch (\Throwable $e) {
                $monthRange = null;
            }
        }

        $recurringParam = $request->get('recurring');
        if ($recurringParam === 'recurring') {
            $filters['is_recurring'] = true;
        } elseif ($recurringParam === 'non_recurring') {
            $filters['is_recurring'] = false;
        }

        $search = trim((string) $request->get('search', ''));

        $transactions = Fatura::with(['bankUser.bank', 'category'])
            ->forUser($user->id)
            ->filter($filters)
            ->when($monthRange, function ($q) use ($monthRange) {
                [$start, $end] = $monthRange;
                $q->whereBetween('created_at', [$start, $end]);
            })
            ->when($search !== '', function ($q) use ($search) {
                $q->where('title', 'like', "%$search%");
            })
            ->when(true, function ($q) use ($order) {
                switch ($order) {
                    case 'created_asc':
                        $q->orderBy('created_at', 'asc');
                        break;
                    case 'title_asc':
                        $q->orderBy('title', 'asc');
                        break;
                    case 'title_desc':
                        $q->orderBy('title', 'desc');
                        break;
                    case 'amount_asc':
                        $q->orderBy('amount', 'asc');
                        break;
                    case 'amount_desc':
                        $q->orderBy('amount', 'desc');
                        break;
                    case 'created_desc':
                    default:
                        $q->orderBy('created_at', 'desc');
                        break;
                }
            })
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

        $months = Fatura::where('user_id', $user->id)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month_key")
            ->groupBy('month_key')
            ->orderBy('month_key', 'desc')
            ->get()
            ->map(function ($row) {
                $key = $row->month_key;
                try {
                    $label = Carbon::createFromFormat('Y-m', $key)->translatedFormat('F Y');
                } catch (\Throwable $e) {
                    $label = $key;
                }

                return [
                    'month_key' => $key,
                    'month_label' => ucfirst($label),
                    'is_paid' => false,
                ];
            })
            ->values();

        return Inertia::render('Transacao', [
            'transactions' => $transactions,
            'bankAccounts' => $bankAccounts,
            'categories' => $categories,
            'months' => $months,
            'filters' => [
                'type' => $filters['type'] ?? null,
                'bank_user_id' => $filters['bank_user_id'] ?? null,
                'category_id' => $filters['category_id'] ?? null,
                'status' => $filters['status'] ?? null,
                'recurring' => $recurringParam,
                'search' => $search,
                'month_key' => $monthKey,
                'order' => $order,
            ],
        ]);
    }
}
