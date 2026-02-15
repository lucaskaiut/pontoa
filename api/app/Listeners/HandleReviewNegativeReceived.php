<?php

namespace App\Listeners;

use App\Events\ReviewNegativeReceived;
use App\Services\SettingService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HandleReviewNegativeReceived
{
    private SettingService $settingService;

    public function __construct(SettingService $settingService)
    {
        $this->settingService = $settingService;
    }

    public function handle(ReviewNegativeReceived $event): void
    {
        $review = $event->review->load(['company', 'customer', 'appointment']);

        Log::warning('Avaliação negativa recebida - ação requerida', [
            'review_id' => $review->id,
            'company_id' => $review->company_id,
            'appointment_id' => $review->appointment_id,
            'customer_id' => $review->customer_id,
            'customer_name' => $review->customer->name ?? null,
            'customer_phone' => $review->customer->phone ?? null,
            'score' => $review->score,
            'comment' => $review->comment,
            'classification' => $review->classification,
        ]);

        $this->sendWhatsAppNotification($review);
    }

    private function sendWhatsAppNotification($review): void
    {
        $company = $review->company;

        if (!$company || !$company->support_phone) {
            Log::info('Empresa sem telefone de suporte configurado, não é possível enviar notificação', [
                'company_id' => $company?->id,
                'review_id' => $review->id,
            ]);
            return;
        }

        try {
            app('company')->registerCompany($company);

            $instanceName = $this->settingService->get('whatsapp_instance_name');

            if (!$instanceName) {
                Log::warning('WhatsApp instance não configurada, não é possível enviar notificação de avaliação negativa');
                return;
            }

            $message = $this->buildNotificationMessage($review);

            $payload = [
                'number' => '55' . $company->support_phone,
                'text' => $message,
            ];

            $url = config('app.evolution_api_url') . '/message/sendText/' . $instanceName;

            $response = Http::withHeaders(['apikey' => config('app.evolution_api_key')])
                ->post($url, $payload);

            if (!$response->successful()) {
                Log::error('Erro ao enviar notificação de avaliação negativa por WhatsApp', [
                    'company_id' => $company->id,
                    'review_id' => $review->id,
                    'support_phone' => $company->support_phone,
                    'response' => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exceção ao enviar notificação de avaliação negativa por WhatsApp', [
                'company_id' => $company->id ?? null,
                'review_id' => $review->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function buildNotificationMessage($review): string
    {
        $customerName = $review->customer->name ?? 'Cliente';
        $customerPhone = $review->customer->phone ?? 'Não informado';
        $appointmentDate = $review->appointment->date 
            ? $review->appointment->date->format('d/m/Y H:i') 
            : 'Não informado';
        
        $message = "⚠️ *Avaliação Negativa Recebida*\n\n";
        $message .= "Cliente: {$customerName}\n";
        $message .= "Telefone: {$customerPhone}\n";
        $message .= "Data do atendimento: {$appointmentDate}\n";
        $message .= "Nota: {$review->score}/10\n\n";

        if ($review->comment) {
            $message .= "Comentário:\n{$review->comment}\n\n";
        }

        $message .= "Ação necessária: Entre em contato com o cliente para resolver a situação.";

        return $message;
    }
}
