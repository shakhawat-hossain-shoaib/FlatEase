<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAssignmentMetadataToComplaintsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasTable('complaints')) {
            return;
        }

        Schema::table('complaints', function (Blueprint $table) {
            if (!Schema::hasColumn('complaints', 'assigned_by_id')) {
                $table->foreignId('assigned_by_id')->nullable()->after('assigned_technician_id')->constrained('users')->nullOnDelete();
            }

            if (!Schema::hasColumn('complaints', 'assigned_at')) {
                $table->timestamp('assigned_at')->nullable()->after('assigned_by_id');
            }

            if (!Schema::hasColumn('complaints', 'sla_due_at')) {
                $table->timestamp('sla_due_at')->nullable()->after('assigned_at');
            }

            $table->index(['assigned_technician_id', 'assigned_at'], 'complaints_assign_time_idx');
            $table->index(['status', 'sla_due_at'], 'complaints_status_sla_idx');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (!Schema::hasTable('complaints')) {
            return;
        }

        Schema::table('complaints', function (Blueprint $table) {
            $table->dropIndex('complaints_assign_time_idx');
            $table->dropIndex('complaints_status_sla_idx');

            if (Schema::hasColumn('complaints', 'assigned_by_id')) {
                $table->dropConstrainedForeignId('assigned_by_id');
            }

            if (Schema::hasColumn('complaints', 'assigned_at')) {
                $table->dropColumn('assigned_at');
            }

            if (Schema::hasColumn('complaints', 'sla_due_at')) {
                $table->dropColumn('sla_due_at');
            }
        });
    }
}
