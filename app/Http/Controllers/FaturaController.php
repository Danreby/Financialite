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

    /**
     * Lista faturas do usuário autenticado
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $baseQuery = Fatura::with(['bankUser.bank', 'user'])
            ->where('user_id', $user->id);

        $bankUserId = $request->input('bank_user_id');

        // Filtro por conta/banco
        if ($request->filled('bank_user_id')) {
            $bankUser = BankUser::findOrFail($bankUserId);

            if ($bankUser->user_id !== $user->id) {
                if ($request->wantsJson()) {
                    return response()->json(['message' => 'Não autorizado.'], 403);
                }

                abort(403, 'Não autorizado.');
            }
            $baseQuery->where('bank_user_id', $bankUserId);
        }

        $baseQuery->orderBy('due_date', 'desc');

        // API / JSON: mantém paginação padrão
        if ($request->wantsJson()) {
            $paginated = $baseQuery->paginate(15);
            return response()->json($paginated);
        }

        // Inertia (página web): envia faturas agrupadas por mês
        $allFaturas = $baseQuery->get();

        // Buscar registros de pagamento de fatura por mês para este usuário e filtro de banco atual
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

        $bankAccounts = BankUser::with('bank')
            ->where('user_id', $user->id)
            ->get()
            ->map(function ($bankUser) {
                return [
                    'id' => $bankUser->id,
                    'name' => $bankUser->bank?->name ?? ('Conta #' . $bankUser->id),
                ];
            });

        return Inertia::render('Fatura', [
            'monthlyGroups' => $monthlyGroups,
            'bankAccounts' => $bankAccounts,
            'filters' => [
                'bank_user_id' => $request->input('bank_user_id'),
            ],
        ]);
    }

    protected function groupFaturasByMonth($faturas, $paidByMonth = null)
    {
        $grouped = $faturas->groupBy(function ($fatura) {
            $date = $fatura->due_date ?: $fatura->created_at;
            return Carbon::parse($date)->format('Y-m');
        });

        $result = $grouped->map(function ($items, $yearMonth) use ($paidByMonth) {
            $carbon = Carbon::createFromFormat('Y-m', $yearMonth)->startOfMonth();
            $label = ucfirst($carbon->translatedFormat('F Y'));

            $totalSpent = $items->sum('amount');
            // Considera o mês "pago" quando existe um registro em paids
            // para aquele usuário/mês/conta (não depende do status individual das faturas,
            // permitindo faturas recorrentes que nunca ficarão marcadas como pagas).
            $isPaid = $paidByMonth ? $paidByMonth->has($yearMonth) : false;

            return [
                'month_key' => $yearMonth,
                'month_label' => $label,
                'total_spent' => (float) $totalSpent,
                'is_paid' => $isPaid,
                'items' => $items->map(function ($fatura) {
                    return [
                        'id' => $fatura->id,
                        'title' => $fatura->title,
                        'description' => $fatura->description,
                        'amount' => (float) $fatura->amount,
                        'type' => $fatura->type,
                        'status' => $fatura->status,
                        'due_date' => $fatura->due_date,
                        'paid_date' => $fatura->paid_date,
                        'total_installments' => $fatura->total_installments,
                        'current_installment' => $fatura->current_installment,
                        'is_recurring' => (bool) $fatura->is_recurring,
                        'bank_name' => optional($fatura->bankUser->bank ?? null)->name ?? null,
                    ];
                })->values()->all(),
            ];
        });

        return $result->sortByDesc('month_key')->values()->all();
    }

    /**
     * Retorna uma fatura específica
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $fatura = Fatura::with(['bankUser.bank', 'user'])->findOrFail($id);

        if ($fatura->user_id !== $user->id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        return response()->json($fatura);
    }

    /**
     * Cria uma nova fatura
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric',
            'due_date' => 'nullable|date',
            'type' => ['required', Rule::in(['credit','debit'])],
            'status' => ['nullable', Rule::in(['paid','unpaid','overdue'])],
            'paid_date' => 'nullable|date',
            'total_installments' => 'nullable|integer|min:1',
            'current_installment' => 'nullable|integer|min:1',
            'is_recurring' => 'sometimes|boolean',
            'bank_user_id' => 'nullable|exists:bank_user,id',
        ]);

        if (!empty($data['bank_user_id'])) {
            $bankUser = BankUser::findOrFail($data['bank_user_id']);
            if ($bankUser->user_id !== $user->id) {
                return response()->json(['message' => 'A associação banco-usuário não pertence ao usuário autenticado.'], 422);
            }
        }

        $data['user_id'] = $user->id;
        // Se due_date não vier do formulário, define como hoje
        if (empty($data['due_date'])) {
            $data['due_date'] = now()->toDateString();
        }
        $data['total_installments'] = $data['total_installments'] ?? 1;
        $data['current_installment'] = $data['current_installment'] ?? 1;
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

    /**
     * Atualiza uma fatura
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $fatura = Fatura::findOrFail($id);

        if ($fatura->user_id !== $user->id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'sometimes|required|numeric|min:0.01',
            'due_date' => 'sometimes|required|date',
            'type' => ['sometimes', 'required', Rule::in(['credit', 'debit'])],
            'status' => ['nullable', Rule::in(['paid', 'unpaid', 'overdue'])],
            'paid_date' => 'nullable|date',
            'total_installments' => 'nullable|integer|min:1',
            'current_installment' => 'nullable|integer|min:1',
            'is_recurring' => 'sometimes|boolean',
            'bank_user_id' => 'nullable|exists:bank_user,id',
        ]);

        // Validar que o bank_user_id pertence ao usuário
        if (array_key_exists('bank_user_id', $data) && !empty($data['bank_user_id'])) {
            $bankUser = BankUser::findOrFail($data['bank_user_id']);
            if ($bankUser->user_id !== $user->id) {
                return response()->json(['message' => 'A associação banco-usuário não pertence ao usuário autenticado.'], 422);
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

    /**
     * Remove uma fatura (soft delete)
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $fatura = Fatura::findOrFail($id);

        if ($fatura->user_id !== $user->id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $fatura->delete();
        return response()->json(['message' => 'Fatura removida.']);
    }

    /**
     * Restaura uma fatura removida
     */
    public function restore(Request $request, $id)
    {
        $user = $request->user();
        $fatura = Fatura::withTrashed()->findOrFail($id);

        if ($fatura->user_id !== $user->id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        if ($fatura->trashed()) {
            $fatura->restore();
            return response()->json(['message' => 'Fatura restaurada.', 'fatura' => $fatura]);
        }

        return response()->json(['message' => 'Fatura não está removida.'], 400);
    }

    /**
     * Filtra faturas com base nos parâmetros fornecidos
     */
    public function filter(Request $request)
    {
        $user = $request->user();

        $query = Fatura::with(['bankUser.bank', 'user'])->where('user_id', $user->id);

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('bank_user_id')) {
            $bankUser = BankUser::findOrFail($request->input('bank_user_id'));
            if ($bankUser->user_id !== $user->id) {
                return response()->json(['message' => 'Não autorizado.'], 403);
            }
            $query->where('bank_user_id', $request->input('bank_user_id'));
        }

        if ($request->filled('due_date_from')) {
            $query->whereDate('due_date', '>=', $request->input('due_date_from'));
        }

        if ($request->filled('due_date_to')) {
            $query->whereDate('due_date', '<=', $request->input('due_date_to'));
        }

        if ($request->filled('amount_min')) {
            $query->where('amount', '>=', $request->input('amount_min'));
        }

        if ($request->filled('amount_max')) {
            $query->where('amount', '<=', $request->input('amount_max'));
        }

        if ($request->filled('is_recurring')) {
            $query->where('is_recurring', filter_var($request->input('is_recurring'), FILTER_VALIDATE_BOOLEAN));
        }

        $faturas = $query->orderBy('due_date', 'desc')->paginate(15);

        return response()->json($faturas);
    }

    /**
     * Marca como pagas as pendências de um mês específico.
     * - Para faturas sem parcelas (total_installments = 1): marca como paid diretamente.
     * - Para faturas parceladas: incrementa current_installment em 1; só marca como paid
     *   quando current_installment atingir total_installments.
     */
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
            if ($bankUser->user_id !== $user->id) {
                return response()->json(['message' => 'Não autorizado.'], 403);
            }
        }

        $startOfMonth = Carbon::createFromFormat('Y-m', $data['month'])->startOfMonth();
        $endOfMonth = (clone $startOfMonth)->endOfMonth();

        $query = Fatura::where('user_id', $user->id)
            ->whereBetween('due_date', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])
            ->where('status', '!=', 'paid');

        if ($bankUserId) {
            $query->where('bank_user_id', $bankUserId);
        }

        $faturas = $query->get();

        if ($faturas->isEmpty()) {
            return response()->json(['message' => 'Nenhuma fatura pendente para este mês.'], 200);
        }

        DB::beginTransaction();
        try {
            $totalPaidThisRun = 0;

            foreach ($faturas as $fatura) {
                $totalInstallments = max((int) $fatura->total_installments, 1);
                $currentInstallment = (int) ($fatura->current_installment ?? 1);

                // Valor de uma parcela (ou total, se sem parcelas)
                $installmentAmount = (float) $fatura->amount / $totalInstallments;

                if ($totalInstallments <= 1) {
                    // Fatura sem parcelas: pagar tudo de uma vez
                    $fatura->status = 'paid';
                    $fatura->paid_date = now()->toDateString();
                    $totalPaidThisRun += (float) $fatura->amount;
                } else {
                    // Fatura parcelada: paga apenas a próxima parcela
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

            // Atualiza/insere registro em paids para este usuário/mês/banco
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

    /**
     * Retorna estatísticas das faturas
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        $stats = [
            'total_income' => Fatura::where('user_id', $user->id)
                ->where('type', 'credit')
                ->where('status', 'paid')
                ->sum('amount'),
            'total_expenses' => Fatura::where('user_id', $user->id)
                ->where('type', 'debit')
                ->where('status', 'paid')
                ->sum('amount'),
            'pending_income' => Fatura::where('user_id', $user->id)
                ->where('type', 'credit')
                ->where('status', '!=', 'paid')
                ->sum('amount'),
            'pending_expenses' => Fatura::where('user_id', $user->id)
                ->where('type', 'debit')
                ->where('status', '!=', 'paid')
                ->sum('amount'),
            'overdue_count' => Fatura::where('user_id', $user->id)
                ->where('status', 'overdue')
                ->count(),
        ];

        return response()->json($stats);
    }
}

