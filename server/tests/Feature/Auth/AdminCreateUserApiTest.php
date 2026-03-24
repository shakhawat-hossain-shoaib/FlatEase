<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class AdminCreateUserApiTest extends TestCase
{
    use WithFaker;

    protected function setUp(): void
    {
        parent::setUp();

        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('users');
        Schema::enableForeignKeyConstraints();
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('role', ['admin', 'tenant', 'technician'])->default('tenant');
            $table->timestamps();
        });
    }

    protected function tearDown(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('users');
        Schema::enableForeignKeyConstraints();
        parent::tearDown();
    }

    public function test_unauthenticated_user_cannot_create_users(): void
    {
        $response = $this->postJson('/api/admin/users', [
            'name' => 'New User',
            'email' => 'new-user@example.com',
            'password' => 'StrongPass123',
            'password_confirmation' => 'StrongPass123',
            'role' => 'tenant',
        ]);

        $response
            ->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.',
            ]);
    }

    public function test_tenant_cannot_create_users(): void
    {
        $tenant = User::create([
            'name' => 'Tenant User',
            'email' => 'tenant@example.com',
            'password' => Hash::make('password123'),
            'role' => 'tenant',
        ]);

        $response = $this->actingAs($tenant)->postJson('/api/admin/users', [
            'name' => 'Blocked User',
            'email' => 'blocked@example.com',
            'password' => 'StrongPass123',
            'password_confirmation' => 'StrongPass123',
            'role' => 'tenant',
        ]);

        $response
            ->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Forbidden. Admin access required.',
            ]);
    }

    public function test_admin_can_create_user_with_selected_role(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        $response = $this->actingAs($admin)->postJson('/api/admin/users', [
            'name' => 'Created Admin',
            'email' => 'created-admin@example.com',
            'password' => 'StrongPass123',
            'password_confirmation' => 'StrongPass123',
            'role' => 'admin',
        ]);

        $response
            ->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'User created successfully.',
                'user' => [
                    'email' => 'created-admin@example.com',
                    'role' => 'admin',
                ],
            ]);

        $created = User::where('email', 'created-admin@example.com')->first();

        $this->assertNotNull($created);
        $this->assertSame('admin', $created->role);
        $this->assertTrue(Hash::check('StrongPass123', $created->password));
    }
}
