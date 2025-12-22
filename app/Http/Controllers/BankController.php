<?php

namespace App\Http\Controllers;

use App\Models\Bank;
use App\Models\BankUser;
use Illuminate\Http\Request;

class BankController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Lista todos os bancos do usuário autenticado
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $banks = $user->banks()
            ->orderBy('name')
            ->paginate(20);
            
        return response()->json($banks);
    }

    /**
     * Retorna um banco específico do usuário autenticado
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        
        $bank = $user->banks()->findOrFail($id);
        
        return response()->json($bank);
    }

    /**
     * Cria um novo banco e associa ao usuário
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:banks,name',
            'due_day' => 'nullable|integer|min:1|max:31',
        ]);

        $bank = Bank::create($data);
        
        // Associar banco ao usuário
        BankUser::create([
            'bank_id' => $bank->id,
            'user_id' => $user->id,
        ]);
        
        return response()->json($bank, 201);
    }

    /**
     * Atualiza um banco do usuário autenticado
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        
        $bank = $user->banks()->findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:255|unique:banks,name,' . $bank->id,
            'due_day' => 'nullable|integer|min:1|max:31',
        ]);

        $bank->update($data);
        
        return response()->json($bank);
    }

    /**
     * Remove um banco e desassocia do usuário
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        
        $bank = $user->banks()->findOrFail($id);
        
        // Remover associação
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

    /**
     * Atualiza apenas o dia de vencimento (due_day) do banco associado a uma conta do usuário.
     */
    public function updateDueDay(Request $request, BankUser $bankUser)
    {
        $user = $request->user();

        if ($bankUser->user_id !== $user->id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $data = $request->validate([
            'due_day' => 'required|integer|min:1|max:31',
        ]);

        // Atualiza o dia de vencimento diretamente na associação bank_user
        $bankUser->due_day = $data['due_day'];
        $bankUser->save();

        return response()->json([
            'message' => 'Dia de vencimento atualizado com sucesso.',
            'bank_user_id' => $bankUser->id,
            'due_day' => $data['due_day'],
        ]);
    }

    public function attachToUser(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'bank_id' => 'required|exists:banks,id',
            'due_day' => 'nullable|integer|min:1|max:31',
        ]);

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
