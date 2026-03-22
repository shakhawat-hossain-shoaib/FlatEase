<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateAdminUserCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:create-admin
                            {email : Email of the admin account}
                            {--name= : Name of the admin account}
                            {--password= : Password for the admin account}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create or update an admin account from terminal';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = (string) $this->argument('email');
        $name = (string) ($this->option('name') ?: $this->ask('Admin name'));

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email format.');
            return self::FAILURE;
        }

        if ($name === '') {
            $this->error('Admin name is required.');
            return self::FAILURE;
        }

        $passwordOption = $this->option('password');
        $password = is_string($passwordOption) && $passwordOption !== ''
            ? $passwordOption
            : (string) $this->secret('Admin password');

        if (strlen($password) < 8) {
            $this->error('Password must be at least 8 characters.');
            return self::FAILURE;
        }

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'role' => 'admin',
            ]
        );

        $this->info("Admin account ready: {$user->email}");
        return self::SUCCESS;
    }
}
