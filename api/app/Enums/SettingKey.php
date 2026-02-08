<?php

namespace App\Enums;

enum SettingKey: string
{
    case SCHEDULE_INTERVAL = 'schedule_interval';
    case SCHEDULING_REQUIRE_CHECKOUT = 'scheduling_require_checkout';
    case AUTO_CONFIRM_SCHEDULING_ON_PAID = 'auto_confirm_scheduling_on_paid';
    case PAGARME_SECRET_KEY = 'pagarme_secret_key';
    case PAGARME_PUBLIC_KEY = 'pagarme_public_key';
    case PAGARME_APP_ID = 'pagarme_app_id';
    case ACTIVE_PAYMENT_METHODS = 'active_payment_methods';
    case GOOGLE_REVIEW_LINK = 'google_review_link';
    case MIN_SCORE_TO_REDIRECT = 'min_score_to_redirect';
    case NPS_ENABLED = 'nps_enabled';
    case WHATSAPP_INSTANCE_NAME = 'whatsapp_instance_name';

    public function type(): string
    {
        return match ($this) {
            self::SCHEDULE_INTERVAL => 'int',
            self::SCHEDULING_REQUIRE_CHECKOUT => 'bool',
            self::AUTO_CONFIRM_SCHEDULING_ON_PAID => 'bool',
            self::PAGARME_SECRET_KEY => 'string',
            self::PAGARME_PUBLIC_KEY => 'string',
            self::PAGARME_APP_ID => 'string',
            self::ACTIVE_PAYMENT_METHODS => 'multiselect',
            self::GOOGLE_REVIEW_LINK => 'string',
            self::MIN_SCORE_TO_REDIRECT => 'int',
            self::NPS_ENABLED => 'bool',
            self::WHATSAPP_INSTANCE_NAME => 'string',
        };
    }

    public function options(): ?array
    {
        return match ($this) {
            self::ACTIVE_PAYMENT_METHODS => [
                [
                    'value' => 'pagarmeCreditCard',
                    'label' => 'Pagarme - Cartão de Crédito',
                ],
                [
                    'value' => 'pagarmePix',
                    'label' => 'Pagarme - Pix',
                ]
            ],
            default => null,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::SCHEDULE_INTERVAL => 'Intervalo de Agendamento (minutos)',
            self::SCHEDULING_REQUIRE_CHECKOUT => 'Exigir Checkout de Pagamento',
            self::AUTO_CONFIRM_SCHEDULING_ON_PAID => 'Confirmar Agendamento Automaticamente ao Pagar',
            self::PAGARME_SECRET_KEY => 'Chave Secreta Pagarme',
            self::PAGARME_PUBLIC_KEY => 'Chave Pública Pagarme',
            self::PAGARME_APP_ID => 'App ID Pagarme',
            self::ACTIVE_PAYMENT_METHODS => 'Métodos de Pagamento Ativos',
            self::GOOGLE_REVIEW_LINK => 'Link do Google Meu Negócio',
            self::MIN_SCORE_TO_REDIRECT => 'Nota Mínima para Redirecionamento',
            self::NPS_ENABLED => 'Ativar Pesquisa de Satisfação (NPS)',
            self::WHATSAPP_INSTANCE_NAME => 'Nome da instância na Evolution',
        };
    }

    public function defaultValue(): mixed
    {
        return match ($this) {
            self::SCHEDULE_INTERVAL => 15,
            self::SCHEDULING_REQUIRE_CHECKOUT => false,
            self::AUTO_CONFIRM_SCHEDULING_ON_PAID => false,
            self::PAGARME_SECRET_KEY => null,
            self::PAGARME_PUBLIC_KEY => null,
            self::PAGARME_APP_ID => null,
            self::ACTIVE_PAYMENT_METHODS => [],
            self::GOOGLE_REVIEW_LINK => null,
            self::MIN_SCORE_TO_REDIRECT => 9,
            self::NPS_ENABLED => false,
            self::WHATSAPP_INSTANCE_NAME => null,
            default => null,
        };
    }

    public function isPublic(): bool
    {
        return match ($this) {
            self::SCHEDULE_INTERVAL => false,
            self::SCHEDULING_REQUIRE_CHECKOUT => true,
            self::AUTO_CONFIRM_SCHEDULING_ON_PAID => false,
            self::PAGARME_SECRET_KEY => false,
            self::PAGARME_PUBLIC_KEY => true,
            self::PAGARME_APP_ID => false,
            self::ACTIVE_PAYMENT_METHODS => true,
            self::GOOGLE_REVIEW_LINK => false,
            self::MIN_SCORE_TO_REDIRECT => false,
            self::NPS_ENABLED => false,
            self::WHATSAPP_INSTANCE_NAME => false,
        };
    }

    public static function all(): array
    {
        return array_map(fn($case) => $case->value, self::cases());
    }

    public static function fromValue(string $value): ?self
    {
        return self::tryFrom($value);
    }
}

