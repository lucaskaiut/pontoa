<?php

namespace App\Services;

use App\Constants\Permissions;
use App\Enums\PlanType;
use App\Enums\RecurrenceType;
use App\Enums\SubscriptionStatus;
use App\Models\Role;
use App\Models\User;
use App\Services\Payments\PaymentService;
use Illuminate\Support\Facades\DB;

final class RegisterService
{
    private CompanyService $companyService;

    private CreditCardService $creditCardService;

    private PaymentService $paymentService;

    private UserService $userService;

    private RoleService $roleService;

    private SettingService $settingService;

    private PlanService $planService;

    public function __construct(
        CompanyService $companyService,
        CreditCardService $creditCardService,
        PaymentService $paymentService,
        UserService $userService,
        RoleService $roleService,
        SettingService $settingService,
        PlanService $planService
    ) {
        $this->companyService = $companyService;
        $this->creditCardService = $creditCardService;
        $this->paymentService = $paymentService;
        $this->userService = $userService;
        $this->roleService = $roleService;
        $this->settingService = $settingService;
        $this->planService = $planService;
    }

    public function handle(array $data): User
    {
        return DB::transaction(function () use ($data) {
            request()->merge(['use_platform_payment' => true]);

            $companyData = collect($data['company'])->except(['credit_card', 'address'])->all();

            $planData = $this->processPlanData($companyData);

            unset($companyData['plan_type']);

            $companyData = array_merge($companyData, $planData);

            $company = $this->companyService->create($companyData);

            app('company')->registerCompany($company);

            $addressId = null;
            if (isset($data['company']['address']) && $data['company']['address']) {
                $address = $company->addresses()->create($data['company']['address']);
                $addressId = $address->id;
            }

            if (isset($data['company']['credit_card']) && $data['company']['credit_card']) {
                $creditCardData = $data['company']['credit_card'];

                $paymentMethod = $this->getPaymentMethod();
                $token = $this->paymentService->createToken($paymentMethod, $creditCardData);

                $creditCardData['token'] = $token;
                if ($addressId) {
                    $creditCardData['address_id'] = $addressId;
                }
                $card = $this->creditCardService->create($creditCardData, $company);

                $company->update(['card_id' => $card->id]);
            }

            $user = $this->userService->create($data['user']);

            $token = $user->createToken('api_key');

            $this->settingService->save(key: 'api_key', value: $token->plainTextToken, label: 'Chave de API');

            $adminRole = $this->createAdminRole($company);
            $user->roles()->attach($adminRole->id);

            return $user->load('roles');
        });
    }

    private function getPaymentMethod(): string
    {
        $settings = json_decode(config('app.payment_method', '{}'), true);
        $activeMethod = $settings['active'] ?? 'PagarmeCreditCard';

        $methodName = lcfirst($activeMethod);

        return $methodName;
    }

    private function createAdminRole($company): Role
    {
        $allPermissions = Permissions::all();

        return $this->roleService->create([
            'company_id' => $company->id,
            'name' => 'Administrador',
            'description' => 'Perfil com acesso total ao sistema',
            'permissions' => $allPermissions,
        ]);
    }

    /**
     * Process plan data from registration
     * Supports both old format (plan: 'monthly'/'yearly') and new format (plan_type + plan_recurrence)
     */
    private function processPlanData(array $companyData): array
    {
        // Handle new format: plan_type + plan_recurrence
        if (isset($companyData['plan_type']) && isset($companyData['plan_recurrence'])) {
            $planType = $companyData['plan_type'];
            $recurrence = $companyData['plan_recurrence'];
        }
        // Handle legacy format: plan as recurrence (monthly/yearly)
        elseif (isset($companyData['plan']) && in_array($companyData['plan'], ['monthly', 'yearly'])) {
            $planType = PlanType::BASIC->value; // Default to BASIC for legacy
            $recurrence = $companyData['plan'];
        }
        // Fallback to defaults
        else {
            $planType = PlanType::BASIC->value;
            $recurrence = RecurrenceType::MONTHLY->value;
        }

        try {
            $planTypeEnum = PlanType::from($planType);
            $recurrenceEnum = RecurrenceType::from($recurrence);
        } catch (\ValueError $e) {
            // Fallback to defaults
            $planTypeEnum = PlanType::BASIC;
            $recurrenceEnum = RecurrenceType::MONTHLY;
        }

        $plan = $this->planService->getPlanByTypeAndRecurrence(
            $planTypeEnum->value,
            $recurrenceEnum->value
        );

        if (! $plan) {
            // Final fallback
            $plan = $this->planService->getPlanByTypeAndRecurrence(
                PlanType::BASIC->value,
                RecurrenceType::MONTHLY->value
            );
        }

        $now = \Carbon\Carbon::now();
        $trialEndDate = $this->planService->calculateTrialEndDate($now, $recurrenceEnum);
        $billingDays = $this->planService->getBillingDays($recurrenceEnum);
        $currentPeriodEnd = $trialEndDate->copy()->addDays($billingDays);

        return [
            'plan_name' => $planTypeEnum->value,
            'plan_recurrence' => $recurrenceEnum->value,
            'plan_price' => $plan->price,
            'plan_started_at' => $now,
            'plan_trial_ends_at' => $trialEndDate,
            'subscription_status' => SubscriptionStatus::ACTIVE->value,
            'current_period_start' => $now,
            'current_period_end' => $currentPeriodEnd,
            'cancel_at_period_end' => false,
            'is_free' => true,
        ];
    }
}
