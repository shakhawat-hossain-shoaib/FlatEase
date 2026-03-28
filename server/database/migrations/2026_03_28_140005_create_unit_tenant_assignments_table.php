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
        if (Schema::hasTable('unit_tenant_assignments')) {
            return;
        }

        Schema::create('unit_tenant_assignments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('unit_id');
            $table->unsignedBigInteger('tenant_user_id');
            $table->unsignedBigInteger('assigned_by')->nullable();
            $table->date('lease_start_date')->nullable();
            $table->date('lease_end_date')->nullable();
            $table->decimal('rent_amount', 12, 2)->nullable();
            $table->enum('status', ['active', 'ended', 'terminated', 'pending_move_in'])->default('active');
            $table->timestamp('moved_out_at')->nullable();
            $table->timestamps();

            $table->index(['unit_id', 'status'], 'unit_tenant_assignments_unit_status_idx');
            $table->index(['tenant_user_id', 'status'], 'unit_tenant_assignments_tenant_status_idx');

            $table->foreign('unit_id', 'unit_tenant_assignments_unit_fk')
                ->references('id')
                ->on('units')
                ->onDelete('cascade');

            $table->foreign('tenant_user_id', 'unit_tenant_assignments_tenant_fk')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('assigned_by', 'unit_tenant_assignments_assigned_by_fk')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('unit_tenant_assignments');
    }
};
