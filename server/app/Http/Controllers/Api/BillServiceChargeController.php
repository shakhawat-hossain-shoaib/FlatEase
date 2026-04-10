<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BillChargeType;
use App\Models\BuildingChargeConfig;
use App\Models\TenantPayment;
use App\Models\UnitTenantAssignment;
use App\Services\BillingChargeService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class BillServiceChargeController extends Controller
{
    public function index(Request $request)
    {
        if ($response = $this->ensureBillingTablesReady()) {
            return $response;
        }

        $validated = $request->validate([
            'building_id' => 'required|integer|exists:buildings,id',
        ]);

        $buildingId = (int) $validated['building_id'];

        $types = BillChargeType::query()
            ->where('is_active', 1)
            ->where(function ($query) use ($buildingId) {
                $query->whereNull('building_id')
                    ->orWhere('building_id', $buildingId);
            })
            ->orderBy('category')
            ->orderBy('display_name')
            ->get();

        $configs = BuildingChargeConfig::query()
            ->with('chargeType:id,key_name,display_name,category')
            ->where('building_id', $buildingId)
            ->orderByDesc('effective_from')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'charge_types' => $types,
            'configs' => $configs,
        ], 200);
    }

    public function createType(Request $request)
    {
        if ($response = $this->ensureBillingTablesReady()) {
            return $response;
        }

        $validated = $request->validate([
            'building_id' => 'required|integer|exists:buildings,id',
            'display_name' => 'required|string|max:120',
            'category' => 'required|in:service',
        ]);

        $normalized = preg_replace('/[^a-z0-9]+/i', '_', strtolower((string) $validated['display_name']));
        $keyName = 'building_' . (int) $validated['building_id'] . '_' . trim((string) $normalized, '_');

        $type = BillChargeType::create([
            'building_id' => (int) $validated['building_id'],
            'key_name' => $keyName,
            'display_name' => (string) $validated['display_name'],
            'category' => (string) $validated['category'],
            'is_system' => 0,
            'is_active' => 1,
            'created_by' => (int) $request->user()->id,
            'updated_by' => (int) $request->user()->id,
        ]);

        return response()->json($type, 201);
    }

    public function updateType(Request $request, $typeId)
    {
        if ($response = $this->ensureBillingTablesReady()) {
            return $response;
        }

        $type = BillChargeType::findOrFail((int) $typeId);

        if ($type->is_system) {
            return response()->json(['error' => 'System charge types cannot be renamed.'], 422);
        }

        $validated = $request->validate([
            'display_name' => 'required|string|max:120',
        ]);

        $type->display_name = (string) $validated['display_name'];
        $type->updated_by = (int) $request->user()->id;
        $type->save();

        return response()->json($type->fresh(), 200);
    }

    public function deleteType(Request $request, $typeId)
    {
        if ($response = $this->ensureBillingTablesReady()) {
            return $response;
        }

        $type = BillChargeType::findOrFail((int) $typeId);

        if ($type->is_system) {
            return response()->json(['error' => 'System charge types cannot be removed.'], 422);
        }

        $hasConfigs = BuildingChargeConfig::query()
            ->where('charge_type_id', (int) $type->id)
            ->where('is_active', 1)
            ->exists();

        if ($hasConfigs) {
            return response()->json([
                'error' => 'Cannot remove charge type while active configurations exist.',
            ], 422);
        }

        $type->is_active = 0;
        $type->updated_by = (int) $request->user()->id;
        $type->save();

        return response()->json(['success' => true], 200);
    }

    public function storeConfig(Request $request)
    {
        if ($response = $this->ensureBillingTablesReady()) {
            return $response;
        }

        $validated = $request->validate([
            'building_id' => 'required|integer|exists:buildings,id',
            'charge_type_id' => 'required|integer|exists:bill_charge_types,id',
            'amount' => 'required|numeric|min:0',
            'recurrence' => 'required|in:monthly,one_time',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after_or_equal:effective_from',
            'billing_month' => 'nullable|date',
            'notes' => 'nullable|string|max:255',
        ]);

        $config = BuildingChargeConfig::create([
            'building_id' => (int) $validated['building_id'],
            'charge_type_id' => (int) $validated['charge_type_id'],
            'amount' => round((float) $validated['amount'], 2),
            'recurrence' => (string) $validated['recurrence'],
            'billing_month' => !empty($validated['billing_month'])
                ? Carbon::parse($validated['billing_month'])->startOfMonth()->toDateString()
                : null,
            'effective_from' => Carbon::parse($validated['effective_from'])->toDateString(),
            'effective_to' => !empty($validated['effective_to'])
                ? Carbon::parse($validated['effective_to'])->toDateString()
                : null,
            'is_active' => 1,
            'notes' => $validated['notes'] ?? null,
            'created_by' => (int) $request->user()->id,
            'updated_by' => (int) $request->user()->id,
        ]);

        return response()->json($config->load('chargeType:id,key_name,display_name,category'), 201);
    }

    public function updateConfig(Request $request, $configId)
    {
        if ($response = $this->ensureBillingTablesReady()) {
            return $response;
        }

        $config = BuildingChargeConfig::findOrFail((int) $configId);

        $validated = $request->validate([
            'amount' => 'nullable|numeric|min:0',
            'recurrence' => 'nullable|in:monthly,one_time',
            'effective_from' => 'nullable|date',
            'effective_to' => 'nullable|date',
            'billing_month' => 'nullable|date',
            'notes' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        if (array_key_exists('amount', $validated)) {
            $config->amount = round((float) $validated['amount'], 2);
        }

        if (array_key_exists('recurrence', $validated)) {
            $config->recurrence = (string) $validated['recurrence'];
        }

        if (array_key_exists('effective_from', $validated)) {
            $config->effective_from = Carbon::parse($validated['effective_from'])->toDateString();
        }

        if (array_key_exists('effective_to', $validated)) {
            $config->effective_to = !empty($validated['effective_to'])
                ? Carbon::parse($validated['effective_to'])->toDateString()
                : null;
        }

        if (array_key_exists('billing_month', $validated)) {
            $config->billing_month = !empty($validated['billing_month'])
                ? Carbon::parse($validated['billing_month'])->startOfMonth()->toDateString()
                : null;
        }

        if (array_key_exists('notes', $validated)) {
            $config->notes = $validated['notes'];
        }

        if (array_key_exists('is_active', $validated)) {
            $config->is_active = (bool) $validated['is_active'];
        }

        $config->updated_by = (int) $request->user()->id;
        $config->save();

        return response()->json($config->fresh()->load('chargeType:id,key_name,display_name,category'), 200);
    }

    public function deleteConfig(Request $request, $configId)
    {
        if ($response = $this->ensureBillingTablesReady()) {
            return $response;
        }

        $config = BuildingChargeConfig::findOrFail((int) $configId);
        $config->is_active = 0;
        $config->updated_by = (int) $request->user()->id;
        $config->save();

        return response()->json(['success' => true], 200);
    }

    public function materializeMonth(Request $request, BillingChargeService $billingChargeService)
    {
        if ($response = $this->ensureBillingTablesReady()) {
            return $response;
        }

        $validated = $request->validate([
            'building_id' => 'required|integer|exists:buildings,id',
            'billing_month' => 'required|date',
        ]);

        $buildingId = (int) $validated['building_id'];
        $monthStart = Carbon::parse($validated['billing_month'])->startOfMonth()->toDateString();

        $assignments = UnitTenantAssignment::query()
            ->with('unit:id,building_id')
            ->where('status', 'active')
            ->whereHas('unit', function ($query) use ($buildingId) {
                $query->where('building_id', $buildingId);
            })
            ->get();

        $processed = 0;

        foreach ($assignments as $assignment) {
            $payment = TenantPayment::firstOrCreate(
                [
                    'tenant_user_id' => (int) $assignment->tenant_user_id,
                    'billing_month' => $monthStart,
                ],
                [
                    'unit_tenant_assignment_id' => (int) $assignment->id,
                    'due_date' => Carbon::parse($monthStart)->setDay(10)->toDateString(),
                    'rent_amount' => round((float) ($assignment->rent_amount ?? 0), 2),
                    'utility_amount' => 0,
                    'service_amount' => 0,
                    'total_amount' => round((float) ($assignment->rent_amount ?? 0), 2),
                    'amount_paid' => 0,
                    'status' => 'pending',
                ]
            );

            $billingChargeService->ensureMonthlyLineItems($payment, $assignment);
            $processed++;
        }

        return response()->json([
            'success' => true,
            'processed_assignments' => $processed,
            'billing_month' => $monthStart,
        ], 200);
    }

    private function ensureBillingTablesReady()
    {
        $requiredTables = [
            'bill_charge_types',
            'building_charge_configs',
            'tenant_payment_charge_items',
        ];

        foreach ($requiredTables as $table) {
            if (!Schema::hasTable($table)) {
                return response()->json([
                    'error' => 'Billing module database tables are missing. Run SQL migrations before using Bill & Service Charge.',
                    'missing_table' => $table,
                ], 503);
            }
        }

        return null;
    }
}
