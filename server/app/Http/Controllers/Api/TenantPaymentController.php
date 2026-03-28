<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TenantPayment;
use App\Models\UnitTenantAssignment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

class TenantPaymentController extends Controller
{
    public function currentSummary(Request $request)
    {
        $user = $request->user();

        if ((string) $user->role !== 'tenant') {
            return response()->json(['error' => 'Forbidden. Tenant access required.'], 403);
        }

        $assignment = $this->activeAssignment((int) $user->id);

        if (!$assignment) {
            return response()->json([
                'error' => 'No active unit assignment found for this tenant.',
            ], 404);
        }

        $today = Carbon::today();
        $this->ensureTenantPaymentLedger($assignment, $today);
        $this->markOverduePayments((int) $user->id, $today);

        $nextMonthStart = $today->copy()->addMonthNoOverflow()->startOfMonth();
        $nextPayment = TenantPayment::query()
            ->where('tenant_user_id', (int) $user->id)
            ->whereDate('billing_month', $nextMonthStart->toDateString())
            ->first();

        if (!$nextPayment) {
            return response()->json([
                'error' => 'Unable to prepare the next payment record for this tenant.',
            ], 500);
        }

        $recentPayments = TenantPayment::query()
            ->where('tenant_user_id', (int) $user->id)
            ->orderByDesc('billing_month')
            ->orderByDesc('id')
            ->limit(4)
            ->get();

        $notices = $request->user()
            ->notifications()
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(static function ($notification) {
                return [
                    'id' => (string) $notification->id,
                    'title' => (string) data_get($notification->data, 'type', 'notice'),
                    'message' => (string) data_get($notification->data, 'message', ''),
                    'created_at' => optional($notification->created_at)->toISOString(),
                    'read_at' => optional($notification->read_at)->toISOString(),
                    'is_read' => $notification->read_at !== null,
                ];
            })
            ->values();

        $rentAmount = (float) $nextPayment->rent_amount;
        $utilityTotal = (float) $nextPayment->utility_amount;
        $totalDue = max((float) $nextPayment->total_amount - (float) $nextPayment->amount_paid, 0);

        return response()->json([
            'month' => Carbon::parse($nextPayment->billing_month)->format('F Y'),
            'currency' => 'BDT',
            'billing_period_start' => Carbon::parse($nextPayment->billing_month)->startOfMonth()->toDateString(),
            'billing_period_end' => Carbon::parse($nextPayment->billing_month)->endOfMonth()->toDateString(),
            'due_date' => Carbon::parse($nextPayment->due_date)->toDateString(),
            'next_payment' => [
                'date' => Carbon::parse($nextPayment->due_date)->toDateString(),
                'amount' => round($totalDue, 2),
                'status' => (string) $nextPayment->status,
            ],
            'unit' => [
                'id' => (int) $assignment->unit_id,
                'unit_number' => optional($assignment->unit)->unit_number,
                'floor_label' => optional(optional($assignment->unit)->floor)->floor_label,
                'building_name' => optional(optional($assignment->unit)->building)->name,
            ],
            'charges' => [
                [
                    'key' => 'rent',
                    'label' => 'Monthly Rent',
                    'category' => 'rent',
                    'amount' => round($rentAmount, 2),
                ],
                [
                    'key' => 'utility',
                    'label' => 'Utility',
                    'category' => 'utility',
                    'amount' => round($utilityTotal, 2),
                ],
            ],
            'subtotal_rent' => round($rentAmount, 2),
            'subtotal_utility' => round($utilityTotal, 2),
            'total_due' => round($totalDue, 2),
            'status' => (string) $nextPayment->status,
            'recent_payments' => $recentPayments->map(function (TenantPayment $payment) {
                return [
                    'id' => (int) $payment->id,
                    'month' => Carbon::parse($payment->billing_month)->format('F Y'),
                    'due_date' => Carbon::parse($payment->due_date)->toDateString(),
                    'amount' => round((float) $payment->total_amount, 2),
                    'status' => (string) $payment->status,
                    'paid_at' => optional($payment->paid_at)->toISOString(),
                ];
            })->values(),
            'notice_count' => (int) $notices->count(),
            'unread_notice_count' => (int) $notices->where('is_read', false)->count(),
            'notices' => $notices,
        ], 200);
    }

    public function adminIndexByTenant($tenantId)
    {
        $payments = TenantPayment::query()
            ->where('tenant_user_id', (int) $tenantId)
            ->with(['assignment.unit:id,unit_number'])
            ->orderByDesc('billing_month')
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json($payments, 200);
    }

    public function adminTenantOptions()
    {
        $assignments = UnitTenantAssignment::query()
            ->with([
                'tenant:id,name,email',
                'unit:id,unit_number',
            ])
            ->where('status', 'active')
            ->orderByDesc('id')
            ->get();

        $tenants = $assignments
            ->map(function (UnitTenantAssignment $assignment) {
                if (!$assignment->tenant) {
                    return null;
                }

                return [
                    'id' => (int) $assignment->tenant->id,
                    'name' => (string) $assignment->tenant->name,
                    'email' => (string) $assignment->tenant->email,
                    'unit_number' => optional($assignment->unit)->unit_number,
                    'assignment_id' => (int) $assignment->id,
                ];
            })
            ->filter()
            ->unique('id')
            ->values();

        return response()->json($tenants, 200);
    }

