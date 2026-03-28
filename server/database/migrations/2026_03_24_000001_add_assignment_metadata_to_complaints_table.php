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
        Schema::table('complaints', function (Blueprint $table) {
            $table->unsignedBigInteger('assigned_by_id')->nullable()->after('assigned_technician_id');
            $table->timestamp('assigned_at')->nullable()->after('assigned_by_id');
            $table->index(['assigned_technician_id', 'assigned_at']);

            if (Schema::hasTable('users')) {
                $table->foreign('assigned_by_id', 'complaints_assigned_by_fk')
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
        Schema::table('complaints', function (Blueprint $table) {
            $table->dropIndex(['assigned_technician_id', 'assigned_at']);

            if (Schema::hasTable('users')) {
                $table->dropForeign('complaints_assigned_by_fk');
            }

            $table->dropColumn(['assigned_by_id', 'assigned_at']);
        });
    }
};
