<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('paids') && !Schema::hasTable('faturas')) {
            Schema::rename('paids', 'faturas');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('faturas') && !Schema::hasTable('paids')) {
            Schema::rename('faturas', 'paids');
        }
    }
};
