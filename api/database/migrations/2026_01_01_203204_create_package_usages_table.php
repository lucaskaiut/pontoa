<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('package_usages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customer_package_id');
            $table->foreign('customer_package_id')->references('id')->on('customer_packages')->onDelete('cascade');
            $table->unsignedBigInteger('appointment_id');
            $table->foreign('appointment_id')->references('id')->on('schedulings')->onDelete('cascade');
            $table->timestamp('used_at');
            $table->timestamps();

            $table->index('appointment_id');
            $table->index('customer_package_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_usages');
    }
};
