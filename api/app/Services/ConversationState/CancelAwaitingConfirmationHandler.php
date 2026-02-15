<?php

namespace App\Services\ConversationState;

use App\Models\ConversationContext;
use App\Models\Scheduling;
use App\Services\ConversationContextService;
use App\Services\SchedulingService;
use App\Services\SettingService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

final class CancelAwaitingConfirmationHandler implements ConversationStateHandler
{
    private ConversationContextService $conversationContextService;
    private SchedulingService $schedulingService;
    private SettingService $settingService;

    public function __construct(
        ConversationContextService $conversationContextService,
        SchedulingService $schedulingService,
        SettingService $settingService
    ) {
        $this->conversationContextService = $conversationContextService;
        $this->schedulingService = $schedulingService;
        $this->settingService = $settingService;
    }

    public function handle(ConversationContext $context, string $message): void
    {
        $payload = $context->state_payload ?? [];
        $schedulingId = $payload['scheduling_id'] ?? null;

        if (!$schedulingId) {
            $this->conversationContextService->closeContext(
                $context->company_id,
                $context->customer_phone
            );
            return;
        }

        if (!$this->isConfirmation($message)) {
            $this->sendWhatsAppMessage(
                $context->customer_phone,
                'Não entendi sua resposta. Para confirmar o cancelamento, digite: sim, confirmo, pode cancelar ou cancelar.',
                $context->company_id
            );
            return;
        }

        try {
            $scheduling = $this->schedulingService->findOrFail($schedulingId);

            if ($scheduling->company_id !== $context->company_id) {
                throw new \Exception('Agendamento não pertence à empresa');
            }

            if ($scheduling->status === 'cancelled') {
                $this->sendWhatsAppMessage(
                    $context->customer_phone,
                    'Este agendamento já foi cancelado anteriormente.',
                    $context->company_id
                );
                $this->conversationContextService->closeContext(
                    $context->company_id,
                    $context->customer_phone
                );
                return;
            }

            $this->schedulingService->cancel($scheduling);

            $schedulingService = $payload['scheduling_service'] ?? 'N/A';
            $schedulingDate = $payload['scheduling_date'] ?? 'N/A';

            $successMessage = "✅ Agendamento cancelado com sucesso!\n\n";
            $successMessage .= "• Serviço: {$schedulingService}\n";
            $successMessage .= "• Data/Hora: {$schedulingDate}\n\n";
            $successMessage .= "Se precisar reagendar, estou à disposição! 😊";

            $this->sendWhatsAppMessage($context->customer_phone, $successMessage, $context->company_id);

            $this->conversationContextService->closeContext(
                $context->company_id,
                $context->customer_phone
            );
        } catch (\Exception $e) {
            Log::error('Erro ao cancelar agendamento via WhatsApp', [
                'scheduling_id' => $schedulingId,
                'phone' => $context->customer_phone,
                'company_id' => $context->company_id,
                'error' => $e->getMessage(),
            ]);

            $errorMessage = "❌ Ocorreu um erro ao cancelar seu agendamento.\n\n";
            $errorMessage .= "Por favor, entre em contato com nosso suporte para mais informações.";

            $this->sendWhatsAppMessage($context->customer_phone, $errorMessage, $context->company_id);

            $this->conversationContextService->closeContext(
                $context->company_id,
                $context->customer_phone
            );
        }
    }

    private function isConfirmation(string $message): bool
    {
        $normalized = mb_strtolower(trim($message));
        
        $confirmations = [
            'sim',
            'confirmo',
            'pode cancelar',
            'cancelar',
            'confirma',
            'confirmar',
            'ok',
            'okay',
            'pode',
            'quero cancelar',
        ];

        foreach ($confirmations as $confirmation) {
            if ($normalized === $confirmation || str_contains($normalized, $confirmation)) {
                return true;
            }
        }

        return false;
    }

    private function sendWhatsAppMessage(string $phone, string $message, int $companyId): void
    {
        try {
            $instanceName = $this->settingService->get('whatsapp_instance_name');

            if (!$instanceName) {
                Log::warning('WhatsApp instance não configurada');
                return;
            }

            $payload = [
                'number' => '55' . $phone,
                'text' => $message,
            ];

            $url = config('app.evolution_api_url') . '/message/sendText/' . $instanceName;

            $response = Http::withHeaders(['apikey' => config('app.evolution_api_key')])
                ->post($url, $payload);

            if (!$response->successful()) {
                Log::error('Erro ao enviar mensagem por WhatsApp', [
                    'phone' => $phone,
                    'company_id' => $companyId,
                    'response' => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exceção ao enviar mensagem por WhatsApp', [
                'phone' => $phone,
                'company_id' => $companyId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}

