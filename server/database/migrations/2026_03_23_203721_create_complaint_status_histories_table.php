<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateComplaintStatusHistoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('complaint_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->constrained('complaints')->cascadeOnDelete();
            $table->enum('old_status', ['pending', 'in_progress', 'resolved'])->nullable();
            $table->enum('new_status', ['pending', 'in_progress', 'resolved']);
            $table->foreignId('changed_by_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('changed_at');
            $table->index(['complaint_id', 'changed_at']);
            $table->index('complaint_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('complaint_status_histories');
    }
}
