<?php

namespace App\Http\Controllers\Api;

use App\Events\ComplaintActivityOccurred;
use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\ComplaintAssignmentHistory;
use App\Models\ComplaintComment;
use App\Models\ComplaintStatusHistory;
use App\Models\Technician;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Throwable;

class ComplaintController extends Controller
{
    private const STATUSES = ['pending', 'assigned', 'in_progress', 'resolved'];

    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 15);

        $complaints = Complaint::with($this->baseRelations())
            ->where('tenant_id', Auth::id())
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json($complaints, 200);
    }

    public function technicianIndex(Request $request)
    {
        $perPage = (int) $request->query('per_page', 15);

        $complaints = Complaint::with($this->baseRelations())
            ->whereHas('technicians', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json($complaints, 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:160',
            'category' => 'required|string|max:80',
            'description' => 'required|string',
            'priority' => 'nullable|in:low,medium,high',
        ]);

        $complaint = Complaint::create([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'description' => $validated['description'],
            'priority' => $validated['priority'] ?? 'medium',
            'status' => 'pending',
            'tenant_id' => Auth::id(),
        ]);

        return response()->json($complaint->fresh($this->baseRelations()), 201);
    }

    public function show($id)
    {
        $complaint = Complaint::with($this->baseRelations())->findOrFail($id);

        if (!$this->canAccessComplaint(Auth::user(), $complaint)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($complaint, 200);
    }

    public function tenantMarkResolved($id)
    {
        $complaint = Complaint::findOrFail($id);

        if ((int) $complaint->tenant_id !== (int) Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($complaint->status === 'resolved') {
            return response()->json(['error' => 'Complaint is already resolved.'], 422);
        }

        if (!in_array($complaint->status, ['assigned', 'in_progress'], true)) {
            return response()->json(['error' => 'Only assigned or in-progress complaints can be marked resolved by tenant.'], 422);
        }

        return $this->applyStatusChange(
            $complaint,
            'resolved',
            (int) Auth::id(),
            'Marked as solved by tenant.',
            false
        );
    }

    public function comments($id)
    {
        $complaint = Complaint::findOrFail($id);

        if (!$this->canAccessComplaint(Auth::user(), $complaint)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $commentsQuery = ComplaintComment::with('user:id,name,email,role')
            ->where('complaint_id', $complaint->id)
            ->orderBy('created_at', 'asc');

        if (data_get(Auth::user(), 'role') !== 'admin') {
            $commentsQuery->where('is_internal', false);
        }

        return response()->json($commentsQuery->get(), 200);
    }

    public function addComment(Request $request, $id)
    {
        $complaint = Complaint::findOrFail($id);

        if (!$this->canAccessComplaint(Auth::user(), $complaint)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'comment' => 'required|string|max:2000',
            'is_internal' => 'nullable|boolean',
        ]);

        $isInternal = (bool) ($validated['is_internal'] ?? false);

        if ($isInternal && data_get(Auth::user(), 'role') !== 'admin') {
            return response()->json(['error' => 'Only admins can post internal comments.'], 403);
        }

        $comment = ComplaintComment::create([
            'complaint_id' => $complaint->id,
            'user_id' => Auth::id(),
            'comment' => trim($validated['comment']),
            'is_internal' => $isInternal,
        ]);

        $this->dispatchComplaintActivityEvent(
            $complaint,
            'comment_added',
            (int) Auth::id(),
            'A new comment was added to the complaint.'
        );

        return response()->json($comment->load('user:id,name,email,role'), 201);
    }

    public function adminIndex(Request $request)
    {
        $perPage = (int) $request->query('per_page', 15);
        $status = $request->query('status');
        $priority = $request->query('priority');
        $category = $request->query('category');
        $technicianId = $request->query('technician_id');
        $sort = $request->query('sort', 'created_at');
        $order = strtolower((string) $request->query('order', 'desc')) === 'asc' ? 'asc' : 'desc';

        $query = Complaint::with($this->baseRelations());

        if ($status && in_array($status, self::STATUSES, true)) {
            $query->where('status', $status);
        }

        if ($priority && in_array($priority, ['low', 'medium', 'high'], true)) {
            $query->where('priority', $priority);
        }

        if (!empty($category)) {
            $query->where('category', $category);
        }

        if (!empty($technicianId)) {
            $query->whereHas('technicians', function ($technicianQuery) use ($technicianId) {
                $technicianQuery->where('technicians.id', (int) $technicianId);
            });
        }

        $sortableFields = ['created_at', 'updated_at', 'status', 'priority'];
        if (!in_array($sort, $sortableFields, true)) {
            $sort = 'created_at';
        }

        $complaints = $query->orderBy($sort, $order)->paginate($perPage);

        return response()->json($complaints, 200);
    }

    public function summary(Request $request)
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
        ]);

        $query = Complaint::query();

        if (!empty($validated['from'])) {
            $query->whereDate('created_at', '>=', $validated['from']);
        }

        if (!empty($validated['to'])) {
            $query->whereDate('created_at', '<=', $validated['to']);
        }

        return response()->json([
            'total' => (clone $query)->count(),
            'pending' => (clone $query)->where('status', 'pending')->count(),
            'assigned' => (clone $query)->where('status', 'assigned')->count(),
            'in_progress' => (clone $query)->where('status', 'in_progress')->count(),
            'resolved' => (clone $query)->where('status', 'resolved')->count(),
            'high_priority' => (clone $query)->where('priority', 'high')->count(),
        ], 200);
    }

    public function technicians(Request $request)
    {
        $specialization = $request->query('specialization');

        $query = Technician::query()
            ->with('user:id,name,email,role')
            ->where('active', true)
            ->orderBy('name');

        if (!empty($specialization)) {
            $query->where('specialization', $specialization);
        }

        return response()->json($query->get(), 200);
    }

    public function assignTechnicians(Request $request, $id)
    {
        $complaint = Complaint::with('technicians')->findOrFail($id);

        if ($complaint->status === 'resolved') {
            return response()->json(['error' => 'Resolved complaints cannot be reassigned.'], 422);
        }

        $validated = $request->validate([
            'technician_ids' => 'required|array|min:1',
            'technician_ids.*' => 'required|integer|exists:technicians,id',
            'sla_due_at' => 'nullable|date|after_or_equal:today',
            'reason' => 'nullable|string|max:500',
        ]);

        $actorId = (int) Auth::id();
        $assignedAt = now();
        $newIds = array_values(array_unique(array_map('intval', $validated['technician_ids'])));
        $existingIds = $complaint->technicians->pluck('id')->map(fn ($value) => (int) $value)->all();
        $toAttach = array_values(array_diff($newIds, $existingIds));
        $toDetach = array_values(array_diff($existingIds, $newIds));

        $techniciansById = Technician::whereIn('id', $newIds)
            ->get()
            ->keyBy('id');

        DB::transaction(function () use ($complaint, $actorId, $assignedAt, $validated, $newIds, $toAttach, $toDetach, $techniciansById) {
            if (!empty($toDetach)) {
                $complaint->technicians()->detach($toDetach);
            }

            foreach ($toAttach as $index => $technicianId) {
                $complaint->technicians()->attach($technicianId, [
                    'assigned_by_admin_id' => $actorId,
                    'assigned_at' => $assignedAt,
                    'assignment_note' => $validated['reason'] ?? null,
                    'is_primary' => $index === 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $technician = $techniciansById->get($technicianId);
                if ($technician && $technician->user_id) {
                    ComplaintAssignmentHistory::create([
                        'complaint_id' => $complaint->id,
                        'previous_assigned_technician_id' => $complaint->assigned_technician_id,
                        'new_assigned_technician_id' => $technician->user_id,
                        'assigned_by_id' => $actorId,
                        'assigned_at' => $assignedAt,
                        'reason' => $validated['reason'] ?? null,
                    ]);
                }
            }

            $primaryTechnician = $techniciansById->get($newIds[0] ?? null);
            $complaint->assigned_technician_id = $primaryTechnician ? $primaryTechnician->user_id : null;
            $complaint->assigned_by_id = $actorId;
            $complaint->assigned_at = $assignedAt;
            $complaint->sla_due_at = $validated['sla_due_at'] ?? null;

            if ($complaint->status === 'pending') {
                ComplaintStatusHistory::create([
                    'complaint_id' => $complaint->id,
                    'old_status' => 'pending',
                    'new_status' => 'assigned',
                    'changed_by_id' => $actorId,
                    'changed_at' => $assignedAt,
                    'reason' => $validated['reason'] ?? 'Technician assigned by admin.',
                ]);
                $complaint->status = 'assigned';
            }

            $complaint->save();
        });

        $this->dispatchComplaintActivityEvent(
            $complaint,
            'assigned',
            $actorId,
            'Complaint has been assigned to technician(s).'
        );

        return response()->json($complaint->fresh($this->baseRelations()), 200);
    }

    public function updateStatus(Request $request, $id)
    {
        $complaint = Complaint::findOrFail($id);

        $validated = $request->validate([
            'new_status' => 'required|in:pending,assigned,in_progress,resolved',
            'reason' => 'nullable|string|max:500',
        ]);

        return $this->applyStatusChange($complaint, $validated['new_status'], (int) Auth::id(), $validated['reason'] ?? null, true);
    }

    public function technicianUpdateStatus(Request $request, $id)
    {
        $complaint = Complaint::with('technicians')->findOrFail($id);

        if (!$this->isAssignedTechnician(Auth::id(), $complaint)) {
            return response()->json(['error' => 'Forbidden. You are not assigned to this complaint.'], 403);
        }

        $validated = $request->validate([
            'new_status' => 'required|in:in_progress,resolved',
            'reason' => 'nullable|string|max:500',
        ]);

        return $this->applyStatusChange($complaint, $validated['new_status'], (int) Auth::id(), $validated['reason'] ?? null, false);
    }

    private function applyStatusChange(Complaint $complaint, string $newStatus, int $actorId, ?string $reason, bool $isAdmin)
    {
        $oldStatus = $complaint->status;

        if ($oldStatus === $newStatus) {
            return response()->json(['error' => 'Status is already ' . $newStatus], 422);
        }

        $validTransitions = $isAdmin
            ? [
                'pending' => ['assigned', 'in_progress', 'resolved'],
                'assigned' => ['in_progress', 'resolved', 'pending'],
                'in_progress' => ['resolved', 'assigned'],
                'resolved' => [],
            ]
            : [
                'assigned' => ['in_progress', 'resolved'],
                'in_progress' => ['resolved'],
                'pending' => [],
                'resolved' => [],
            ];

        if (!in_array($newStatus, $validTransitions[$oldStatus] ?? [], true)) {
            return response()->json(['error' => 'Cannot transition from ' . $oldStatus . ' to ' . $newStatus], 422);
        }

        DB::transaction(function () use ($complaint, $oldStatus, $newStatus, $actorId, $reason) {
            ComplaintStatusHistory::create([
                'complaint_id' => $complaint->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'changed_by_id' => $actorId,
                'changed_at' => now(),
                'reason' => $reason,
            ]);

            $complaint->status = $newStatus;
            $complaint->resolved_at = $newStatus === 'resolved' ? now() : null;
            $complaint->save();
        });

        $this->dispatchComplaintActivityEvent(
            $complaint,
            'status_changed',
            $actorId,
            'Complaint status changed from ' . $oldStatus . ' to ' . $newStatus . '.'
        );

        return response()->json($complaint->fresh($this->baseRelations()), 200);
    }

    private function baseRelations(): array
    {
        return [
            'tenant:id,name,email,role',
            'assignedTechnician:id,name,email,role',
            'technicians',
            'statusHistories.changedBy:id,name,email,role',
            'assignmentHistories.previousAssignedTechnician:id,name,email,role',
            'assignmentHistories.newAssignedTechnician:id,name,email,role',
            'assignmentHistories.assignedBy:id,name,email,role',
        ];
    }

    private function canAccessComplaint($user, Complaint $complaint): bool
    {
        if (!$user) {
            return false;
        }

        if ($user->role === 'admin') {
            return true;
        }

        if ((int) $complaint->tenant_id === (int) $user->id) {
            return true;
        }

        if ($user->role === 'technician') {
            return $this->isAssignedTechnician((int) $user->id, $complaint);
        }

        return false;
    }

    private function isAssignedTechnician(?int $userId, Complaint $complaint): bool
    {
        if (!$userId) {
            return false;
        }

        return $complaint->technicians()
            ->where('technicians.user_id', $userId)
            ->exists();
    }

    private function dispatchComplaintActivityEvent(Complaint $complaint, string $type, int $actorId, string $message): void
    {
        try {
            event(new ComplaintActivityOccurred($complaint->fresh($this->baseRelations()), $type, $actorId, $message));
        } catch (Throwable $e) {
            report($e);
        }
    }
}
