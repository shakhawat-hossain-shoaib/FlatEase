<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        if (Schema::hasTable('complaints')) {
            DB::statement("ALTER TABLE complaints MODIFY status ENUM('pending','assigned','in_progress','resolved') NOT NULL DEFAULT 'pending'");
        }

        if (Schema::hasTable('complaint_status_histories')) {
            DB::statement("ALTER TABLE complaint_status_histories MODIFY old_status ENUM('pending','assigned','in_progress','resolved') NULL");
            DB::statement("ALTER TABLE complaint_status_histories MODIFY new_status ENUM('pending','assigned','in_progress','resolved') NOT NULL");
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        if (Schema::hasTable('complaints')) {
            DB::statement("ALTER TABLE complaints MODIFY status ENUM('pending','in_progress','resolved') NOT NULL DEFAULT 'pending'");
        }

        if (Schema::hasTable('complaint_status_histories')) {
            DB::statement("ALTER TABLE complaint_status_histories MODIFY old_status ENUM('pending','in_progress','resolved') NULL");
            DB::statement("ALTER TABLE complaint_status_histories MODIFY new_status ENUM('pending','in_progress','resolved') NOT NULL");
        }
    }
};
