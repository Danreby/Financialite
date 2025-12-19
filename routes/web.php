<?php

use App\Http\Controllers\FaturaController;
use App\Http\Controllers\BankController;
use App\Http\Controllers\BankUserController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    // ============ Profile Routes ============
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ============ Page Routes (Inertia) ============
    Route::get('/accounts', function () {
        return Inertia::render('Accounts/Index');
    })->name('accounts.index');

    Route::get('/faturas', function () {
        return Inertia::render('Faturas/Index');
    })->name('faturas.index');

    Route::get('/transactions', function () {
        return Inertia::render('Transactions/Index');
    })->name('transactions.index');

    Route::get('/reports', function () {
        return Inertia::render('Reports/Index');
    })->name('reports.index');

    Route::get('/settings', function () {
        return Inertia::render('Settings/Index');
    })->name('settings');

    // ============ API Routes (JSON) ============
    
    // Bancos
    Route::get('/api/banks', [BankController::class, 'index'])->name('api.banks.index');
    Route::post('/api/banks', [BankController::class, 'store'])->name('api.banks.store');
    Route::get('/api/banks/{id}', [BankController::class, 'show'])->name('api.banks.show');
    Route::put('/api/banks/{id}', [BankController::class, 'update'])->name('api.banks.update');
    Route::delete('/api/banks/{id}', [BankController::class, 'destroy'])->name('api.banks.destroy');

    // Associações Banco-Usuário
    Route::get('/api/bank-users', [BankUserController::class, 'index'])->name('api.bank-users.index');
    Route::post('/api/bank-users', [BankUserController::class, 'store'])->name('api.bank-users.store');
    Route::get('/api/bank-users/{id}', [BankUserController::class, 'show'])->name('api.bank-users.show');
    Route::delete('/api/bank-users/{id}', [BankUserController::class, 'destroy'])->name('api.bank-users.destroy');
    Route::get('/api/bank-users/stats', [BankUserController::class, 'stats'])->name('api.bank-users.stats')->withoutMiddleware(['web']);

    // Faturas
    Route::get('/api/faturas', [FaturaController::class, 'index'])->name('api.faturas.index');
    Route::post('/api/faturas', [FaturaController::class, 'store'])->name('api.faturas.store');
    Route::get('/api/faturas/filter', [FaturaController::class, 'filter'])->name('api.faturas.filter');
    Route::get('/api/faturas/stats', [FaturaController::class, 'stats'])->name('api.faturas.stats')->withoutMiddleware(['web']);
    Route::get('/api/faturas/{id}', [FaturaController::class, 'show'])->name('api.faturas.show');
    Route::put('/api/faturas/{id}', [FaturaController::class, 'update'])->name('api.faturas.update');
    Route::delete('/api/faturas/{id}', [FaturaController::class, 'destroy'])->name('api.faturas.destroy');
    Route::post('/api/faturas/{id}/restore', [FaturaController::class, 'restore'])->name('api.faturas.restore');
});

require __DIR__.'/auth.php';
