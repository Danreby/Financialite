<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bank_user', function (Blueprint $table) {
            $table->unsignedTinyInteger('due_day')
                ->nullable()
                ->after('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('bank_user', function (Blueprint $table) {
            $table->dropColumn('due_day');
        });
    }
};
