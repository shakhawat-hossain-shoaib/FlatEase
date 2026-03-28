<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddReasonToComplaintHistoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('complaint_status_histories') && !Schema::hasColumn('complaint_status_histories', 'reason')) {
            Schema::table('complaint_status_histories', function (Blueprint $table) {
                $table->string('reason', 500)->nullable()->after('changed_at');
            });
        }

        if (Schema::hasTable('complaint_assignment_histories') && !Schema::hasColumn('complaint_assignment_histories', 'reason')) {
            Schema::table('complaint_assignment_histories', function (Blueprint $table) {
                $table->string('reason', 500)->nullable()->after('assigned_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('complaint_status_histories', function (Blueprint $table) {
            $table->dropColumn('reason');
        });

        Schema::table('complaint_assignment_histories', function (Blueprint $table) {
            $table->dropColumn('reason');
        });
    }
}
