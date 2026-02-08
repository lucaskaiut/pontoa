<?php

namespace App\Services;

use App\Constants\Modules;
use App\Models\Company;
use App\Services\ConversationState\ConversationStateHandlerFactory;
use App\Services\ScheduleService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class WhatsAppWebhookService
{
    private CompanyService $companyService;

    private SettingService $settingService;

    private ModuleService $moduleService;

    private ScheduleService $scheduleService;

    private ConversationContextService $conversationContextService;

    private ConversationStateHandlerFactory $stateHandlerFactory;

    public function __construct(
        CompanyService $companyService,
        SettingService $settingService,
        ModuleService $moduleService,
        ScheduleService $scheduleService,
        ConversationContextService $conversationContextService,
        ConversationStateHandlerFactory $stateHandlerFactory
    ) {
        $this->companyService = $companyService;
        $this->settingService = $settingService;
        $this->moduleService = $moduleService;
        $this->scheduleService = $scheduleService;
        $this->conversationContextService = $conversationContextService;
        $this->stateHandlerFactory = $stateHandlerFactory;
    }

    public function processWebhook(array $data): void
    {
        $instance = $data['instance'] ?? null;

        if (! $instance) {
            throw new NotFoundHttpException('Instance não encontrada no payload');
        }

        $company = $this->resolveCompany($instance);
        app('company')->registerCompany($company);

        $this->validateInstance($instance);

        $phone = $this->extractPhoneFromPayload($data['data']['key']['remoteJid']);

        if (!$phone) {
            $phone = $this->extractPhoneFromPayload($data['data']['key']['remoteJidAlt']);
        }

        if (! $phone) {
            return;
        }

        $fromMe = $data['data']['key']['fromMe'] ?? false;

        if ($fromMe) {
            $context = $this->conversationContextService->getActiveContext($company->id, $phone);
            
            if (!$context->isLocked() || $context->current_state !== 'handoff') {
                $this->conversationContextService->createContext(
                    $company->id,
                    $phone,
                    'handoff',
                    null,
                    Carbon::now()->addMinutes(30)
                );
            }
            
            return;
        }

        $context = $this->conversationContextService->getActiveContext($company->id, $phone);

        if ($this->isAudioMessage($data['data'] ?? [])) {
            if (!$context->isLocked() || $context->current_state !== 'handoff') {
                $this->conversationContextService->createContext(
                    $company->id,
                    $phone,
                    'handoff',
                    null,
                    Carbon::now()->addMinutes(30)
                );
                $context = $this->conversationContextService->getActiveContext($company->id, $phone);
            }
            
            $handler = $this->stateHandlerFactory->resolve('handoff');
            $handler->handle($context, 'Áudio recebido');
            return;
        }
        
        $message = $this->extractMessageFromPayload($data['data'] ?? []);

        if (! $message) {
            return;
        }

        if ($context->isLocked()) {
            $handler = $this->stateHandlerFactory->resolve($context->current_state);
            $handler->handle($context, $message);
            return;
        }

        if ($this->detectCancelIntent($message)) {
            $this->conversationContextService->createContext(
                $company->id,
                $phone,
                'cancel_awaiting_email',
                null,
                Carbon::now()->addHours(2)
            );
            $this->sendWhatsAppMessage($phone, 'Para cancelar seu agendamento, preciso do seu e-mail. Por favor, envie o e-mail cadastrado.', $company->id);
            return;
        }

        $this->processAiAttendance($company, $data);
    }

    private function resolveCompany(string $instance): Company
    {
        $instanceParts = explode('-', $instance);
        $companyId = (int) $instanceParts[0];

        $company = $this->companyService->findOneBy(['id' => $companyId]);

        if (! $company) {
            throw new NotFoundHttpException('Company não encontrada');
        }

        return $company;
    }

    private function validateInstance(string $instance): void
    {
        $whatsappInstanceName = $this->settingService->get('whatsapp_instance_name');

        if ($whatsappInstanceName !== $instance) {
            throw new NotFoundHttpException('Instance não corresponde à configuração');
        }
    }

    private function extractPhoneFromPayload(string $phone): ?string
    {
        if (! str_contains($phone, '@s.whatsapp.net')) {
            return null;
        }

        $phone = str_replace('@s.whatsapp.net', '', $phone);
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with($phone, '55')) {
            return substr($phone, 2);
        }

        return $phone;
    }

    private function isAudioMessage(array $data): bool
    {
        if (isset($data['messageType']) && $data['messageType'] === 'audioMessage') {
            return true;
        }

        $message = $data['message'] ?? null;

        if (!$message) {
            return false;
        }

        return isset($message['audioMessage']);
    }

    private function extractMessageFromPayload(array $data): ?string
    {
        $message = $data['message'] ?? null;

        if (! $message) {
            return null;
        }

        if (isset($message['conversation'])) {
            return $message['conversation'];
        }

        if (isset($message['extendedTextMessage']['text'])) {
            return $message['extendedTextMessage']['text'];
        }

        return null;
    }

    private function processAiAttendance(Company $company, array $data): void
    {
        if (! $this->moduleService->hasModule($company, Modules::AI_ATTENDANCE)) {
            throw new AccessDeniedHttpException(
                'O módulo "Atendimento com IA" não está habilitado para esta empresa.'
            );
        }

        $n8nUrl = config('app.n8n_url');

        if (! $n8nUrl) {
            throw new \Exception('N8N URL não configurada');
        }

        $systemPrompt = file_get_contents(resource_path('prompts/systemprompt.md'));
        $servicesList = $this->formatServicesList($company);
        $availableSlots = $this->formatAvailableSlots($company);
        $currentDate = Carbon::now()->format('d/m/Y');
        $systemPrompt = str_replace('{services}', $servicesList, $systemPrompt);
        $systemPrompt = str_replace('{available_slots}', $availableSlots, $systemPrompt);
        $systemPrompt = str_replace('{current_date}', $currentDate, $systemPrompt);

        $payload = [
            'evolution_data' => $data,
            'system_message_prompt' => $systemPrompt,
            'company_domain' => $company->domain,
            'api_token' => $this->settingService->get('api_key'),
            'support_phone' => $company->support_phone,
        ];

        Http::post($n8nUrl, $payload);
    }

    private function formatServicesList(Company $company): string
    {
        $services = $company->services()
            ->where('status', true)
            ->orderBy('name')
            ->get(['id', 'name', 'price', 'duration', 'description']);

        if ($services->isEmpty()) {
            return 'Nenhum serviço disponível no momento.';
        }

        $servicesText = [];
        foreach ($services as $service) {
            $price = number_format($service->price, 2, ',', '.');
            $duration = $service->duration;
            $description = $service->description ? " - {$service->description}" : '';
            
            $servicesText[] = "* **{$service->name}**{$description}";
            $servicesText[] = "  - Duração: {$duration} minutos";
            $servicesText[] = "  - Valor: R$ {$price}";
        }

        return implode("\n", $servicesText);
    }

    private function formatAvailableSlots(Company $company): string
    {
        $services = $company->services()
            ->where('status', true)
            ->get(['id', 'name']);

        if ($services->isEmpty()) {
            return 'Nenhum horário disponível no momento.';
        }

        $startDate = Carbon::now()->startOfDay();
        $endDate = Carbon::now()->startOfDay()->addMonths(3);
        $allSlots = [];
        
        foreach ($services as $service) {
            try {
                $currentDate = clone $startDate;
                
                while ($currentDate->lte($endDate)) {
                    $dateString = $currentDate->format('Y-m-d H:i');
                    $availableHours = $this->scheduleService->availableHours($dateString, $service->id, null);
                    
                    if (isset($availableHours['schedule']) && !empty($availableHours['schedule'])) {
                        foreach ($availableHours['schedule'] as $date => $usersHours) {
                            if (!isset($allSlots[$date])) {
                                $allSlots[$date] = [];
                            }
                            
                            foreach ($usersHours as $hours) {
                                if (is_array($hours)) {
                                    foreach ($hours as $hour) {
                                        if (!in_array($hour, $allSlots[$date])) {
                                            $allSlots[$date][] = $hour;
                                        }
                                    }
                                }
                            }
                            
                            sort($allSlots[$date]);
                        }
                    }
                    
                    $currentDate->addDays(6);
                }
            } catch (\Exception $e) {
                Log::warning('Erro ao buscar horários disponíveis para serviço', [
                    'service_id' => $service->id,
                    'error' => $e->getMessage(),
                ]);
                continue;
            }
        }

        if (empty($allSlots)) {
            return 'Nenhum horário disponível no momento.';
        }

        uksort($allSlots, function ($a, $b) {
            return strtotime($a) <=> strtotime($b);
        });
        
        $slotsText = [];
        foreach ($allSlots as $date => $hours) {
            $dateCarbon = Carbon::createFromFormat('Y-m-d', $date);
            $formattedDate = $dateCarbon->format('d/m');
            
            $slotsText[] = "📅 **{$formattedDate}**";
            foreach ($hours as $hour) {
                $slotsText[] = "• {$hour}";
            }
            $slotsText[] = '';
        }

        return implode("\n", $slotsText);
    }

    private function detectCancelIntent(string $message): bool
    {
        $normalized = mb_strtolower(trim($message));
        
        $keywords = [
            'cancelar',
            'desmarcar',
            'cancelamento',
            'cancelar agendamento',
            'desmarcar agendamento',
            'não vou poder ir',
            'não vou conseguir ir',
            'quero cancelar',
            'preciso cancelar',
            'gostaria de cancelar',
        ];

        foreach ($keywords as $keyword) {
            if (str_contains($normalized, $keyword)) {
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