    public function adminUpdate(Request $request, $paymentId)
    {
        $payment = TenantPayment::findOrFail((int) $paymentId);

        $validated = $request->validate([
            'amount_paid' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string|max:50',
            'transaction_ref' => 'nullable|string|max:120',
            'notes' => 'nullable|string|max:500',
            'mark_paid' => 'nullable|boolean',
        ]);

        $newAmountPaid = array_key_exists('amount_paid', $validated)
            ? (float) $validated['amount_paid']
            : (float) $payment->amount_paid;

        if (!empty($validated['mark_paid'])) {
            $newAmountPaid = (float) $payment->total_amount;
        }

        if ($newAmountPaid > (float) $payment->total_amount) {
            return response()->json([
                'error' => 'Amount paid cannot exceed total amount.',
            ], 422);
        }

        $payment->amount_paid = round($newAmountPaid, 2);
        $payment->payment_method = Arr::get($validated, 'payment_method', $payment->payment_method);
        $payment->transaction_ref = Arr::get($validated, 'transaction_ref', $payment->transaction_ref);
        $payment->notes = Arr::get($validated, 'notes', $payment->notes);
        $payment->recorded_by = (int) $request->user()->id;
        $payment->status = $this->resolvePaymentStatus(
            Carbon::parse($payment->due_date),
            (float) $payment->total_amount,
            (float) $payment->amount_paid,
            Carbon::today()
        );
        $payment->paid_at = $payment->status === 'paid' ? now() : null;
        $payment->save();

        return response()->json($payment->fresh(), 200);
    }

    private function activeAssignment(int $tenantUserId): ?UnitTenantAssignment
    {
        return UnitTenantAssignment::query()
            ->with(['unit.floor:id,floor_label', 'unit.building:id,name'])
            ->where('tenant_user_id', $tenantUserId)
            ->where('status', 'active')
            ->orderByDesc('id')
            ->first();
    }

    private function ensureTenantPaymentLedger(UnitTenantAssignment $assignment, Carbon $today): void
    {
        $rentAmount = (float) ($assignment->rent_amount ?? 0);
        $utilityAmount = $this->defaultUtilityAmount();
        $totalAmount = $rentAmount + $utilityAmount;

        // Keep recent 4 months + next month pre-generated so dashboard always reads from DB.
        $months = collect(range(-3, 1))
            ->map(static function (int $offset) use ($today) {
                return $today->copy()->startOfMonth()->addMonthsNoOverflow($offset);
            });

        $months->each(function (Carbon $monthStart) use ($assignment, $rentAmount, $utilityAmount, $totalAmount, $today) {
            $dueDate = $monthStart->copy()->setDay(10);
            TenantPayment::firstOrCreate(
                [
                    'tenant_user_id' => (int) $assignment->tenant_user_id,
                    'billing_month' => $monthStart->toDateString(),
                ],
                [
                    'unit_tenant_assignment_id' => (int) $assignment->id,
                    'due_date' => $dueDate->toDateString(),
                    'rent_amount' => round($rentAmount, 2),
                    'utility_amount' => round($utilityAmount, 2),
                    'total_amount' => round($totalAmount, 2),
                    'amount_paid' => 0,
                    'status' => $this->resolvePaymentStatus($dueDate, $totalAmount, 0, $today),
                ]
            );
        });
    }

    private function markOverduePayments(int $tenantUserId, Carbon $today): void
    {
        TenantPayment::query()
            ->where('tenant_user_id', $tenantUserId)
            ->whereIn('status', ['pending', 'partially_paid'])
            ->get()
            ->each(function (TenantPayment $payment) use ($today) {
                $newStatus = $this->resolvePaymentStatus(
                    Carbon::parse($payment->due_date),
                    (float) $payment->total_amount,
                    (float) $payment->amount_paid,
                    $today
                );

                if ($newStatus !== (string) $payment->status) {
                    $payment->status = $newStatus;
                    if ($newStatus !== 'paid') {
                        $payment->paid_at = null;
                    }
                    $payment->save();
                }
            });
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

    private function defaultUtilityAmount(): float
    {
        $electricityAmount = (float) env('TENANT_UTILITY_ELECTRICITY_DEFAULT', 0);
        $waterAmount = (float) env('TENANT_UTILITY_WATER_DEFAULT', 0);
        $gasAmount = (float) env('TENANT_UTILITY_GAS_DEFAULT', 0);
        $internetAmount = (float) env('TENANT_UTILITY_INTERNET_DEFAULT', 0);

        return $electricityAmount + $waterAmount + $gasAmount + $internetAmount;
    }
}
