<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('technicians')) {
            return;
        }

        Schema::create('technicians', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            $table->string('name', 160);
            $table->string('phone', 40)->nullable();
            $table->string('email')->unique();
            $table->string('specialization', 80);
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index(['specialization', 'active'], 'technicians_spec_active_idx');
            $table->index('active', 'technicians_active_idx');

            $table->foreign('user_id', 'technicians_user_fk')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('technicians');
    }
};
