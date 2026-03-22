<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Database\Seeders\DefaultAdminSeeder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DefaultAdminSeederTest extends TestCase
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

    public function test_default_admin_seeder_creates_admin_from_env(): void
    {
        putenv('DEFAULT_ADMIN_NAME=Seed Admin');
        putenv('DEFAULT_ADMIN_EMAIL=seed-admin@example.com');
        putenv('DEFAULT_ADMIN_PASSWORD=StrongPassword123');

        (new DefaultAdminSeeder())->run();

        $admin = User::where('email', 'seed-admin@example.com')->first();

        $this->assertNotNull($admin);
        $this->assertSame('Seed Admin', $admin->name);
        $this->assertSame('admin', $admin->role);
        $this->assertTrue(Hash::check('StrongPassword123', $admin->password));
    }

    public function test_default_admin_seeder_updates_existing_record_without_duplication(): void
    {
        User::create([
            'name' => 'Old Name',
            'email' => 'seed-admin@example.com',
            'password' => Hash::make('old-pass'),
            'role' => 'tenant',
        ]);

        putenv('DEFAULT_ADMIN_NAME=Updated Admin');
        putenv('DEFAULT_ADMIN_EMAIL=seed-admin@example.com');
        putenv('DEFAULT_ADMIN_PASSWORD=UpdatedStrongPassword');

        (new DefaultAdminSeeder())->run();
        (new DefaultAdminSeeder())->run();

        $this->assertSame(1, User::where('email', 'seed-admin@example.com')->count());

        $admin = User::where('email', 'seed-admin@example.com')->first();

        $this->assertSame('Updated Admin', $admin->name);
        $this->assertSame('admin', $admin->role);
        $this->assertTrue(Hash::check('UpdatedStrongPassword', $admin->password));
    }
}
