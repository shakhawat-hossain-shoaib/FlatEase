<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OtpChallenge extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'purpose',
        'channel',
        'destination',
        'challenge_token_hash',
        'otp_hash',
        'failed_attempts',
        'max_attempts',
        'resend_count',
        'max_resends',
        'resend_available_at',
        'expires_at',
        'verified_at',
        'locked_until',
        'status',
        'request_ip',
        'user_agent',
        'meta',
    ];

    protected $casts = [
        'resend_available_at' => 'datetime',
        'expires_at' => 'datetime',
        'verified_at' => 'datetime',
        'locked_until' => 'datetime',
        'meta' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
