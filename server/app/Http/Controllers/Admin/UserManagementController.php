<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Technician;
use App\Models\TenantProfile;
use App\Models\Unit;
use App\Models\UnitTenantAssignment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules;

class UserManagementController extends Controller
{
    public function createdCredentials()
    {
        $rows = DB::table('users as u')
            ->leftJoin('admin_user_credentials as auc', 'auc.user_id', '=', 'u.id')
            ->leftJoin('users as creator', 'creator.id', '=', 'auc.created_by_user_id')
            ->select([
                'u.id',
                'u.name',
                'u.email',
                'u.role',
                'u.created_at',
                'auc.id as credential_id',
                'auc.password_ciphertext',
                'auc.created_at as credential_created_at',
                'creator.name as created_by_name',
            ])
            ->whereIn('u.role', ['tenant', 'technician', 'admin'])
            ->orderByDesc('u.id')
            ->get();

        $data = $rows->map(function ($row) {
            $password = null;
            $hasCiphertext = !empty($row->password_ciphertext);

            if ($hasCiphertext) {
                try {
                    $password = Crypt::decryptString((string) $row->password_ciphertext);
                } catch (\Throwable $exception) {
                    Log::warning('Password decryption failed', [
                        'user_id' => (int) $row->id,
                        'error' => $exception->getMessage(),
                        'ciphertext_length' => strlen((string) $row->password_ciphertext),
                    ]);
                    $password = null;
                }
            }

            return [
                'id' => (int) $row->id,
                'name' => (string) $row->name,
                'email' => (string) $row->email,
                'role' => (string) $row->role,
                'password' => $password,
                'created_at' => $row->created_at,
                'credential_created_at' => $row->credential_created_at,
                'created_by_name' => $row->created_by_name,
                'debug_has_credential_id' => (int) $row->credential_id > 0,
                'debug_has_ciphertext' => $hasCiphertext,
            ];
        })->values();

        return response()->json($data, 200);
    }

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

        $this->storeAdminCreatedCredential((int) $user->id, (string) $validated['password'], (int) optional($request->user())->id);

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
                'password' => $validated['password'],
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

        $this->storeAdminCreatedCredential((int) $user->id, $plainPassword, (int) $request->user()->id);

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

    public function resetCredential(Request $request, int $userId)
    {
        $user = User::query()
            ->whereIn('role', ['tenant', 'technician', 'admin'])
            ->find($userId);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        $plainPassword = bin2hex(random_bytes(6));

        try {
            DB::transaction(function () use ($user, $plainPassword, $request) {
                $user->password = Hash::make($plainPassword);
                $user->save();

                $this->storeAdminCreatedCredential(
                    (int) $user->id,
                    $plainPassword,
                    (int) optional($request->user())->id
                );
            });
        } catch (\Throwable $exception) {
            Log::error('RESET_CREDENTIAL_FAILED', [
                'user_id' => $userId,
                'error' => $exception->getMessage(),
                'exception_type' => get_class($exception),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to reset credential.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Credential reset successfully.',
            'user' => [
                'id' => (int) $user->id,
                'name' => (string) $user->name,
                'email' => (string) $user->email,
                'role' => (string) $user->role,
                'password' => $plainPassword,
            ],
        ], 200);
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

    private function storeAdminCreatedCredential(int $userId, string $plainPassword, int $createdByUserId): void
    {
        Log::info('STORE_CREDENTIAL_CALLED', ['user_id' => $userId, 'password_length' => strlen($plainPassword)]);

        try {
            $encryptedPassword = Crypt::encryptString($plainPassword);
            Log::info('PASSWORD_ENCRYPTED', [
                'user_id' => $userId,
                'encrypted_length' => strlen($encryptedPassword),
            ]);
        } catch (\Throwable $exception) {
            Log::error('PASSWORD_ENCRYPTION_FAILED', [
                'user_id' => $userId,
                'error' => $exception->getMessage(),
                'exception_type' => get_class($exception),
            ]);
            return;
        }

        try {
            // Try direct insert first
            $existingId = DB::table('admin_user_credentials')->where('user_id', $userId)->value('id');

            if ($existingId) {
                DB::table('admin_user_credentials')
                    ->where('user_id', $userId)
                    ->update([
                        'password_ciphertext' => $encryptedPassword,
                        'created_by_user_id' => $createdByUserId > 0 ? $createdByUserId : null,
                        'updated_at' => now(),
                    ]);
                Log::info('CREDENTIAL_UPDATED', ['user_id' => $userId, 'credential_id' => $existingId]);
            } else {
                DB::table('admin_user_credentials')->insert([
                    'user_id' => $userId,
                    'password_ciphertext' => $encryptedPassword,
                    'created_by_user_id' => $createdByUserId > 0 ? $createdByUserId : null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                Log::info('CREDENTIAL_INSERTED', ['user_id' => $userId]);
            }
        } catch (\Throwable $exception) {
            Log::error('CREDENTIAL_STORAGE_FAILED', [
                'user_id' => $userId,
                'error' => $exception->getMessage(),
                'exception_type' => get_class($exception),
                'trace' => $exception->getTraceAsString(),
            ]);
        }
    }
}
