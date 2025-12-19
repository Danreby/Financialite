<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BankController;
use App\Http\Controllers\FaturaController;
use App\Models\BankUser;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::get('/dashboard', function () {
    $user = request()->user();

    $bankAccounts = BankUser::with('bank')
        ->where('user_id', $user->id)
        ->get()
        ->map(function ($bankUser) {
            return [
                'id' => $bankUser->id,
                'name' => $bankUser->bank?->name ?? ('Conta #' . $bankUser->id),
            ];
        });

    return Inertia::render('Dashboard', [
        'bankAccounts' => $bankAccounts,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/accounts', function () {
        return Inertia::render('Accounts/Index');
    })->name('accounts.index');

    Route::get('/transactions', function () {
        return Inertia::render('Transactions/Index');
    })->name('transactions.index');

    Route::get('/reports', function () {
        return Inertia::render('Reports/Index');
    })->name('reports.index');

    Route::get('/settings', function () {
        return Inertia::render('Settings/Index');
    })->name('settings');

    Route::get('/banks/list', [BankController::class, 'list'])->name('banks.list');
    Route::post('/banks/attach', [BankController::class, 'attachToUser'])->name('banks.attach');
});

require __DIR__.'/Fatura.php';

require __DIR__.'/auth.php';
