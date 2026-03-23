<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\ComplaintStatusHistory;
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

        return response()->json($complaint, 200);
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
