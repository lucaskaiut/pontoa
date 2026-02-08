<?php

namespace App\Http\Controllers;

use App\Services\WhatsAppWebhookService;
use Illuminate\Http\Request;

class WhatsAppWebhookController extends Controller
{
    private WhatsAppWebhookService $whatsAppWebhookService;

    public function __construct(WhatsAppWebhookService $whatsAppWebhookService)
    {
        $this->whatsAppWebhookService = $whatsAppWebhookService;
    }

    public function handle(Request $request)
    {
        $this->whatsAppWebhookService->processWebhook($request->all());

        return response()->noContent();
    }
}
