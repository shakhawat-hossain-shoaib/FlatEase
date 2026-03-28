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
        if (Schema::hasTable('complaint_technician_assignments')) {
            return;
        }

        Schema::create('complaint_technician_assignments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('complaint_id');
            $table->unsignedBigInteger('technician_id');
            $table->unsignedBigInteger('assigned_by_admin_id');
            $table->timestamp('assigned_at');
            $table->string('assignment_note', 500)->nullable();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->unique(['complaint_id', 'technician_id'], 'cta_complaint_technician_unique');
            $table->index(['technician_id', 'assigned_at'], 'cta_technician_assigned_idx');
            $table->index(['complaint_id', 'assigned_at'], 'cta_complaint_assigned_idx');

            $table->foreign('complaint_id', 'cta_complaint_fk')
                ->references('id')
                ->on('complaints')
                ->onDelete('cascade');

            $table->foreign('technician_id', 'cta_technician_fk')
                ->references('id')
                ->on('technicians')
                ->onDelete('cascade');

            $table->foreign('assigned_by_admin_id', 'cta_admin_fk')
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
        Schema::dropIfExists('complaint_technician_assignments');
    }
};
