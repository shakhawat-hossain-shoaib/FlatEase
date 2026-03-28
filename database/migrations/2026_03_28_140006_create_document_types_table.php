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
        if (Schema::hasTable('document_types')) {
            return;
        }

        Schema::create('document_types', function (Blueprint $table) {
            $table->id();
            $table->string('type_key', 80)->unique();
            $table->string('label', 160);
            $table->json('allowed_mimes');
            $table->unsignedSmallInteger('max_size_mb')->default(5);
            $table->boolean('is_required')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'is_required'], 'document_types_active_required_idx');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('document_types');
    }
};
