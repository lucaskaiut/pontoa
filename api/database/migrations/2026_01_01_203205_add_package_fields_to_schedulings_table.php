<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schedulings', function (Blueprint $table) {
            $table->unsignedBigInteger('customer_package_id')->nullable()->after('customer_id');
            $table->foreign('customer_package_id')->references('id')->on('customer_packages')->onDelete('set null');
            $table->boolean('used_package_session')->default(false)->after('customer_package_id');
        });
    }

    public function down(): void
    {
        Schema::table('schedulings', function (Blueprint $table) {
            $table->dropForeign(['customer_package_id']);
            $table->dropColumn(['customer_package_id', 'used_package_session']);
        });
    }
};
