<?php

namespace App\Listeners;

use App\Events\OrderPaid;
use App\Services\PostPaymentHandler;

class ProcessOrderItems
{
    public function handle(OrderPaid $event): void
    {
        $handler = new PostPaymentHandler;
        $handler->handle($event->order);
    }
}
