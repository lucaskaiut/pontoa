<?php

namespace App\Services\ConversationState;

use App\Models\ConversationContext;

interface ConversationStateHandler
{
    public function handle(ConversationContext $context, string $message): void;
}

