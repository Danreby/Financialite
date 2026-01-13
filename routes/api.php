<?php

use App\Http\Controllers\TransacaoController;
use App\Http\Controllers\BankController;
use App\Http\Controllers\BankUserController;
use App\Http\Controllers\CategoryController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // Rotas de Bancos
    Route::apiResource('banks', BankController::class);

    // Rotas de Associações Banco-Usuário
    Route::apiResource('bank-users', BankUserController::class);
    Route::get('bank-users/stats', [BankUserController::class, 'stats'])->name('bank-users.stats');

    // Rotas de Transações
    Route::apiResource('transacoes', TransacaoController::class);
    Route::get('transacoes/stats', [TransacaoController::class, 'stats'])->name('transacoes.stats');
    Route::post('transacoes/{id}/restore', [TransacaoController::class, 'restore'])->name('transacoes.restore');

    // (Rotas de categorias foram movidas para as rotas web autenticadas em routes/Fatura.php)
});
