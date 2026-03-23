<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'assigned_technician_id',
        'title',
        'category',
        'description',
        'priority',
        'status',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    public function assignedTechnician()
    {
        return $this->belongsTo(User::class, 'assigned_technician_id');
    }

    public function statusHistories()
    {
        return $this->hasMany(ComplaintStatusHistory::class);
    }

    public function comments()
    {
        return $this->hasMany(ComplaintComment::class);
    }
}
