<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('total_sessions');
            $table->integer('bonus_sessions')->default(0);
            $table->integer('expires_in_days')->nullable();
            $table->boolean('is_active')->default(true);
            $table->decimal('price', 10, 2)->nullable();
            $table->timestamps();

            $table->index('company_id');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
