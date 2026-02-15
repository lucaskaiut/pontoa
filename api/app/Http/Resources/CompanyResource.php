<?php

namespace App\Http\Resources;

use App\Services\PlanService;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'name' => $this->name,
            'active' => $this->active,
            'id' => $this->id,
            'domain' => $this->domain,
            'banner' => $this->banner ? asset($this->banner) : null,
            'logo' => $this->logo ? asset($this->logo) : null,
            'email' => $this->email,
            'phone' => $this->phone,
            'support_phone' => $this->support_phone,
            'document' => $this->document,
            'plan' => $this->getPlanData(),
            'is_free' => $this->is_free,
            'last_billed_at' => $this->last_billed_at,
            'plan_started_at' => $this->plan_started_at,
            'plan_trial_ends_at' => $this->plan_trial_ends_at,
            'plan_name' => $this->plan_name,
            'plan_recurrence' => $this->plan_recurrence,
            'plan_price' => $this->plan_price !== null ? (float) $this->plan_price : null,
            'subscription_status' => $this->subscription_status ?? 'ACTIVE',
            'current_period_start' => $this->current_period_start,
            'current_period_end' => $this->current_period_end,
            'canceled_at' => $this->canceled_at,
            'cancel_at_period_end' => $this->cancel_at_period_end ?? false,
            'onboarding_completed' => $this->onboarding_completed ?? false,
            'terms_and_conditions' => $this->terms_and_conditions,
            'addresses' => new AddressCollection($this->addresses()->get()),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * Get plan data using new system or fallback to legacy
     */
    private function getPlanData(): ?array
    {
        $planService = app(PlanService::class);

        // Try new system first
        if ($this->plan_name && $this->plan_recurrence) {
            $plan = $planService->getPlanByTypeAndRecurrence(
                $this->plan_name,
                $this->plan_recurrence
            );

            if ($plan) {
                return [
                    'name' => $plan->type->label().' - '.$plan->recurrence->label(),
                    'free' => $plan->trialDays,
                    'days' => match ($plan->recurrence->value) {
                        'monthly' => 30,
                        'yearly' => 365,
                        default => 30,
                    },
                    'price' => $plan->price,
                ];
            }
        }

        // Fallback to legacy
        if ($this->plan) {
            return $this->plans($this->plan);
        }

        return null;
    }
}
