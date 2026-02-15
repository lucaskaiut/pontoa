<?php

namespace App\Services;

use App\Constants\Modules;
use App\Models\Company;
use App\DTOs\ModuleDTO;

final class ModuleService
{
    /**
     * Get all available modules
     *
     * @return ModuleDTO[]
     */
    public function getAllModules(): array
    {
        $definitions = Modules::definitions();
        $modules = [];

        foreach ($definitions as $definition) {
            $modules[] = new ModuleDTO(
                id: $definition['id'],
                name: $definition['name'],
                description: $definition['description'],
                enabledByDefault: $definition['enabled_by_default'] ?? false
            );
        }

        return $modules;
    }

    /**
     * Get module by ID
     *
     * @param string $moduleId
     * @return ModuleDTO|null
     */
    public function getModule(string $moduleId): ?ModuleDTO
    {
        $definition = Modules::getDefinition($moduleId);

        if (!$definition) {
            return null;
        }

        return new ModuleDTO(
            id: $definition['id'],
            name: $definition['name'],
            description: $definition['description'],
            enabledByDefault: $definition['enabled_by_default'] ?? false
        );
    }

    /**
     * Check if company has a specific module enabled
     *
     * @param Company $company
     * @param string $moduleId
     * @return bool
     */
    public function hasModule(Company $company, string $moduleId): bool
    {
        $planService = app(PlanService::class);
        $plan = $planService->getPlanByTypeAndRecurrence(
            $company->plan_name ?? null,
            $company->plan_recurrence ?? null
        );

        if (!$plan) {
            return false;
        }

        $modules = $plan->modules;
        $moduleIds = array_column($modules, 'id');

        return in_array($moduleId, $moduleIds, true);
    }

    /**
     * Get enabled modules for a company
     *
     * @param Company $company
     * @return ModuleDTO[]
     */
    public function getEnabledModules(Company $company): array
    {
        $planService = app(PlanService::class);
        $plan = $planService->getPlanByTypeAndRecurrence(
            $company->plan_name ?? null,
            $company->plan_recurrence ?? null
        );

        if (!$plan) {
            return [];
        }

        return $plan->modules;
    }
}

