<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use Exception;

final class PostPaymentHandler
{
    private CustomerPackageService $customerPackageService;

    public function __construct()
    {
        $this->customerPackageService = new CustomerPackageService;
    }

    public function handle(Order $order): void
    {
        foreach ($order->items as $item) {
            $this->handleItem($item);
        }
    }

    public function handleItem(OrderItem $item): void
    {
        match ($item->item_type) {
            'package' => $this->handlePackage($item),
            'scheduling' => $this->handleScheduling($item),
            'service' => null,
            default => throw new Exception("Tipo de item não suportado: {$item->item_type}", 422),
        };
    }

    private function handlePackage(OrderItem $item): void
    {
        $order = $item->order;

        $this->customerPackageService->activateFromOrder(
            $item->item_id,
            $order->customer_id,
            $order->id
        );
    }

    private function handleScheduling(OrderItem $item): void
    {
        $schedulingService = new SchedulingService;
        $schedulingService->createFromOrderItem($item);
    }
}
