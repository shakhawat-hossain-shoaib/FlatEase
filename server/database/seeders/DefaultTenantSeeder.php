<?php

namespace Database\Seeders;

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
        $name = env('DEFAULT_TENANT_NAME', 'Partha');
        $email = env('DEFAULT_TENANT_EMAIL', 'partha@gmail.com');
        $password = env('DEFAULT_TENANT_PASSWORD', '12345678');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->command?->warn('Skipping default tenant seed: DEFAULT_TENANT_EMAIL is invalid.');
            return;
        }

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'role' => 'tenant',
            ]
        );

        $this->command?->info("Default tenant account seeded/updated for {$email}.");
    }
}
