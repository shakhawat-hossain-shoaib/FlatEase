<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComplaintAssignmentHistory extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'complaint_id',
        'previous_assigned_technician_id',
        'new_assigned_technician_id',
        'assigned_by_id',
        'assigned_at',
        'reason',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
    ];

    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }

    public function previousAssignee()
    {
        return $this->belongsTo(User::class, 'previous_assigned_technician_id');
    }

    public function newAssignee()
    {
        return $this->belongsTo(User::class, 'new_assigned_technician_id');
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by_id');
    }
}
