<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Collection;

final class ReportService
{
    public function generate(string $type, array $filters): Collection|array
    {
        $serviceClass = $this->getServiceClass($type);

        if (!class_exists($serviceClass)) {
            throw new \InvalidArgumentException("Tipo de relatório '{$type}' não encontrado");
        }

        $service = new $serviceClass();

        return $service->generate($filters);
    }

    private function getServiceClass(string $type): string
    {
        $typeName = str_replace('-', '', ucwords(strtolower($type), '-'));
        $typeName = ucfirst($typeName);
        
        return "App\\Services\\{$typeName}ReportService";
    }
}

