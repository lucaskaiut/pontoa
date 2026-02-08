<?php

namespace App\Console\Commands;

use App\Mail\BillingNotificationMail;
use App\Models\Company;
use App\Services\CompanyService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendBillingNotifications extends Command
{
    protected $signature = 'billing:send-notifications';

    protected $description = 'Envia notificações de cobrança para empresas que serão cobradas em 3 dias';

    public function handle(CompanyService $companyService)
    {
        $companies = Company::where('active', 1)
            ->whereNotNull('plan_name')
            ->whereNotNull('plan_recurrence')
            ->get();

        $sentCount = 0;

        foreach ($companies as $company) {
            if (!$companyService->shouldSendBillingNotification($company)) {
                continue;
            }

            try {
                app('company')->registerCompany($company);

                Mail::to($company->email)
                    ->queue(new BillingNotificationMail($company));

                $companyService->markBillingNotificationSent($company);

                $sentCount++;

                $this->info("Notificação enviada para {$company->name} ({$company->email})");
            } catch (\Exception $e) {
                Log::error('Erro ao enviar notificação de cobrança', [
                    'company_id' => $company->id,
                    'company_name' => $company->name,
                    'error' => $e->getMessage(),
                ]);

                $this->error("Erro ao enviar notificação para {$company->name}: {$e->getMessage()}");
            }
        }

        $this->info("Total de notificações enviadas: {$sentCount}");

        return 0;
    }
}
