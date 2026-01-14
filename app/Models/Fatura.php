<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\Transacao;

class Fatura extends Model
{
    use HasFactory;

    protected $table = 'faturas';

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

    public function transacoes(): BelongsToMany
    {
        return $this->belongsToMany(Transacao::class, 'fatura_transacao', 'fatura_id', 'transacao_id')->withTimestamps();
    }
}
