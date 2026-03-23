<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Complaint;
use App\Models\ComplaintStatusHistory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ComplaintApiTest extends TestCase
{
    use RefreshDatabase;

    protected $tenant;
    protected $admin;
    protected $otherTenant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = User::factory()->create(['role' => 'tenant']);
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->otherTenant = User::factory()->create(['role' => 'tenant']);
    }

    // POST create complaint tests
    
    public function test_unauthenticated_cannot_create_complaint()
    {
        $response = $this->postJson('/api/complaints', [
            'title' => 'Test Complaint',
            'category' => 'Maintenance',
            'description' => 'Test description',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    public function test_authenticated_tenant_can_create_complaint()
    {
        $response = $this->actingAs($this->tenant)->postJson('/api/complaints', [
            'title' => 'Broken Door',
            'category' => 'Maintenance',
            'description' => 'Door lock is broken',
            'priority' => 'high',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure(['id', 'tenant_id', 'title', 'status', 'priority']);
        $this->assertEquals($this->tenant->id, $response->json('tenant_id'));
        $this->assertEquals('pending', $response->json('status'));
        $this->assertEquals('high', $response->json('priority'));
    }

    public function test_complaint_priority_defaults_to_medium()
    {
        $response = $this->actingAs($this->tenant)->postJson('/api/complaints', [
            'title' => 'Issue',
            'category' => 'General',
            'description' => 'Test',
        ]);

        $response->assertStatus(201);
        $this->assertEquals('medium', $response->json('priority'));
    }

    public function test_create_complaint_validation_requires_fields()
    {
        $response = $this->actingAs($this->tenant)->postJson('/api/complaints', [
            'title' => 'Missing fields',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors']);
    }

    public function test_create_complaint_validation_rejects_invalid_priority()
    {
        $response = $this->actingAs($this->tenant)->postJson('/api/complaints', [
            'title' => 'Test',
            'category' => 'Test',
            'description' => 'Test',
            'priority' => 'invalid',
        ]);

        $response->assertStatus(422);
    }

    // GET list complaints tests

    public function test_unauthenticated_cannot_list_complaints()
    {
        $response = $this->getJson('/api/complaints');
        $response->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    public function test_tenant_can_list_own_complaints()
    {
        Complaint::factory(3)->create(['tenant_id' => $this->tenant->id]);
        Complaint::factory(2)->create(['tenant_id' => $this->otherTenant->id]);

        $response = $this->actingAs($this->tenant)->getJson('/api/complaints');

        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data'));
    }

    public function test_list_complaints_returns_pagination_metadata()
    {
        Complaint::factory(20)->create(['tenant_id' => $this->tenant->id]);

        $response = $this->actingAs($this->tenant)->getJson('/api/complaints?per_page=10');

        $response->assertStatus(200);
        $response->assertJsonStructure(['data', 'total', 'per_page', 'current_page', 'last_page']);
        $this->assertEquals(10, count($response->json('data')));
    }

    public function test_list_complaints_newest_first()
    {
        $c1 = Complaint::factory()->create(['tenant_id' => $this->tenant->id, 'created_at' => now()->subDays(2)]);
        $c2 = Complaint::factory()->create(['tenant_id' => $this->tenant->id, 'created_at' => now()]);

        $response = $this->actingAs($this->tenant)->getJson('/api/complaints');

        $this->assertEquals($c2->id, $response->json('data')[0]['id']);
        $this->assertEquals($c1->id, $response->json('data')[1]['id']);
    }

    // GET detail complaint tests

    public function test_unauthenticated_cannot_get_complaint_detail()
    {
        $complaint = Complaint::factory()->create(['tenant_id' => $this->tenant->id]);
        $response = $this->getJson("/api/complaints/{$complaint->id}");
        $response->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    public function test_tenant_can_get_own_complaint_detail()
    {
        $complaint = Complaint::factory()->create(['tenant_id' => $this->tenant->id]);

        $response = $this->actingAs($this->tenant)->getJson("/api/complaints/{$complaint->id}");

        $response->assertStatus(200);
        $this->assertEquals($complaint->id, $response->json('id'));
        $response->assertJsonStructure(['id', 'tenant_id', 'title', 'status', 'priority']);
    }

    public function test_tenant_cannot_get_other_tenant_complaint()
    {
        $complaint = Complaint::factory()->create(['tenant_id' => $this->otherTenant->id]);

        $response = $this->actingAs($this->tenant)->getJson("/api/complaints/{$complaint->id}");

        $response->assertStatus(403);
    }

    public function test_get_complaint_returns_404_for_nonexistent()
    {
        $response = $this->actingAs($this->tenant)->getJson('/api/complaints/99999');
        $response->assertStatus(404);
    }

    // GET admin list tests

    public function test_non_admin_cannot_list_all_complaints()
    {
        $response = $this->actingAs($this->tenant)->getJson('/api/admin/complaints');
        $response->assertStatus(403);
    }

    public function test_admin_can_list_all_complaints()
    {
        Complaint::factory(3)->create(['tenant_id' => $this->tenant->id]);
        Complaint::factory(2)->create(['tenant_id' => $this->otherTenant->id]);

        $response = $this->actingAs($this->admin)->getJson('/api/admin/complaints');

        $response->assertStatus(200);
        $this->assertCount(5, $response->json('data'));
    }

    public function test_admin_can_filter_by_status()
    {
        Complaint::factory(2)->create(['status' => 'pending']);
        Complaint::factory(1)->create(['status' => 'resolved']);

        $response = $this->actingAs($this->admin)->getJson('/api/admin/complaints?status=pending');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }

    public function test_admin_can_filter_by_priority()
    {
        Complaint::factory(2)->create(['priority' => 'high']);
        Complaint::factory(1)->create(['priority' => 'low']);

        $response = $this->actingAs($this->admin)->getJson('/api/admin/complaints?priority=high');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }

    // PATCH status update tests

    public function test_non_admin_cannot_update_complaint_status()
    {
        $complaint = Complaint::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($this->tenant)->patchJson(
            "/api/admin/complaints/{$complaint->id}/status",
            ['new_status' => 'in_progress']
        );

        $response->assertStatus(403);
    }

    public function test_admin_can_update_complaint_status()
    {
        $complaint = Complaint::factory()->create(['status' => 'pending', 'tenant_id' => $this->tenant->id]);

        $response = $this->actingAs($this->admin)->patchJson(
            "/api/admin/complaints/{$complaint->id}/status",
            ['new_status' => 'in_progress']
        );

        $response->assertStatus(200);
        $this->assertEquals('in_progress', $response->json('status'));
        $this->assertDatabaseHas('complaints', ['id' => $complaint->id, 'status' => 'in_progress']);
    }

    public function test_status_update_creates_history_record()
    {
        $complaint = Complaint::factory()->create(['status' => 'pending']);

        $this->actingAs($this->admin)->patchJson(
            "/api/admin/complaints/{$complaint->id}/status",
            ['new_status' => 'in_progress']
        );

        $this->assertDatabaseHas('complaint_status_histories', [
            'complaint_id' => $complaint->id,
            'old_status' => 'pending',
            'new_status' => 'in_progress',
            'changed_by_id' => $this->admin->id,
        ]);
    }

    public function test_status_update_to_resolved_sets_resolved_at()
    {
        $complaint = Complaint::factory()->create(['status' => 'in_progress', 'resolved_at' => null]);

        $this->actingAs($this->admin)->patchJson(
            "/api/admin/complaints/{$complaint->id}/status",
            ['new_status' => 'resolved']
        );

        $complaint->refresh();
        $this->assertNotNull($complaint->resolved_at);
    }

    public function test_status_update_rejects_same_status()
    {
        $complaint = Complaint::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($this->admin)->patchJson(
            "/api/admin/complaints/{$complaint->id}/status",
            ['new_status' => 'pending']
        );

        $response->assertStatus(422);
    }

    public function test_status_update_validates_transitions()
    {
        $complaint = Complaint::factory()->create(['status' => 'resolved']);

        $response = $this->actingAs($this->admin)->patchJson(
            "/api/admin/complaints/{$complaint->id}/status",
            ['new_status' => 'pending']
        );

        $response->assertStatus(422);
    }

    public function test_valid_transitions_from_pending()
    {
        $complaint = Complaint::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($this->admin)->patchJson(
            "/api/admin/complaints/{$complaint->id}/status",
            ['new_status' => 'resolved']
        );

        $response->assertStatus(200);
        $this->assertEquals('resolved', $response->json('status'));
    }
}
