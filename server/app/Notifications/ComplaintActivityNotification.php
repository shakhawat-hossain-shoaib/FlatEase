<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ComplaintActivityNotification extends Notification
{
    use Queueable;

    private $complaintId;
    private $type;
    private $message;
    private $occurredAt;

    public function __construct(int $complaintId, string $type, string $message)
    {
        $this->complaintId = $complaintId;
        $this->type = $type;
        $this->message = $message;
        $this->occurredAt = now()->toISOString();
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'complaint_id' => $this->complaintId,
            'type' => $this->type,
            'message' => $this->message,
            'created_at' => $this->occurredAt,
        ];
    }
}
