<?php

namespace App\Constants;

class Modules
{
    public const AI_ATTENDANCE = 'ai_attendance';

    public static function all(): array
    {
        return [
            self::AI_ATTENDANCE,
        ];
    }

    public static function definitions(): array
    {
        return [
            self::AI_ATTENDANCE => [
                'id' => self::AI_ATTENDANCE,
                'name' => 'Atendimento com IA',
                'description' => 'Permite o uso de inteligência artificial para atendimento automatizado via WhatsApp, melhorando a experiência do cliente e reduzindo o tempo de resposta.',
                'enabled_by_default' => false,
            ],
        ];
    }

    public static function getDefinition(string $moduleId): ?array
    {
        return self::definitions()[$moduleId] ?? null;
    }
}

