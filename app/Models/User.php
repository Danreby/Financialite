<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];


    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function banks(): BelongsToMany
    {
        return $this->belongsToMany(Bank::class, 'bank_user', 'user_id', 'bank_id');
    }
    
    public function faturas(): HasMany
    {
        return $this->hasMany(Fatura::class);
    }

    public function bankUsers(): HasMany
    {
        return $this->hasMany(BankUser::class, 'user_id');
    }

    public function getAvailableBanksAttribute()
    {
        return $this->banks()->get();
    }
}
