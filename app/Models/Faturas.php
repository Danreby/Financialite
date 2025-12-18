<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

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
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bankUser()
    {
        return $this->belongsTo(BankUser::class, 'bank_user_id');
    }

    public function bank()
    {
        return $this->belongsToThrough(Bank::class, BankUser::class, 'bank_user_id');
    }
}
