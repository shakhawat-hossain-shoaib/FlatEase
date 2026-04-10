<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BuildingChargeConfig extends Model
{
    use HasFactory;

    protected $fillable = [
        'building_id',
        'charge_type_id',
        'amount',
        'recurrence',
        'billing_month',
        'effective_from',
        'effective_to',
        'is_active',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'billing_month' => 'date',
        'effective_from' => 'date',
        'effective_to' => 'date',
        'is_active' => 'boolean',
    ];

    public function building()
    {
        return $this->belongsTo(Building::class);
    }

    public function chargeType()
    {
        return $this->belongsTo(BillChargeType::class, 'charge_type_id');
    }
}
