<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DefaultAdminSeeder extends Seeder
{
    /**
     * Seed a default admin account from environment configuration.
     */
    public function run(): void
    {
        $name = env('DEFAULT_ADMIN_NAME');
        $email = env('DEFAULT_ADMIN_EMAIL');
        $password = env('DEFAULT_ADMIN_PASSWORD');

        if (!$name || !$email || !$password) {
            $this->command?->warn('Skipping default admin seed: DEFAULT_ADMIN_NAME/EMAIL/PASSWORD not fully configured.');
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->command?->warn('Skipping default admin seed: DEFAULT_ADMIN_EMAIL is invalid.');
            return;
        }

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'role' => 'admin',
            ]
        );

        $this->command?->info("Default admin account seeded/updated for {$email}.");
    }
}
