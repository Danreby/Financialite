<?php

namespace App\Http\Controllers;

use App\Models\Fatura;
use App\Models\BankUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class FaturaController extends Controller
{
    public function __construct()
    {
        // somente autenticação — sem roles/permissions
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $faturas = Fatura::with(['bankUser.bank', 'user'])
            ->where('user_id', $user->id)
            ->orderBy('due_date', 'desc')
            ->paginate(15);

        return response()->json($faturas);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $fatura = Fatura::with(['bankUser.bank', 'user'])->findOrFail($id);

        if ($fatura->user_id !== $user->id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        return response()->json($fatura);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric',
            'due_date' => 'required|date',
            'type' => ['required', Rule::in(['credit','debit'])],
            'status' => ['nullable', Rule::in(['paid','unpaid','overdue'])],
            'paid_date' => 'nullable|date',
            'total_installments' => 'nullable|integer|min:1',
            'current_installment' => 'nullable|integer|min:1',
            'is_recurring' => 'sometimes|boolean',
            'bank_user_id' => 'nullable|exists:bank_user,id',
        ]);

        if (! empty($data['bank_user_id'])) {
            $bankUser = BankUser::findOrFail($data['bank_user_id']);
            if ($bankUser->user_id !== $user->id) {
                return response()->json(['message' => 'A associação banco-usuário não pertence ao usuário autenticado.'], 422);
            }
        }

        // força o dono como usuário autenticado (evita spoofing)
        $data['user_id'] = $user->id;

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

        if ($fatura->user_id !== $user->id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'sometimes|required|numeric',
            'due_date' => 'sometimes|required|date',
            'type' => ['sometimes','required', Rule::in(['credit','debit'])],
            'status' => ['nullable', Rule::in(['paid','unpaid','overdue'])],
            'paid_date' => 'nullable|date',
            'total_installments' => 'nullable|integer|min:1',
            'current_installment' => 'nullable|integer|min:1',
            'is_recurring' => 'sometimes|boolean',
            'bank_user_id' => 'nullable|exists:bank_user,id',
        ]);

        if (array_key_exists('bank_user_id', $data) && ! empty($data['bank_user_id'])) {
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
}
