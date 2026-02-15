<?php

namespace App\Events;

use App\Models\Scheduling;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SchedulingPaymentStatusUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Scheduling $scheduling;
    public string $oldStatus;
    public string $newStatus;

    public function __construct(Scheduling $scheduling, string $oldStatus, string $newStatus)
    {
        $this->scheduling = $scheduling;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }
}
