<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\Unit;
use App\Models\UnitTenantAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminBuildingController extends Controller
{
    public function store(Request $request)
    {
        if ((string) optional($request->user())->role !== 'admin') {
            return response()->json(['error' => 'Forbidden. Admin access required.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:buildings,name',
            'code' => 'nullable|string|max:100|unique:buildings,code',
            'address_line' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'total_floors' => 'required|integer|min:1|max:60',
            'units_per_floor' => 'required|integer|min:1|max:26',
        ]);

        $building = DB::transaction(function () use ($validated) {
            $building = Building::create([
                'name' => $validated['name'],
                'code' => $validated['code'] ?? null,
                'address_line' => $validated['address_line'] ?? null,
                'city' => $validated['city'] ?? null,
                'state' => $validated['state'] ?? null,
                'postal_code' => $validated['postal_code'] ?? null,
                'country' => $validated['country'] ?? null,
                'total_floors' => (int) $validated['total_floors'],
                'is_active' => true,
            ]);

            $unitsPerFloor = (int) $validated['units_per_floor'];
            $totalFloors = (int) $validated['total_floors'];

            for ($floorIndex = 0; $floorIndex < $totalFloors; $floorIndex++) {
                $floorNumber = $floorIndex;
                $floorLabel = $floorNumber === 0 ? 'Ground Floor' : $floorNumber . ' Floor';

                $floor = $building->floors()->create([
                    'floor_number' => $floorNumber,
                    'floor_label' => $floorLabel,
                    'sort_order' => $floorNumber,
                ]);

                for ($unitIndex = 0; $unitIndex < $unitsPerFloor; $unitIndex++) {
                    $letter = chr(65 + $unitIndex);
                    $numberPart = (($floorIndex + 1) * 100) + ($unitIndex + 1);
                    $unitNumber = $letter . '-' . str_pad((string) $numberPart, 3, '0', STR_PAD_LEFT);

                    $floor->units()->create([
                        'building_id' => $building->id,
                        'unit_number' => $unitNumber,
                        'bedrooms' => 2,
                        'bathrooms' => 2,
                        'area_sqft' => 1100,
                        'occupancy_status' => 'vacant',
                    ]);
                }
            }

            return $building;
        });

        return response()->json(
            $building->loadCount([
                'units',
                'units as occupied_units_count' => function ($query) {
                    $query->where('occupancy_status', 'occupied');
                },
                'units as vacant_units_count' => function ($query) {
                    $query->where('occupancy_status', 'vacant');
                },
            ]),
            201
        );
    }

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

    public function update(Request $request, $buildingId)
    {
        if ((string) optional($request->user())->role !== 'admin') {
            return response()->json(['error' => 'Forbidden. Admin access required.'], 403);
        }

        $building = Building::findOrFail($buildingId);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:buildings,name,' . $building->id,
            'code' => 'nullable|string|max:100|unique:buildings,code,' . $building->id,
            'address_line' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
        ]);

        $building->fill([
            'name' => $validated['name'],
            'code' => $validated['code'] ?? null,
            'address_line' => $validated['address_line'] ?? null,
            'city' => $validated['city'] ?? null,
            'state' => $validated['state'] ?? null,
            'postal_code' => $validated['postal_code'] ?? null,
            'country' => $validated['country'] ?? null,
        ]);

        $building->save();

        return response()->json($building->fresh()->loadCount([
            'units',
            'units as occupied_units_count' => function ($query) {
                $query->where('occupancy_status', 'occupied');
            },
            'units as vacant_units_count' => function ($query) {
                $query->where('occupancy_status', 'vacant');
            },
        ]), 200);
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

    public function getVacantUnits($buildingId)
    {
        $units = Unit::where('building_id', $buildingId)
            ->where('occupancy_status', 'vacant')
            ->with('floor')
            ->orderBy('unit_number')
            ->get();

        return response()->json($units, 200);
    }

    public function destroy(Request $request, $buildingId)
    {
        if ((string) optional($request->user())->role !== 'admin') {
            return response()->json(['error' => 'Forbidden. Admin access required.'], 403);
        }

        $building = Building::withCount([
            'units as occupied_units_count' => function ($query) {
                $query->where('occupancy_status', 'occupied');
            },
        ])->findOrFail($buildingId);

        if ((int) $building->occupied_units_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete building with occupied units. Unassign tenants first.',
            ], 422);
        }

        $building->delete();

        return response()->json([
            'success' => true,
            'message' => 'Building deleted successfully.',
        ], 200);
    }
}
