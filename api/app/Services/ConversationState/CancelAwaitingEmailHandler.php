<?php

namespace App\Services\ConversationState;

use App\Models\ConversationContext;
use App\Models\Scheduling;
use App\Services\ConversationContextService;
use App\Services\SettingService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

final class CancelAwaitingEmailHandler implements ConversationStateHandler
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
        $email = $this->extractEmail($message);

        if (!$email || !$this->isValidEmail($email)) {
            $this->sendWhatsAppMessage(
                $context->customer_phone,
                'Por favor, envie um e-mail válido para continuar com o cancelamento.',
                $context->company_id
            );
            return;
        }

        $schedulings = $this->findSchedulingsByEmail($email, $context->company_id);

        if ($schedulings->isEmpty()) {
            $this->sendWhatsAppMessage(
                $context->customer_phone,
                'Não encontrei agendamentos para o e-mail informado. Por favor, verifique se o e-mail está correto ou entre em contato com nosso suporte.',
                $context->company_id
            );
            return;
        }

        $schedulingsData = $schedulings->map(function ($scheduling) {
            return [
                'id' => $scheduling->id,
                'date' => $scheduling->date->format('d/m/Y H:i'),
                'service' => $scheduling->service->name ?? 'Serviço não informado',
            ];
        })->toArray();

        $this->conversationContextService->createContext(
            $context->company_id,
            $context->customer_phone,
            'cancel_listing_schedulings',
            [
                'email' => $email,
                'schedulings' => $schedulingsData,
            ],
            Carbon::now()->addHours(2)
        );

        $this->sendSchedulingsList($context->customer_phone, $schedulingsData, $context->company_id);
    }

    private function extractEmail(string $message): ?string
    {
        $normalized = trim($message);
        
        if (filter_var($normalized, FILTER_VALIDATE_EMAIL)) {
            return $normalized;
        }

        preg_match('/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/', $normalized, $matches);
        
        return $matches[0] ?? null;
    }

    private function isValidEmail(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    private function findSchedulingsByEmail(string $email, int $companyId)
    {
        return Scheduling::whereHas('customer', function ($query) use ($email) {
            $query->where('email', $email);
        })
        ->whereIn('status', ['pending', 'confirmed'])
        ->where('date', '>=', Carbon::now())
        ->with('service')
        ->orderBy('date')
        ->get();
    }

    private function sendSchedulingsList(string $phone, array $schedulings, int $companyId): void
    {
        $message = "Encontrei os seguintes agendamentos:\n\n";
        
        foreach ($schedulings as $index => $scheduling) {
            $number = $index + 1;
            $message .= "{$number}. {$scheduling['service']} - {$scheduling['date']}\n";
        }
        
        $message .= "\nPor favor, informe qual agendamento deseja cancelar (número ou data/hora).";

        $this->sendWhatsAppMessage($phone, $message, $companyId);
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

