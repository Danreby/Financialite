<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bank extends Model
{
    protected $table = 'banks';

    protected $fillable = [
        'name',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'bank_user', 'bank_id', 'user_id')->withTimestamps();
    }

    public function bankUsers()
    {
        return $this->hasMany(BankUser::class, 'bank_id');
    }

    public function faturas()
    {
        return $this->hasManyThrough(Fatura::class, BankUser::class, 'bank_id', 'bank_user_id');
    }
}

