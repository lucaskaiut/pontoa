<?php

namespace App\Listeners;

use App\Events\SchedulingConfirmed;
use App\Mail\SchedulingConfirmationMail;
use App\Services\SettingService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendSchedulingConfirmationNotification
{
    public function handle(SchedulingConfirmed $event)
    {
        $scheduling = $event->scheduling->load(['customer', 'service', 'user', 'company']);

        try {
            Mail::to($scheduling->customer->email)
                ->queue(new SchedulingConfirmationMail($scheduling));
        } catch (\Exception $e) {
            Log::error('Erro ao enviar notificação de confirmação por email: '.$e->getMessage());
        }

        $this->sendWhatsApp($scheduling);
    }

    private function sendWhatsApp($scheduling): void
    {
        if (! $scheduling->customer->phone) {
            return;
        }

        try {
            $message = $this->buildConfirmationMessage($scheduling);

            $payload = [
                'number' => '55'.$scheduling->customer->phone,
                'text' => $message,
            ];

            $instanceName = app(SettingService::class)->get('whatsapp_instance_name');

            if (! $instanceName) {
                Log::warning('WhatsApp instance não configurada, não é possível enviar notificação');

                return;
            }

            $url = config('app.evolution_api_url').'/message/sendText/'.$instanceName;

            $response = Http::withHeaders(['apikey' => config('app.evolution_api_key')])
                ->post($url, $payload);

            if (! $response->successful()) {
                Log::error('Erro ao enviar notificação de confirmação por WhatsApp: '.$response->body());
            }
        } catch (\Exception $e) {
            Log::error('Erro ao enviar notificação de confirmação por WhatsApp: '.$e->getMessage());
        }
    }

    private function buildConfirmationMessage($scheduling): string
    {
        $message = "Olá, {$scheduling->customer->name}!\n\n";
        $message .= "✅ Seu agendamento foi confirmado com sucesso! Estamos ansiosos para atendê-lo.\n\n";
        $message .= "📋 *Detalhes do Agendamento*\n\n";

        if ($scheduling->service) {
            $message .= "• *Serviço:* {$scheduling->service->name}\n";
        }

        $message .= "• *Data e Horário:* {$scheduling->date->format('d/m/Y')} às {$scheduling->date->format('H:i')}\n";

        if ($scheduling->service && $scheduling->service->duration) {
            $message .= "• *Duração:* {$scheduling->service->duration} minutos\n";
        }

        if ($scheduling->user) {
            $message .= "• *Profissional:* {$scheduling->user->name}\n";
        }

        $message .= '• *Valor:* R$ '.number_format($scheduling->price, 2, ',', '.')."\n\n";

        $message .= "⚠️ *Importante:*\n";
        $message .= "• Chegue com alguns minutos de antecedência\n";
        $message .= "• Em caso de necessidade de cancelamento ou reagendamento, entre em contato conosco com pelo menos 24 horas de antecedência\n";
        $message .= "• Se tiver alguma dúvida, não hesite em nos contatar\n\n";
        $message .= "Estamos à sua disposição para qualquer esclarecimento.\n\n";

        return $message;
    }
}
