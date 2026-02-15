<?php

namespace App\Console\Commands;

use App\Services\Payments\PaymentService;
use Illuminate\Console\Command;

class UpdatePaymentStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:update-status';

    protected $description = 'Atualiza o status de pagamento dos agendamentos';

    public function handle(PaymentService $paymentService)
    {
        $paymentService->updatePaymentStatus();
    }
}
