<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    use HasFactory;

    protected $fillable = [
        'building_id',
        'floor_id',
        'unit_number',
        'bedrooms',
        'bathrooms',
        'area_sqft',
        'occupancy_status',
    ];

    protected $casts = [
        'bedrooms' => 'integer',
        'bathrooms' => 'integer',
        'area_sqft' => 'integer',
    ];

    public function building()
    {
        return $this->belongsTo(Building::class);
    }

    public function floor()
    {
        return $this->belongsTo(Floor::class);
    }

    public function assignments()
    {
        return $this->hasMany(UnitTenantAssignment::class);
    }

    public function activeAssignment()
    {
        return $this->hasOne(UnitTenantAssignment::class)->where('status', 'active')->latest('id');
    }
}
