<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\AdminAnnouncementNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 15);

        $notifications = $request->user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($notifications, 200);
    }

    public function markRead(Request $request, $id)
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->firstOrFail();

        if ($notification->read_at === null) {
            $notification->markAsRead();
        }

        return response()->json($notification->fresh(), 200);
    }

    public function adminBroadcast(Request $request)
    {
        if ((string) optional($request->user())->role !== 'admin') {
            return response()->json(['error' => 'Forbidden. Admin access required.'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:120',
            'message' => 'required|string|max:1000',
        ]);

        $tenantUsers = User::query()
            ->where('role', 'tenant')
            ->select(['id'])
            ->get();

        if ($tenantUsers->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No tenant users found to send this notification.',
            ], 422);
        }

        $broadcastId = (string) Str::uuid();

        $tenantUsers->each(function (User $tenant) use ($validated, $request, $broadcastId) {
            $tenant->notify(new AdminAnnouncementNotification(
                (string) $validated['title'],
                (string) $validated['message'],
                (int) $request->user()->id,
                $broadcastId
            ));
        });

        return response()->json([
            'success' => true,
            'message' => 'Notification sent to tenants successfully.',
            'broadcast_id' => $broadcastId,
            'recipients' => (int) $tenantUsers->count(),
        ], 201);
    }
}
