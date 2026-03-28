<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\Unit;
use App\Models\UnitTenantAssignment;
use Illuminate\Http\Request;

class AdminBuildingController extends Controller
{
    public function index()
    {
        $buildings = Building::query()
            ->withCount(['units'])
            ->withCount([
                'units as occupied_units_count' => function ($query) {
                    $query->where('occupancy_status', 'occupied');
                },
                'units as vacant_units_count' => function ($query) {
                    $query->where('occupancy_status', 'vacant');
                },
            ])
            ->orderBy('name')
            ->get();

        return response()->json($buildings, 200);
    }

    public function show($buildingId)
    {
        $building = Building::query()
            ->with([
                'floors' => function ($floorQuery) {
                    $floorQuery->orderBy('sort_order')->with([
                        'units' => function ($unitQuery) {
                            $unitQuery->orderBy('unit_number')->with([
                                'activeAssignment.tenant:id,name,email',
                                'activeAssignment.tenant.tenantProfile:id,user_id,phone',
                            ]);
                        },
                    ]);
                },
            ])
            ->findOrFail($buildingId);

        return response()->json($building, 200);
    }

    public function assignTenant(Request $request, $unitId)
    {
        $validated = $request->validate([
            'tenant_user_id' => 'required|integer|exists:users,id',
            'lease_start_date' => 'nullable|date',
            'lease_end_date' => 'nullable|date|after_or_equal:lease_start_date',
            'rent_amount' => 'nullable|numeric|min:0',
        ]);

        if ((string) optional($request->user())->role !== 'admin') {
            return response()->json(['error' => 'Forbidden. Admin access required.'], 403);
        }

        $unit = Unit::findOrFail($unitId);
        $activeAssignment = $unit->activeAssignment()->first();

        if ($activeAssignment) {
            return response()->json(['error' => 'Unit already has an active tenant assignment.'], 422);
        }

        $assignment = UnitTenantAssignment::create([
            'unit_id' => $unit->id,
            'tenant_user_id' => (int) $validated['tenant_user_id'],
            'assigned_by' => (int) $request->user()->id,
            'lease_start_date' => $validated['lease_start_date'] ?? null,
            'lease_end_date' => $validated['lease_end_date'] ?? null,
            'rent_amount' => $validated['rent_amount'] ?? null,
            'status' => 'active',
        ]);

        $unit->occupancy_status = 'occupied';
        $unit->save();

        return response()->json($assignment->load(['unit', 'tenant:id,name,email']), 201);
    }

    public function unassignTenant(Request $request, $assignmentId)
    {
        if ((string) optional($request->user())->role !== 'admin') {
            return response()->json(['error' => 'Forbidden. Admin access required.'], 403);
        }

        $assignment = UnitTenantAssignment::with('unit')->findOrFail($assignmentId);

        if ($assignment->status !== 'active') {
            return response()->json(['error' => 'Only active assignments can be ended.'], 422);
        }

        $assignment->status = 'ended';
        $assignment->moved_out_at = now();
        $assignment->save();

        $unit = $assignment->unit;
        if ($unit) {
            $unit->occupancy_status = 'vacant';
            $unit->save();
        }

        return response()->json($assignment->fresh(['unit', 'tenant:id,name,email']), 200);
    }
}
