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
        if (Schema::hasTable('tenant_documents')) {
            return;
        }

        Schema::create('tenant_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_user_id');
            $table->unsignedBigInteger('document_type_id');
            $table->string('storage_disk', 40)->default('local');
            $table->string('storage_path', 500);
            $table->string('original_filename', 255);
            $table->string('mime_type', 120);
            $table->unsignedBigInteger('file_size_bytes');
            $table->string('checksum_sha256', 64)->nullable();
            $table->enum('status', ['uploaded', 'under_review', 'approved', 'rejected', 'expired'])->default('uploaded');
            $table->unsignedBigInteger('verified_by')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->string('rejection_reason', 500)->nullable();
            $table->timestamps();

            $table->index(['tenant_user_id', 'status'], 'tenant_documents_tenant_status_idx');
            $table->index(['document_type_id', 'status'], 'tenant_documents_type_status_idx');

            $table->foreign('tenant_user_id', 'tenant_documents_tenant_fk')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('document_type_id', 'tenant_documents_type_fk')
                ->references('id')
                ->on('document_types')
                ->onDelete('cascade');

            $table->foreign('verified_by', 'tenant_documents_verified_by_fk')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tenant_documents');
    }
};
