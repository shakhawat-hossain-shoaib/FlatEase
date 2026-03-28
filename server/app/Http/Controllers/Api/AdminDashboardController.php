<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\Complaint;
use App\Models\TenantPayment;
use App\Models\Unit;
use App\Models\UnitTenantAssignment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function summary()
    {
        $totalTenants = User::query()->where('role', 'tenant')->count();
        $activeLeases = UnitTenantAssignment::query()->where('status', 'active')->count();
        $vacantUnits = Unit::query()->where('occupancy_status', 'vacant')->count();
        $totalComplaints = Complaint::query()->count();

        $utilityPerLease = $this->defaultUtilityAmount();

        $revenueRows = Building::query()
            ->leftJoin('units', 'units.building_id', '=', 'buildings.id')
            ->leftJoin('unit_tenant_assignments', function ($join) {
                $join->on('unit_tenant_assignments.unit_id', '=', 'units.id')
                    ->where('unit_tenant_assignments.status', '=', 'active');
            })
            ->groupBy('buildings.id', 'buildings.name')
            ->orderBy('buildings.name')
            ->select([
                'buildings.id',
                'buildings.name',
                DB::raw('COUNT(unit_tenant_assignments.id) as active_leases'),
                DB::raw('COALESCE(SUM(unit_tenant_assignments.rent_amount), 0) as rent_expected'),
            ])
            ->get()
            ->map(function ($row) use ($utilityPerLease) {
                $activeLeasesCount = (int) $row->active_leases;
                $rentExpected = (float) $row->rent_expected;
                $utilityExpected = $activeLeasesCount * $utilityPerLease;

                return [
                    'building_id' => (int) $row->id,
                    'building_name' => (string) $row->name,
                    'active_leases' => $activeLeasesCount,
                    'rent_expected' => round($rentExpected, 2),
                    'utility_expected' => round($utilityExpected, 2),
                    'total_expected' => round($rentExpected + $utilityExpected, 2),
                ];
            })
            ->values();

        return response()->json([
            'stats' => [
                'total_tenants' => (int) $totalTenants,
                'active_leases' => (int) $activeLeases,
                'vacant_units' => (int) $vacantUnits,
                'total_complaints' => (int) $totalComplaints,
            ],
            'revenue_overview' => [
                'currency' => 'BDT',
                'total_expected' => round((float) $revenueRows->sum('total_expected'), 2),
                'by_building' => $revenueRows,
            ],
            'recent_activity' => $this->recentActivity(),
        ], 200);
    }

    private function recentActivity(): Collection
    {
        $paymentActivity = TenantPayment::query()
            ->with(['tenant:id,name', 'assignment.unit:id,unit_number'])
            ->where(function ($query) {
                $query->whereNotNull('paid_at')->orWhere('amount_paid', '>', 0);
            })
            ->orderByDesc('updated_at')
            ->limit(10)
            ->get()
            ->map(function (TenantPayment $payment) {
                $tenantName = optional($payment->tenant)->name ?? 'Tenant';
                $unitNumber = optional(optional($payment->assignment)->unit)->unit_number;
                $at = $payment->paid_at ?: $payment->updated_at;

                return [
                    'type' => 'payment',
                    'title' => 'Payment update',
                    'description' => trim($tenantName . ($unitNumber ? (' - Unit ' . $unitNumber) : '')),
                    'meta' => 'Amount paid: ' . number_format((float) $payment->amount_paid, 2),
                    'created_at' => $at ? Carbon::parse($at)->toISOString() : null,
                ];
            });

        $complaintActivity = Complaint::query()
            ->with('tenant:id,name')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function (Complaint $complaint) {
                $tenantName = optional($complaint->tenant)->name ?? 'Tenant';

                return [
                    'type' => 'complaint',
                    'title' => 'Complaint submitted',
                    'description' => trim($tenantName . ' - ' . $complaint->title),
                    'meta' => 'Status: ' . (string) $complaint->status,
                    'created_at' => $complaint->created_at ? Carbon::parse($complaint->created_at)->toISOString() : null,
                ];
            });

        return collect($paymentActivity->all())
            ->merge($complaintActivity->all())
            ->filter(function (array $item) {
                return !empty($item['created_at']);
            })
            ->sortByDesc('created_at')
            ->take(10)
            ->values();
    }

    private function defaultUtilityAmount(): float
    {
        $electricityAmount = (float) env('TENANT_UTILITY_ELECTRICITY_DEFAULT', 0);
        $waterAmount = (float) env('TENANT_UTILITY_WATER_DEFAULT', 0);
        $gasAmount = (float) env('TENANT_UTILITY_GAS_DEFAULT', 0);
        $internetAmount = (float) env('TENANT_UTILITY_INTERNET_DEFAULT', 0);

        return $electricityAmount + $waterAmount + $gasAmount + $internetAmount;
    }
}
