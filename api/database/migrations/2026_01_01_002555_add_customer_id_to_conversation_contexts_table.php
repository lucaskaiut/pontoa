<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversation_contexts', function (Blueprint $table) {
            $table->unsignedBigInteger('customer_id')->nullable()->after('company_id');
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('SET NULL');
            
            $table->index('customer_id');
        });
    }

    public function down(): void
    {
        Schema::table('conversation_contexts', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropIndex(['customer_id']);
            $table->dropColumn('customer_id');
        });
    }
};
