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
            $table->string('subscription_status')->default('ACTIVE')->after('plan_trial_ends_at');
            $table->timestamp('current_period_start')->nullable()->after('subscription_status');
            $table->timestamp('current_period_end')->nullable()->after('current_period_start');
            $table->timestamp('canceled_at')->nullable()->after('current_period_end');
            $table->boolean('cancel_at_period_end')->default(false)->after('canceled_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn([
                'subscription_status',
                'current_period_start',
                'current_period_end',
                'canceled_at',
                'cancel_at_period_end',
            ]);
        });
    }
};
