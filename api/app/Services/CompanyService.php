<?php

namespace App\Services;

use App\Enums\RecurrenceType;
use App\Enums\SubscriptionStatus;
use App\Models\Company;
use App\Models\CompanyRecurrency;
use App\Services\Payments\PaymentService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

final class CompanyService
{
    public function create(array $data): Company
    {
        if (! isset($data['plan_started_at'])) {
            $data['is_free'] = true;
        }

        return Company::create($data);
    }

    public function update(Company $company, array $data): Company
    {
        if (isset($data['addresses'])) {
            $this->syncAddresses($company, $data['addresses']);
            unset($data['addresses']);
        }

        if (isset($data['current_period_end'])) {
            $data['current_period_end'] = $data['current_period_end']
                ? Carbon::parse($data['current_period_end'])->format('Y-m-d H:i:s')
                : null;
        }

        if (isset($data['plan_trial_ends_at'])) {
            $data['plan_trial_ends_at'] = $data['plan_trial_ends_at']
                ? Carbon::parse($data['plan_trial_ends_at'])->format('Y-m-d H:i:s')
                : null;
        }

        $company->update($data);

        return $company;
    }

    public function findOneBy(array $filter): ?Company
    {
        $company = Company::query();

        foreach ($filter as $key => $value) {
            $company = $company->where($key, $value);
        }

        return $company->first();
    }

    /**
     * @return Company[]
     */
    public function findBy(array $filter)
    {
        $company = Company::query();

        foreach ($filter as $key => $value) {
            if ($key == 'domain') {
                $domain = $value;

                if (str_contains($domain, 'http')) {
                    $domainParts = explode('/', $domain);
                    $domain = $domainParts[2];
                }

                $domain = str_replace('www.', '', $domain);
                $value = str_replace('/', '', $domain);
            }

            $company = $company->where($key, $value);
        }

        return $company->get();
    }

    public function verifyIfShouldBill(Company $company): bool
    {
        if ($company->payment_attempts >= 3) {
            return false;
        }

        if ($company->subscription_status === SubscriptionStatus::SUSPENDED->value) {
            return false;
        }

        if ($company->active === 0) {
            return false;
        }

        if ($company->cancel_at_period_end) {
            return false;
        }

        $planService = app(PlanService::class);

        if ($planService->isInTrialPeriod($company)) {
            return false;
        }

        if (! $company->plan_name || ! $company->plan_recurrence) {
            return false;
        }

        $plan = $planService->getPlanByTypeAndRecurrence(
            $company->plan_name,
            $company->plan_recurrence
        );

        if (! $plan) {
            return false;
        }

        if ($company->current_period_end) {
            $periodEndDate = Carbon::parse($company->current_period_end)->startOfDay();
            $today = Carbon::now()->startOfDay();

            return $periodEndDate <= $today;
        }

        if (! $company->last_billed_at) {
            return false;
        }

        $billingDays = match ($plan->recurrence) {
            RecurrenceType::MONTHLY => 30,
            RecurrenceType::YEARLY => 365,
        };

        $lastBilledDate = Carbon::parse($company->last_billed_at)->startOfDay();
        $nextBillingDate = $lastBilledDate
            ->copy()
            ->addDays($billingDays)
            ->startOfDay();

        $today = Carbon::now()->startOfDay();

        return $nextBillingDate <= $today;
    }

    public function billCompany(Company $company): void
    {
        $planService = app(PlanService::class);
        $plan = $planService->getPlanByTypeAndRecurrence(
            $company->plan_name,
            $company->plan_recurrence
        );

        if (! $plan) {
            throw new \Exception('Plano não encontrado para a empresa');
        }

        try {
            $orderId = (new PaymentService)->billCompany($company);

            $company->recurrencies()->create([
                'amount' => $company->plan_price,
                'payment_method' => $company->card()->source,
                'plan' => $company->plan_recurrence ?? $company->plan ?? 'monthly',
                'billed_at' => Carbon::now(),
                'external_id' => $orderId,
            ]);

            $this->resetPaymentAttempts($company);
        } catch (\Exception $e) {
            $this->incrementPaymentAttempt($company);
            throw $e;
        }
    }

    public function updateLastBilledAtAndSetNonFree(Company $company): void
    {
        $planService = app(PlanService::class);
        $plan = $planService->getPlanByTypeAndRecurrence(
            $company->plan_name,
            $company->plan_recurrence
        );

        $now = Carbon::now();
        $billingDays = $plan ? $planService->getBillingDays($plan->recurrence) : 30;
        $currentPeriodEnd = $now->copy()->addDays($billingDays);

        $company->update([
            'last_billed_at' => $now,
            'is_free' => 0,
            'subscription_status' => SubscriptionStatus::ACTIVE->value,
            'current_period_start' => $now,
            'current_period_end' => $currentPeriodEnd,
            'billing_notification_sent_at' => null,
        ]);

        $this->resetPaymentAttempts($company);
    }

