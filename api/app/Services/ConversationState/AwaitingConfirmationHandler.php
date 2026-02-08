<?php

namespace App\Services\ConversationState;

use App\Models\ConfirmationRequest;
use App\Models\ConversationContext;
use App\Services\ConfirmationRequestService;
use App\Services\ConversationContextService;
use Illuminate\Support\Facades\Log;

final class AwaitingConfirmationHandler implements ConversationStateHandler
{
    private ConfirmationRequestService $confirmationRequestService;
    private ConversationContextService $conversationContextService;

    public function __construct(
        ConfirmationRequestService $confirmationRequestService,
        ConversationContextService $conversationContextService
    ) {
        $this->confirmationRequestService = $confirmationRequestService;
        $this->conversationContextService = $conversationContextService;
    }

    public function handle(ConversationContext $context, string $message): void
    {
        $payload = $context->state_payload ?? [];
        $confirmationRequestId = $payload['confirmation_request_id'] ?? null;

        if (!$confirmationRequestId) {
            $this->conversationContextService->closeContext(
                $context->company_id,
                $context->customer_phone
            );
            return;
        }

        $confirmationRequest = ConfirmationRequest::find($confirmationRequestId);

        if (!$confirmationRequest || $confirmationRequest->status !== 'pending') {
            $this->conversationContextService->closeContext(
                $context->company_id,
                $context->customer_phone
            );
            return;
        }

        $action = $this->confirmationRequestService->interpretMessage($message);

        if ($action === 'confirm') {
            $this->confirmationRequestService->confirm($confirmationRequest);
            $this->conversationContextService->closeContext(
                $context->company_id,
                $context->customer_phone
            );
            return;
        }

        if ($action === 'cancel') {
            $this->confirmationRequestService->cancel($confirmationRequest);
            $this->conversationContextService->closeContext(
                $context->company_id,
                $context->customer_phone
            );
            return;
        }

        Log::info('Mensagem não reconhecida no contexto de confirmação', [
            'phone' => $context->customer_phone,
            'message' => $message,
            'company_id' => $context->company_id,
        ]);
    }
}

