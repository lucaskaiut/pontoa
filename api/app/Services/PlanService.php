<?php

namespace App\Services;

use App\Constants\Modules;
use App\DTOs\ModuleDTO;
use App\DTOs\PlanDTO;
use App\Enums\PlanType;
use App\Enums\RecurrenceType;
use App\Models\Company;
use Carbon\Carbon;

final class PlanService
{
    /**
     * Get all available plans
     *
     * @return PlanDTO[]
     */
    public function getAllPlans(): array
    {
        $plans = [];

        foreach (PlanType::cases() as $planType) {
            foreach (RecurrenceType::cases() as $recurrenceType) {
                $plans[] = $this->createPlan($planType, $recurrenceType);
            }
        }

        return $plans;
    }

    /**
     * Get plan by type and recurrence
     */
    public function getPlanByTypeAndRecurrence(?string $planType, ?string $recurrenceType): ?PlanDTO
    {
        if (! $planType || ! $recurrenceType) {
            return null;
        }

        try {
            $planTypeEnum = PlanType::from($planType);
            $recurrenceTypeEnum = RecurrenceType::from($recurrenceType);
        } catch (\ValueError $e) {
            return null;
        }

        return $this->createPlan($planTypeEnum, $recurrenceTypeEnum);
    }

    /**
     * Get price for a plan
     */
    public function getPrice(PlanType $planType, RecurrenceType $recurrenceType): float
    {
        return match ([$planType, $recurrenceType]) {
            [PlanType::BASIC, RecurrenceType::MONTHLY] => 49.90,
            [PlanType::BASIC, RecurrenceType::YEARLY] => 499.00,
            [PlanType::PRO, RecurrenceType::MONTHLY] => 149.90,
            [PlanType::PRO, RecurrenceType::YEARLY] => 999.00,
        };
    }

    /**
     * Get trial days for a plan
     */
    public function getTrialDays(RecurrenceType $recurrenceType): int
    {
        return match ($recurrenceType) {
            RecurrenceType::MONTHLY => 7,
            RecurrenceType::YEARLY => 30,
        };
    }

    /**
     * Get modules included in a plan
     *
     * @return ModuleDTO[]
     */
    public function getPlanModules(PlanType $planType): array
    {
        $modules = [];

        if ($planType === PlanType::PRO) {
            $aiAttendanceDefinition = Modules::getDefinition(Modules::AI_ATTENDANCE);
            if ($aiAttendanceDefinition) {
                $modules[] = new ModuleDTO(
                    id: $aiAttendanceDefinition['id'],
                    name: $aiAttendanceDefinition['name'],
                    description: $aiAttendanceDefinition['description'],
                    enabledByDefault: $aiAttendanceDefinition['enabled_by_default'] ?? false
                );
            }
        }

        return $modules;
    }

    /**
     * Calculate trial end date
     */
    public function calculateTrialEndDate(Carbon $startDate, RecurrenceType $recurrenceType): Carbon
    {
        $trialDays = $this->getTrialDays($recurrenceType);

        return $startDate->copy()->addDays($trialDays);
    }

    /**
     * Check if company is in trial period
     */
    public function isInTrialPeriod(\App\Models\Company $company): bool
    {
        if ($company->last_billed_at) {
            return false;
        }

        if ($company->plan_trial_ends_at) {
            $trialEndDate = Carbon::parse($company->plan_trial_ends_at);

            return Carbon::now()->isBefore($trialEndDate);
        }

        if ($company->current_period_end) {
            $periodEndDate = Carbon::parse($company->current_period_end);

            return Carbon::now()->isBefore($periodEndDate);
        }

        return false;
    }

    /**
     * Get billing days for a recurrence type
     */
    public function getBillingDays(RecurrenceType $recurrenceType): int
    {
        return match ($recurrenceType) {
            RecurrenceType::MONTHLY => 30,
            RecurrenceType::YEARLY => 365,
        };
    }

    /**
     * Calculate remaining days for current plan
     */
    public function calculateRemainingDays(Company $company): int
    {
        if (! $company->plan_name || ! $company->plan_recurrence) {
            return 0;
        }

        $plan = $this->getPlanByTypeAndRecurrence(
            $company->plan_name,
            $company->plan_recurrence
        );

        if (! $plan) {
            return 0;
        }

        $now = Carbon::now()->startOfDay();

        if ($this->isInTrialPeriod($company)) {
            if ($company->plan_trial_ends_at) {
                $trialEndDate = Carbon::parse($company->plan_trial_ends_at)->startOfDay();

                return max(0, $now->diffInDays($trialEndDate, false));
            }

            if ($company->current_period_end) {
                $periodEndDate = Carbon::parse($company->current_period_end)->startOfDay();

                return max(0, $now->diffInDays($periodEndDate, false));
            }

            return 0;
        }

        if (! $company->last_billed_at) {
            if ($company->current_period_end) {
                $periodEndDate = Carbon::parse($company->current_period_end)->startOfDay();

                return max(0, $now->diffInDays($periodEndDate, false));
            }

            return 0;
        }

        $billingDays = $this->getBillingDays($plan->recurrence);
        $lastBilledDate = Carbon::parse($company->last_billed_at)->startOfDay();
        $nextBillingDate = $lastBilledDate->copy()->addDays($billingDays)->startOfDay();

        return max(0, $now->diffInDays($nextBillingDate, false));
    }

    /**
     * Calculate prorated discount value
     */
    public function calculateProratedDiscount(\App\Models\Company $company): float
    {
        if (! $company->plan_name || ! $company->plan_recurrence || ! $company->plan_price) {
            return 0.0;
        }

        $plan = $this->getPlanByTypeAndRecurrence(
            $company->plan_name,
            $company->plan_recurrence
        );

        if (! $plan) {
            return 0.0;
        }

        $remainingDays = $this->calculateRemainingDays($company);

        if ($remainingDays <= 0) {
            return 0.0;
        }

        $billingDays = $this->getBillingDays($plan->recurrence);

        if ($billingDays <= 0) {
            return 0.0;
        }

        return round(($company->plan_price / $billingDays) * $remainingDays, 2);
    }

    /**
     * Create a PlanDTO instance
     */
    private function createPlan(PlanType $planType, RecurrenceType $recurrenceType): PlanDTO
    {
        return new PlanDTO(
            type: $planType,
            recurrence: $recurrenceType,
            price: $this->getPrice($planType, $recurrenceType),
            trialDays: $this->getTrialDays($recurrenceType),
            modules: $this->getPlanModules($planType)
        );
    }
}
