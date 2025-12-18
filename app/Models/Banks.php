<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bank extends Model
{
    protected $table = 'banks';

    protected $fillable = [
        'name',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'bank_user')->withTimestamps();
    }

    public function bankUsers()
    {
        return $this->hasMany(\App\Models\BankUser::class);
    }
}
