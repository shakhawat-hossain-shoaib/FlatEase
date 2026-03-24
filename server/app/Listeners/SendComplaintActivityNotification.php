<?php

namespace App\Listeners;

use App\Events\ComplaintActivityOccurred;
use App\Models\User;
use App\Notifications\ComplaintActivityNotification;

class SendComplaintActivityNotification
{
    public function handle(ComplaintActivityOccurred $event)
    {
        $recipientIds = [];

        if ($event->complaint->tenant_id && (int) $event->complaint->tenant_id !== (int) $event->actorId) {
            $recipientIds[] = (int) $event->complaint->tenant_id;
        }

        if (
            $event->complaint->assigned_technician_id
            && (int) $event->complaint->assigned_technician_id !== (int) $event->actorId
        ) {
            $recipientIds[] = (int) $event->complaint->assigned_technician_id;
        }

        $recipientIds = array_values(array_unique($recipientIds));
        if (count($recipientIds) === 0) {
            return;
        }

        $notification = new ComplaintActivityNotification(
            (int) $event->complaint->id,
            $event->type,
            $event->message
        );

        User::whereIn('id', $recipientIds)
            ->get()
            ->each(function (User $user) use ($notification) {
                $user->notify($notification);
            });
    }
}
