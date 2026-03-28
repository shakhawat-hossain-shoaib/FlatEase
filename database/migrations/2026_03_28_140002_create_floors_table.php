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
        if (Schema::hasTable('floors')) {
            return;
        }

        Schema::create('floors', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('building_id');
            $table->smallInteger('floor_number');
            $table->string('floor_label', 80);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['building_id', 'floor_number'], 'floors_building_floor_unique');
            $table->index(['building_id', 'sort_order'], 'floors_building_sort_idx');

            $table->foreign('building_id', 'floors_building_fk')
                ->references('id')
                ->on('buildings')
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
        Schema::dropIfExists('floors');
    }
};
