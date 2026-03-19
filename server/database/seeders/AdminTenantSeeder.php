<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminTenantSeeder extends Seeder
{
    public function run()
    {
        Admin::updateOrCreate(
            ['email' => 'admin@flatease.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
            ]
        );

        Tenant::updateOrCreate(
            ['email' => 'tenant@flatease.com'],
            [
                'name' => 'Tenant User',
                'password' => Hash::make('password'),
            ]
        );
    }
}
