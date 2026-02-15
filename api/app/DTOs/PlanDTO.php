<?php

namespace App\DTOs;

use App\Enums\PlanType;
use App\Enums\RecurrenceType;

class PlanDTO
{
    public function __construct(
        public readonly PlanType $type,
        public readonly RecurrenceType $recurrence,
        public readonly float $price,
        public readonly int $trialDays,
        public readonly array $modules = []
    ) {
    }

    public function toArray(): array
    {
        return [
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'recurrence' => $this->recurrence->value,
            'recurrence_label' => $this->recurrence->label(),
            'price' => $this->price,
            'trial_days' => $this->trialDays,
            'modules' => array_map(fn($module) => $module->toArray(), $this->modules),
        ];
    }
}

