<?php

namespace App\Http\Controllers\Api;

use App\Events\ComplaintActivityOccurred;
use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\ComplaintAssignmentHistory;
use App\Models\ComplaintComment;
use App\Models\ComplaintStatusHistory;
use App\Models\User;
use Throwable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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

        if ($complaint->tenant_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($complaint, 200);
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
     * Return aggregate complaint metrics for admin dashboards.
     */
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
            'in_progress' => (clone $query)->where('status', 'in_progress')->count(),
            'resolved' => (clone $query)->where('status', 'resolved')->count(),
            'high_priority' => (clone $query)->where('priority', 'high')->count(),
        ], 200);
    }

    /**
     * Update complaint status with validation and history
     */
    public function updateStatus(Request $request, $id)
    {
        $complaint = Complaint::findOrFail($id);

        $validated = $request->validate([
            'new_status' => 'required|in:pending,in_progress,resolved',
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
        ]);

        // Update complaint
        $complaint->status = $newStatus;
        if ($newStatus === 'resolved') {
            $complaint->resolved_at = now();
        }
        $complaint->save();

        $this->dispatchComplaintActivityEvent(
            $complaint,
            'status_changed',
            Auth::id(),
            'Complaint status changed from ' . $oldStatus . ' to ' . $newStatus . '.'
        );

        return response()->json($complaint, 200);
    }

    /**
     * Assign or reassign complaint to a technician.
     */
    public function assign(Request $request, $id)
    {
        $complaint = Complaint::findOrFail($id);

        $validated = $request->validate([
            'assigned_technician_id' => 'required|integer|exists:users,id',
        ]);

        if ($complaint->status === 'resolved') {
            return response()->json(['error' => 'Resolved complaints cannot be assigned'], 422);
        }

        $assignee = User::findOrFail($validated['assigned_technician_id']);
        if (!in_array($assignee->role, ['technician', 'admin'], true)) {
            return response()->json(['error' => 'Assigned user must be a technician or admin'], 422);
        }

        $actorId = Auth::id();
        $assignedAt = now();
        $previousAssigneeId = $complaint->assigned_technician_id;

        DB::transaction(function () use ($complaint, $assignee, $actorId, $assignedAt, $previousAssigneeId) {
            $complaint->assigned_technician_id = $assignee->id;
            $complaint->assigned_by_id = $actorId;
            $complaint->assigned_at = $assignedAt;
            $complaint->save();

            ComplaintAssignmentHistory::create([
                'complaint_id' => $complaint->id,
                'previous_assigned_technician_id' => $previousAssigneeId,
                'new_assigned_technician_id' => $assignee->id,
                'assigned_by_id' => $actorId,
                'assigned_at' => $assignedAt,
            ]);

            if ($complaint->status === 'pending') {
                ComplaintStatusHistory::create([
                    'complaint_id' => $complaint->id,
                    'old_status' => 'pending',
                    'new_status' => 'in_progress',
                    'changed_by_id' => $actorId,
                    'changed_at' => $assignedAt,
                ]);

                $complaint->status = 'in_progress';
                $complaint->save();
            }
        });

        $this->dispatchComplaintActivityEvent(
            $complaint,
            'assigned',
            $actorId,
            'Complaint has been assigned to a technician.'
        );

        return response()->json(
            $complaint->fresh(['tenant', 'assignedTechnician', 'statusHistories', 'assignmentHistories']),
            200
        );
    }

    /**
     * List complaint comments in chronological order.
     */
    public function comments($id)
    {
        $complaint = Complaint::findOrFail($id);

        if (!$this->canAccessComplaint(Auth::user(), $complaint)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $comments = ComplaintComment::with('user')
            ->where('complaint_id', $complaint->id)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($comments, 200);
    }

    /**
     * Add comment to complaint thread.
     */
    public function addComment(Request $request, $id)
    {
        $complaint = Complaint::findOrFail($id);

        if (!$this->canAccessComplaint(Auth::user(), $complaint)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'comment' => 'required|string',
        ]);

        $commentBody = trim($validated['comment']);
        if ($commentBody === '') {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => ['comment' => ['The comment field is required.']],
            ], 422);
        }

        $comment = ComplaintComment::create([
            'complaint_id' => $complaint->id,
            'user_id' => Auth::id(),
            'comment' => $commentBody,
        ]);

        $this->dispatchComplaintActivityEvent(
            $complaint,
            'comment_added',
            Auth::id(),
            'A new comment was added to the complaint.'
        );

        return response()->json($comment->load('user'), 201);
    }

    private function dispatchComplaintActivityEvent(Complaint $complaint, string $type, int $actorId, string $message)
    {
        try {
            event(new ComplaintActivityOccurred($complaint, $type, $actorId, $message));
        } catch (Throwable $e) {
            report($e);
        }
    }

    private function canAccessComplaint($user, Complaint $complaint)
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

        return $complaint->assigned_technician_id !== null
            && (int) $complaint->assigned_technician_id === (int) $user->id;
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
