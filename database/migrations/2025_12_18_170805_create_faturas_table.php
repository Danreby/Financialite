<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('faturas', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('description')->nullable();
            $table->decimal('amount', 10, 2);
            $table->date('due_date');
            $table->enum('type', ['credit', 'debit']);
            $table->enum('status', ['paid', 'unpaid', 'overdue'])->default('unpaid');
            $table->date('paid_date')->nullable();
            $table->integer('total_installments')->default(1);
            $table->integer('current_installment')->default(1);
            $table->boolean('is_recurring')->default(false);

            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('bank_user_id')
                ->nullable()
                ->after('user_id')
                ->constrained('bank_user')
                ->nullOnDelete();

            $table->index('bank_user_id');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faturas');
    }
};
