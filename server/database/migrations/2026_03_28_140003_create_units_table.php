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
        if (Schema::hasTable('units')) {
            return;
        }

        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('building_id');
            $table->unsignedBigInteger('floor_id');
            $table->string('unit_number', 40);
            $table->unsignedTinyInteger('bedrooms')->nullable();
            $table->unsignedTinyInteger('bathrooms')->nullable();
            $table->unsignedInteger('area_sqft')->nullable();
            $table->enum('occupancy_status', ['vacant', 'occupied', 'blocked'])->default('vacant');
            $table->timestamps();

            $table->unique(['building_id', 'unit_number'], 'units_building_unit_unique');
            $table->index(['building_id', 'floor_id', 'occupancy_status'], 'units_grid_idx');

            $table->foreign('building_id', 'units_building_fk')
                ->references('id')
                ->on('buildings')
                ->onDelete('cascade');

            $table->foreign('floor_id', 'units_floor_fk')
                ->references('id')
                ->on('floors')
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
        Schema::dropIfExists('units');
    }
};
