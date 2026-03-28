<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TenantProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'phone',
        'emergency_contact_name',
        'emergency_contact_phone',
        'nid_number',
        'job_title',
        'employer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
