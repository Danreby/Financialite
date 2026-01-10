<?php

namespace App\Http\Controllers;

use App\Http\Requests\BankUser\BankUserStoreRequest;
use App\Models\Bank;
use App\Models\BankUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BankUserController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $bankUsers = BankUser::with('bank')
            ->forUser($user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($bankUsers);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();

        $bankUser = BankUser::with('bank')
            ->forUser($user->id)
            ->findOrFail($id);

        return response()->json($bankUser);
    }

    public function store(BankUserStoreRequest $request)
    {
        $user = $request->user();

        $data = $this->normalizeInsertData($request->validated());

        $existing = BankUser::forUser($user->id)
            ->where('bank_id', $data['bank_id'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Este banco já está associado ao usuário.'], 422);
        }

        $bankUser = DB::transaction(function () use ($data, $user) {
            return BankUser::create([
                'user_id' => $user->id,
                'bank_id' => $data['bank_id'],
            ]);
        });

        $bankUser->load('bank');

        return response()->json($bankUser, 201);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $bankUser = BankUser::forUser($user->id)->findOrFail($id);

        DB::transaction(function () use ($bankUser) {
            $bankUser->delete();
        });

        return response()->json(['message' => 'Banco desassociado do usuário.']);
    }

    public function stats(Request $request)
    {
        $user = $request->user();

        $stats = BankUser::with('bank')
            ->forUser($user->id)
            ->get()
            ->map(function ($bankUser) {
                return [
                    'bank_user_id' => $bankUser->id,
                    'bank_id' => $bankUser->bank_id,
                    'bank_name' => $bankUser->bank->name,
                    'total_faturas' => $bankUser->faturas()->count(),
                    'paid_faturas' => $bankUser->faturas()->where('status', 'paid')->count(),
                    'unpaid_faturas' => $bankUser->faturas()->where('status', 'unpaid')->count(),
                    'overdue_faturas' => $bankUser->faturas()->where('status', 'overdue')->count(),
                    'total_amount' => $bankUser->faturas()->sum('amount'),
                    'income_amount' => $bankUser->faturas()->where('type', 'credit')->sum('amount'),
                    'expense_amount' => $bankUser->faturas()->where('type', 'debit')->sum('amount'),
                ];
            });

        return response()->json($stats);
    }
}
