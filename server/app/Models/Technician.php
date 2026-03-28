<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Technician extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'phone',
        'email',
        'specialization',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function complaints()
    {
        return $this->belongsToMany(Complaint::class, 'complaint_technician_assignments')
            ->withPivot(['assigned_by_admin_id', 'assigned_at', 'assignment_note', 'is_primary'])
            ->withTimestamps();
    }
}
