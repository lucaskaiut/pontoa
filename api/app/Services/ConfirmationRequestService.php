<?php

namespace App\Services;

use App\Models\ConfirmationRequest;
use App\Models\Notification;
use App\Models\Scheduling;
use App\Utilities\PhoneNormalizer;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

final class ConfirmationRequestService
{
    private ConversationContextService $conversationContextService;

    public function __construct(ConversationContextService $conversationContextService)
    {
        $this->conversationContextService = $conversationContextService;
    }

    public function create(Scheduling $scheduling, Notification $notification, int $expirationHours = 24): ConfirmationRequest
    {
        return DB::transaction(function () use ($scheduling, $notification, $expirationHours) {
            $this->invalidatePendingRequests($scheduling);

            $confirmationRequest = ConfirmationRequest::create([
                'scheduling_id' => $scheduling->id,
                'notification_id' => $notification->id,
                'status' => 'pending',
                'expires_at' => Carbon::now()->addHours($expirationHours),
            ]);

            if ($scheduling->customer && $scheduling->customer->phone) {
                $this->conversationContextService->createContext(
                    $scheduling->company_id,
                    $scheduling->customer->phone,
                    'awaiting_confirmation',
                    [
                        'confirmation_request_id' => $confirmationRequest->id,
                        'scheduling_id' => $scheduling->id,
                    ],
                    Carbon::now()->addHours($expirationHours)
                );
            }

            return $confirmationRequest;
        });
    }

    public function findActiveByPhone(string $phone, int $companyId): ?ConfirmationRequest
    {
        $normalizedPhone = $this->normalizePhone($phone);

        logger()->info('Normalized Phone: '.$normalizedPhone);

        return ConfirmationRequest::whereHas('scheduling', function ($query) use ($normalizedPhone, $companyId) {
            $query->where('company_id', $companyId)
                ->whereHas('customer', function ($q) use ($normalizedPhone) {
                    $q->where('phone', 'like', '%'.$normalizedPhone.'%');
                });
        })
            ->where('status', 'pending')
            ->where('expires_at', '>', Carbon::now())
            ->orderBy('created_at', 'desc')
            ->first();
    }

    private function normalizePhone(string $phone): string
    {
        return PhoneNormalizer::normalizeToString($phone);
    }

    public function confirm(ConfirmationRequest $confirmationRequest): void
    {
        DB::transaction(function () use ($confirmationRequest) {
            $confirmationRequest->update([
                'status' => 'confirmed',
                'confirmed_at' => Carbon::now(),
            ]);

            $confirmationRequest->scheduling->update([
                'status' => 'confirmed',
            ]);
        });
    }

    public function cancel(ConfirmationRequest $confirmationRequest): void
    {
        DB::transaction(function () use ($confirmationRequest) {
            $confirmationRequest->scheduling->update([
                'status' => 'cancelled',
            ]);
        });
    }

    public function expire(ConfirmationRequest $confirmationRequest): void
    {
        DB::transaction(function () use ($confirmationRequest) {
            $confirmationRequest->update([
                'status' => 'expired',
            ]);

            if ($confirmationRequest->scheduling->status === 'pending') {
                $confirmationRequest->scheduling->update([
                    'status' => 'cancelled',
                ]);
            }
        });
    }

    public function invalidatePendingRequests(Scheduling $scheduling): void
    {
        ConfirmationRequest::where('scheduling_id', $scheduling->id)
            ->where('status', 'pending')
            ->update(['status' => 'expired']);
    }

    public function interpretMessage(string $message): ?string
    {
        $normalized = mb_strtolower(trim($message));

        $confirmPatterns = ['sim', 'confirmo', 'ok', 'confirmar', 'confirmado'];
        $cancelPatterns = ['não', 'nao', 'cancelar', 'cancelado'];

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
