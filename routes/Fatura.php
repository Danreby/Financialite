<?php

use App\Http\Controllers\FaturaController;
use App\Http\Controllers\CategoryController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
	Route::prefix('faturas')->name('faturas.')->group(function () {
		Route::get('/', [FaturaController::class, 'index'])->name('index');
		// Rotas "estáticas" precisam vir antes da rota dinâmica /{id}
		Route::get('/stats', [FaturaController::class, 'stats'])->name('stats');
		Route::get('/export-data', [FaturaController::class, 'exportData'])->name('export_data');
		Route::post('/import', [FaturaController::class, 'import'])->name('import');
		Route::post('/pay-month', [FaturaController::class, 'payMonth'])->name('pay_month');
		Route::post('/{id}/restore', [FaturaController::class, 'restore'])->name('restore');
		Route::get('/{id}', [FaturaController::class, 'show'])->name('show');
		Route::post('/', [FaturaController::class, 'store'])->name('store');
		Route::match(['put', 'patch'], '/{id}', [FaturaController::class, 'update'])->name('update');
		Route::delete('/{id}', [FaturaController::class, 'destroy'])->name('destroy');
	});

	Route::prefix('categories')->name('categories.')->group(function () {
		Route::post('/', [CategoryController::class, 'store'])->name('store');
	});
});

