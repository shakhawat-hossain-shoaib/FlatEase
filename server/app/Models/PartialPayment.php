<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartialPayment extends Model
{
    use HasFactory;

    protected $table = 'partial_payments';

    protected $fillable = [
        'tenant_payment_id',
        'tenant_user_id',
        'amount',
        'payment_method',
        'transaction_id',
        'transaction_ref',
        'status',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function tenantPayment()
    {
        return $this->belongsTo(TenantPayment::class, 'tenant_payment_id');
    }

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_user_id');
    }
}
