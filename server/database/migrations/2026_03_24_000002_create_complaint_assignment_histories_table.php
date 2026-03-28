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
        Schema::create('complaint_assignment_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('complaint_id');
            $table->unsignedBigInteger('previous_assigned_technician_id')->nullable();
            $table->unsignedBigInteger('new_assigned_technician_id');
            $table->unsignedBigInteger('assigned_by_id');
            $table->timestamp('assigned_at');

            $table->index(['complaint_id', 'assigned_at'], 'cah_complaint_assigned_idx');

            $table->foreign('complaint_id', 'cah_complaint_fk')
                ->references('id')
                ->on('complaints')
                ->onDelete('cascade');

            if (Schema::hasTable('users')) {
                $table->foreign('previous_assigned_technician_id', 'cah_prev_tech_fk')
                    ->references('id')
                    ->on('users')
                    ->onDelete('set null');

                $table->foreign('new_assigned_technician_id', 'cah_new_tech_fk')
                    ->references('id')
                    ->on('users')
                    ->onDelete('cascade');

                $table->foreign('assigned_by_id', 'cah_assigned_by_fk')
                    ->references('id')
                    ->on('users')
                    ->onDelete('cascade');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('complaint_assignment_histories');
    }
};
