<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
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
            ...$validated,
            'tenant_id' => Auth::id(),
            'priority' => $validated['priority'] ?? 'medium',
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
