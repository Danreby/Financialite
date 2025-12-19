<?php

use App\Http\Controllers\FaturaController;
use App\Http\Controllers\BankController;
use App\Http\Controllers\BankUserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // Rotas de Bancos
    Route::apiResource('banks', BankController::class);

    // Rotas de Associações Banco-Usuário
    Route::apiResource('bank-users', BankUserController::class);
    Route::get('bank-users/stats', [BankUserController::class, 'stats'])->name('bank-users.stats');

    // Rotas de Faturas
    Route::apiResource('faturas', FaturaController::class);
    Route::get('faturas/filter', [FaturaController::class, 'filter'])->name('faturas.filter');
    Route::get('faturas/stats', [FaturaController::class, 'stats'])->name('faturas.stats');
    Route::post('faturas/{id}/restore', [FaturaController::class, 'restore'])->name('faturas.restore');
});
