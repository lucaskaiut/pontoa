<?php

namespace App\Events;

use App\Models\AppointmentExecution;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AppointmentCheckedOut
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public AppointmentExecution $execution;

    public function __construct(AppointmentExecution $execution)
    {
        $this->execution = $execution;
    }
}

