<?php

namespace App\Services\ConversationState;

use App\Events\ReviewNegativeReceived;
use App\Models\ConversationContext;
use App\Models\Review;
use App\Services\ConversationContextService;
use App\Services\ReviewService;
use App\Services\SettingService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

final class AwaitingNpsCommentHandler implements ConversationStateHandler
{
    private ConversationContextService $conversationContextService;
    private ReviewService $reviewService;
    private SettingService $settingService;

    public function __construct(
        ConversationContextService $conversationContextService,
        ReviewService $reviewService,
        SettingService $settingService
    ) {
        $this->conversationContextService = $conversationContextService;
        $this->reviewService = $reviewService;
        $this->settingService = $settingService;
    }

    public function handle(ConversationContext $context, string $message): void
    {
        $payload = $context->state_payload ?? [];
        $reviewId = $payload['review_id'] ?? null;

        if (!$reviewId) {
            $this->conversationContextService->closeContext(
                $context->company_id,
                $context->customer_phone
            );
            return;
        }

        $review = Review::find($reviewId);

        if (!$review) {
            $this->conversationContextService->closeContext(
                $context->company_id,
                $context->customer_phone
            );
            return;
        }

        $comment = trim($message);

        if (empty($comment)) {
            Log::info('Comentário vazio recebido no contexto NPS', [
                'phone' => $context->customer_phone,
                'review_id' => $reviewId,
                'company_id' => $context->company_id,
            ]);
            return;
        }

        $this->reviewService->update($review, [
            'comment' => $comment,
        ]);

        $review->refresh();

        if ($review->classification === 'detractor') {
            event(new ReviewNegativeReceived($review));
        }

        $this->handleReviewResponse($review, $context);

        $this->conversationContextService->closeContext(
            $context->company_id,
            $context->customer_phone
        );
    }

    private function handleReviewResponse($review, ConversationContext $context): void
    {
        $classification = $review->classification;

        if ($classification === 'detractor') {
            $this->handleDetractor($review, $context);
        } else {
            $this->handleNeutral($review, $context);
        }
    }

    private function handleDetractor($review, ConversationContext $context): void
    {
        $this->sendWhatsAppMessage(
            $context->customer_phone,
            'Obrigado pelo seu feedback. Vamos trabalhar para melhorar! 🙏',
            $context->company_id
        );
    }

    private function handleNeutral($review, ConversationContext $context): void
    {
        $this->sendWhatsAppMessage(
            $context->customer_phone,
            'Obrigado pela sua avaliação! 😊',
            $context->company_id
        );
    }

    private function sendWhatsAppMessage(string $phone, string $message, int $companyId): void
    {
        try {
            $instanceName = $this->settingService->get('whatsapp_instance_name');

            if (!$instanceName) {
                Log::warning('WhatsApp instance não configurada, não é possível enviar mensagem NPS');
                return;
            }

            $payload = [
                'number' => '55' . $phone,
                'text' => $message,
            ];

            $url = config('app.evolution_api_url') . '/message/sendText/' . $instanceName;

            $response = Http::withHeaders(['apikey' => config('app.evolution_api_key')])
                ->post($url, $payload);

            if (!$response->successful()) {
                Log::error('Erro ao enviar mensagem NPS por WhatsApp', [
                    'phone' => $phone,
                    'company_id' => $companyId,
                    'response' => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exceção ao enviar mensagem NPS por WhatsApp', [
                'phone' => $phone,
                'company_id' => $companyId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}

