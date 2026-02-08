<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('document', 14)->unique();
            $table->string('email')->unique();
            $table->string('phone', 11);
            $table->string('domain')->unique();
            $table->string('payment_customer_id')->nullable();
            $table->unsignedBigInteger('card_id')->nullable();
            $table->enum('plan', ['monthly', 'quarterly', 'yearly'])->default('monthly');
            $table->boolean('is_free')->default(false);
            $table->boolean('active')->default(true);
            $table->boolean('onboarding_completed')->default(false);
            $table->string('logo')->nullable();
            $table->string('banner')->nullable();
            $table->date('last_billed_at')->nullable();
            $table->string('evolution_api_url')->nullable();
            $table->string('evolution_api_key')->nullable();
            $table->string('evolution_api_instance_name')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('companies');
    }
};
