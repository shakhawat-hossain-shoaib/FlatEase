<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Floor extends Model
{
    use HasFactory;

    protected $fillable = [
        'building_id',
        'floor_number',
        'floor_label',
        'sort_order',
    ];

    protected $casts = [
        'floor_number' => 'integer',
        'sort_order' => 'integer',
    ];

    public function building()
    {
        return $this->belongsTo(Building::class);
    }

    public function units()
    {
        return $this->hasMany(Unit::class);
    }
}
