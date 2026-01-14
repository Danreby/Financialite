<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BankController;
use App\Http\Controllers\TransacaoController;
use App\Http\Controllers\NotificationController;
use App\Models\BankUser;
use App\Models\Category;
use App\Models\Transacao;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::get('/dashboard', function () {
    $user = request()->user();

    $bankAccounts = BankUser::with('bank')
        ->forUser($user->id)
        ->get()
        ->map(function ($bankUser) {
            return [
                'id' => $bankUser->id,
                'name' => $bankUser->bank?->name ?? ('Conta #' . $bankUser->id),
                'due_day' => $bankUser->due_day,
            ];
        });

    $categories = Category::forUser($user->id)
        ->orderBy('name')
        ->get(['id', 'name']);

    return Inertia::render('Dashboard', [
        'bankAccounts' => $bankAccounts,
        'categories' => $categories,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    // ============ Profile Routes ============
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ============ Page Routes (Inertia) ============
    Route::get('/accounts', function () {
            $user = request()->user();

            $bankAccounts = BankUser::with('bank')
                ->forUser($user->id)
                ->orderBy('id')
                ->paginate(10, ['*'], 'accounts_page')
                ->through(function ($bankUser) {
                    return [
                        'id' => $bankUser->id,
                        'bank_id' => $bankUser->bank_id,
                        'name' => $bankUser->bank?->name ?? ('Conta #' . $bankUser->id),
                        'due_day' => $bankUser->due_day,
                    ];
                });

            $categories = Category::forUser($user->id)
                ->orderBy('name')
                ->paginate(5, ['id', 'name'], 'categories_page');

            return Inertia::render('Conta', [
                'bankAccounts' => $bankAccounts,
                'categories' => $categories,
            ]);
    })->name('accounts.index');

    Route::get('/transactions', [\App\Http\Controllers\TransactionController::class, 'index'])
        ->name('transactions.index');

    Route::get('/reports', function () {
        $user = request()->user();

        $bankAccounts = BankUser::with('bank')
            ->forUser($user->id)
            ->get()
            ->map(function ($bankUser) {
                return [
                    'id' => $bankUser->id,
                    'name' => $bankUser->bank?->name ?? ('Conta #' . $bankUser->id),
                ];
            });

        $categories = Category::forUser($user->id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Relatorio', [
            'bankAccounts' => $bankAccounts,
            'categories' => $categories,
        ]);
    })->name('reports.index');

    Route::get('/about', function () {
        return Inertia::render('About');
    })->name('about');

    Route::get('/settings', function () {
        return Inertia::render('Config');
    })->name('settings');

    Route::get('/banks/list', [BankController::class, 'list'])->name('banks.list');
    Route::post('/banks/attach', [BankController::class, 'attachToUser'])->name('banks.attach');
    Route::patch('/banks/user/{bankUser}/due-day', [BankController::class, 'updateDueDay'])
        ->name('banks.update-due-day');

    // ============ Notifications ============
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])
        ->name('notifications.mark-as-read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])
        ->name('notifications.mark-all-as-read');
    Route::delete('/notifications', [NotificationController::class, 'clearAll'])
        ->name('notifications.clear-all');
});

require __DIR__.'/Fatura.php';

require __DIR__.'/auth.php';
