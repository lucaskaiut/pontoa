<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;
use Exception;

final class SchedulingCartValidator
{
    public function validateNoConflicts(Order $cart, array $schedulingData): bool
    {
        $newDate = Carbon::parse($schedulingData['date']);
        $newUserId = (int) $schedulingData['user_id'];

        $conflictingItems = $cart->items()
            ->where('item_type', 'scheduling')
            ->get()
            ->filter(function (OrderItem $item) use ($newDate, $newUserId) {
                $itemData = $item->getSchedulingData();
                
                if (!$itemData) {
                    return false;
                }

                $itemDate = Carbon::parse($itemData['date']);
                $itemUserId = (int) $itemData['user_id'];

                return $itemDate->equalTo($newDate) && $itemUserId === $newUserId;
            });

        throw_if(
            $conflictingItems->isNotEmpty(),
            new Exception('Já existe um agendamento no mesmo horário para este profissional no carrinho', 422)
        );

        return true;
    }

    public function validateNoDuplicate(Order $cart, array $schedulingData): bool
    {
        $newServiceId = (int) $schedulingData['service_id'];
        $newUserId = (int) $schedulingData['user_id'];
        $newDate = Carbon::parse($schedulingData['date']);

        $duplicateItems = $cart->items()
            ->where('item_type', 'scheduling')
            ->get()
            ->filter(function (OrderItem $item) use ($newServiceId, $newUserId, $newDate) {
                $itemData = $item->getSchedulingData();
                
                if (!$itemData) {
                    return false;
                }

                $itemServiceId = (int) $itemData['service_id'];
                $itemUserId = (int) $itemData['user_id'];
                $itemDate = Carbon::parse($itemData['date']);

                return $itemServiceId === $newServiceId 
                    && $itemUserId === $newUserId 
                    && $itemDate->equalTo($newDate);
            });

        throw_if(
            $duplicateItems->isNotEmpty(),
            new Exception('Este agendamento já foi adicionado ao carrinho', 422)
        );

        return true;
    }
}

