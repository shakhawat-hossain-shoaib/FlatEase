<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TenantDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_user_id',
        'document_type_id',
        'storage_disk',
        'storage_path',
        'original_filename',
        'mime_type',
        'file_size_bytes',
        'checksum_sha256',
        'status',
        'verified_by',
        'verified_at',
        'rejection_reason',
    ];

    protected $casts = [
        'file_size_bytes' => 'integer',
        'verified_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_user_id');
    }

    public function documentType()
    {
        return $this->belongsTo(DocumentType::class);
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
