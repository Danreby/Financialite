<?php

use App\Http\Controllers\FaturaController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
	Route::prefix('faturas')->name('faturas.')->group(function () {
		Route::get('/', [FaturaController::class, 'index'])->name('index');
		Route::get('/{id}', [FaturaController::class, 'show'])->name('show');
		Route::post('/', [FaturaController::class, 'store'])->name('store');
		Route::match(['put', 'patch'], '/{id}', [FaturaController::class, 'update'])->name('update');
		Route::delete('/{id}', [FaturaController::class, 'destroy'])->name('destroy');
		Route::post('/{id}/restore', [FaturaController::class, 'restore'])->name('restore');
		Route::post('/pay-month', [FaturaController::class, 'payMonth'])->name('pay_month');
	});
});

