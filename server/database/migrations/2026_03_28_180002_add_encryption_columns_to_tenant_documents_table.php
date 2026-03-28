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
        if (!Schema::hasTable('tenant_documents')) {
            return;
        }

        Schema::table('tenant_documents', function (Blueprint $table) {
            if (!Schema::hasColumn('tenant_documents', 'is_encrypted')) {
                $table->boolean('is_encrypted')->default(false)->after('storage_path');
            }

            if (!Schema::hasColumn('tenant_documents', 'encryption_algorithm')) {
                $table->string('encryption_algorithm', 64)->nullable()->after('is_encrypted');
            }

            if (!Schema::hasColumn('tenant_documents', 'encryption_key_version')) {
                $table->string('encryption_key_version', 32)->nullable()->after('encryption_algorithm');
            }

            if (!Schema::hasColumn('tenant_documents', 'encryption_iv')) {
                $table->text('encryption_iv')->nullable()->after('encryption_key_version');
            }

            if (!Schema::hasColumn('tenant_documents', 'encryption_tag')) {
                $table->text('encryption_tag')->nullable()->after('encryption_iv');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('tenant_documents')) {
            return;
        }

        Schema::table('tenant_documents', function (Blueprint $table) {
            $drop = [];

            foreach (['is_encrypted', 'encryption_algorithm', 'encryption_key_version', 'encryption_iv', 'encryption_tag'] as $column) {
                if (Schema::hasColumn('tenant_documents', $column)) {
                    $drop[] = $column;
                }
            }

            if (!empty($drop)) {
                $table->dropColumn($drop);
            }
        });
    }
};
