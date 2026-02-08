<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('original_total_amount', 10, 2)->default(0)->after('total_amount');
            $table->decimal('discount_amount', 10, 2)->default(0)->after('original_total_amount');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->decimal('original_unit_price', 10, 2)->nullable()->after('unit_price');
            $table->decimal('original_total_price', 10, 2)->nullable()->after('total_price');
            $table->decimal('discount_amount', 10, 2)->default(0)->after('original_total_price');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['original_total_amount', 'discount_amount']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['original_unit_price', 'original_total_price', 'discount_amount']);
        });
    }
};
