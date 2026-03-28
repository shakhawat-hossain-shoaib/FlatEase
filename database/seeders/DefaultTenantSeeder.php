<?php

namespace Database\Seeders;

use App\Models\TenantProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DefaultTenantSeeder extends Seeder
{
    /**
     * Seed a default tenant account from environment configuration.
     */
    public function run(): void
    {
        $name = env('DEFAULT_TENANT_NAME', 'FlatEase Tenant');
        $email = env('DEFAULT_TENANT_EMAIL', 'tenant@flatease.local');
        $password = env('DEFAULT_TENANT_PASSWORD', 'Tenant@123456');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->command?->warn('Skipping default tenant seed: DEFAULT_TENANT_EMAIL is invalid.');
            return;
        }

        $tenant = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'role' => 'tenant',
            ]
        );

        TenantProfile::updateOrCreate(['user_id' => $tenant->id], []);

        $this->command?->info("Default tenant account seeded/updated for {$email}.");
    }
}
