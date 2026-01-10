<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Paid extends Model
{
    use HasFactory;

    protected $table = 'paids';

    protected $fillable = [
        'user_id',
        'month_key',
        'bank_user_id',
        'paid_at',
        'total_paid',
    ];

    protected $casts = [
        'paid_at' => 'date',
        'total_paid' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bankUser(): BelongsTo
    {
        return $this->belongsTo(BankUser::class);
    }
}
