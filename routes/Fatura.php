<?php

use App\Http\Controllers\TransacaoController;
use App\Http\Controllers\CategoryController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
	Route::prefix('transacoes')->name('transacoes.')->group(function () {
		Route::get('/', [TransacaoController::class, 'index'])->name('index');
		// Rotas "estáticas" precisam vir antes da rota dinâmica /{id}
		Route::get('/stats', [TransacaoController::class, 'stats'])->name('stats');
		Route::get('/export-data', [TransacaoController::class, 'exportData'])->name('export_data');
		Route::post('/import', [TransacaoController::class, 'import'])->name('import');
		Route::post('/pay-month', [TransacaoController::class, 'payMonth'])->name('pay_month');
		Route::post('/{id}/restore', [TransacaoController::class, 'restore'])->name('restore');
		Route::get('/{id}', [TransacaoController::class, 'show'])->name('show');
		Route::post('/', [TransacaoController::class, 'store'])->name('store');
		Route::match(['put', 'patch'], '/{id}', [TransacaoController::class, 'update'])->name('update');
		Route::delete('/{id}', [TransacaoController::class, 'destroy'])->name('destroy');
	});

	Route::prefix('categories')->name('categories.')->group(function () {
		Route::post('/', [CategoryController::class, 'store'])->name('store');
		Route::match(['put', 'patch'], '/{category}', [CategoryController::class, 'update'])->name('update');
		Route::delete('/{category}', [CategoryController::class, 'destroy'])->name('destroy');
	});
});

