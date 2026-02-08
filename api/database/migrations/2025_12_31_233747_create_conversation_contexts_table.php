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
        Schema::create('conversation_contexts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('CASCADE');
            $table->string('customer_phone');
            $table->string('channel')->default('whatsapp');
            $table->string('current_state')->default('idle');
            $table->json('state_payload')->nullable();
            $table->timestamp('locked_until')->nullable();
            $table->timestamps();
            
            $table->index(['company_id', 'customer_phone', 'current_state'], 'conv_ctx_lookup_idx');
            $table->index('locked_until', 'conv_ctx_locked_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversation_contexts');
    }
};