    public function calculatePlanChange(Company $company, string $newPlanType, string $newRecurrenceType): array
    {
        $planService = app(PlanService::class);

        $currentPlan = null;
        if ($company->plan_name && $company->plan_recurrence) {
            $currentPlan = $planService->getPlanByTypeAndRecurrence(
                $company->plan_name,
                $company->plan_recurrence
            );
        }

        $newPlan = $planService->getPlanByTypeAndRecurrence(
            $newPlanType,
            $newRecurrenceType
        );

        if (! $newPlan) {
            throw new \Exception('Novo plano não encontrado');
        }

        $proratedDiscount = 0.0;
        $remainingDays = 0;

        if ($currentPlan && $company->plan_name && $company->plan_recurrence) {
            $proratedDiscount = $planService->calculateProratedDiscount($company);
            $remainingDays = $planService->calculateRemainingDays($company);
        }

        $newPlanPrice = $newPlan->price;
        $finalAmount = max(0, $newPlanPrice - $proratedDiscount);

        return [
            'current_plan' => $currentPlan ? [
                'type' => $currentPlan->type->value,
                'type_label' => $currentPlan->type->label(),
                'recurrence' => $currentPlan->recurrence->value,
                'recurrence_label' => $currentPlan->recurrence->label(),
                'price' => $currentPlan->price,
            ] : null,
            'new_plan' => [
                'type' => $newPlan->type->value,
                'type_label' => $newPlan->type->label(),
                'recurrence' => $newPlan->recurrence->value,
                'recurrence_label' => $newPlan->recurrence->label(),
                'price' => $newPlan->price,
            ],
            'remaining_days' => $remainingDays,
            'prorated_discount' => $proratedDiscount,
            'new_plan_price' => $newPlanPrice,
            'final_amount' => $finalAmount,
        ];
    }

    public function updateCreditCard(Company $company, array $creditCardData): Company
    {
        $paymentService = new PaymentService;
        $creditCardService = new CreditCardService;

        $paymentMethod = $this->getPaymentMethod();
        $token = $paymentService->createToken($paymentMethod, $creditCardData);

        $creditCardData['token'] = $token;
        $card = $creditCardService->create($creditCardData, $company);

        if ($company->card_id) {
            $company->cards()->where('id', $company->card_id)->delete();
        }

        $company->update(['card_id' => $card->id]);

        return $company->fresh();
    }

    public function changePlan(Company $company, string $newPlanType, string $newRecurrenceType, ?array $creditCardData = null): Company
    {
        if ($company->cancel_at_period_end) {
            throw new \Exception('Não é possível alterar o plano enquanto houver cancelamento agendado. Reative a assinatura primeiro.');
        }

        $planService = app(PlanService::class);

        $newPlan = $planService->getPlanByTypeAndRecurrence(
            $newPlanType,
            $newRecurrenceType
        );

        if (! $newPlan) {
            throw new \Exception('Novo plano não encontrado');
        }

        if ($creditCardData) {
            $this->updateCreditCard($company, $creditCardData);
            $company->refresh();
        }

        $proratedDiscount = 0.0;
        if ($company->plan_name && $company->plan_recurrence) {
            $proratedDiscount = $planService->calculateProratedDiscount($company);
        }

        $newPlanPrice = $newPlan->price;
        $finalAmount = max(0, $newPlanPrice - $proratedDiscount);

        $now = Carbon::now();
        $billingDays = $planService->getBillingDays($newPlan->recurrence);
        $currentPeriodEnd = $now->copy()->addDays($billingDays);

        $updateData = [
            'plan_name' => $newPlanType,
            'plan_recurrence' => $newRecurrenceType,
            'plan_price' => $newPlanPrice,
            'plan_started_at' => $now,
            'plan_trial_ends_at' => null,
            'current_period_start' => $now,
            'current_period_end' => $currentPeriodEnd,
            'cancel_at_period_end' => false,
            'canceled_at' => null,
        ];

        if ($company->card_id) {
            try {
                $orderId = (new PaymentService)->billCompany($company, $finalAmount);

                $company->recurrencies()->create([
                    'amount' => $finalAmount,
                    'payment_method' => $company->card()->source,
                    'plan' => $newRecurrenceType,
                    'billed_at' => $now,
                    'external_id' => $orderId,
                ]);

                $updateData['last_billed_at'] = $now;
                $updateData['is_free'] = false;
                $updateData['subscription_status'] = SubscriptionStatus::ACTIVE->value;

                $this->resetPaymentAttempts($company);
            } catch (\Exception $e) {
                $this->incrementPaymentAttempt($company);
                throw $e;
            }
        } else {
            $updateData['is_free'] = true;
            $this->resetPaymentAttempts($company);
        }

        $company->update($updateData);

        return $company->fresh();
    }

