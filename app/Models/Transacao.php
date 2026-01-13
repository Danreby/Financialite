<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Fatura;

class Transacao extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'transacoes';

    protected $fillable = [
        'title',
        'description',
        'amount',
        'type',
        'status',
        'paid_date',
        'total_installments',
        'current_installment',
        'is_recurring',
        'user_id',
        'bank_user_id',
        'category_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
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

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function faturas(): BelongsToMany
    {
        return $this->belongsToMany(Fatura::class, 'fatura_transacao', 'transacao_id', 'fatura_id')->withTimestamps();
    }

    public function getBankAttribute()
    {
        return $this->bankUser?->bank;
    }

    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeFilter(Builder $query, array $filters = []): Builder
    {
        return $query
            ->when($filters['type'] ?? null, function (Builder $q, $type) {
                $q->where('type', $type);
            })
            ->when($filters['status'] ?? null, function (Builder $q, $status) {
                $q->where('status', $status);
            })
            ->when($filters['bank_user_id'] ?? null, function (Builder $q, $bankUserId) {
                $q->where('bank_user_id', $bankUserId);
            })
            ->when($filters['amount_min'] ?? null, function (Builder $q, $min) {
                $q->where('amount', '>=', $min);
            })
            ->when($filters['amount_max'] ?? null, function (Builder $q, $max) {
                $q->where('amount', '<=', $max);
            })
            ->when($filters['category_id'] ?? null, function (Builder $q, $categoryId) {
                $q->where('category_id', $categoryId);
            })
            ->when(isset($filters['is_recurring']) && $filters['is_recurring'] !== null, function (Builder $q) use ($filters) {
                $value = filter_var($filters['is_recurring'], FILTER_VALIDATE_BOOLEAN);
                $q->where('is_recurring', $value);
            });
    }

    public function scopeBetweenDueDates(Builder $query, $start, $end): Builder
    {
        $startDate = $start instanceof Carbon ? $start->toDateString() : $start;
        $endDate = $end instanceof Carbon ? $end->toDateString() : $end;
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    public function scopeNotStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', '!=', $status);
    }

    public function scopeForBankUser(Builder $query, ?int $bankUserId): Builder
    {
        if ($bankUserId) {
            $query->where('bank_user_id', $bankUserId);
        }

        return $query;
    }
}
