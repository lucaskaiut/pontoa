<?php

namespace App\Listeners;

use App\Events\SchedulingCancelled;
use App\Services\CustomerPackageService;
use Illuminate\Support\Facades\Log;

class RevertPackageSession
{
    public function handle(SchedulingCancelled $event): void
    {
        $scheduling = $event->scheduling;

        if (! $scheduling->used_package_session || ! $scheduling->customer_package_id) {
            return;
        }

        try {
            $packageUsage = $scheduling->packageUsage;

            if (! $packageUsage) {
                return;
            }

            $customerPackageService = new CustomerPackageService;
            $customerPackageService->revertSession($packageUsage);
        } catch (\Exception $e) {
            Log::error('Erro ao reverter sessão do pacote após cancelamento do agendamento', [
                'scheduling_id' => $scheduling->id,
                'customer_package_id' => $scheduling->customer_package_id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
