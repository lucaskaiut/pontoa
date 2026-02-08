<?php

namespace App\Listeners;

use App\Events\SchedulingPaymentPaid;
use App\Services\SettingService;

class ConfirmScheduling
{
    public function handle(SchedulingPaymentPaid $event): void
    {
        $scheduling = $event->scheduling;

        $autoConfirm = app(SettingService::class)->get('auto_confirm_scheduling_on_paid');

        if ($autoConfirm && $scheduling->status !== 'confirmed') {
            $scheduling->update(['status' => 'confirmed']);
        }
    }
}
