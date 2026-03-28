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

        $assignedTechnicianUserIds = $event->complaint
            ->technicians()
            ->pluck('technicians.user_id')
            ->map(static fn ($id) => (int) $id)
            ->filter(static fn ($id) => $id > 0)
            ->all();

        foreach ($assignedTechnicianUserIds as $technicianUserId) {
            if ($technicianUserId !== (int) $event->actorId) {
                $recipientIds[] = $technicianUserId;
            }
        }

        if (
            empty($assignedTechnicianUserIds)
            && $event->complaint->assigned_technician_id
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
