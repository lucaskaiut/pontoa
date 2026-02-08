<?php

namespace App\Listeners;

use App\Events\SchedulingCancelled;
use App\Mail\SchedulingCancellationMail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendSchedulingCancellationNotification
{
    public function handle(SchedulingCancelled $event)
    {
        $scheduling = $event->scheduling;

        try {
            Mail::to($scheduling->customer->email)
                ->queue(new SchedulingCancellationMail($scheduling));
        } catch (\Exception $e) {
            Log::error('Erro ao enviar notificação de cancelamento por email: ' . $e->getMessage());
        }
    }
}

