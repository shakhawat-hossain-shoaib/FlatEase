<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'preferred_contact_method',
        'password',
        'role',
        'account_status',
        'otp_locked_until',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'otp_locked_until' => 'datetime',
    ];

    public function technicianProfile()
    {
        return $this->hasOne(Technician::class);
    }

    public function submittedComplaints()
    {
        return $this->hasMany(Complaint::class, 'tenant_id');
    }

    public function tenantProfile()
    {
        return $this->hasOne(TenantProfile::class);
    }

    public function tenantDocuments()
    {
        return $this->hasMany(TenantDocument::class, 'tenant_user_id');
    }

    public function unitAssignments()
    {
        return $this->hasMany(UnitTenantAssignment::class, 'tenant_user_id');
    }

    public function tenantPayments()
    {
        return $this->hasMany(TenantPayment::class, 'tenant_user_id');
    }

    public function recordedPayments()
    {
        return $this->hasMany(TenantPayment::class, 'recorded_by');
    }
}
