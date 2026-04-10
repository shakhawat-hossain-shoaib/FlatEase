<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TenantPaymentChargeItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_payment_id',
        'charge_type_id',
        'building_charge_config_id',
        'label_snapshot',
        'category_snapshot',
        'amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function payment()
    {
        return $this->belongsTo(TenantPayment::class, 'tenant_payment_id');
    }

    public function chargeType()
    {
        return $this->belongsTo(BillChargeType::class, 'charge_type_id');
    }

    public function config()
    {
        return $this->belongsTo(BuildingChargeConfig::class, 'building_charge_config_id');
    }
}
