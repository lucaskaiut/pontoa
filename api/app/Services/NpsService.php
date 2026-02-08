<?php

namespace App\Services;

use App\Models\ConversationContext;
use App\Models\Review;
use App\Models\Scheduling;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

final class NpsService
{
    private ConversationContextService $conversationContextService;
    private SettingService $settingService;

    public function __construct(
        ConversationContextService $conversationContextService,
        SettingService $settingService
    ) {
        $this->conversationContextService = $conversationContextService;
        $this->settingService = $settingService;
    }

    public function sendNpsRequest(Scheduling $scheduling): bool
    {
        if (!$this->shouldSendNps($scheduling)) {
            return false;
        }

        $customer = $scheduling->customer;

        if (!$customer || !$customer->phone) {
            Log::info('Cliente sem telefone, não é possível enviar NPS', [
                'scheduling_id' => $scheduling->id,
                'customer_id' => $customer?->id,
            ]);
            return false;
        }

        $message = 'Como foi sua experiência com nosso atendimento?' . "\n" . 'Responda com uma nota de 0 a 10 😊';

        $sent = $this->sendWhatsAppMessage($customer->phone, $message, $scheduling->company_id);

        if (!$sent) {
            return false;
        }

        $this->conversationContextService->createContext(
            $scheduling->company_id,
            $customer->phone,
            'awaiting_nps',
            [
                'appointment_id' => $scheduling->id,
                'customer_id' => $customer->id,
            ],
            Carbon::now()->addHours(24)
        );

        return true;
    }

    private function shouldSendNps(Scheduling $scheduling): bool
    {
        $npsEnabled = $this->settingService->get('nps_enabled');

        if (!$npsEnabled) {
            return false;
        }

        $existingReview = Review::where('appointment_id', $scheduling->id)->exists();

        if ($existingReview) {
            return false;
        }

        if (!$scheduling->customer || !$scheduling->customer->phone) {
            return false;
        }

        $activeContext = $this->conversationContextService->getActiveContext(
            $scheduling->company_id,
            $scheduling->customer->phone
        );

        if ($activeContext->isLocked() && $activeContext->current_state !== 'idle') {
            return false;
        }

        return true;
    }

    private function sendWhatsAppMessage(string $phone, string $message, int $companyId): bool
    {
        try {
            $instanceName = $this->settingService->get('whatsapp_instance_name');

            if (!$instanceName) {
                Log::warning('WhatsApp instance não configurada, não é possível enviar NPS');
                return false;
            }

            $payload = [
                'number' => '55' . $phone,
                'text' => $message,
            ];

            $url = config('app.evolution_api_url') . '/message/sendText/' . $instanceName;

            $response = Http::withHeaders(['apikey' => config('app.evolution_api_key')])
                ->post($url, $payload);

            if (!$response->successful()) {
                Log::error('Erro ao enviar NPS por WhatsApp', [
                    'phone' => $phone,
                    'company_id' => $companyId,
                    'response' => $response->body(),
                ]);
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Exceção ao enviar NPS por WhatsApp', [
                'phone' => $phone,
                'company_id' => $companyId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}

