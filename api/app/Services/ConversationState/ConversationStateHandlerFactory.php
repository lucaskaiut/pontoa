<?php

namespace App\Services\ConversationState;

use Illuminate\Contracts\Container\Container;

final class ConversationStateHandlerFactory
{
    private Container $container;

    public function __construct(Container $container)
    {
        $this->container = $container;
    }

    public function resolve(string $state): ConversationStateHandler
    {
        return match ($state) {
            'awaiting_confirmation' => $this->container->make(AwaitingConfirmationHandler::class),
            'awaiting_nps' => $this->container->make(AwaitingNpsHandler::class),
            'awaiting_nps_comment' => $this->container->make(AwaitingNpsCommentHandler::class),
            'awaiting_payment' => $this->container->make(AwaitingPaymentHandler::class),
            'cancel_awaiting_email' => $this->container->make(CancelAwaitingEmailHandler::class),
            'cancel_listing_schedulings' => $this->container->make(CancelListingSchedulingsHandler::class),
            'cancel_awaiting_confirmation' => $this->container->make(CancelAwaitingConfirmationHandler::class),
            'handoff' => $this->container->make(HandoffHandler::class),
            default => throw new \InvalidArgumentException("Handler não encontrado para o estado: {$state}"),
        };
    }
}

