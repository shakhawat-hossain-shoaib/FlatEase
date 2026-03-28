<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentAccessAudit extends Model
{
    use HasFactory;

    public const UPDATED_AT = null;

    protected $fillable = [
        'tenant_document_id',
        'tenant_user_id',
        'actor_user_id',
        'actor_role',
        'action',
        'document_type_key',
        'ip_address',
        'user_agent',
        'tenant_name',
        'metadata',
    ];

    protected $casts = [
        'tenant_document_id' => 'integer',
        'tenant_user_id' => 'integer',
        'actor_user_id' => 'integer',
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    public function document()
    {
        return $this->belongsTo(TenantDocument::class, 'tenant_document_id');
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
