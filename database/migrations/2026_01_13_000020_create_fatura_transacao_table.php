<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('fatura_transacao')) {
            Schema::create('fatura_transacao', function (Blueprint $table) {
                $table->id();
                $table->foreignId('fatura_id')->constrained('faturas')->cascadeOnDelete();
                $table->foreignId('transacao_id')->constrained('transacoes')->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['fatura_id', 'transacao_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('fatura_transacao');
    }
};
