<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class CreateAdminUserCommandTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::dropIfExists('users');
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('role', ['admin', 'tenant'])->default('tenant');
            $table->timestamps();
        });
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('users');
        parent::tearDown();
    }

    public function test_command_creates_admin_user(): void
    {
        $exitCode = Artisan::call('user:create-admin', [
            'email' => 'cli-admin@example.com',
            '--name' => 'CLI Admin',
            '--password' => 'StrongPass123',
        ]);

        $this->assertSame(0, $exitCode);

        $admin = User::where('email', 'cli-admin@example.com')->first();

        $this->assertNotNull($admin);
        $this->assertSame('CLI Admin', $admin->name);
        $this->assertSame('admin', $admin->role);
        $this->assertTrue(Hash::check('StrongPass123', $admin->password));
    }

    public function test_command_upgrades_existing_user_to_admin(): void
    {
        User::create([
            'name' => 'Old Tenant',
            'email' => 'existing@example.com',
            'password' => Hash::make('old-password'),
            'role' => 'tenant',
        ]);

        $exitCode = Artisan::call('user:create-admin', [
            'email' => 'existing@example.com',
            '--name' => 'Updated Admin',
            '--password' => 'UpdatedPass123',
        ]);

        $this->assertSame(0, $exitCode);
        $this->assertSame(1, User::where('email', 'existing@example.com')->count());

        $admin = User::where('email', 'existing@example.com')->first();

        $this->assertSame('Updated Admin', $admin->name);
        $this->assertSame('admin', $admin->role);
        $this->assertTrue(Hash::check('UpdatedPass123', $admin->password));
    }
}