    private function getPaymentMethod(): string
    {
        request()->merge(['use_platform_payment' => true]);
        $settings = json_decode(config('app.payment_method', '{}'), true);
        $activeMethod = $settings['active'] ?? 'PagarmeCreditCard';

        $methodName = lcfirst($activeMethod);

        return $methodName;
    }

    public function recurrencies(array $filters = [])
    {
        $company = app('company')->company();
        $query = CompanyRecurrency::where('company_id', $company->id);

        if (isset($filters['sort'])) {
            $parts = explode(',', $filters['sort']);
            $column = $parts[0] ?? null;
            $direction = strtoupper($parts[1] ?? 'ASC');

            if ($column && in_array($direction, ['ASC', 'DESC'])) {
                $allowedColumns = ['amount', 'billed_at', 'plan', 'payment_method', 'created_at', 'updated_at'];
                if (in_array($column, $allowedColumns)) {
                    $query->orderBy($column, $direction);
                }
            }
        } else {
            $query->orderBy('billed_at', 'desc');
        }

        return $query->paginate();
    }

    public function cancelSubscription(Company $company): Company
    {
        if (! $company->plan_name || ! $company->plan_recurrence) {
            throw new \Exception('Empresa não possui plano ativo');
        }

        if ($company->cancel_at_period_end) {
            throw new \Exception('Assinatura já está com cancelamento agendado');
        }

        $planService = app(PlanService::class);
        $plan = $planService->getPlanByTypeAndRecurrence(
            $company->plan_name,
            $company->plan_recurrence
        );

        if (! $plan) {
            throw new \Exception('Plano não encontrado');
        }

        $now = Carbon::now();
        $currentPeriodStart = $company->current_period_start
            ? Carbon::parse($company->current_period_start)
            : ($company->last_billed_at ? Carbon::parse($company->last_billed_at) : $now);

        $currentPeriodEnd = $company->current_period_end
            ? Carbon::parse($company->current_period_end)
            : $currentPeriodStart->copy()->addDays($planService->getBillingDays($plan->recurrence));

        $company->update([
            'cancel_at_period_end' => true,
            'canceled_at' => $now,
            'subscription_status' => SubscriptionStatus::CANCELED->value,
            'current_period_start' => $currentPeriodStart,
            'current_period_end' => $currentPeriodEnd,
        ]);

        return $company->fresh();
    }

    public function reactivateSubscription(Company $company): Company
    {
        if (! $company->cancel_at_period_end) {
            throw new \Exception('Assinatura não está com cancelamento agendado');
        }

        $planService = app(PlanService::class);
        $plan = $planService->getPlanByTypeAndRecurrence(
            $company->plan_name,
            $company->plan_recurrence
        );

        if (! $plan) {
            throw new \Exception('Plano não encontrado');
        }

        $now = Carbon::now();
        $currentPeriodEnd = $company->current_period_end
            ? Carbon::parse($company->current_period_end)
            : $now->copy()->addDays($planService->getBillingDays($plan->recurrence));

        $company->update([
            'cancel_at_period_end' => false,
            'canceled_at' => null,
            'subscription_status' => SubscriptionStatus::ACTIVE->value,
            'current_period_end' => $currentPeriodEnd,
        ]);

        $this->resetPaymentAttempts($company);

        return $company->fresh();
    }

    public function isSubscriptionActive(Company $company): bool
    {
        if (! $company->plan_name || ! $company->plan_recurrence) {
            return false;
        }

        if ($company->subscription_status === SubscriptionStatus::EXPIRED->value) {
            return false;
        }

        if ($company->subscription_status === SubscriptionStatus::SUSPENDED->value) {
            return false;
        }

        if ($company->cancel_at_period_end) {
            if (! $company->current_period_end) {
                return false;
            }

            $periodEnd = Carbon::parse($company->current_period_end);

            return Carbon::now()->isBefore($periodEnd);
        }

        return true;
    }

    public function canWrite(Company $company): bool
    {
        if (! $this->isSubscriptionActive($company)) {
            return false;
        }

        if ($company->subscription_status === SubscriptionStatus::EXPIRED->value) {
            return false;
        }

        return true;
    }

    public function expireSubscriptions(): void
    {
        $companies = Company::where('cancel_at_period_end', true)
            ->whereNotNull('current_period_end')
            ->get();

        foreach ($companies as $company) {
            $periodEnd = Carbon::parse($company->current_period_end);

            if (Carbon::now()->isAfter($periodEnd)) {
                $company->update([
                    'subscription_status' => SubscriptionStatus::EXPIRED->value,
                ]);
            }
        }

        $companiesWithoutCard = Company::whereNull('card_id')
            ->whereNotNull('current_period_end')
            ->where('subscription_status', SubscriptionStatus::ACTIVE->value)
            ->where('is_free', false)
            ->get();

        foreach ($companiesWithoutCard as $company) {
            $periodEnd = Carbon::parse($company->current_period_end);

            if (Carbon::now()->isAfter($periodEnd)) {
                $company->update([
                    'subscription_status' => SubscriptionStatus::EXPIRED->value,
                ]);
            }
        }
    }

