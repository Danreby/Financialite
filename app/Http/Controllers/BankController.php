<?php

namespace App\Http\Controllers;

use App\Http\Requests\Bank\AttachBankToUserRequest;
use App\Http\Requests\Bank\BankStoreRequest;
use App\Http\Requests\Bank\BankUpdateRequest;
use App\Http\Requests\Bank\UpdateBankDueDayRequest;
use App\Models\Bank;
use App\Models\BankUser;
use Illuminate\Http\Request;

class BankController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $user = $request->user();
        
        $banks = $user->banks()
            ->orderBy('name')
            ->paginate(20);
            
        return response()->json($banks);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        
        $bank = $user->banks()->findOrFail($id);
        
        return response()->json($bank);
    }

    public function store(BankStoreRequest $request)
    {
        $user = $request->user();
        
        $data = $request->validated();

        $bank = Bank::create($data);
        
        BankUser::create([
            'bank_id' => $bank->id,
            'user_id' => $user->id,
        ]);
        
        return response()->json($bank, 201);
    }

    public function update(BankUpdateRequest $request, $id)
    {
        $user = $request->user();
        
        $bank = $user->banks()->findOrFail($id);

        $data = $request->validated();

        $bank->update($data);
        
        return response()->json($bank);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        
        $bank = $user->banks()->findOrFail($id);
        
        BankUser::where('bank_id', $bank->id)
            ->where('user_id', $user->id)
            ->delete();

        return response()->json(['message' => 'Banco removido.']);
    }

    public function list(Request $request)
    {
        $banks = Bank::orderBy('name')->get(['id', 'name']);
        return response()->json($banks);
    }

    public function updateDueDay(UpdateBankDueDayRequest $request, BankUser $bankUser)
    {
        $user = $request->user();

        if ($bankUser->user_id !== $user->id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $data = $request->validated();

        $bankUser->due_day = $data['due_day'];
        $bankUser->save();

        return response()->json([
            'message' => 'Dia de vencimento atualizado com sucesso.',
            'bank_user_id' => $bankUser->id,
            'due_day' => $data['due_day'],
        ]);
    }

    public function attachToUser(AttachBankToUserRequest $request)
    {
        $user = $request->user();

        $data = $request->validated();

        $exists = BankUser::where('user_id', $user->id)
            ->where('bank_id', $data['bank_id'])
            ->first();

        if ($exists) {
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

        return response()->json($bankUser->load('bank'), 201);
    }
}
