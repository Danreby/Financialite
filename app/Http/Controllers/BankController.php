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
}
