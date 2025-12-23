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

        $monthlyGroups = $this->faturaService->groupFaturasByMonth($allFaturas, $paidByMonth);

        $currentMonthKey = $this->faturaService->resolveCurrentBillingMonthKey($selectedBankUser, $paidByMonth);

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

        $categories = Category::where('user_id', $user->id)
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
        $data = $request->validated();

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

        $data = $request->validated();

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
            $totalInstallments = max((int) ($fatura->total_installments ?? 1), 1);

            $firstBillingMonthKey = $this->faturaService->resolveBillingMonthKey($fatura);
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

        $stats = $this->faturaService->calculateBaseStats($base);

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

        $monthlyGroups = $this->faturaService->groupFaturasByMonth($allFaturas, $paidByMonth);

        $currentMonthKey = $this->faturaService->resolveCurrentBillingMonthKey($selectedBankUser, $paidByMonth);

        $currentGroup = collect($monthlyGroups)->firstWhere('month_key', $currentMonthKey);

        $currentPendingBill = 0.0;
        $currentMonthLabel = null;

        if ($currentGroup && !($currentGroup['is_paid'] ?? false)) {
            $currentMonthLabel = $currentGroup['month_label'] ?? null;

            foreach ($currentGroup['items'] as $item) {
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

}

