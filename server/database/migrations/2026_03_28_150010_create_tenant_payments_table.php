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
        if (Schema::hasTable('tenant_payments')) {
            return;
        }

        Schema::create('tenant_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_user_id');
            $table->unsignedBigInteger('unit_tenant_assignment_id')->nullable();
            $table->date('billing_month');
            $table->date('due_date');
            $table->decimal('rent_amount', 12, 2)->default(0);
            $table->decimal('utility_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->enum('status', ['pending', 'partially_paid', 'paid', 'overdue'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->string('payment_method', 50)->nullable();
            $table->string('transaction_ref', 120)->nullable();
            $table->string('notes', 500)->nullable();
            $table->unsignedBigInteger('recorded_by')->nullable();
            $table->timestamps();

            $table->unique(['tenant_user_id', 'billing_month'], 'tenant_payments_tenant_month_unique');
            $table->index(['tenant_user_id', 'status'], 'tenant_payments_tenant_status_idx');

            $table->foreign('tenant_user_id', 'tenant_payments_tenant_fk')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('unit_tenant_assignment_id', 'tenant_payments_assignment_fk')
                ->references('id')
                ->on('unit_tenant_assignments')
                ->onDelete('set null');

            $table->foreign('recorded_by', 'tenant_payments_recorded_by_fk')
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
        Schema::dropIfExists('tenant_payments');
    }
};
