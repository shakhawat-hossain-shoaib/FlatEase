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
        'assigned_by_id',
        'assigned_at',
        'sla_due_at',
        'title',
        'category',
        'description',
        'priority',
        'status',
        'resolved_at',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'sla_due_at' => 'datetime',
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

    public function technicians()
    {
        return $this->belongsToMany(Technician::class, 'complaint_technician_assignments')
            ->withPivot(['assigned_by_admin_id', 'assigned_at', 'assignment_note', 'is_primary'])
            ->withTimestamps();
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by_id');
    }

    public function statusHistories()
    {
        return $this->hasMany(ComplaintStatusHistory::class);
    }

    public function comments()
    {
        return $this->hasMany(ComplaintComment::class);
    }

    public function assignmentHistories()
    {
        return $this->hasMany(ComplaintAssignmentHistory::class);
    }

    public function technicianPayments()
    {
        return $this->hasMany(TechnicianPayment::class, 'complaint_id');
    }
}
