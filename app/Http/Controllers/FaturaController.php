<?php

namespace App\Http\Controllers;

use App\Models\Fatura;
use App\Models\BankUser;
use App\Models\Paid;
use App\Services\FaturaService;
use App\Http\Requests\Fatura\FaturaStoreRequest;
use App\Http\Requests\Fatura\FaturaUpdateRequest;
use App\Http\Requests\Fatura\PayMonthRequest;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Carbon\Carbon;

class FaturaController extends Controller
{
    public function __construct(private FaturaService $faturaService)
    {
        $this->middleware('auth');
    }

    public function exportData(Request $request)
    {
        $user = $request->user();
        $bankUserId = $request->input('bank_user_id');
        $categoryId = $request->input('category_id');

        $query = Fatura::with(['bankUser.bank', 'category'])
            ->forUser($user->id)
            ->forBankUser($bankUserId)
            ->when($categoryId, function ($q, $categoryId) {
                $q->where('category_id', $categoryId);
            })
            ->orderBy('created_at', 'desc');

        $faturas = $query->get()->map(function (Fatura $fatura) {
            $createdAt = $fatura->created_at ? Carbon::parse($fatura->created_at) : null;
            $yearMonth = $createdAt ? $createdAt->format('Y-m') : null;
            $monthLabel = $createdAt ? ucfirst($createdAt->translatedFormat('F Y')) : null;
            $createdAtFormatted = $createdAt ? $createdAt->format('d/m/Y H:i') : null;

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
        });

        return response()->json($faturas);
    }

