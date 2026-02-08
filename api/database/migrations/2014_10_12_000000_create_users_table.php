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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->string('name');
            $table->string('email');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('type', ['admin', 'customer']);
            $table->string('document', 14)->nullable();
            $table->string('phone', 11);
            $table->boolean('status')->default(true);
            $table->boolean('is_collaborator')->default(false);
            $table->integer('bank')->nullable();
            $table->integer('branch_number')->nullable();
            $table->integer('account_number')->nullable();
            $table->integer('account_check_digit')->nullable();
            $table->enum('bank_account_type', ['checking', 'saving'])->nullable();
            $table->string('receiver_id')->nullable();
            $table->string('image')->nullable();
            $table->text('description')->nullable();
            $table->string('url')->nullable();
            $table->rememberToken();
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
        Schema::dropIfExists('users');
    }
};
