<?php

namespace App\Http\Controllers;

use App\Models\Bank;
use Illuminate\Http\Request;

class BankController extends Controller
{
    public function __construct()
    {
        // autenticação básica — sem roles/permissions
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $banks = Bank::orderBy('name')->paginate(20);
        return response()->json($banks);
    }

    public function show(Request $request, $id)
    {
        $bank = Bank::findOrFail($id);
        return response()->json($bank);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:banks,name',
        ]);

        $bank = Bank::create($data);
        return response()->json($bank, 201);
    }

    public function update(Request $request, $id)
    {
        $bank = Bank::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:255|unique:banks,name,' . $bank->id,
        ]);

        $bank->update($data);
        return response()->json($bank);
    }

    public function destroy(Request $request, $id)
    {
        $bank = Bank::findOrFail($id);

        // se quiser evitar exclusão quando houver pivot/faturas, trate aqui
        $bank->delete();

        return response()->json(['message' => 'Banco removido.']);
    }
}
