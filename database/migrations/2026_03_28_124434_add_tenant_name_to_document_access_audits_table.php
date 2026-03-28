<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTenantNameToDocumentAccessAuditsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('document_access_audits', function (Blueprint $table) {
            $table->string('tenant_name', 255)->nullable()->after('user_agent');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('document_access_audits', function (Blueprint $table) {
            $table->dropColumn('tenant_name');
        });
    }
}
