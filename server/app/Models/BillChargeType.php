<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillChargeType extends Model
{
    use HasFactory;

    protected $fillable = [
        'building_id',
        'key_name',
        'display_name',
        'category',
        'is_system',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'building_id' => 'integer',
        'is_system' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function building()
    {
        return $this->belongsTo(Building::class);
    }

    public function configs()
    {
        return $this->hasMany(BuildingChargeConfig::class, 'charge_type_id');
    }
}
