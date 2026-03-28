<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('document_types')) {
            return;
        }

        Schema::table('document_types', function (Blueprint $table) {
            if (!Schema::hasColumn('document_types', 'is_sensitive')) {
                $table->boolean('is_sensitive')->default(false)->after('max_size_mb');
            }

            if (!Schema::hasColumn('document_types', 'admin_only_access')) {
                $table->boolean('admin_only_access')->default(false)->after('is_sensitive');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('document_types')) {
            return;
        }

        Schema::table('document_types', function (Blueprint $table) {
            if (Schema::hasColumn('document_types', 'admin_only_access')) {
                $table->dropColumn('admin_only_access');
            }

            if (Schema::hasColumn('document_types', 'is_sensitive')) {
                $table->dropColumn('is_sensitive');
            }
        });
    }
};
