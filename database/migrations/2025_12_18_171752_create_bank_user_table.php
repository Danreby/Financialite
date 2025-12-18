<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_user', function (Blueprint $table) {
            $table->id();

            // use foreignId + constrained para convenção e cascades
            $table->foreignId('bank_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // evita duplicação do mesmo banco para mesmo usuário
            $table->unique(['bank_id', 'user_id'], 'bank_user_unique');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_user');
    }
};
