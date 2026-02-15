<?php

namespace App\Console\Commands;

use App\Models\Company;
use App\Services\CompanyService;
use Illuminate\Console\Command;

class CheckCompanySubscription extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:subscription';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'This command handles companies payment';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(CompanyService $service)
    {
        $service->expireSubscriptions();

        $companies = $service->findBy(['active' => 1]);

        foreach ($companies as $company) {
            if (!$this->isCompanyBillable($company)) {
                continue;
            }

            $this->handleCompanyBilling($company, $service);
        }
    }

    private function isCompanyBillable(Company $company): bool
    {
        return $company->card_id
            && $company->active
            && $company->plan_name
            && $company->plan_recurrence
            && ($company->payment_attempts ?? 0) < 3
            && $company->subscription_status !== 'SUSPENDED';
    }

    private function handleCompanyBilling(Company $company, CompanyService $service)
    {
        try {
            app('company')->registerCompany($company);
    
            if (!$service->verifyIfShouldBill($company)) {
                return;
            }

            if (!$this->canRetryPaymentToday($company, $service)) {
                return;
            }
    
            $this->info($company->name . ' billed at ' . now()->format("Y-m-d H:i:s"));
            $service->billCompany($company);
            $service->updateLastBilledAtAndSetNonFree($company);
        } catch (\Exception $e) {
            $service->handlePaymentFailure($company, $e);
            $this->error($e->getMessage() . ' at ' . $e->getFile() . ':' . $e->getLine());
        }
    }

    private function canRetryPaymentToday(Company $company, CompanyService $service): bool
    {
        return $service->canRetryPayment($company);
    }
}
