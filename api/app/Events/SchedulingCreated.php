<?php

namespace App\Events;

use App\Models\Scheduling;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SchedulingCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Scheduling $scheduling;

    public function __construct(Scheduling $scheduling)
    {
        $this->scheduling = $scheduling;
    }
}

