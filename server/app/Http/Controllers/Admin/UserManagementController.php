<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Technician;
use App\Models\TenantProfile;
use App\Models\Unit;
use App\Models\UnitTenantAssignment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules;

class UserManagementController extends Controller
{
    public function assignable()
    {
        $users = User::query()
            ->whereIn('role', ['admin', 'technician'])
            ->select(['id', 'name', 'email', 'role'])
            ->orderBy('name')
            ->get();

        return response()->json($users, 200);
    }

    /**
     * Get tenants available for unit assignment (not currently assigned to any active unit).
     */
    public function assignableTenants()
    {
        $users = User::query()
            ->where('role', 'tenant')
            ->whereDoesntHave('unitAssignments', function ($query) {
                $query->where('status', 'active');
            })
            ->select(['id', 'name', 'email', 'role'])
            ->orderBy('name')
            ->get();

        return response()->json($users, 200);
    }

    /**
     * Create a user from admin context.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => ['required', 'in:admin,tenant,technician'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        if ($user->role === 'technician') {
            Technician::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => null,
                    'specialization' => 'general',
                    'active' => true,
                ]
            );
        }

        if ($user->role === 'tenant') {
            TenantProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'phone' => null,
                    'emergency_contact_name' => null,
                    'emergency_contact_phone' => null,
                    'nid_number' => null,
                    'job_title' => null,
                    'employer' => null,
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'User created successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ], 201);
    }

    public function createTenantWithAssignment(Request $request)
    {
        if ((string) optional($request->user())->role !== 'admin') {
            return response()->json(['error' => 'Forbidden. Admin access required.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone' => ['nullable', 'string', 'max:20'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:20'],
            'nid_number' => ['nullable', 'string', 'max:20'],
            'job_title' => ['nullable', 'string', 'max:255'],
            'employer' => ['nullable', 'string', 'max:255'],
            'unit_id' => ['required', 'integer', 'exists:units,id'],
            'lease_start_date' => ['nullable', 'date'],
            'lease_end_date' => ['nullable', 'date', 'after_or_equal:lease_start_date'],
            'rent_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        $unit = Unit::findOrFail($validated['unit_id']);

        if ($unit->occupancy_status !== 'vacant') {
            return response()->json([
                'success' => false,
                'message' => 'Selected unit is not available for assignment.',
            ], 422);
        }

        $plainPassword = bin2hex(random_bytes(6));

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($plainPassword),
            'role' => 'tenant',
        ]);

        TenantProfile::create([
            'user_id' => $user->id,
            'phone' => $validated['phone'] ?? null,
            'emergency_contact_name' => $validated['emergency_contact_name'] ?? null,
            'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? null,
            'nid_number' => $validated['nid_number'] ?? null,
            'job_title' => $validated['job_title'] ?? null,
            'employer' => $validated['employer'] ?? null,
        ]);

        $assignment = UnitTenantAssignment::create([
            'unit_id' => $unit->id,
            'tenant_user_id' => $user->id,
            'assigned_by' => (int) $request->user()->id,
            'lease_start_date' => $validated['lease_start_date'] ?? null,
            'lease_end_date' => $validated['lease_end_date'] ?? null,
            'rent_amount' => $validated['rent_amount'] ?? null,
            'status' => 'active',
        ]);

        $unit->occupancy_status = 'occupied';
        $unit->save();

        return response()->json([
            'success' => true,
            'message' => 'Tenant created and assigned successfully.',
            'tenant' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'password' => $plainPassword,
                'role' => $user->role,
            ],
            'assignment' => [
                'id' => $assignment->id,
                'unit_id' => $unit->id,
                'unit_number' => $unit->unit_number,
            ],
        ], 201);
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
}
