<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Complaint;
use App\Models\ComplaintAssignmentHistory;
use App\Models\ComplaintComment;
use App\Models\ComplaintStatusHistory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ComplaintApiTest extends TestCase
{
    use RefreshDatabase;

    protected $tenant;
    protected $admin;
    protected $technician;
    protected $otherTenant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = User::factory()->create(['role' => 'tenant']);
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->technician = User::factory()->create(['role' => 'technician']);
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

    // PATCH assignment tests

    public function test_admin_can_assign_complaint_to_technician()
    {
        $complaint = Complaint::factory()->create([
            'tenant_id' => $this->tenant->id,
            'status' => 'in_progress',
            'assigned_technician_id' => null,
        ]);

        $response = $this->actingAs($this->admin)->patchJson(
            "/api/admin/complaints/{$complaint->id}/assign",
            ['assigned_technician_id' => $this->technician->id]
        );

        $response->assertStatus(200);
        $this->assertEquals($this->technician->id, $response->json('assigned_technician_id'));
        $this->assertEquals($this->admin->id, $response->json('assigned_by_id'));
        $this->assertDatabaseHas('complaints', [
            'id' => $complaint->id,
            'assigned_technician_id' => $this->technician->id,
            'assigned_by_id' => $this->admin->id,
        ]);
    }

    public function test_non_admin_cannot_assign_complaint()
    {
        $complaint = Complaint::factory()->create(['tenant_id' => $this->tenant->id]);

        $response = $this->actingAs($this->tenant)->patchJson(
            "/api/admin/complaints/{$complaint->id}/assign",
            ['assigned_technician_id' => $this->technician->id]
        );

        $response->assertStatus(403);
    }

    public function test_assignment_rejects_invalid_assignee_role()
    {
        $complaint = Complaint::factory()->create(['tenant_id' => $this->tenant->id]);

        $response = $this->actingAs($this->admin)->patchJson(
            "/api/admin/complaints/{$complaint->id}/assign",
            ['assigned_technician_id' => $this->otherTenant->id]
        );

        $response->assertStatus(422);
    }

    public function test_assignment_on_pending_auto_transitions_to_in_progress_and_creates_history()
    {
        $complaint = Complaint::factory()->create([
            'tenant_id' => $this->tenant->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->admin)->patchJson(
            "/api/admin/complaints/{$complaint->id}/assign",
            ['assigned_technician_id' => $this->technician->id]
        );

        $response->assertStatus(200);
        $this->assertEquals('in_progress', $response->json('status'));

        $this->assertDatabaseHas('complaint_status_histories', [
            'complaint_id' => $complaint->id,
            'old_status' => 'pending',
            'new_status' => 'in_progress',
            'changed_by_id' => $this->admin->id,
        ]);
    }

    public function test_reassignment_creates_audit_history_entries()
    {
        $secondTechnician = User::factory()->create(['role' => 'technician']);
        $complaint = Complaint::factory()->create([
            'tenant_id' => $this->tenant->id,
            'status' => 'in_progress',
        ]);

        $this->actingAs($this->admin)->patchJson(
            "/api/admin/complaints/{$complaint->id}/assign",
            ['assigned_technician_id' => $this->technician->id]
        )->assertStatus(200);

        $this->actingAs($this->admin)->patchJson(
            "/api/admin/complaints/{$complaint->id}/assign",
            ['assigned_technician_id' => $secondTechnician->id]
        )->assertStatus(200);

        $this->assertEquals(2, ComplaintAssignmentHistory::where('complaint_id', $complaint->id)->count());

        $this->assertDatabaseHas('complaint_assignment_histories', [
            'complaint_id' => $complaint->id,
            'previous_assigned_technician_id' => $this->technician->id,
            'new_assigned_technician_id' => $secondTechnician->id,
            'assigned_by_id' => $this->admin->id,
        ]);
    }

    // Complaint comments tests

    public function test_unauthenticated_cannot_post_complaint_comment()
    {
        $complaint = Complaint::factory()->create(['tenant_id' => $this->tenant->id]);

        $response = $this->postJson("/api/complaints/{$complaint->id}/comments", [
            'comment' => 'Checking this issue.',
        ]);

        $response->assertStatus(401);
    }

    public function test_owner_admin_and_assigned_technician_can_post_comments()
    {
        $complaint = Complaint::factory()->create([
            'tenant_id' => $this->tenant->id,
            'assigned_technician_id' => $this->technician->id,
            'status' => 'in_progress',
        ]);

        $this->actingAs($this->tenant)->postJson("/api/complaints/{$complaint->id}/comments", [
            'comment' => 'Owner comment',
        ])->assertStatus(201);

        $this->actingAs($this->admin)->postJson("/api/complaints/{$complaint->id}/comments", [
            'comment' => 'Admin comment',
        ])->assertStatus(201);

        $this->actingAs($this->technician)->postJson("/api/complaints/{$complaint->id}/comments", [
            'comment' => 'Technician comment',
        ])->assertStatus(201);

        $this->assertEquals(3, ComplaintComment::where('complaint_id', $complaint->id)->count());
    }

    public function test_unauthorized_user_cannot_post_or_list_comments()
    {
        $outsider = User::factory()->create(['role' => 'tenant']);
        $complaint = Complaint::factory()->create([
            'tenant_id' => $this->tenant->id,
            'assigned_technician_id' => $this->technician->id,
            'status' => 'in_progress',
        ]);

        $postResponse = $this->actingAs($outsider)->postJson("/api/complaints/{$complaint->id}/comments", [
            'comment' => 'I should not be able to post',
        ]);
        $postResponse->assertStatus(403);

        $getResponse = $this->actingAs($outsider)->getJson("/api/complaints/{$complaint->id}/comments");
        $getResponse->assertStatus(403);
    }

    public function test_comment_validation_rejects_blank_values()
    {
        $complaint = Complaint::factory()->create(['tenant_id' => $this->tenant->id]);

        $response = $this->actingAs($this->tenant)->postJson("/api/complaints/{$complaint->id}/comments", [
            'comment' => '   ',
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure(['errors']);
    }

    public function test_comment_listing_returns_oldest_to_newest_for_authorized_user()
    {
        $complaint = Complaint::factory()->create([
            'tenant_id' => $this->tenant->id,
            'assigned_technician_id' => $this->technician->id,
            'status' => 'in_progress',
        ]);

        $first = ComplaintComment::create([
            'complaint_id' => $complaint->id,
            'user_id' => $this->tenant->id,
            'comment' => 'First',
            'created_at' => now()->subMinutes(10),
            'updated_at' => now()->subMinutes(10),
        ]);

        $second = ComplaintComment::create([
            'complaint_id' => $complaint->id,
            'user_id' => $this->admin->id,
            'comment' => 'Second',
            'created_at' => now()->subMinutes(5),
            'updated_at' => now()->subMinutes(5),
        ]);

        $response = $this->actingAs($this->technician)->getJson("/api/complaints/{$complaint->id}/comments");

        $response->assertStatus(200);
        $this->assertEquals($first->id, $response->json('0.id'));
        $this->assertEquals($second->id, $response->json('1.id'));
    }

    // Notifications tests

    public function test_assignment_triggers_notifications_for_tenant_and_assigned_technician()
    {
        $complaint = Complaint::factory()->create([
            'tenant_id' => $this->tenant->id,
            'status' => 'pending',
        ]);

        $this->actingAs($this->admin)->patchJson(
            "/api/admin/complaints/{$complaint->id}/assign",
            ['assigned_technician_id' => $this->technician->id]
        )->assertStatus(200);

        $tenantNotification = $this->tenant->fresh()->notifications()->latest()->first();
        $technicianNotification = $this->technician->fresh()->notifications()->latest()->first();

        $this->assertNotNull($tenantNotification);
        $this->assertNotNull($technicianNotification);
        $this->assertSame('assigned', data_get($tenantNotification->data, 'type'));
        $this->assertSame('assigned', data_get($technicianNotification->data, 'type'));
    }

    public function test_status_update_triggers_notifications_for_relevant_users()
    {
        $complaint = Complaint::factory()->create([
            'tenant_id' => $this->tenant->id,
            'assigned_technician_id' => $this->technician->id,
            'status' => 'in_progress',
        ]);

        $this->actingAs($this->admin)->patchJson(
            "/api/admin/complaints/{$complaint->id}/status",
            ['new_status' => 'resolved']
        )->assertStatus(200);

        $this->assertSame('status_changed', data_get($this->tenant->fresh()->notifications()->latest()->first()->data, 'type'));
        $this->assertSame('status_changed', data_get($this->technician->fresh()->notifications()->latest()->first()->data, 'type'));
    }

    public function test_comment_creation_triggers_notification_for_other_relevant_user_only()
    {
        $complaint = Complaint::factory()->create([
            'tenant_id' => $this->tenant->id,
            'assigned_technician_id' => $this->technician->id,
            'status' => 'in_progress',
        ]);

        $this->actingAs($this->tenant)->postJson("/api/complaints/{$complaint->id}/comments", [
            'comment' => 'Please fix this soon.',
        ])->assertStatus(201);

        $this->assertSame(0, $this->tenant->fresh()->notifications()->count());
        $this->assertSame('comment_added', data_get($this->technician->fresh()->notifications()->latest()->first()->data, 'type'));
    }

    public function test_unauthorized_actions_do_not_trigger_notifications()
    {
        $outsider = User::factory()->create(['role' => 'tenant']);
        $complaint = Complaint::factory()->create([
            'tenant_id' => $this->tenant->id,
            'assigned_technician_id' => $this->technician->id,
            'status' => 'in_progress',
        ]);

        $before = $this->technician->fresh()->notifications()->count() + $this->tenant->fresh()->notifications()->count();

        $this->actingAs($outsider)->postJson("/api/complaints/{$complaint->id}/comments", [
            'comment' => 'Unauthorized post attempt',
        ])->assertStatus(403);

        $after = $this->technician->fresh()->notifications()->count() + $this->tenant->fresh()->notifications()->count();
        $this->assertSame($before, $after);
    }

    public function test_notification_list_is_scoped_to_authenticated_user()
    {
        $complaint = Complaint::factory()->create([
            'tenant_id' => $this->tenant->id,
            'assigned_technician_id' => $this->technician->id,
            'status' => 'in_progress',
        ]);

        $this->actingAs($this->tenant)->postJson("/api/complaints/{$complaint->id}/comments", [
            'comment' => 'Tenant message',
        ])->assertStatus(201);

        $this->actingAs($this->technician)->postJson("/api/complaints/{$complaint->id}/comments", [
            'comment' => 'Tech response',
        ])->assertStatus(201);

        $tenantResponse = $this->actingAs($this->tenant)->getJson('/api/notifications');
        $tenantResponse->assertStatus(200);
        $this->assertSame(1, count($tenantResponse->json('data')));

        $technicianResponse = $this->actingAs($this->technician)->getJson('/api/notifications');
        $technicianResponse->assertStatus(200);
        $this->assertSame(1, count($technicianResponse->json('data')));
    }

    public function test_user_can_mark_own_notification_as_read()
    {
        $complaint = Complaint::factory()->create([
            'tenant_id' => $this->tenant->id,
            'assigned_technician_id' => $this->technician->id,
            'status' => 'in_progress',
        ]);

        $this->actingAs($this->tenant)->postJson("/api/complaints/{$complaint->id}/comments", [
            'comment' => 'Tenant update',
        ])->assertStatus(201);

        $notification = $this->technician->fresh()->notifications()->latest()->first();
        $this->assertNotNull($notification);
        $this->assertNull($notification->read_at);

        $response = $this->actingAs($this->technician)
            ->patchJson("/api/notifications/{$notification->id}/read");

        $response->assertStatus(200);
        $this->assertNotNull($this->technician->fresh()->notifications()->where('id', $notification->id)->first()->read_at);
    }

    public function test_user_cannot_mark_other_users_notification_as_read()
    {
        $complaint = Complaint::factory()->create([
            'tenant_id' => $this->tenant->id,
            'assigned_technician_id' => $this->technician->id,
            'status' => 'in_progress',
        ]);

        $this->actingAs($this->tenant)->postJson("/api/complaints/{$complaint->id}/comments", [
            'comment' => 'Another tenant update',
        ])->assertStatus(201);

        $notification = $this->technician->fresh()->notifications()->latest()->first();
        $this->assertNotNull($notification);

        $this->actingAs($this->tenant)
            ->patchJson("/api/notifications/{$notification->id}/read")
            ->assertStatus(404);
    }

    // Summary metrics tests

    public function test_non_admin_cannot_access_admin_complaint_summary()
    {
        $response = $this->actingAs($this->tenant)->getJson('/api/admin/complaints/summary');
        $response->assertStatus(403);
    }

    public function test_admin_complaint_summary_returns_accurate_counts()
    {
        Complaint::factory()->create(['status' => 'pending', 'priority' => 'high']);
        Complaint::factory()->create(['status' => 'in_progress', 'priority' => 'medium']);
        Complaint::factory()->create(['status' => 'resolved', 'priority' => 'high']);

        $response = $this->actingAs($this->admin)->getJson('/api/admin/complaints/summary');

        $response->assertStatus(200)
            ->assertJson([
                'total' => 3,
                'pending' => 1,
                'in_progress' => 1,
                'resolved' => 1,
                'high_priority' => 2,
            ]);
    }

    public function test_admin_complaint_summary_applies_date_range_filter()
    {
        Complaint::factory()->create([
            'status' => 'pending',
            'priority' => 'high',
            'created_at' => now()->subDays(7),
            'updated_at' => now()->subDays(7),
        ]);

        Complaint::factory()->create([
            'status' => 'resolved',
            'priority' => 'low',
            'created_at' => now()->subDays(1),
            'updated_at' => now()->subDays(1),
        ]);

        $from = now()->subDays(2)->toDateString();
        $to = now()->toDateString();

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/complaints/summary?from={$from}&to={$to}");

        $response->assertStatus(200)
            ->assertJson([
                'total' => 1,
                'pending' => 0,
                'in_progress' => 0,
                'resolved' => 1,
                'high_priority' => 0,
            ]);
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
