<?php

namespace App\Enums;

enum SubscriptionStatus: string
{
    case ACTIVE = 'ACTIVE';
    case CANCELED = 'CANCELED';
    case EXPIRED = 'EXPIRED';
    case SUSPENDED = 'SUSPENDED';

    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => 'Ativa',
            self::CANCELED => 'Cancelada',
            self::EXPIRED => 'Expirada',
            self::SUSPENDED => 'Suspensa',
        };
    }
}

