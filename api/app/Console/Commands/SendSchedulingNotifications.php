<?php

namespace App\Console\Commands;

use App\Models\Company;
use App\Services\CompanyService;
use App\Services\NotificationSchedulingService;
use Illuminate\Console\Command;

class SendSchedulingNotifications extends Command
{
    protected $signature = 'notifications:send';

    protected $description = 'Envia notificações de agendamentos para clientes';

    public function handle(CompanyService $companyService, NotificationSchedulingService $notificationService)
    {
        $companies = $companyService->findBy(['active' => 1]);

        foreach ($companies as $company) {
            $this->handleCompanyNotifications($company, $notificationService);
        }
    }

    private function handleCompanyNotifications(Company $company, NotificationSchedulingService $notificationService)
    {
        try {
            app('company')->registerCompany($company);
            
            $this->info("Processando notificações para: {$company->name}");
            
            $notificationService->processNotifications();
            
            $this->info("Notificações processadas para: {$company->name}");
        } catch (\Exception $e) {
            $this->error("Erro ao processar notificações para {$company->name}: {$e->getMessage()} em {$e->getFile()}:{$e->getLine()}");
        }
    }
}

