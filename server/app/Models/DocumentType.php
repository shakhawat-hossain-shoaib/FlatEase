<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentType extends Model
{
    use HasFactory;

    protected $fillable = [
        'type_key',
        'label',
        'allowed_mimes',
        'max_size_mb',
        'is_sensitive',
        'admin_only_access',
        'is_required',
        'is_active',
    ];

    protected $casts = [
        'allowed_mimes' => 'array',
        'max_size_mb' => 'integer',
        'is_sensitive' => 'boolean',
        'admin_only_access' => 'boolean',
        'is_required' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function tenantDocuments()
    {
        return $this->hasMany(TenantDocument::class);
    }
}
