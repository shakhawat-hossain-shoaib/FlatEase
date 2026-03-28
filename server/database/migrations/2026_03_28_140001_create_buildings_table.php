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
        if (Schema::hasTable('buildings')) {
            return;
        }

        Schema::create('buildings', function (Blueprint $table) {
            $table->id();
            $table->string('name', 160);
            $table->string('code', 60)->nullable();
            $table->string('address_line', 255)->nullable();
            $table->string('city', 120)->nullable();
            $table->string('state', 120)->nullable();
            $table->string('postal_code', 40)->nullable();
            $table->string('country', 120)->nullable();
            $table->unsignedSmallInteger('total_floors')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique('name', 'buildings_name_unique');
            $table->unique('code', 'buildings_code_unique');
            $table->index(['is_active', 'name'], 'buildings_active_name_idx');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('buildings');
    }
};
