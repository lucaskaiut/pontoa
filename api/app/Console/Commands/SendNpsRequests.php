<?php

namespace App\Console\Commands;

use App\Models\Company;
use App\Models\ConversationContext;
use App\Models\Review;
use App\Models\Scheduling;
use App\Services\CompanyService;
use App\Services\NpsService;
use App\Utilities\PhoneNormalizer;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendNpsRequests extends Command
{
    protected $signature = 'nps:send';

    protected $description = 'Envia solicitações de NPS para agendamentos finalizados há mais de 1 hora';

    private CompanyService $companyService;
    private NpsService $npsService;

    public function __construct(CompanyService $companyService, NpsService $npsService)
    {
        parent::__construct();
        $this->companyService = $companyService;
        $this->npsService = $npsService;
    }

    public function handle(): void
    {
        $companies = $this->companyService->findBy(['active' => 1]);

        foreach ($companies as $company) {
            $this->handleCompanyNps($company);
        }
    }

    private function handleCompanyNps(Company $company): void
    {
        try {
            app('company')->registerCompany($company);

            $schedulings = $this->getSchedulingsReadyForNps();

            foreach ($schedulings as $scheduling) {
                $this->sendNpsForScheduling($scheduling, $company);
            }
        } catch (\Exception $e) {
            $this->error("Erro ao processar NPS para {$company->name}: {$e->getMessage()}");
        }
    }

    private function getSchedulingsReadyForNps(): array
    {
        $now = Carbon::now();

        $schedulings = Scheduling::with(['customer', 'service'])
            ->where('status', 'confirmed')
            ->whereHas('service', function ($query) {
                $query->whereNotNull('duration');
            })
            ->whereDoesntHave('customer', function ($query) {
                $query->whereNull('phone');
            })
            ->get();

        $readySchedulings = [];

        foreach ($schedulings as $scheduling) {
            if ($this->hasReview($scheduling->id) || $this->hasActiveNpsContext($scheduling)) {
                continue;
            }

            $completionTime = $this->calculateCompletionTime($scheduling);
                
            if ($now->isAfter($completionTime)) {
                $readySchedulings[] = $scheduling;
            }
        }

        return $readySchedulings;
    }

    private function calculateCompletionTime(Scheduling $scheduling): Carbon
    {
        $startTime = $scheduling->date;
        $serviceDuration = $scheduling->service->duration ?? 0;

        $completionTime = $startTime->copy()->addMinutes($serviceDuration)->addHour();

        return $completionTime;
    }

    private function hasReview(int $appointmentId): bool
    {
        return Review::where('appointment_id', $appointmentId)->exists();
    }

    private function hasActiveNpsContext(Scheduling $scheduling): bool
    {
        if (!$scheduling->customer || !$scheduling->customer->phone) {
            return false;
        }

        $normalizedPhone = PhoneNormalizer::normalizeToString($scheduling->customer->phone);

        $context = ConversationContext::where('customer_phone', $normalizedPhone)
            ->where('current_state', 'awaiting_nps')
            ->first();

        if (!$context || $context->isExpired()) {
            return false;
        }

        $payload = $context->state_payload ?? [];
        $payloadAppointmentId = $payload['appointment_id'] ?? null;

        return $payloadAppointmentId === $scheduling->id;
    }

    private function sendNpsForScheduling(Scheduling $scheduling, Company $company): void
    {
        try {
            $sent = $this->npsService->sendNpsRequest($scheduling);

            if ($sent) {
                $this->info("NPS enviado para agendamento #{$scheduling->id} - Cliente: {$scheduling->customer->name}");
            }
        } catch (\Exception $e) {
            $this->error("Erro ao enviar NPS para agendamento #{$scheduling->id}: {$e->getMessage()}");
        }
    }
}

