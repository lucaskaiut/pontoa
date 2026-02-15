<?php

namespace App\Services\ConversationState;

use App\Models\ConversationContext;
use App\Services\ConversationContextService;
use Illuminate\Support\Facades\Log;

final class AwaitingPaymentHandler implements ConversationStateHandler
{
    private ConversationContextService $conversationContextService;

    public function __construct(ConversationContextService $conversationContextService)
    {
        $this->conversationContextService = $conversationContextService;
    }

    public function handle(ConversationContext $context, string $message): void
    {
        $payload = $context->state_payload ?? [];
        $schedulingId = $payload['scheduling_id'] ?? null;

        if (!$schedulingId) {
            $this->conversationContextService->closeContext(
                $context->company_id,
                $context->customer_phone
            );
            return;
        }

        $action = $this->extractPaymentAction($message);

        if ($action === null) {
            Log::info('Mensagem não reconhecida no contexto de pagamento', [
                'phone' => $context->customer_phone,
                'message' => $message,
                'company_id' => $context->company_id,
            ]);
            return;
        }

        Log::info('Ação de pagamento recebida', [
            'phone' => $context->customer_phone,
            'action' => $action,
            'scheduling_id' => $schedulingId,
            'company_id' => $context->company_id,
        ]);

        $this->conversationContextService->closeContext(
            $context->company_id,
            $context->customer_phone
        );
    }

    private function extractPaymentAction(string $message): ?string
    {
        $normalized = mb_strtolower(trim($message));

        $confirmPatterns = ['pago', 'pagamento realizado', 'confirmado', 'ok'];
        $cancelPatterns = ['cancelar', 'cancelado', 'não', 'nao'];

        foreach ($confirmPatterns as $pattern) {
            if (str_contains($normalized, $pattern)) {
                return 'confirm';
            }
        }

        foreach ($cancelPatterns as $pattern) {
            if (str_contains($normalized, $pattern)) {
                return 'cancel';
            }
        }

        return null;
    }
}

