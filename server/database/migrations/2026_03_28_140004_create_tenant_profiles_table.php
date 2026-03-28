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
        if (Schema::hasTable('tenant_profiles')) {
            return;
        }

        Schema::create('tenant_profiles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            $table->string('phone', 40)->nullable();
            $table->string('emergency_contact_name', 160)->nullable();
            $table->string('emergency_contact_phone', 40)->nullable();
            $table->string('nid_number', 80)->nullable();
            $table->string('job_title', 160)->nullable();
            $table->string('employer', 160)->nullable();
            $table->timestamps();

            $table->foreign('user_id', 'tenant_profiles_user_fk')
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
        Schema::dropIfExists('tenant_profiles');
    }
};
