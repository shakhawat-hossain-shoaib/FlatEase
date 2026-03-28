<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ReconcileDatabaseFirstSchema extends Migration
{
    /**
     * Run the migrations.
     *
     * This migration is intentionally additive and idempotent so teams can
     * keep legacy migration files while still converging to one working schema.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'email_verified_at')) {
                    $table->timestamp('email_verified_at')->nullable()->after('email');
                }

                if (!Schema::hasColumn('users', 'remember_token')) {
                    $table->rememberToken();
                }
            });
        }

        if (Schema::hasTable('complaints')) {
            Schema::table('complaints', function (Blueprint $table) {
                if (!Schema::hasColumn('complaints', 'assigned_by_id')) {
                    $table->unsignedBigInteger('assigned_by_id')->nullable()->after('assigned_technician_id');
                }

                if (!Schema::hasColumn('complaints', 'assigned_at')) {
                    $table->timestamp('assigned_at')->nullable()->after('assigned_by_id');
                }

                if (!Schema::hasColumn('complaints', 'sla_due_at')) {
                    $table->timestamp('sla_due_at')->nullable()->after('assigned_at');
                }
            });
        }

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

        if (Schema::hasTable('complaint_comments') && !Schema::hasColumn('complaint_comments', 'is_internal')) {
            Schema::table('complaint_comments', function (Blueprint $table) {
                $table->boolean('is_internal')->default(false)->after('comment');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * Non-destructive by design for local team consistency.
     *
     * @return void
     */
    public function down()
    {
        // No-op intentionally.
    }
}
