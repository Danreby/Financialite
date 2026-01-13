<?php

namespace App\Http\Controllers;

use App\Models\Transacao;
use App\Models\BankUser;
use App\Services\FaturaService;
use App\Services\FaturaExportService;
use App\Services\FaturaImportService;
use App\Services\FaturaDashboardService;
use App\Services\FaturaPaymentService;
use App\Services\NotificationService;
use App\Http\Requests\Fatura\FaturaStoreRequest;
use App\Http\Requests\Fatura\FaturaUpdateRequest;
use App\Http\Requests\Fatura\PayMonthRequest;
use App\Http\Requests\Fatura\FaturaImportRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use DomainException;

class TransacaoController extends Controller
{
    public function __construct(
        private FaturaService $faturaService,
        private FaturaExportService $exportService,
        private FaturaImportService $importService,
        private FaturaDashboardService $dashboardService,
        private FaturaPaymentService $paymentService,
        private NotificationService $notifications
    )
    {
        $this->middleware('auth');
    }

    public function exportData(Request $request)
    {
        $user = $request->user();
        $bankUserId = $request->input('bank_user_id');
        $categoryId = $request->input('category_id');

        $faturas = $this->exportService->exportForUser($user->id, $bankUserId, $categoryId);

        return response()->json($faturas);
    }

    public function import(FaturaImportRequest $request)
    {
        $user = $request->user();

        $rows = $request->validated()['rows'] ?? [];

        try {
            $importedCount = $this->importService->importRows($user, $rows);

            return response()->json([
                'message' => 'Importação concluída.',
                'imported_count' => $importedCount,
            ]);
        } catch (DomainException $e) {
            $this->notifications->error($user, 'Erro na importação de faturas', $e->getMessage());

            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            $this->notifications->error($user, 'Erro ao importar faturas', 'Ocorreu um erro inesperado ao importar faturas.');

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

        $dashboard = $this->dashboardService->buildDashboardData($user, $filters);

        if ($request->wantsJson()) {
            $paginated = $dashboard['base_query']->paginate(15);
            return response()->json($paginated);
        }

        return Inertia::render('Fatura', [
            'monthlyGroups' => $dashboard['monthly_groups'],
            'bankAccounts' => $dashboard['bank_accounts'],
            'currentMonthKey' => $dashboard['current_month_key'],
            'filters' => [
                'bank_user_id' => $request->input('bank_user_id'),
                'category_id' => $request->input('category_id'),
            ],
            'categories' => $dashboard['categories'],
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $fatura = Transacao::with(['bankUser.bank', 'user'])->findOrFail($id);

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
            $this->notifications->error($user, 'Erro ao criar fatura', 'Ocorreu um erro inesperado ao criar uma fatura.');

            return response()->json(['message' => 'Erro ao criar fatura', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(FaturaUpdateRequest $request, $id)
    {
        $user = $request->user();
        $fatura = Transacao::findOrFail($id);

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
            $this->notifications->error($user, 'Erro ao atualizar fatura', 'Ocorreu um erro inesperado ao atualizar uma fatura.');

            return response()->json(['message' => 'Erro ao atualizar fatura', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $fatura = Transacao::findOrFail($id);

        if ($response = $this->ensureFaturaBelongsToUser($fatura, $user->id)) {
            return $response;
        }

        $fatura->delete();
        return response()->json(['message' => 'Fatura removida.']);
    }

    public function restore(Request $request, $id)
    {
        $user = $request->user();
        $fatura = Transacao::withTrashed()->findOrFail($id);

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
        $bankUser = null;

        if ($bankUserId) {
            $bankUser = BankUser::findOrFail($bankUserId);
            if ($response = $this->ensureBankUserBelongsToUser($bankUser, $user->id, 403)) {
                return $response;
            }
        }

        try {
            $totalPaidThisRun = $this->paymentService->payMonthForUser($user, $data['month'], $bankUser ?? null);

            if ($totalPaidThisRun <= 0) {
                return response()->json(['message' => 'Nenhuma fatura pendente para este mês.'], 200);
            }

            $this->notifications->info($user, 'Pagamentos do mês', 'Pagamentos registrados com sucesso para o mês selecionado.');

            return response()->json([
                'message' => 'Pagamentos registrados com sucesso.',
            ]);
        } catch (\Throwable $e) {
            $this->notifications->error($user, 'Erro ao registrar pagamentos', 'Ocorreu um erro inesperado ao registrar os pagamentos do mês.');

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
        if ($request->filled('bank_user_id')) {
            $selectedBankUser = BankUser::findOrFail($bankUserId);

            if ($response = $this->ensureBankUserBelongsToUser($selectedBankUser, $user->id, 403)) {
                return $response;
            }
        }

        $stats = $this->dashboardService->buildStats(
            $user,
            $bankUserId,
            $categoryId,
            $request->has('bank_user_id')
        );

        return response()->json($stats);
    }

    protected function ensureFaturaBelongsToUser(Transacao $fatura, int $userId)
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

    private function normalizeInsertData(array $data): array
    {
        return $data;
    }
}
