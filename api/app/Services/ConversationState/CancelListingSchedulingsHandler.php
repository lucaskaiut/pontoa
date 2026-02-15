<?php

namespace App\Services\ConversationState;

use App\Models\ConversationContext;
use App\Services\ConversationContextService;
use App\Services\SettingService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

final class CancelListingSchedulingsHandler implements ConversationStateHandler
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

    public function handle(ConversationContext $context, string $message): void
    {
        $payload = $context->state_payload ?? [];
        $schedulings = $payload['schedulings'] ?? [];

        if (empty($schedulings)) {
            $this->conversationContextService->closeContext(
                $context->company_id,
                $context->customer_phone
            );
            return;
        }

        $schedulingId = $this->resolveSchedulingId($message, $schedulings);

        if (!$schedulingId) {
            $this->sendWhatsAppMessage(
                $context->customer_phone,
                'Não consegui identificar qual agendamento você deseja cancelar. Por favor, informe o número ou a data/hora do agendamento.',
                $context->company_id
            );
            return;
        }

        $selectedScheduling = collect($schedulings)->firstWhere('id', $schedulingId);

        if (!$selectedScheduling) {
            $this->sendWhatsAppMessage(
                $context->customer_phone,
                'Agendamento não encontrado. Por favor, tente novamente.',
                $context->company_id
            );
            return;
        }

        $this->conversationContextService->createContext(
            $context->company_id,
            $context->customer_phone,
            'cancel_awaiting_confirmation',
            [
                'email' => $payload['email'] ?? null,
                'scheduling_id' => $schedulingId,
                'scheduling_date' => $selectedScheduling['date'],
                'scheduling_service' => $selectedScheduling['service'],
            ],
            Carbon::now()->addHours(2)
        );

        $confirmationMessage = "Você deseja cancelar o agendamento:\n\n";
        $confirmationMessage .= "• Serviço: {$selectedScheduling['service']}\n";
        $confirmationMessage .= "• Data/Hora: {$selectedScheduling['date']}\n\n";
        $confirmationMessage .= "Confirme digitando: sim, confirmo, pode cancelar ou cancelar";

        $this->sendWhatsAppMessage($context->customer_phone, $confirmationMessage, $context->company_id);
    }

    private function resolveSchedulingId(string $message, array $schedulings): ?int
    {
        $normalized = mb_strtolower(trim($message));
        
        $number = $this->extractNumber($normalized);
        if ($number !== null && $number > 0 && $number <= count($schedulings)) {
            return $schedulings[$number - 1]['id'] ?? null;
        }

        foreach ($schedulings as $scheduling) {
            if ($this->matchesDateOrTime($normalized, $scheduling['date'])) {
                return $scheduling['id'];
            }
        }

        return null;
    }

    private function extractNumber(string $message): ?int
    {
        preg_match('/\b(\d+)\b/', $message, $matches);
        return isset($matches[1]) ? (int) $matches[1] : null;
    }

    private function matchesDateOrTime(string $message, string $schedulingDate): bool
    {
        try {
            $schedulingCarbon = Carbon::createFromFormat('d/m/Y H:i', $schedulingDate);
            
            $dateFormats = [
                'd/m/Y',
                'd/m',
                'd-m-Y',
                'd-m',
            ];

            foreach ($dateFormats as $format) {
                try {
                    $parsed = Carbon::createFromFormat($format, $message);
                    if ($parsed->format('Y-m-d') === $schedulingCarbon->format('Y-m-d')) {
                        return true;
                    }
                } catch (\Exception $e) {
                    continue;
                }
            }

            $timeFormats = ['H:i', 'H:i:s'];
            foreach ($timeFormats as $format) {
                try {
                    $parsed = Carbon::createFromFormat($format, $message);
                    if ($parsed->format('H:i') === $schedulingCarbon->format('H:i')) {
                        return true;
                    }
                } catch (\Exception $e) {
                    continue;
                }
            }

            if (str_contains($message, $schedulingCarbon->format('d/m/Y'))) {
                return true;
            }

            if (str_contains($message, $schedulingCarbon->format('H:i'))) {
                return true;
            }
        } catch (\Exception $e) {
            return false;
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

            $response = \Illuminate\Support\Facades\Http::withHeaders(['apikey' => config('app.evolution_api_key')])
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

