<?php

namespace Database\Seeders;

use App\Models\Technician;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TechnicianSeeder extends Seeder
{
    /**
     * Seed sample technician accounts with profiles for complaint assignment tests.
     */
    public function run(): void
    {
        $seed = [
            [
                'name' => 'Rafiq Electric',
                'email' => 'tech.electrical@flatease.local',
                'phone' => '+8801700001001',
                'specialization' => 'electrical',
            ],
            [
                'name' => 'Mita Plumbing',
                'email' => 'tech.plumbing@flatease.local',
                'phone' => '+8801700001002',
                'specialization' => 'plumbing',
            ],
            [
                'name' => 'Kamal Maintenance',
                'email' => 'tech.maintenance@flatease.local',
                'phone' => '+8801700001003',
                'specialization' => 'maintenance',
            ],
            [
                'name' => 'Nadia HVAC',
                'email' => 'tech.hvac@flatease.local',
                'phone' => '+8801700001004',
                'specialization' => 'hvac',
            ],
            [
                'name' => 'Sohel Carpentry',
                'email' => 'tech.carpentry@flatease.local',
                'phone' => '+8801700001005',
                'specialization' => 'carpentry',
            ],
        ];

        foreach ($seed as $item) {
            $user = User::updateOrCreate(
                ['email' => $item['email']],
                [
                    'name' => $item['name'],
                    'password' => Hash::make(env('DEFAULT_TECHNICIAN_PASSWORD', 'Technician@123456')),
                    'role' => 'technician',
                ]
            );

            Technician::updateOrCreate(
                ['email' => $item['email']],
                [
                    'user_id' => $user->id,
                    'name' => $item['name'],
                    'phone' => $item['phone'],
                    'specialization' => $item['specialization'],
                    'active' => true,
                ]
            );
        }
    }
}
