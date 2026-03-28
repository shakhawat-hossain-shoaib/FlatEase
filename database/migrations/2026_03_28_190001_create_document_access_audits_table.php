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
        if (Schema::hasTable('document_access_audits')) {
            return;
        }

        Schema::create('document_access_audits', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_document_id')->nullable()->index('document_access_audits_document_id_idx');
            $table->unsignedBigInteger('tenant_user_id')->nullable()->index('document_access_audits_tenant_id_idx');
            $table->unsignedBigInteger('actor_user_id')->nullable()->index('document_access_audits_actor_id_idx');
            $table->string('actor_role', 32)->nullable();
            $table->string('action', 48);
            $table->string('document_type_key', 100)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('tenant_name', 255)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_access_audits');
    }
};
