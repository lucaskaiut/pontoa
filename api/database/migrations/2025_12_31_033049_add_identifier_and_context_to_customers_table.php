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
        Schema::table('customers', function (Blueprint $table) {
            $table->string('identifier', 255)->nullable()->after('id');
            $table->text('context')->nullable()->after('identifier');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->unique(['identifier', 'company_id']);
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropUnique(['identifier', 'company_id']);
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['identifier', 'context']);
        });
    }
};
