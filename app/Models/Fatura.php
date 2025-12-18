<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Fatura extends Model
{
    use SoftDeletes;

    protected $table = 'faturas';

    protected $fillable = [
        'title',
        'description',
        'amount',
        'due_date',
        'type',
        'status',
        'paid_date',
        'total_installments',
        'current_installment',
        'is_recurring',
        'user_id',
        'bank_user_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'paid_date' => 'date',
        'is_recurring' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bankUser(): BelongsTo
    {
        return $this->belongsTo(BankUser::class, 'bank_user_id');
    }

    public function getBankAttribute()
    {
        return $this->bankUser?->bank;
    }
}
