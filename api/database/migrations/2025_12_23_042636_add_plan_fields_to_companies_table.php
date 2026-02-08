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
            $table->string('plan_name')->nullable()->after('plan');
            $table->string('plan_recurrence')->nullable()->after('plan_name');
            $table->decimal('plan_price', 10, 2)->nullable()->after('plan_recurrence');
            $table->timestamp('plan_started_at')->nullable()->after('plan_price');
            $table->timestamp('plan_trial_ends_at')->nullable()->after('plan_started_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn([
                'plan_name',
                'plan_recurrence',
                'plan_price',
                'plan_started_at',
                'plan_trial_ends_at',
            ]);
        });
    }
};
