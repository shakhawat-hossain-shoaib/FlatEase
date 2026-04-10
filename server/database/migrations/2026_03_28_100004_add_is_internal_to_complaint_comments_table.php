<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddIsInternalToComplaintCommentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasTable('complaint_comments') || Schema::hasColumn('complaint_comments', 'is_internal')) {
            return;
        }

        Schema::table('complaint_comments', function (Blueprint $table) {
            $table->boolean('is_internal')->default(false)->after('comment');
            $table->index(['complaint_id', 'is_internal'], 'cc_complaint_internal_idx');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (!Schema::hasTable('complaint_comments')) {
            return;
        }

        Schema::table('complaint_comments', function (Blueprint $table) {
            $table->dropIndex('cc_complaint_internal_idx');

            if (Schema::hasColumn('complaint_comments', 'is_internal')) {
                $table->dropColumn('is_internal');
            }
        });
    }
}
