<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TechnicianPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'complaint_id',
        'tenant_user_id',
        'technician_user_id',
        'building_id',
        'amount',
        'currency',
        'status',
        'payment_method',
        'transaction_ref',
        'failure_reason',
        'paid_at',
        'callback_payload',
        'validated_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'validated_at' => 'datetime',
        'callback_payload' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function complaint()
    {
        return $this->belongsTo(Complaint::class, 'complaint_id');
    }

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_user_id');
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'technician_user_id');
    }

    public function building()
    {
        return $this->belongsTo(Building::class, 'building_id');
    }
}
