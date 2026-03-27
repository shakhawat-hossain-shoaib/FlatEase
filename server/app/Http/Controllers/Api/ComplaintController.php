<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ComplaintAssignmentHistory;
use App\Models\ComplaintComment;
use App\Models\Complaint;
use App\Models\ComplaintStatusHistory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ComplaintController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 15);
        
        $complaints = Complaint::where('tenant_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
        
        return response()->json($complaints, 200);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
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

        return response()->json($complaint, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $complaint = Complaint::with(['tenant', 'assignedTechnician', 'statusHistories', 'comments'])
            ->findOrFail($id);

        if (!$this->canViewComplaint(Auth::user(), $complaint)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($complaint, 200);
    }

    public function comments($id)
    {
        $complaint = Complaint::findOrFail($id);

        if (!$this->canViewComplaint(Auth::user(), $complaint)) {
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

        if (!$this->canViewComplaint(Auth::user(), $complaint)) {
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
            'comment' => $validated['comment'],
            'is_internal' => $isInternal,
        ]);

        return response()->json($comment->load('user:id,name,email,role'), 201);
    }

    /**
     * Display all complaints for admin with filtering
     */
    public function adminIndex(Request $request)
    {
        $perPage = $request->query('per_page', 15);
        $status = $request->query('status');
        $priority = $request->query('priority');
        $sort = $request->query('sort', 'created_at');
        $order = $request->query('order', 'desc');

        $query = Complaint::query();

        if ($status && in_array($status, ['pending', 'in_progress', 'resolved'])) {
            $query->where('status', $status);
        }

        if ($priority && in_array($priority, ['low', 'medium', 'high'])) {
            $query->where('priority', $priority);
        }

        $sortableFields = ['created_at', 'updated_at', 'status', 'priority'];
        if (in_array($sort, $sortableFields)) {
            $order = strtolower($order) === 'asc' ? 'asc' : 'desc';
            $query->orderBy($sort, $order);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $complaints = $query->paginate($perPage);

        return response()->json($complaints, 200);
    }

    /**
     * Update complaint status with validation and history
     */
    public function updateStatus(Request $request, $id)
    {
        $complaint = Complaint::findOrFail($id);

        $validated = $request->validate([
            'new_status' => 'required|in:pending,in_progress,resolved',
            'reason' => 'nullable|string|max:500',
        ]);

        $oldStatus = $complaint->status;
        $newStatus = $validated['new_status'];

        // Check if same status
        if ($oldStatus === $newStatus) {
            return response()->json(['error' => 'Status is already ' . $newStatus], 422);
        }

        // Validate transitions
        $validTransitions = [
            'pending' => ['in_progress', 'resolved'],
            'in_progress' => ['pending', 'resolved'],
            'resolved' => [],
        ];

        if (!in_array($newStatus, $validTransitions[$oldStatus] ?? [])) {
            return response()->json(['error' => 'Cannot transition from ' . $oldStatus . ' to ' . $newStatus], 422);
        }

        // Create status history
        ComplaintStatusHistory::create([
            'complaint_id' => $complaint->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'changed_by_id' => Auth::id(),
            'changed_at' => now(),
            'reason' => $validated['reason'] ?? null,
        ]);

        // Update complaint
        $complaint->status = $newStatus;
        if ($newStatus === 'resolved') {
            $complaint->resolved_at = now();
        }
        $complaint->save();

        return response()->json($complaint, 200);
    }

    public function assign(Request $request, $id)
    {
        $complaint = Complaint::findOrFail($id);

        $validated = $request->validate([
            'assigned_technician_id' => 'required|integer|exists:users,id',
            'sla_due_at' => 'nullable|date|after_or_equal:today',
            'reason' => 'nullable|string|max:500',
        ]);

        $assignee = User::findOrFail($validated['assigned_technician_id']);
        if (!in_array($assignee->role, ['admin', 'technician'], true)) {
            return response()->json(['error' => 'Assignee must have admin or technician role.'], 422);
        }

        ComplaintAssignmentHistory::create([
            'complaint_id' => $complaint->id,
            'previous_assigned_technician_id' => $complaint->assigned_technician_id,
            'new_assigned_technician_id' => $assignee->id,
            'assigned_by_id' => Auth::id(),
            'assigned_at' => now(),
            'reason' => $validated['reason'] ?? null,
        ]);

        $complaint->assigned_technician_id = $assignee->id;
        $complaint->assigned_by_id = Auth::id();
        $complaint->assigned_at = now();
        $complaint->sla_due_at = $validated['sla_due_at'] ?? null;

        if ($complaint->status === 'pending') {
            $complaint->status = 'in_progress';
        }

        $complaint->save();

        return response()->json($complaint->load(['tenant', 'assignedTechnician']), 200);
    }

    public function summary()
    {
        $total = Complaint::count();
        $pending = Complaint::where('status', 'pending')->count();
        $inProgress = Complaint::where('status', 'in_progress')->count();
        $resolved = Complaint::where('status', 'resolved')->count();
        $highPriority = Complaint::where('priority', 'high')->count();

        return response()->json([
            'total' => $total,
            'pending' => $pending,
            'in_progress' => $inProgress,
            'resolved' => $resolved,
            'high_priority' => $highPriority,
        ], 200);
    }

    private function canViewComplaint($user, Complaint $complaint)
    {
        if (!$user) {
            return false;
        }

        if ($user->role === 'admin') {
            return true;
        }

        return (int) $complaint->tenant_id === (int) $user->id;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
