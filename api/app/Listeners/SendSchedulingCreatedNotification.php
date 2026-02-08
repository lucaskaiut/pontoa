<?php

namespace App\Listeners;

use App\Events\SchedulingCreated;
use App\Mail\SchedulingReceivedMail;
use App\Mail\SchedulingReceivedProfessionalMail;
use App\Mail\SchedulingReceivedCompanyMail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendSchedulingCreatedNotification
{
    public function handle(SchedulingCreated $event)
    {
        $scheduling = $event->scheduling->load(['customer', 'user', 'service', 'company']);

        try {
            Mail::to($scheduling->customer->email)
                ->queue(new SchedulingReceivedMail($scheduling));
        } catch (\Exception $e) {
            Log::error('Erro ao enviar notificação de recebimento de agendamento por email: ' . $e->getMessage());
        }

        try {
            if ($scheduling->user && $scheduling->user->email) {
                Mail::to($scheduling->user->email)
                    ->queue(new SchedulingReceivedProfessionalMail($scheduling));
            }
        } catch (\Exception $e) {
            Log::error('Erro ao enviar notificação de recebimento de agendamento por email para o profissional: ' . $e->getMessage());
        }

        try {
            if ($scheduling->company && $scheduling->company->email) {
                Mail::to($scheduling->company->email)
                    ->queue(new SchedulingReceivedCompanyMail($scheduling));
            }
        } catch (\Exception $e) {
            Log::error('Erro ao enviar notificação de recebimento de agendamento por email para a empresa: ' . $e->getMessage());
        }
    }
}

