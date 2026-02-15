<?php

namespace App\DTOs;

class ModuleDTO
{
    public function __construct(
        public readonly string $id,
        public readonly string $name,
        public readonly string $description,
        public readonly bool $enabledByDefault = false
    ) {
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'enabled_by_default' => $this->enabledByDefault,
        ];
    }
}

