<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateComplaintsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('assigned_technician_id')->nullable();
            $table->string('title', 160);
            $table->string('category', 80);
            $table->text('description');
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->enum('status', ['pending', 'in_progress', 'resolved'])->default('pending');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'status']);
            $table->index(['status', 'priority']);
            $table->index('assigned_technician_id');

            if (Schema::hasTable('users')) {
                $table->foreign('tenant_id', 'complaints_tenant_fk')
                    ->references('id')
                    ->on('users')
                    ->onDelete('cascade');

                $table->foreign('assigned_technician_id', 'complaints_assigned_tech_fk')
                    ->references('id')
                    ->on('users')
                    ->onDelete('set null');
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
        Schema::dropIfExists('complaints');
    }
}
