<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankUser extends Model
{
    protected $table = 'bank_user';

    protected $fillable = [
        'bank_id',
        'user_id',
        'due_day',
    ];

    protected $casts = [
        'due_day' => 'integer',
    ];

    public function bank()
    {
        return $this->belongsTo(Bank::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function faturas()
    {
        return $this->hasMany(Fatura::class, 'bank_user_id');
    }
}
