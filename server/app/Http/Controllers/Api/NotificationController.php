<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

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
}
