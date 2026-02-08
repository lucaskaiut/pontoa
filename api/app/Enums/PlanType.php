<?php

namespace App\Enums;

enum PlanType: string
{
    case BASIC = 'basic';
    case PRO = 'pro';

    public function label(): string
    {
        return match ($this) {
            self::BASIC => 'Básico',
            self::PRO => 'PRO (com IA)',
        };
    }
}

