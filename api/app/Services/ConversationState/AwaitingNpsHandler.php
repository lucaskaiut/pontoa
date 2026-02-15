<?php

namespace App\Services\ConversationState;

use App\Models\ConversationContext;
use App\Models\Review;
use App\Models\Scheduling;
use App\Services\ConversationContextService;
use App\Services\ReviewService;
use App\Services\SettingService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

final class AwaitingNpsHandler implements ConversationStateHandler
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
        $appointmentId = $payload['appointment_id'] ?? null;
        $customerId = $payload['customer_id'] ?? null;

        if (!$appointmentId || !$customerId) {
            $this->conversationContextService->closeContext(
                $context->company_id,
                $context->customer_phone
            );
            return;
        }

        $rating = $this->extractRating($message);

        if ($rating === null) {
            Log::info('Mensagem não reconhecida como avaliação NPS', [
                'phone' => $context->customer_phone,
                'message' => $message,
                'company_id' => $context->company_id,
            ]);
            return;
        }

        $scheduling = Scheduling::find($appointmentId);

        if (!$scheduling) {
            $this->conversationContextService->closeContext(
                $context->company_id,
                $context->customer_phone
            );
            return;
        }

        $review = $this->reviewService->create([
            'company_id' => $context->company_id,
            'appointment_id' => $appointmentId,
            'customer_id' => $customerId,
            'score' => $rating,
            'comment' => null,
        ]);

        $classification = $review->classification;

        if ($classification === 'promoter') {
            $this->handlePromoter($review, $context);
            $this->conversationContextService->closeContext(
                $context->company_id,
                $context->customer_phone
            );
        } else {
            $this->requestComment($review, $context);
        }
    }

    private function requestComment(Review $review, ConversationContext $context): void
    {
        $message = 'Gostaríamos de saber mais sobre sua experiência. Pode nos contar o que podemos melhorar?';

        $this->sendWhatsAppMessage($context->customer_phone, $message, $context->company_id);

        $this->conversationContextService->createContext(
            $context->company_id,
            $context->customer_phone,
            'awaiting_nps_comment',
            [
                'review_id' => $review->id,
            ],
            Carbon::now()->addHours(24)
        );
    }

    private function handlePromoter($review, ConversationContext $context): void
    {
        $googleReviewLink = $this->settingService->get('google_review_link');
        $minScoreToRedirect = (int) ($this->settingService->get('min_score_to_redirect') ?? 9);

        $message = 'Ficamos muito felizes com sua avaliação! 💙';

        if ($review->score >= $minScoreToRedirect && $googleReviewLink) {
            $message .= "\n\nSe puder, deixe esse feedback no Google:\n{$googleReviewLink}";
            $review->update(['sent_to_google' => true]);
        }

        $this->sendWhatsAppMessage($context->customer_phone, $message, $context->company_id);
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

    private function extractRating(string $message): ?int
    {
        $normalized = mb_strtolower(trim($message));
        $normalized = preg_replace('/[^0-9]/', '', $normalized);

        if (empty($normalized)) {
            return null;
        }

        $rating = (int) $normalized;

        if ($rating >= 0 && $rating <= 10) {
            return $rating;
        }

        return null;
    }
}

