<?php

namespace App\Events;

use App\Models\Complaint;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ComplaintActivityOccurred
{
    use Dispatchable, SerializesModels;

    public $complaint;
    public $type;
    public $actorId;
    public $message;

    public function __construct(Complaint $complaint, string $type, int $actorId, string $message)
    {
        $this->complaint = $complaint;
        $this->type = $type;
        $this->actorId = $actorId;
        $this->message = $message;
    }
}
