<?php

namespace App\Services;

use App\Models\Package;
use App\Models\Service;
use Carbon\Carbon;
use Exception;

final class OrderItemFactory
{
    public function create(string $itemType, int $itemId, int $quantity = 1): array
    {
        $this->validate($itemType, $itemId);

        $item = $this->getItemModel($itemType, $itemId);
        $price = $this->getPrice($itemType, $item);
        $description = $this->getDescription($itemType, $item);

        return [
            'item_type' => $itemType,
            'item_id' => $itemId,
            'description' => $description,
            'quantity' => $quantity,
            'unit_price' => $price,
            'total_price' => $price * $quantity,
        ];
    }

    public function createScheduling(array $schedulingData): array
    {
        throw_if(
            !isset($schedulingData['service_id']) || !isset($schedulingData['user_id']) || !isset($schedulingData['date']),
            new Exception('Dados do agendamento incompletos. Necessário: service_id, user_id, date', 422)
        );

        $service = Service::find($schedulingData['service_id']);
        throw_if(!$service, new Exception("Serviço não encontrado: #{$schedulingData['service_id']}", 404));

        $date = Carbon::parse($schedulingData['date']);
        $serviceName = $service->name;
        $formattedDate = $date->format('d/m/Y H:i');
        $description = "{$serviceName} - {$formattedDate}";

        $metadata = [
            'service_id' => (int) $schedulingData['service_id'],
            'user_id' => (int) $schedulingData['user_id'],
            'date' => $date->format('Y-m-d H:i:s'),
        ];

        if (isset($schedulingData['customer'])) {
            $metadata['customer'] = [
                'name' => $schedulingData['customer']['name'] ?? null,
                'email' => $schedulingData['customer']['email'] ?? null,
                'phone' => $schedulingData['customer']['phone'] ?? null,
            ];
        }

        if (isset($schedulingData['package'])) {
            $metadata['package'] = $schedulingData['package'];
        }

        $price = (float) $service->price;

        return [
            'item_type' => 'scheduling',
            'item_id' => $schedulingData['service_id'],
            'description' => $description,
            'quantity' => 1,
            'unit_price' => $price,
            'total_price' => $price,
            'metadata' => $metadata,
        ];
    }

    public function validate(string $itemType, int $itemId): bool
    {
        $item = $this->getItemModel($itemType, $itemId);

        throw_if(! $item, new Exception("Item não encontrado: {$itemType} #{$itemId}", 404));

        return true;
    }

    public function getPrice(string $itemType, $item): float
    {
        return match ($itemType) {
            'package' => $this->getPackagePrice($item),
            'service' => (float) $item->price,
            default => throw new Exception("Tipo de item não suportado: {$itemType}", 422),
        };
    }

    public function getDescription(string $itemType, $item): string
    {
        return match ($itemType) {
            'package' => $item->name,
            'service' => $item->name,
            default => throw new Exception("Tipo de item não suportado: {$itemType}", 422),
        };
    }

    private function getItemModel(string $itemType, int $itemId)
    {
        return match ($itemType) {
            'package' => Package::find($itemId),
            'service' => Service::find($itemId),
            default => null,
        };
    }

    private function getPackagePrice($package): float
    {
        if (!empty($package->price)) {
            return (float) $package->price;
        }

        return 0;
    }
}
