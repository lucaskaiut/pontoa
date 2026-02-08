<?php

namespace App\Enums;

enum RecurrenceType: string
{
    case MONTHLY = 'monthly';
    case YEARLY = 'yearly';

    public function label(): string
    {
        return match ($this) {
            self::MONTHLY => 'Mensal',
            self::YEARLY => 'Anual',
        };
    }
}

