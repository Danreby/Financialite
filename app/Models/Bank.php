<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

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

    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->whereHas('bankUsers', function (Builder $sub) use ($userId) {
            $sub->where('user_id', $userId);
        });
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('name');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'bank_user', 'bank_id', 'user_id')->withTimestamps();
    }

    public function bankUsers(): HasMany
    {
        return $this->hasMany(BankUser::class, 'bank_id');
    }

    public function faturas(): HasManyThrough
    {
        return $this->hasManyThrough(Fatura::class, BankUser::class, 'bank_id', 'bank_user_id');
    }
}

