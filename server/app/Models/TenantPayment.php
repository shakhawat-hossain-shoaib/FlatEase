<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TenantPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_user_id',
        'unit_tenant_assignment_id',
        'billing_month',
        'due_date',
        'rent_amount',
        'utility_amount',
        'total_amount',
        'amount_paid',
        'status',
        'paid_at',
        'payment_method',
        'transaction_ref',
        'notes',
        'recorded_by',
    ];

    protected $casts = [
        'billing_month' => 'date',
        'due_date' => 'date',
        'rent_amount' => 'decimal:2',
        'utility_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_user_id');
    }

    public function assignment()
    {
        return $this->belongsTo(UnitTenantAssignment::class, 'unit_tenant_assignment_id');
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