    public function import(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.title' => ['required', 'string', 'max:255'],
            'rows.*.description' => ['nullable', 'string'],
            'rows.*.amount' => ['required', 'numeric', 'min:0'],
            'rows.*.type' => ['required', 'string', Rule::in(['credit', 'debit'])],
            'rows.*.status' => ['nullable', 'string', Rule::in(['unpaid', 'paid', 'overdue'])],
            'rows.*.total_installments' => ['nullable', 'integer', 'min:1', 'max:360'],
            'rows.*.current_installment' => ['nullable', 'integer', 'min:0', 'max:360'],
            'rows.*.is_recurring' => ['nullable'],
            'rows.*.bank_user_name' => ['nullable', 'string', 'max:255'],
            'rows.*.category_name' => ['nullable', 'string', 'max:255'],
        ]);

        $rows = $validated['rows'] ?? [];

        DB::beginTransaction();

        try {
            $importedCount = 0;

            foreach ($rows as $index => $row) {
                $bankUserId = null;
                $categoryId = null;

                if (!empty($row['bank_user_name'])) {
                    $bankUser = BankUser::with('bank')
                        ->forUser($user->id)
                        ->whereHas('bank', function ($q) use ($row) {
                            $q->where('name', $row['bank_user_name']);
                        })
                        ->first();

                    if (!$bankUser) {
                        DB::rollBack();

                        return response()->json([
                            'message' => 'Conta não encontrada para o nome informado na linha ' . ($index + 2) . ': ' . $row['bank_user_name'],
                        ], 422);
                    }

                    $bankUserId = $bankUser->id;
                }

                if (!empty($row['category_name'])) {
                    $category = Category::forUser($user->id)
                        ->where('name', $row['category_name'])
                        ->first();

                    if (!$category) {
                        DB::rollBack();

                        return response()->json([
                            'message' => 'Categoria não encontrada para o nome informado na linha ' . ($index + 2) . ': ' . $row['category_name'],
                        ], 422);
                    }

                    $categoryId = $category->id;
                }

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

                $this->faturaService->createForUser($user, $data);
                $importedCount++;
            }

            DB::commit();

            return response()->json([
                'message' => 'Importação concluída.',
                'imported_count' => $importedCount,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Erro ao importar faturas.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $bankUserId = $request->input('bank_user_id');
        $categoryId = $request->input('category_id');
        $selectedBankUser = null;

        if ($request->filled('bank_user_id')) {
            $bankUser = BankUser::findOrFail($bankUserId);
            $selectedBankUser = $bankUser;

            if ($bankUser->user_id !== $user->id) {
                if ($request->wantsJson()) {
                    return response()->json(['message' => 'Não autorizado.'], 403);
                }

                abort(403, 'Não autorizado.');
            }
        }

        $filters = [
            'bank_user_id' => $bankUserId,
            'category_id' => $categoryId,
        ];

        $baseQuery = Fatura::with(['bankUser.bank', 'user', 'category'])
            ->forUser($user->id)
            ->filter($filters)
            ->orderBy('created_at', 'desc');

        if ($request->wantsJson()) {
            $paginated = $baseQuery->paginate(15);
            return response()->json($paginated);
        }

        // Para a página de faturas, consideramos todas as compras no crédito,
        // inclusive as já pagas, para permitir histórico completo.
        $allFaturas = (clone $baseQuery)
            ->where('type', 'credit')
            ->get();

        $paidQuery = Paid::where('user_id', $user->id);

        if ($request->has('bank_user_id')) {
            if (is_null($bankUserId)) {
                $paidQuery->whereNull('bank_user_id');
            } else {
                $paidQuery->where('bank_user_id', $bankUserId);
            }
        }

        $paidByMonth = $paidQuery
            ->pluck('total_paid', 'month_key');

        $monthlyGroups = $this->faturaService->groupFaturasByMonth($allFaturas, $paidByMonth);

        $currentMonthKey = $this->faturaService->resolveCurrentBillingMonthKey($selectedBankUser, $paidByMonth);

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
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Fatura', [
            'monthlyGroups' => $monthlyGroups,
            'bankAccounts' => $bankAccounts,
            'currentMonthKey' => $effectiveMonthKey,
            'filters' => [
                'bank_user_id' => $request->input('bank_user_id'),
                'category_id' => $request->input('category_id'),
            ],
            'categories' => $categories,
        ]);
    }

    protected function resolveInstallmentNumberForMonth(Fatura $fatura, string $yearMonth): ?int
    {
        return $this->faturaService->resolveInstallmentNumberForMonth($fatura, $yearMonth);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $fatura = Fatura::with(['bankUser.bank', 'user'])->findOrFail($id);

        if ($response = $this->ensureFaturaBelongsToUser($fatura, $user->id)) {
            return $response;
        }

        return response()->json($fatura);
    }

    public function store(FaturaStoreRequest $request)
    {
        $user = $request->user();
        $data = $this->normalizeInsertData($request->validated());

        if (!empty($data['bank_user_id'])) {
            $bankUser = BankUser::with('bank')->findOrFail($data['bank_user_id']);
            if ($response = $this->ensureBankUserBelongsToUser($bankUser, $user->id, 422)) {
                return $response;
            }
        }

        try {
            $fatura = $this->faturaService->createForUser($user, $data);
            $fatura->load(['bankUser.bank', 'user']);
            return response()->json($fatura, 201);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Erro ao criar fatura', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(FaturaUpdateRequest $request, $id)
    {
        $user = $request->user();
        $fatura = Fatura::findOrFail($id);

        if ($response = $this->ensureFaturaBelongsToUser($fatura, $user->id)) {
            return $response;
        }

        $data = $this->normalizeInsertData($request->validated());

        if (array_key_exists('bank_user_id', $data) && !empty($data['bank_user_id'])) {
            $bankUser = BankUser::findOrFail($data['bank_user_id']);
            if ($response = $this->ensureBankUserBelongsToUser($bankUser, $user->id, 422)) {
                return $response;
            }
        }

        try {
            $fatura = $this->faturaService->updateForUser($fatura, $data);
            $fatura->load(['bankUser.bank', 'user']);
            return response()->json($fatura);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Erro ao atualizar fatura', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $fatura = Fatura::findOrFail($id);

        if ($response = $this->ensureFaturaBelongsToUser($fatura, $user->id)) {
            return $response;
        }

        $fatura->delete();
        return response()->json(['message' => 'Fatura removida.']);
    }

    public function restore(Request $request, $id)
    {
        $user = $request->user();
        $fatura = Fatura::withTrashed()->findOrFail($id);

        if ($response = $this->ensureFaturaBelongsToUser($fatura, $user->id)) {
            return $response;
        }

        if ($fatura->trashed()) {
            $fatura->restore();
            return response()->json(['message' => 'Fatura restaurada.', 'fatura' => $fatura]);
        }

        return response()->json(['message' => 'Fatura não está removida.'], 400);
    }

    public function payMonth(PayMonthRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();
        $bankUserId = $data['bank_user_id'] ?? null;

        if ($bankUserId) {
            $bankUser = BankUser::findOrFail($bankUserId);
            if ($response = $this->ensureBankUserBelongsToUser($bankUser, $user->id, 403)) {
                return $response;
            }
        }

        $query = Fatura::with('bankUser')
            ->forUser($user->id)
            ->forBankUser($bankUserId)
            ->notStatus('paid');

        $allFaturas = $query->get();

        $targetMonth = Carbon::createFromFormat('Y-m', $data['month'])->startOfMonth();

        $faturas = $allFaturas->filter(function (Fatura $fatura) use ($targetMonth) {
            return $this->faturaService->faturaAppliesToMonth($fatura, $targetMonth);
        });

        if ($faturas->isEmpty()) {
            return response()->json(['message' => 'Nenhuma fatura pendente para este mês.'], 200);
        }

        DB::beginTransaction();
        try {
            $totalPaidThisRun = 0;

            foreach ($faturas as $fatura) {
                $totalPaidThisRun += $this->faturaService->applyPaymentForMonth($fatura);
                $fatura->save();
            }

            if ($totalPaidThisRun > 0) {
                $monthKey = $data['month'];

                $paid = Paid::firstOrNew([
                    'user_id' => $user->id,
                    'month_key' => $monthKey,
                    'bank_user_id' => $bankUserId,
                ]);

                $paid->total_paid = ($paid->total_paid ?? 0) + $totalPaidThisRun;
                $paid->paid_at = now()->toDateString();
                $paid->save();
            }

            DB::commit();

            return response()->json([
                'message' => 'Pagamentos registrados com sucesso.',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Erro ao registrar pagamentos do mês.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function stats(Request $request)
    {
        $user = $request->user();
        $bankUserId = $request->input('bank_user_id');
        $categoryId = $request->input('category_id');
        $selectedBankUser = null;

        if ($request->filled('bank_user_id')) {
            $selectedBankUser = BankUser::findOrFail($bankUserId);

            if ($response = $this->ensureBankUserBelongsToUser($selectedBankUser, $user->id, 403)) {
                return $response;
            }
        }

        $base = Fatura::forUser($user->id)
            ->forBankUser($bankUserId)
            ->when($categoryId, function ($q, $categoryId) {
                $q->where('category_id', $categoryId);
            });

        $stats = $this->faturaService->calculateBaseStats($base);

        $today = Carbon::today();
        $monthStart = $today->copy()->startOfMonth();
        $monthEnd = $today->copy()->endOfMonth();

        // Monthly income vs expenses (last 6 months) for dashboard charts
        $seriesStart = $today->copy()->subMonths(5)->startOfMonth();

        $seriesEntries = (clone $base)
            ->whereBetween('created_at', [$seriesStart, $monthEnd])
            ->get();

        $monthlySummary = $seriesEntries
            ->groupBy(function (Fatura $fatura) {
                return $fatura->created_at instanceof Carbon
                    ? $fatura->created_at->format('Y-m')
                    : Carbon::parse($fatura->created_at)->format('Y-m');
            })
            ->map(function ($items, $yearMonth) {
                $carbon = Carbon::createFromFormat('Y-m', $yearMonth)->startOfMonth();

                $incomePaid = $items
                    ->where('type', 'credit')
                    ->where('status', 'paid')
                    ->sum('amount');

                $expensesPaid = $items
                    ->where('type', 'debit')
                    ->where('status', 'paid')
                    ->sum('amount');

                return [
                    'month_key' => $yearMonth,
                    'month_label' => ucfirst($carbon->translatedFormat('M Y')),
                    'income_paid' => (float) $incomePaid,
                    'expenses_paid' => (float) $expensesPaid,
                ];
            })
            ->sortBy('month_key')
            ->values()
            ->all();

        // Top spending categories in the current month (paid debits)
        $currentMonthPaidDebits = (clone $base)
            ->with('category')
            ->where('type', 'debit')
            ->where('status', 'paid')
            ->whereBetween('created_at', [$monthStart, $monthEnd])
            ->get();

        $topSpendingCategories = $currentMonthPaidDebits
            ->groupBy('category_id')
            ->map(function ($items) {
                /** @var Fatura|null $first */
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

        $paidQuery = Paid::where('user_id', $user->id);

        if ($request->has('bank_user_id')) {
            if (is_null($bankUserId)) {
                $paidQuery->whereNull('bank_user_id');
            } else {
                $paidQuery->where('bank_user_id', $bankUserId);
            }
        }

        $paidByMonth = $paidQuery
            ->pluck('total_paid', 'month_key');

        $monthlyGroups = $this->faturaService->groupFaturasByMonth($allFaturas, $paidByMonth);

        $currentMonthKey = $this->faturaService->resolveCurrentBillingMonthKey($selectedBankUser, $paidByMonth);

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

        $currentPendingBill = 0.0;
        $currentMonthLabel = null;
        $effectiveMonthKey = $currentMonthKey;

        if ($effectiveGroup && !($effectiveGroup['is_paid'] ?? false)) {
            $currentMonthLabel = $effectiveGroup['month_label'] ?? null;
            $effectiveMonthKey = $effectiveGroup['month_key'] ?? $currentMonthKey;

            foreach ($effectiveGroup['items'] as $item) {
                $totalInstallments = max((int) ($item['total_installments'] ?? 1), 1);
                $amount = (float) ($item['amount'] ?? 0);
                $currentPendingBill += $amount / $totalInstallments;
            }
        }

        $stats['current_month_key'] = $effectiveMonthKey;
        $stats['current_month_label'] = $currentMonthLabel;
        $stats['current_month_pending_bill'] = (float) $currentPendingBill;
        $stats['current_month_debit_total'] = (float) $currentMonthDebitTotal;
        $stats['monthly_summary'] = $monthlySummary;
        $stats['top_spending_categories'] = $topSpendingCategories;

        return response()->json($stats);
    }

    protected function ensureFaturaBelongsToUser(Fatura $fatura, int $userId)
    {
        if ($fatura->user_id !== $userId) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        return null;
    }

    protected function ensureBankUserBelongsToUser(BankUser $bankUser, int $userId, int $statusCode = 403)
    {
        if ($bankUser->user_id !== $userId) {
            return response()->json([
                'message' => 'A associação banco-usuário não pertence ao usuário autenticado.',
            ], $statusCode);
        }

        return null;
    }

}

