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
        Schema::create('company_recurrencies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->double('amount', 10, 4);
            $table->string('payment_method');
            $table->enum('plan', ['monthly', 'quarterly', 'yearly']);
            $table->datetime('billed_at');
            $table->string('external_id');
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('company_recurrencies');
    }
};
