<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('faturas') && !Schema::hasTable('transacoes')) {
            Schema::rename('faturas', 'transacoes');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('transacoes') && !Schema::hasTable('faturas')) {
            Schema::rename('transacoes', 'faturas');
        }
    }
};
