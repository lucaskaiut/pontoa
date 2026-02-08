<?php

namespace App\Services\ConversationState;

use App\Models\Company;
use App\Models\ConversationContext;
use App\Models\Customer;
use App\Services\ConversationContextService;
use App\Services\SettingService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

final class HandoffHandler implements ConversationStateHandler
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
        $this->conversationContextService->createContext(
            $context->company_id,
            $context->customer_phone,
            'handoff',
            $context->state_payload,
            Carbon::now()->addMinutes(30)
        );

        $company = Company::find($context->company_id);

        if (!$company || !$company->support_phone) {
            Log::info('Empresa sem telefone de suporte configurado no contexto de handoff', [
                'company_id' => $company?->id,
                'phone' => $context->customer_phone,
            ]);
            return;
        }

        $this->notifySupport($company, $context, $message);
    }

    private function notifySupport(Company $company, ConversationContext $context, string $message): void
    {
        try {
            app('company')->registerCompany($company);

            $instanceName = $this->settingService->get('whatsapp_instance_name');

            if (!$instanceName) {
                Log::warning('WhatsApp instance não configurada, não é possível enviar notificação de handoff');
                return;
            }

            $notificationMessage = $this->buildNotificationMessage($context, $message);

            $payload = [
                'number' => '55' . $company->support_phone,
                'text' => $notificationMessage,
            ];

            $url = config('app.evolution_api_url') . '/message/sendText/' . $instanceName;

            $response = Http::withHeaders(['apikey' => config('app.evolution_api_key')])
                ->post($url, $payload);

            if (!$response->successful()) {
                Log::error('Erro ao enviar notificação de handoff por WhatsApp', [
                    'company_id' => $company->id,
                    'phone' => $context->customer_phone,
                    'support_phone' => $company->support_phone,
                    'response' => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exceção ao enviar notificação de handoff por WhatsApp', [
                'company_id' => $company->id,
                'phone' => $context->customer_phone,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function buildNotificationMessage(ConversationContext $context, string $message): string
    {
        $customer = $context->customer_id ? Customer::find($context->customer_id) : null;
        $customerName = $customer?->name ?? 'Cliente';
        $customerPhone = $context->customer_phone;

        $isAudio = $message === 'Áudio recebido';

        $notificationMessage = "🔔 *Handoff - Nova Mensagem*\n\n";
        $notificationMessage .= "Cliente: {$customerName}\n";
        $notificationMessage .= "Telefone: {$customerPhone}\n\n";

        if ($isAudio) {
            $notificationMessage .= "Tipo: 🎤 Áudio\n\n";
            $notificationMessage .= "O cliente enviou uma mensagem de áudio. Entre em contato para atendimento.";
        } else {
            $notificationMessage .= "Mensagem:\n{$message}";
        }

        return $notificationMessage;
    }
}
