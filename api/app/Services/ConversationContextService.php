<?php

namespace App\Services;

use App\Models\ConversationContext;
use App\Models\Customer;
use App\Utilities\PhoneNormalizer;
use Carbon\Carbon;

final class ConversationContextService
{
    public function getActiveContext(int $companyId, string $phone): ConversationContext
    {
        $normalizedPhone = $this->normalizePhone($phone);

        $context = ConversationContext::where('company_id', $companyId)
            ->where('customer_phone', $normalizedPhone)
            ->first();

        if (!$context) {
            return $this->createIdleContext($companyId, $normalizedPhone);
        }

        if ($context->isExpired()) {
            $context->close();
        }

        $this->syncCustomerId($context, $companyId, $normalizedPhone);

        return $context;
    }

    public function createContext(
        int $companyId,
        string $phone,
        string $state,
        ?array $payload = null,
        ?Carbon $lockedUntil = null
    ): ConversationContext {
        $normalizedPhone = $this->normalizePhone($phone);

        $customer = $this->findCustomerByPhone($companyId, $normalizedPhone);

        $context = ConversationContext::updateOrCreate(
            [
                'company_id' => $companyId,
                'customer_phone' => $normalizedPhone,
            ],
            [
                'customer_id' => $customer?->id,
                'channel' => 'whatsapp',
                'current_state' => $state,
                'state_payload' => $payload,
                'locked_until' => $lockedUntil,
            ]
        );

        return $context;
    }

    public function closeContext(int $companyId, string $phone): void
    {
        $normalizedPhone = $this->normalizePhone($phone);

        ConversationContext::where('company_id', $companyId)
            ->where('customer_phone', $normalizedPhone)
            ->update([
                'current_state' => 'idle',
                'state_payload' => null,
                'locked_until' => null,
            ]);
    }

    private function createIdleContext(int $companyId, string $normalizedPhone): ConversationContext
    {
        $customer = $this->findCustomerByPhone($companyId, $normalizedPhone);

        return ConversationContext::create([
            'company_id' => $companyId,
            'customer_id' => $customer?->id,
            'customer_phone' => $normalizedPhone,
            'channel' => 'whatsapp',
            'current_state' => 'idle',
            'state_payload' => null,
            'locked_until' => null,
        ]);
    }

    private function syncCustomerId(ConversationContext $context, int $companyId, string $normalizedPhone): void
    {
        if ($context->customer_id !== null) {
            return;
        }

        $customer = $this->findCustomerByPhone($companyId, $normalizedPhone);

        if ($customer) {
            $context->update(['customer_id' => $customer->id]);
        }
    }

    private function findCustomerByPhone(int $companyId, string $normalizedPhone): ?Customer
    {
        return Customer::where('company_id', $companyId)
            ->where('phone', $normalizedPhone)
            ->first();
    }

    private function normalizePhone(string $phone): string
    {
        return PhoneNormalizer::normalizeToString($phone);
    }
}

