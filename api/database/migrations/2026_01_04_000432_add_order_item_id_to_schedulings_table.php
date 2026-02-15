<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schedulings', function (Blueprint $table) {
            $table->unsignedBigInteger('order_item_id')->nullable()->after('service_id');
            $table->foreign('order_item_id')->references('id')->on('order_items')->onDelete('set null');
            $table->index('order_item_id');
        });
    }

    public function down(): void
    {
        Schema::table('schedulings', function (Blueprint $table) {
            $table->dropForeign(['order_item_id']);
            $table->dropIndex(['order_item_id']);
            $table->dropColumn('order_item_id');
        });
    }
};

