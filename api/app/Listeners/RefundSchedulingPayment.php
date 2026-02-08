<?php

namespace App\Listeners;

use App\Events\SchedulingCancelled;
use App\Services\Payments\PaymentService;
use App\Services\SettingService;
use Illuminate\Support\Facades\Log;

class RefundSchedulingPayment
{
    public function handle(SchedulingCancelled $event): void
    {
        $scheduling = $event->scheduling;

        if (!$scheduling->payment_reference || !$scheduling->payment_method) {
            return;
        }

        if (!app(SettingService::class)->get('scheduling_require_checkout')) {
            return;
        }

        try {
            $paymentService = new PaymentService();
            $paymentService->refund($scheduling->payment_reference, $scheduling->payment_method);
        } catch (\Exception $e) {
            Log::error('Erro ao estornar pagamento após cancelamento do agendamento', [
                'scheduling_id' => $scheduling->id,
                'payment_reference' => $scheduling->payment_reference,
                'payment_method' => $scheduling->payment_method,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
