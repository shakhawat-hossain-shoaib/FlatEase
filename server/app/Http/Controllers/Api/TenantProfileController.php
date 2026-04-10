<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TenantProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TenantProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        if ((string) $user->role !== 'tenant') {
            return response()->json(['error' => 'Forbidden. Tenant access required.'], 403);
        }

        $validated = $request->validate([
            'phone' => ['nullable', 'string', 'max:20', 'required_if:preferred_contact_method,sms'],
            'preferred_contact_method' => ['required', 'in:email,sms'],
        ]);

        DB::transaction(function () use ($user, $validated) {
            $user->phone = $validated['phone'] ?? null;
            $user->preferred_contact_method = $validated['preferred_contact_method'];
            $user->save();

            TenantProfile::updateOrCreate(
                ['user_id' => (int) $user->id],
                [
                    'phone' => $validated['phone'] ?? null,
                ]
            );
        });

        return response()->json([
            'success' => true,
            'message' => 'Tenant profile updated successfully.',
            'user' => $request->user()->fresh()->load([
                'tenantProfile',
                'unitAssignments.unit.floor.building',
            ]),
        ], 200);
    }
}