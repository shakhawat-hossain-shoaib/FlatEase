<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AdminAnnouncementNotification extends Notification
{
    use Queueable;

    private string $title;
    private string $message;
    private int $createdBy;
    private string $broadcastId;

    public function __construct(string $title, string $message, int $createdBy, string $broadcastId)
    {
        $this->title = $title;
        $this->message = $message;
        $this->createdBy = $createdBy;
        $this->broadcastId = $broadcastId;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'type' => 'admin_announcement',
            'title' => $this->title,
            'message' => $this->message,
            'created_by' => $this->createdBy,
            'broadcast_id' => $this->broadcastId,
            'created_at' => now()->toISOString(),
        ];
    }
}
