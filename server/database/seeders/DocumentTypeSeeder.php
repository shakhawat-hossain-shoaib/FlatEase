<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DocumentTypeSeeder extends Seeder
{
    /**
     * Seed required tenant document types.
     */
    public function run(): void
    {
        $rows = [
            [
                'type_key' => 'nid',
                'label' => 'National ID (NID)',
                'allowed_mimes' => json_encode(['application/pdf', 'image/jpeg', 'image/png']),
                'max_size_mb' => 5,
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'type_key' => 'personal_photo',
                'label' => 'Personal Photo',
                'allowed_mimes' => json_encode(['image/jpeg', 'image/png', 'image/webp']),
                'max_size_mb' => 3,
                'is_required' => true,
                'is_active' => true,
            ],
            [
                'type_key' => 'job_id_card',
                'label' => 'Job ID Card',
                'allowed_mimes' => json_encode(['application/pdf', 'image/jpeg', 'image/png']),
                'max_size_mb' => 5,
                'is_required' => true,
                'is_active' => true,
            ],
        ];

        foreach ($rows as $row) {
            DB::table('document_types')->updateOrInsert(
                ['type_key' => $row['type_key']],
                array_merge($row, [
                    'updated_at' => now(),
                    'created_at' => now(),
                ])
            );
        }
    }
}
