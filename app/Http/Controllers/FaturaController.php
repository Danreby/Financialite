<?php

namespace App\Http\Controllers;

use App\Models\Fatura;
use App\Models\BankUser;
use App\Models\Paid;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Carbon\Carbon;

class FaturaController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
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

        $allFaturas = $baseQuery->get();

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

        $monthlyGroups = $this->groupFaturasByMonth($allFaturas, $paidByMonth);

        $currentMonthKey = $this->resolveCurrentBillingMonthKey($selectedBankUser, $paidByMonth);

        $bankAccounts = BankUser::with('bank')
            ->where('user_id', $user->id)
            ->get()
            ->map(function ($bankUser) {
                return [
                    'id' => $bankUser->id,
                    'name' => $bankUser->bank?->name ?? ('Conta #' . $bankUser->id),
                    'due_day' => $bankUser->due_day,
                ];
            });

        $categories = \App\Models\Category::where('user_id', $user->id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Fatura', [
            'monthlyGroups' => $monthlyGroups,
            'bankAccounts' => $bankAccounts,
            'currentMonthKey' => $currentMonthKey,
            'filters' => [
                'bank_user_id' => $request->input('bank_user_id'),
                'category_id' => $request->input('category_id'),
            ],
            'categories' => $categories,
        ]);
    }

    protected function groupFaturasByMonth($faturas, $paidByMonth = null)
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

    protected function resolveBillingMonthKey(Fatura $fatura): string
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

    protected function resolveCurrentBillingMonthKey(?BankUser $bankUser = null, $paidByMonth = null): string
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

    protected function resolveInstallmentNumberForMonth(Fatura $fatura, string $yearMonth): ?int
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

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $fatura = Fatura::with(['bankUser.bank', 'user'])->findOrFail($id);

        if ($response = $this->ensureFaturaBelongsToUser($fatura, $user->id)) {
            return $response;
        }

        return response()->json($fatura);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate($this->storeRulesForUser($user->id));

        if (!empty($data['bank_user_id'])) {
            $bankUser = BankUser::with('bank')->findOrFail($data['bank_user_id']);
            if ($response = $this->ensureBankUserBelongsToUser($bankUser, $user->id, 422)) {
                return $response;
            }
        }

        $data['user_id'] = $user->id;
        $data['total_installments'] = max($data['total_installments'] ?? 1, 1);
        $data['current_installment'] = 0;
        $data['status'] = $data['status'] ?? 'unpaid';
        $data['is_recurring'] = $data['is_recurring'] ?? false;

        DB::beginTransaction();
        try {
            $fatura = Fatura::create($data);
            DB::commit();
            $fatura->load(['bankUser.bank', 'user']);
            return response()->json($fatura, 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erro ao criar fatura', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $fatura = Fatura::findOrFail($id);

        if ($response = $this->ensureFaturaBelongsToUser($fatura, $user->id)) {
            return $response;
        }

        $data = $request->validate($this->updateRulesForUser($user->id));

        if (array_key_exists('bank_user_id', $data) && !empty($data['bank_user_id'])) {
            $bankUser = BankUser::findOrFail($data['bank_user_id']);
            if ($response = $this->ensureBankUserBelongsToUser($bankUser, $user->id, 422)) {
                return $response;
            }
        }

        DB::beginTransaction();
        try {
            $fatura->update($data);
            DB::commit();
            $fatura->refresh()->load(['bankUser.bank', 'user']);
            return response()->json($fatura);
        } catch (\Throwable $e) {
            DB::rollBack();
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

    public function payMonth(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'month' => 'required|date_format:Y-m',
            'bank_user_id' => 'nullable|exists:bank_user,id',
        ]);

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
            $totalInstallments = max((int) ($fatura->total_installments ?? 1), 1);

            $firstBillingMonthKey = $this->resolveBillingMonthKey($fatura);
            $first = Carbon::createFromFormat('Y-m', $firstBillingMonthKey)->startOfMonth();
            $last = (clone $first)->addMonths($totalInstallments - 1);

            return !$targetMonth->lt($first) && !$targetMonth->gt($last);
        });

        if ($faturas->isEmpty()) {
            return response()->json(['message' => 'Nenhuma fatura pendente para este mês.'], 200);
        }

        DB::beginTransaction();
        try {
            $totalPaidThisRun = 0;

            foreach ($faturas as $fatura) {
                $totalInstallments = max((int) $fatura->total_installments, 1);
                $currentInstallment = max((int) ($fatura->current_installment ?? 0), 0);

                $installmentAmount = (float) $fatura->amount / $totalInstallments;

                if ($totalInstallments <= 1) {
                    $fatura->status = 'paid';
                    $fatura->paid_date = now()->toDateString();
                    $totalPaidThisRun += (float) $fatura->amount;
                } else {
                    if ($currentInstallment < $totalInstallments) {
                        $currentInstallment++;
                        $fatura->current_installment = $currentInstallment;
                        $totalPaidThisRun += $installmentAmount;
                    }

                    if ($currentInstallment >= $totalInstallments) {
                        $fatura->status = 'paid';
                        $fatura->paid_date = now()->toDateString();
                    }
                }

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
        $selectedBankUser = null;

        if ($request->filled('bank_user_id')) {
            $selectedBankUser = BankUser::findOrFail($bankUserId);

            if ($response = $this->ensureBankUserBelongsToUser($selectedBankUser, $user->id, 403)) {
                return $response;
            }
        }

        $base = Fatura::forUser($user->id)
            ->forBankUser($bankUserId);

        $stats = $this->calculateBaseStats($base);

        $allFaturas = Fatura::with('bankUser')
            ->forUser($user->id)
            ->forBankUser($bankUserId)
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

        $monthlyGroups = $this->groupFaturasByMonth($allFaturas, $paidByMonth);

        $currentMonthKey = $this->resolveCurrentBillingMonthKey($selectedBankUser, $paidByMonth);

        $currentGroup = collect($monthlyGroups)->firstWhere('month_key', $currentMonthKey);

        $currentPendingBill = 0.0;
        $currentMonthLabel = null;

        if ($currentGroup && !($currentGroup['is_paid'] ?? false)) {
            $currentMonthLabel = $currentGroup['month_label'] ?? null;

            foreach ($currentGroup['items'] as $item) {
                if (($item['type'] ?? null) !== 'debit') {
                    continue;
                }

                $totalInstallments = max((int) ($item['total_installments'] ?? 1), 1);
                $amount = (float) ($item['amount'] ?? 0);
                $currentPendingBill += $amount / $totalInstallments;
            }
        }

        $stats['current_month_key'] = $currentMonthKey;
        $stats['current_month_label'] = $currentMonthLabel;
        $stats['current_month_pending_bill'] = (float) $currentPendingBill;

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

    protected function storeRulesForUser(int $userId): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric',
            'type' => ['required', Rule::in(['credit','debit'])],
            'status' => ['nullable', Rule::in(['paid','unpaid','overdue'])],
            'paid_date' => 'nullable|date',
            'total_installments' => 'nullable|integer|min:1',
            'current_installment' => 'nullable|integer|min:1',
            'is_recurring' => 'sometimes|boolean',
            'bank_user_id' => 'nullable|exists:bank_user,id',
            'category_id' => [
                'nullable',
                Rule::exists('categories', 'id')->where(function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                }),
            ],
        ];
    }

    protected function updateRulesForUser(int $userId): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'sometimes|required|numeric|min:0.01',
            'type' => ['sometimes', 'required', Rule::in(['credit', 'debit'])],
            'status' => ['nullable', Rule::in(['paid', 'unpaid', 'overdue'])],
            'paid_date' => 'nullable|date',
            'total_installments' => 'nullable|integer|min:1',
            'current_installment' => 'nullable|integer|min:1',
            'is_recurring' => 'sometimes|boolean',
            'bank_user_id' => 'nullable|exists:bank_user,id',
            'category_id' => [
                'nullable',
                Rule::exists('categories', 'id')->where(function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                }),
            ],
        ];
    }

    protected function calculateBaseStats($base): array
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
}

