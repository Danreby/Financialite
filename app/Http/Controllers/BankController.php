<?php

namespace App\Http\Controllers;

use App\Http\Requests\Bank\AttachBankToUserRequest;
use App\Http\Requests\Bank\BankStoreRequest;
use App\Http\Requests\Bank\BankUpdateRequest;
use App\Http\Requests\Bank\UpdateBankDueDayRequest;
use App\Models\Bank;
use App\Models\BankUser;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class BankController extends Controller
{
    public function __construct(private NotificationService $notifications)
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $user = $request->user();
        
        $banks = Bank::forUser($user->id)
            ->ordered()
            ->paginate(20);
            
        return response()->json($banks);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        
        $bank = Bank::forUser($user->id)->findOrFail($id);
        
        return response()->json($bank);
    }

    public function store(BankStoreRequest $request)
    {
        $user = $request->user();
        
        $data = $this->normalizeInsertData($request->validated());

        $bank = Bank::create($data);

        BankUser::create([
            'bank_id' => $bank->id,
            'user_id' => $user->id,
        ]);

        $this->notifications->info($user, 'Banco adicionado', 'Um novo banco foi vinculado à sua conta.');

        return response()->json($bank, 201);
    }

    public function update(BankUpdateRequest $request, $id)
    {
        $user = $request->user();
        
        $bank = Bank::forUser($user->id)->findOrFail($id);

        $data = $request->validated();

        $bank->update($data);

        $this->notifications->info($user, 'Banco atualizado', 'As informações do banco foram atualizadas.');

        return response()->json($bank);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        
        $bank = $user->banks()->findOrFail($id);
        
        BankUser::forUser($user->id)
            ->forBank($bank->id)
            ->delete();

        $this->notifications->info($user, 'Banco removido', 'Um banco foi desvinculado da sua conta.');

        return response()->json(['message' => 'Banco removido.']);
    }

    public function list(Request $request)
    {
        $banks = Bank::ordered()->get(['id', 'name']);
        return response()->json($banks);
    }

    public function updateDueDay(UpdateBankDueDayRequest $request, BankUser $bankUser)
    {
        $user = $request->user();

        if (!$bankUser->belongsToUser($user->id)) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $data = $request->validated();

        $bankUser->due_day = $data['due_day'];
        $bankUser->save();

        $this->notifications->info($user, 'Vencimento atualizado', 'O dia de vencimento da fatura foi atualizado.');

        return response()->json([
            'message' => 'Dia de vencimento atualizado com sucesso.',
            'bank_user_id' => $bankUser->id,
            'due_day' => $data['due_day'],
        ]);
    }

    public function attachToUser(AttachBankToUserRequest $request)
    {
        $user = $request->user();

        $data = $this->normalizeInsertData($request->validated());

        $exists = BankUser::forUser($user->id)
            ->forBank($data['bank_id'])
            ->first();

        if ($exists) {
            $this->notifications->warning($user, 'Banco já vinculado', 'Tentativa de vincular um banco que já está associado à sua conta.');

            return response()->json([
                'already_attached' => true,
                'message' => 'Este banco já está vinculado ao usuário.',
                'bank_user' => $exists->load('bank'),
            ], 200);
        }

        $bankUser = BankUser::create([
            'user_id' => $user->id,
            'bank_id' => $data['bank_id'],
            'due_day' => $data['due_day'] ?? null,
        ]);

        $this->notifications->info($user, 'Conta vinculada', 'Uma conta de banco foi vinculada com sucesso.');

        return response()->json($bankUser->load('bank'), 201);
    }
}
