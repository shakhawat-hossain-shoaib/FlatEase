<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UnitTenantAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_id',
        'tenant_user_id',
        'assigned_by',
        'lease_start_date',
        'lease_end_date',
        'rent_amount',
        'status',
        'moved_out_at',
    ];

    protected $casts = [
        'lease_start_date' => 'date',
        'lease_end_date' => 'date',
        'rent_amount' => 'decimal:2',
        'moved_out_at' => 'datetime',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_user_id');
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function payments()
    {
        return $this->hasMany(TenantPayment::class, 'unit_tenant_assignment_id');
    }
}
