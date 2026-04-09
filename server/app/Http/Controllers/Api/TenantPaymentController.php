<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\TenantPayment;
use App\Models\PartialPayment;
use App\Models\UnitTenantAssignment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class TenantPaymentController extends Controller
{
    public function currentSummary(Request $request)
    {
        $user = $request->user();

        if ((string) $user->role !== 'tenant') {
            return response()->json(['error' => 'Forbidden. Tenant access required.'], 403);
        }

        $today = Carbon::today();
        $assignment = $this->activeAssignment((int) $user->id);

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

        if (!$assignment) {
            $nextDueDate = $today->copy()->addMonthNoOverflow()->startOfMonth()->setDay(10);

            return response()->json([
                'month' => $today->copy()->addMonthNoOverflow()->startOfMonth()->format('F Y'),
                'currency' => 'BDT',
                'billing_period_start' => $today->copy()->addMonthNoOverflow()->startOfMonth()->toDateString(),
                'billing_period_end' => $today->copy()->addMonthNoOverflow()->endOfMonth()->toDateString(),
                'due_date' => $nextDueDate->toDateString(),
                'next_payment' => [
                    'id' => null,
                    'date' => $nextDueDate->toDateString(),
                    'amount' => 0,
                    'status' => 'pending',
                ],
                'unit' => [
                    'id' => 0,
                    'unit_number' => null,
                    'floor_label' => null,
                    'building_name' => null,
                ],
                'charges' => [
                    [
                        'key' => 'rent',
                        'label' => 'Monthly Rent',
                        'category' => 'rent',
                        'amount' => 0,
                    ],
                    [
                        'key' => 'utility',
                        'label' => 'Utility',
                        'category' => 'utility',
                        'amount' => 0,
                    ],
                ],
                'subtotal_rent' => 0,
                'subtotal_utility' => 0,
                'total_due' => 0,
                'status' => 'pending',
                'recent_payments' => [],
                'notice_count' => (int) $notices->count(),
                'unread_notice_count' => (int) $notices->where('is_read', false)->count(),
                'notices' => $notices,
            ], 200);
        }

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
                'id' => (int) $nextPayment->id,
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

    public function initiateSslCommerz(Request $request): JsonResponse
    {
        $user = $request->user();

        if ((string) $user->role !== 'tenant') {
            return response()->json(['error' => 'Forbidden. Tenant access required.'], 403);
        }

        $validated = $request->validate([
            'payment_id' => 'required|integer|exists:tenant_payments,id',
            'custom_amount' => 'nullable|numeric|min:0.01',
        ]);

        $payment = TenantPayment::query()
            ->where('id', (int) $validated['payment_id'])
            ->where('tenant_user_id', (int) $user->id)
            ->first();

        if (!$payment) {
            return response()->json(['error' => 'Payment record not found for this tenant.'], 404);
        }

        $remainingAmount = max((float) $payment->total_amount - (float) $payment->amount_paid, 0);

        if ($remainingAmount <= 0) {
            return response()->json(['error' => 'This payment is already cleared.'], 422);
        }

        $paymentAmount = $remainingAmount;

        if (isset($validated['custom_amount'])) {
            $customAmount = (float) $validated['custom_amount'];

            if ($customAmount > $remainingAmount) {
                return response()->json([
                    'error' => 'Custom amount exceeds remaining balance.',
                    'remaining_balance' => round($remainingAmount, 2),
                ], 422);
            }

            if ($customAmount <= 0) {
                return response()->json([
                    'error' => 'Custom amount must be greater than zero.',
                ], 422);
            }

            $paymentAmount = $customAmount;
        }

        $credentials = config('sslcommerz.apiCredentials', []);
        $storeId = (string) Arr::get($credentials, 'store_id', '');
        $storePassword = (string) Arr::get($credentials, 'store_password', '');

        if ($storeId === '' || $storePassword === '') {
            return response()->json(['error' => 'Payment gateway credentials are not configured.'], 500);
        }

        $appUrl = rtrim((string) config('app.url'), '/');
        $frontendUrl = rtrim((string) env('FRONTEND_URL', $appUrl), '/');
        $tranId = sprintf('TENANTPAY-%d-%s', (int) $payment->id, Str::upper(Str::random(10)));

        $payload = [
            'store_id' => $storeId,
            'store_passwd' => $storePassword,
            'total_amount' => round($paymentAmount, 2),
            'currency' => 'BDT',
            'tran_id' => $tranId,
            'success_url' => $appUrl . '/api/sslcommerz/success',
            'fail_url' => $appUrl . '/api/sslcommerz/fail',
            'cancel_url' => $appUrl . '/api/sslcommerz/cancel',
            'ipn_url' => $appUrl . '/api/sslcommerz/ipn',
            'cus_name' => (string) $user->name,
            'cus_email' => (string) $user->email,
            'cus_add1' => 'N/A',
            'cus_city' => 'Dhaka',
            'cus_country' => 'Bangladesh',
            'cus_phone' => (string) (optional($user->tenantProfile)->phone ?? 'N/A'),
            'shipping_method' => 'NO',
            'product_name' => 'FlatEase Monthly Rent',
            'product_category' => 'Rent',
            'product_profile' => 'general',
            'num_of_item' => 1,
            'value_a' => (string) $payment->id,
            'value_b' => (string) $user->id,
            'value_c' => $frontendUrl,
            'value_d' => '',
        ];

        $this->upsertGatewayPayment(
            $tranId,
            (string) $user->name,
            (string) $user->email,
            (string) (optional($user->tenantProfile)->phone ?? ''),
            round($paymentAmount, 2),
            'pending',
            'N/A',
            'BDT'
        );

        $payment->payment_method = 'sslcommerz';
        $payment->transaction_ref = $tranId;
        $payment->save();

        $makePaymentPath = (string) Arr::get(config('sslcommerz.apiUrl', []), 'make_payment', '/gwprocess/v4/api.php');
        $gatewayEndpoint = rtrim((string) config('sslcommerz.apiDomain'), '/') . '/' . ltrim($makePaymentPath, '/');

        try {
            $response = Http::asForm()->timeout(30)->post($gatewayEndpoint, $payload);
        } catch (\Throwable $exception) {
            Log::error('SSLCommerz initiate request failed', [
                'payment_id' => (int) $payment->id,
                'transaction_ref' => $tranId,
                'error' => $exception->getMessage(),
            ]);

            return response()->json(['error' => 'Failed to connect to payment gateway.'], 502);
        }

        $result = $response->json() ?? [];
        $gatewayUrl = (string) Arr::get($result, 'GatewayPageURL', '');
        $gatewayStatus = strtoupper((string) Arr::get($result, 'status', ''));

        if (!$response->successful() || $gatewayUrl === '' || !in_array($gatewayStatus, ['SUCCESS', 'SUCCESSFUL'], true)) {
            Log::warning('SSLCommerz initiate response invalid', [
                'payment_id' => (int) $payment->id,
                'transaction_ref' => $tranId,
                'status' => Arr::get($result, 'status'),
                'failedreason' => Arr::get($result, 'failedreason'),
                'response_code' => $response->status(),
            ]);

            return response()->json([
                'error' => (string) Arr::get($result, 'failedreason', 'Unable to initialize payment gateway.'),
            ], 502);
        }

        return response()->json([
            'success' => true,
            'payment_id' => (int) $payment->id,
            'transaction_id' => $tranId,
            'gateway_url' => $gatewayUrl,
        ], 200);
    }

    public function sslCommerzSuccess(Request $request): JsonResponse|RedirectResponse
    {
        $payment = $this->resolveCallbackPayment($request);
        $amount = (float) $request->input('amount', 0);
        $tranId = (string) $request->input('tran_id', '');

        if ($payment) {
            $remaining = max((float) $payment->total_amount - (float) $payment->amount_paid, 0);
            $creditAmount = $amount > 0 ? min($amount, $remaining) : $remaining;
            $payment->amount_paid = round((float) $payment->amount_paid + $creditAmount, 2);
            $payment->payment_method = 'sslcommerz';
            $payment->transaction_ref = (string) $request->input('tran_id', $payment->transaction_ref);
            $payment->status = $this->resolvePaymentStatus(
                Carbon::parse($payment->due_date),
                (float) $payment->total_amount,
                (float) $payment->amount_paid,
                Carbon::today()
            );
            $payment->paid_at = $payment->status === 'paid' ? now() : null;
            $payment->save();
        }

        $this->upsertGatewayPayment(
            $tranId,
            (string) optional($payment->tenant)->name,
            (string) optional($payment->tenant)->email,
            (string) optional(optional($payment->tenant)->tenantProfile)->phone,
            $amount > 0 ? $amount : (float) optional($payment)->amount_paid,
            'paid',
            'N/A',
            'BDT'
        );

        return $this->redirectGatewayResult('success', $request);
    }

    public function sslCommerzFail(Request $request): JsonResponse|RedirectResponse
    {
        $payment = $this->resolveCallbackPayment($request);
        $tranId = (string) $request->input('tran_id', '');

        if ($payment) {
            $payment->payment_method = 'sslcommerz';
            $payment->transaction_ref = (string) $request->input('tran_id', $payment->transaction_ref);
            $payment->save();
        }

        $this->upsertGatewayPayment(
            $tranId,
            (string) optional($payment?->tenant)->name,
            (string) optional($payment?->tenant)->email,
            (string) optional(optional($payment?->tenant)->tenantProfile)->phone,
            (float) optional($payment)->amount_paid,
            'failed',
            'N/A',
            'BDT'
        );

        return $this->redirectGatewayResult('failed', $request);
    }

    public function sslCommerzCancel(Request $request): JsonResponse|RedirectResponse
    {
        $payment = $this->resolveCallbackPayment($request);
        $tranId = (string) $request->input('tran_id', '');

        if ($payment) {
            $payment->payment_method = 'sslcommerz';
            $payment->transaction_ref = (string) $request->input('tran_id', $payment->transaction_ref);
            $payment->save();
        }

        $this->upsertGatewayPayment(
            $tranId,
            (string) optional($payment?->tenant)->name,
            (string) optional($payment?->tenant)->email,
            (string) optional(optional($payment?->tenant)->tenantProfile)->phone,
            (float) optional($payment)->amount_paid,
            'cancelled',
            'N/A',
            'BDT'
        );

        return $this->redirectGatewayResult('cancelled', $request);
    }

    public function sslCommerzIpn(Request $request): JsonResponse
    {
        $status = strtoupper((string) $request->input('status', ''));
        $tranId = (string) $request->input('tran_id', '');

        if (!in_array($status, ['VALID', 'VALIDATED'], true)) {
            return response()->json([
                'status' => 'ignored',
                'message' => 'IPN ignored for non-valid payment status.',
            ], 200);
        }

        $payment = $this->resolveCallbackPayment($request);

        if ($payment) {
            $remaining = max((float) $payment->total_amount - (float) $payment->amount_paid, 0);
            $amount = (float) $request->input('amount', 0);
            $creditAmount = $amount > 0 ? min($amount, $remaining) : $remaining;
            $payment->amount_paid = round((float) $payment->amount_paid + $creditAmount, 2);
            $payment->payment_method = 'sslcommerz';
            $payment->transaction_ref = (string) $request->input('tran_id', $payment->transaction_ref);
            $payment->status = $this->resolvePaymentStatus(
                Carbon::parse($payment->due_date),
                (float) $payment->total_amount,
                (float) $payment->amount_paid,
                Carbon::today()
            );
            $payment->paid_at = $payment->status === 'paid' ? now() : null;
            $payment->save();
        }

        $this->upsertGatewayPayment(
            $tranId,
            (string) optional($payment?->tenant)->name,
            (string) optional($payment?->tenant)->email,
            (string) optional(optional($payment?->tenant)->tenantProfile)->phone,
            (float) $request->input('amount', 0),
            'paid',
            'N/A',
            'BDT'
        );

        return response()->json([
            'status' => 'received',
            'message' => 'SSLCommerz IPN processed.',
            'transaction_id' => (string) $request->input('tran_id'),
        ], 200);
    }

    private function resolveCallbackPayment(Request $request): ?TenantPayment
    {
        $tranId = (string) $request->input('tran_id', '');
        $paymentId = (int) $request->input('value_a', 0);

        if ($tranId !== '') {
            $payment = TenantPayment::query()
                ->where('transaction_ref', $tranId)
                ->first();

            if ($payment) {
                return $payment;
            }
        }

        if ($paymentId > 0) {
            return TenantPayment::find($paymentId);
        }

        return null;
    }

    private function upsertGatewayPayment(
        string $transactionId,
        string $name,
        string $email,
        string $phone,
        float $amount,
        string $status,
        string $address,
        string $currency
    ): void {
        if ($transactionId === '') {
            return;
        }

        Payment::updateOrCreate(
            ['transaction_id' => $transactionId],
            [
                'name' => $name !== '' ? $name : null,
                'email' => $email !== '' ? $email : null,
                'phone' => $phone !== '' ? $phone : null,
                'amount' => round($amount, 2),
                'address' => $address !== '' ? $address : null,
                'status' => $status,
                'currency' => $currency,
            ]
        );
    }

    private function redirectGatewayResult(string $status, Request $request): JsonResponse|RedirectResponse
    {
        $frontendUrl = rtrim((string) env('FRONTEND_URL', config('app.url')), '/');
        $tranId = (string) $request->input('tran_id', '');
        $amount = (string) $request->input('amount', '');
        $redirectUrl = $frontendUrl . '/tenant/payments?payment_status=' . urlencode($status);

        if ($tranId !== '') {
            $redirectUrl .= '&tran_id=' . urlencode($tranId);
        }

        if ($amount !== '') {
            $redirectUrl .= '&amount=' . urlencode($amount);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'status' => $status,
                'message' => 'SSLCommerz payment ' . $status . '.',
                'transaction_id' => $tranId,
                'amount' => $amount,
                'redirect_url' => $redirectUrl,
            ], 200);
        }

        return redirect()->away($redirectUrl);
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

    public function recordPartialPayment(Request $request, $paymentId): JsonResponse
    {
        $user = $request->user();
        $payment = TenantPayment::findOrFail((int) $paymentId);

        if ((int) $payment->tenant_user_id !== (int) $user->id && (string) $user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'nullable|string|max:50',
            'transaction_id' => 'nullable|string|max:255',
            'transaction_ref' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
        ]);

        $amount = (float) $validated['amount'];
        $remaining = max((float) $payment->total_amount - (float) $payment->amount_paid, 0);

        if ($amount > $remaining) {
            return response()->json([
                'error' => 'Partial payment amount exceeds remaining balance.',
                'remaining_balance' => round($remaining, 2),
            ], 422);
        }

        $partialPayment = PartialPayment::create([
            'tenant_payment_id' => (int) $payment->id,
            'tenant_user_id' => (int) $payment->tenant_user_id,
            'amount' => $amount,
            'payment_method' => Arr::get($validated, 'payment_method', 'sslcommerz'),
            'transaction_id' => Arr::get($validated, 'transaction_id'),
            'transaction_ref' => Arr::get($validated, 'transaction_ref'),
            'status' => 'completed',
            'notes' => Arr::get($validated, 'notes'),
        ]);

        $payment->amount_paid = round((float) $payment->amount_paid + $amount, 2);
        $payment->payment_method = Arr::get($validated, 'payment_method', $payment->payment_method);
        $payment->transaction_ref = Arr::get($validated, 'transaction_ref', $payment->transaction_ref);
        $payment->status = $this->resolvePaymentStatus(
            Carbon::parse($payment->due_date),
            (float) $payment->total_amount,
            (float) $payment->amount_paid,
            Carbon::today()
        );
        $payment->paid_at = $payment->status === 'paid' ? now() : null;
        $payment->save();

        return response()->json([
            'success' => true,
            'partial_payment_id' => (int) $partialPayment->id,
            'amount_paid' => round($amount, 2),
            'new_total_paid' => round((float) $payment->amount_paid, 2),
            'remaining_balance' => round(max((float) $payment->total_amount - (float) $payment->amount_paid, 0), 2),
            'payment_status' => (string) $payment->status,
        ], 201);
    }

    public function getPartialPayments($paymentId): JsonResponse
    {
        $payment = TenantPayment::findOrFail((int) $paymentId);

        $partialPayments = PartialPayment::query()
            ->where('tenant_payment_id', (int) $payment->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function (PartialPayment $pp) {
                return [
                    'id' => (int) $pp->id,
                    'amount' => round((float) $pp->amount, 2),
                    'payment_method' => (string) $pp->payment_method,
                    'transaction_id' => optional($pp->transaction_id),
                    'status' => (string) $pp->status,
                    'created_at' => optional($pp->created_at)->toISOString(),
                ];
            });

        return response()->json([
            'total_partial_payments' => $partialPayments->count(),
            'partial_payments' => $partialPayments,
        ], 200);
    }
}
