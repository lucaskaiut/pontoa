<?php

namespace App\Console\Commands;

use App\Models\ConfirmationRequest;
use App\Services\ConfirmationRequestService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ExpireConfirmationRequests extends Command
{
    protected $signature = 'confirmations:expire';

    protected $description = 'Expira solicitações de confirmação pendentes que passaram do prazo';

    public function handle(ConfirmationRequestService $confirmationRequestService)
    {
        $expiredRequests = ConfirmationRequest::where('status', 'pending')
            ->where('expires_at', '<=', Carbon::now())
            ->get();

        $count = 0;

        foreach ($expiredRequests as $request) {
            $confirmationRequestService->expire($request);
            $count++;
        }

        if ($count > 0) {
            $this->info("{$count} solicitação(ões) de confirmação expirada(s).");
        } else {
            $this->info('Nenhuma solicitação de confirmação expirada.');
        }
    }
}
