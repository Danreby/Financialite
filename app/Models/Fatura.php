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

    public static function filter(
        $title = null, 
        $description = null, 
        $amount = null, 
        $due_date = null, 
        $type = null, 
        $status = null,
        $paid_date = null, 
        $is_recurring = null, 
        $user_id = null, 
        $bank_user_id = null, 
        $total_installments = null, 
        $current_installment = null, 
    )
    {
        $query = self::query();

        if ($title !== null) {
            $query->where('title', 'like', '%' . $title . '%');
        }
        if ($description !== null) {
            $query->where('description', 'like', '%' . $description . '%');
        }
        if ($amount !== null) {
            $query->where('amount', $amount);
        }
        if ($due_date !== null) {
            $query->where('due_date', $due_date);
        }
        if ($type !== null) {
            $query->where('type', $type);
        }
        if ($status !== null) {
            $query->where('status', $status);
        }  
        if ($paid_date !== null) {
            $query->where('paid_date', $paid_date);
        }
        if ($is_recurring !== null) {
            $query->where('is_recurring', $is_recurring);
        }
        if ($user_id !== null) {
            $query->where('user_id', $user_id);
        }
        if ($bank_user_id !== null) {
            $query->where('bank_user_id', $bank_user_id);
        }
        if ($total_installments !== null) {
            $query->where('total_installments', $total_installments);
        }
        if ($current_installment !== null) {
            $query->where('current_installment', $current_installment);
        }
        return $query->get();
    }
}
