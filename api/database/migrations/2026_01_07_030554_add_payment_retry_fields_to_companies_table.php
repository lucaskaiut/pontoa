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
        Schema::table('companies', function (Blueprint $table) {
            $table->integer('payment_attempts')->default(0)->after('cancel_at_period_end');
            $table->timestamp('last_payment_attempt_at')->nullable()->after('payment_attempts');
            $table->timestamp('payment_retry_until')->nullable()->after('last_payment_attempt_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn([
                'payment_attempts',
                'last_payment_attempt_at',
                'payment_retry_until',
            ]);
        });
    }
};
