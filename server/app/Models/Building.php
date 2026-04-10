<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Building extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'address_line',
        'city',
        'state',
        'postal_code',
        'country',
        'total_floors',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'total_floors' => 'integer',
    ];

    public function floors()
    {
        return $this->hasMany(Floor::class);
    }

    public function units()
    {
        return $this->hasMany(Unit::class);
    }

    public function chargeTypes()
    {
        return $this->hasMany(BillChargeType::class);
    }

    public function chargeConfigs()
    {
        return $this->hasMany(BuildingChargeConfig::class);
    }
}
