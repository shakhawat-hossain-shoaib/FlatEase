<?php

namespace App\Services;

use App\Models\BillChargeType;
use App\Models\BuildingChargeConfig;
use App\Models\TenantPayment;
use App\Models\TenantPaymentChargeItem;
use App\Models\UnitTenantAssignment;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class BillingChargeService
{
    public function ensureMonthlyLineItems(TenantPayment $payment, UnitTenantAssignment $assignment): TenantPayment
    {
        if (!$this->hasBillingTables()) {
            return $this->applyLegacyFallback($payment, $assignment);
        }

        $assignment->loadMissing('unit:id,building_id');
        $buildingId = (int) optional($assignment->unit)->building_id;

        if ($buildingId <= 0) {
            return $payment;
        }

        $monthStart = Carbon::parse($payment->billing_month)->startOfMonth();

        return DB::transaction(function () use ($payment, $assignment, $buildingId, $monthStart) {
            $activeConfigs = $this->resolveActiveConfigs($buildingId, $monthStart);
            $lineItems = collect();

            if ($activeConfigs->isEmpty()) {
                $lineItems = $this->fallbackUtilityItems();
            } else {
                $lineItems = $activeConfigs->map(function (BuildingChargeConfig $config) {
                    $type = $config->chargeType;

                    return [
                        'charge_type_id' => (int) $config->charge_type_id,
                        'building_charge_config_id' => (int) $config->id,
                        'label_snapshot' => (string) optional($type)->display_name,
                        'category_snapshot' => (string) optional($type)->category,
                        'amount' => round((float) $config->amount, 2),
                    ];
                });
            }

            $existingIds = [];
            foreach ($lineItems as $item) {
                $line = TenantPaymentChargeItem::updateOrCreate(
                    [
                        'tenant_payment_id' => (int) $payment->id,
                        'charge_type_id' => (int) $item['charge_type_id'],
                    ],
                    [
                        'building_charge_config_id' => $item['building_charge_config_id'] ?? null,
                        'label_snapshot' => (string) $item['label_snapshot'],
                        'category_snapshot' => (string) $item['category_snapshot'],
                        'amount' => round((float) $item['amount'], 2),
                    ]
                );

                $existingIds[] = (int) $line->id;
            }

            if (!empty($existingIds)) {
                TenantPaymentChargeItem::query()
                    ->where('tenant_payment_id', (int) $payment->id)
                    ->whereNotIn('id', $existingIds)
                    ->delete();
            }

            $payment->load('chargeItems');

            $utilitySubtotal = round((float) $payment->chargeItems
                ->where('category_snapshot', 'utility')
                ->sum('amount'), 2);

            $serviceSubtotal = round((float) $payment->chargeItems
                ->where('category_snapshot', 'service')
                ->sum('amount'), 2);

            $rentAmount = round((float) ($assignment->rent_amount ?? $payment->rent_amount ?? 0), 2);
            $totalAmount = round($rentAmount + $utilitySubtotal + $serviceSubtotal, 2);

            $payment->rent_amount = $rentAmount;
            $payment->utility_amount = $utilitySubtotal;
            if ($this->hasServiceAmountColumn()) {
                $payment->service_amount = $serviceSubtotal;
            }
            $payment->total_amount = $totalAmount;
            $payment->status = $this->resolvePaymentStatus(
                Carbon::parse($payment->due_date),
                $totalAmount,
                (float) $payment->amount_paid,
                Carbon::today()
            );
            $payment->paid_at = $payment->status === 'paid' ? $payment->paid_at : null;
            $payment->save();

            return $payment->fresh('chargeItems');
        });
    }

    public function resolveActiveConfigs(int $buildingId, Carbon $monthStart): Collection
    {
        return BuildingChargeConfig::query()
            ->with('chargeType:id,display_name,category,is_active')
            ->where('building_id', $buildingId)
            ->where('is_active', 1)
            ->where(function ($query) use ($monthStart) {
                $query->whereNull('effective_to')
                    ->orWhereDate('effective_to', '>=', $monthStart->toDateString());
            })
            ->whereDate('effective_from', '<=', $monthStart->toDateString())
            ->where(function ($query) use ($monthStart) {
                $query->where('recurrence', 'monthly')
                    ->orWhere(function ($oneTime) use ($monthStart) {
                        $oneTime->where('recurrence', 'one_time')
                            ->whereDate('billing_month', '=', $monthStart->toDateString());
                    });
            })
            ->whereHas('chargeType', function ($typeQuery) use ($buildingId) {
                $typeQuery->where('is_active', 1)
                    ->where(function ($scope) use ($buildingId) {
                        $scope->whereNull('building_id')
                            ->orWhere('building_id', $buildingId);
                    });
            })
            ->get();
    }

    private function fallbackUtilityItems(): Collection
    {
        $defaults = [
            [
                'key' => 'electricity',
                'label' => 'Electricity Bill',
                'amount' => (float) env('TENANT_UTILITY_ELECTRICITY_DEFAULT', 0),
            ],
            [
                'key' => 'water',
                'label' => 'Water Bill',
                'amount' => (float) env('TENANT_UTILITY_WATER_DEFAULT', 0),
            ],
            [
                'key' => 'gas',
                'label' => 'Gas Bill',
                'amount' => (float) env('TENANT_UTILITY_GAS_DEFAULT', 0),
            ],
        ];

        return collect($defaults)
            ->filter(static fn (array $item) => (float) $item['amount'] > 0)
            ->map(function (array $item) {
                $type = BillChargeType::firstOrCreate(
                    ['key_name' => (string) $item['key']],
                    [
                        'display_name' => (string) $item['label'],
                        'category' => 'utility',
                        'is_system' => 1,
                        'is_active' => 1,
                    ]
                );

                return [
                    'charge_type_id' => (int) $type->id,
                    'building_charge_config_id' => null,
                    'label_snapshot' => (string) $type->display_name,
                    'category_snapshot' => 'utility',
                    'amount' => round((float) $item['amount'], 2),
                ];
            })
            ->values();
    }

    private function applyLegacyFallback(TenantPayment $payment, UnitTenantAssignment $assignment): TenantPayment
    {
        $rentAmount = round((float) ($assignment->rent_amount ?? $payment->rent_amount ?? 0), 2);
        $utilitySubtotal = round($this->defaultUtilityAmount(), 2);
        $serviceSubtotal = 0.0;
        $totalAmount = round($rentAmount + $utilitySubtotal + $serviceSubtotal, 2);

        $payment->rent_amount = $rentAmount;
        $payment->utility_amount = $utilitySubtotal;
        if ($this->hasServiceAmountColumn()) {
            $payment->service_amount = $serviceSubtotal;
        }
        $payment->total_amount = $totalAmount;
        $payment->status = $this->resolvePaymentStatus(
            Carbon::parse($payment->due_date),
            $totalAmount,
            (float) $payment->amount_paid,
            Carbon::today()
        );

        if ($payment->status !== 'paid') {
            $payment->paid_at = null;
        }

        $payment->save();

        return $payment;
    }

    private function hasBillingTables(): bool
    {
        return Schema::hasTable('bill_charge_types')
            && Schema::hasTable('building_charge_configs')
            && Schema::hasTable('tenant_payment_charge_items');
    }

    private function hasServiceAmountColumn(): bool
    {
        return Schema::hasTable('tenant_payments')
            && Schema::hasColumn('tenant_payments', 'service_amount');
    }

    private function defaultUtilityAmount(): float
    {
        $electricityAmount = (float) env('TENANT_UTILITY_ELECTRICITY_DEFAULT', 0);
        $waterAmount = (float) env('TENANT_UTILITY_WATER_DEFAULT', 0);
        $gasAmount = (float) env('TENANT_UTILITY_GAS_DEFAULT', 0);
        $internetAmount = (float) env('TENANT_UTILITY_INTERNET_DEFAULT', 0);

        return $electricityAmount + $waterAmount + $gasAmount + $internetAmount;
    }

    private function resolvePaymentStatus(Carbon $dueDate, float $totalAmount, float $amountPaid, Carbon $today): string
    {
        if ($amountPaid >= $totalAmount && $totalAmount > 0) {
            return 'paid';
        }

        if ($amountPaid > 0 && $amountPaid < $totalAmount) {
            return $dueDate->lt($today) ? 'overdue' : 'partially_paid';
        }

        return $dueDate->lt($today) ? 'overdue' : 'pending';
    }
}