    public function canRetryPayment(Company $company): bool
    {
        if ($company->payment_attempts >= 3) {
            return false;
        }

        if ($company->last_payment_attempt_at) {
            $lastAttemptDate = Carbon::parse($company->last_payment_attempt_at)->startOfDay();
            $today = Carbon::now()->startOfDay();

            return $lastAttemptDate->lt($today);
        }

        return true;
    }

    public function resetPaymentAttempts(Company $company): void
    {
        $company->update([
            'payment_attempts' => 0,
            'last_payment_attempt_at' => null,
            'payment_retry_until' => null,
        ]);
    }

    public function incrementPaymentAttempt(Company $company): void
    {
        $newAttempts = ($company->payment_attempts ?? 0) + 1;
        $now = Carbon::now();

        $updateData = [
            'payment_attempts' => $newAttempts,
            'last_payment_attempt_at' => $now,
        ];

        if ($newAttempts >= 3) {
            $updateData['subscription_status'] = SubscriptionStatus::SUSPENDED->value;
            $updateData['active'] = 0;

            Log::warning('Empresa suspensa após 3 tentativas de pagamento falhadas', [
                'company_id' => $company->id,
                'company_name' => $company->name,
                'payment_attempts' => $newAttempts,
                'last_payment_attempt_at' => $now,
            ]);
        }

        $company->update($updateData);
    }

    public function handlePaymentFailure(Company $company, \Exception $exception): void
    {
        $this->incrementPaymentAttempt($company);

        Log::error('Falha no pagamento da empresa', [
            'company_id' => $company->id,
            'company_name' => $company->name,
            'payment_attempts' => $company->fresh()->payment_attempts,
            'error_message' => $exception->getMessage(),
            'error_file' => $exception->getFile(),
            'error_line' => $exception->getLine(),
        ]);
    }

    public function getNextBillingDate(Company $company): ?Carbon
    {
        $planService = app(PlanService::class);

        if ($planService->isInTrialPeriod($company)) {
            if ($company->plan_trial_ends_at) {
                return Carbon::parse($company->plan_trial_ends_at);
            }

            if ($company->current_period_end) {
                return Carbon::parse($company->current_period_end);
            }

            return null;
        }

        if ($company->current_period_end) {
            return Carbon::parse($company->current_period_end);
        }

        if ($company->last_billed_at && $company->plan_name && $company->plan_recurrence) {
            $plan = $planService->getPlanByTypeAndRecurrence(
                $company->plan_name,
                $company->plan_recurrence
            );

            if ($plan) {
                $billingDays = $planService->getBillingDays($plan->recurrence);
                $lastBilledDate = Carbon::parse($company->last_billed_at);

                return $lastBilledDate->copy()->addDays($billingDays);
            }
        }

        return null;
    }

    public function shouldSendBillingNotification(Company $company): bool
    {
        if (!$company->email) {
            return false;
        }

        if ($company->cancel_at_period_end) {
            return false;
        }

        if ($company->subscription_status === SubscriptionStatus::SUSPENDED->value) {
            return false;
        }

        if ($company->subscription_status === SubscriptionStatus::EXPIRED->value) {
            return false;
        }

        if (!$company->plan_name || !$company->plan_recurrence) {
            return false;
        }

        $nextBillingDate = $this->getNextBillingDate($company);

        if (!$nextBillingDate) {
            return false;
        }

        $now = Carbon::now();
        $hoursUntilBilling = $now->diffInHours($nextBillingDate, false);

        if ($hoursUntilBilling < 0 || $hoursUntilBilling > 72 || $hoursUntilBilling < 71) {
            return false;
        }

        if ($company->billing_notification_sent_at) {
            $lastNotificationDate = Carbon::parse($company->billing_notification_sent_at);
            $companyFresh = Company::find($company->id);
            $nextBillingDateAtNotification = $this->getNextBillingDate($companyFresh);

            if ($nextBillingDateAtNotification && $nextBillingDateAtNotification->eq($nextBillingDate)) {
                return false;
            }
        }

        return true;
    }

    public function markBillingNotificationSent(Company $company): void
    {
        $company->update([
            'billing_notification_sent_at' => Carbon::now(),
        ]);
    }

    private function syncAddresses(Company $company, array $addresses)
    {
        foreach ($company->addresses()->get() as $companyAddress) {
            $companyAddress->delete();
        }

        $company->addresses()->createMany($addresses);
    }
}
