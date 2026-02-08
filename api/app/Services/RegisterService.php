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
            $planData = $this->processPlanData();

            unset($data['company']['plan_type']);

            $data['company'] = array_merge($data['company'], $planData);

            $company = $this->companyService->create($data['company']);

            app('company')->registerCompany($company);

            $user = $this->userService->create($data['user']);

            $token = $user->createToken('api_key');

            $this->settingService->save(key: 'api_key', value: $token->plainTextToken, label: 'Chave de API');

            $adminRole = $this->createAdminRole($company);
            $user->roles()->attach($adminRole->id);

            return $user->load('roles');
        });
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
     * Supports format (plan_type + plan_recurrence)
     */
    private function processPlanData(): array
    {
        $planType = 'basic';
        $recurrence = 'monthly';
        $planTypeEnum = PlanType::from($planType);
        $recurrenceEnum = RecurrenceType::from($recurrence);

        $plan = $this->planService->getPlanByTypeAndRecurrence(
            $planTypeEnum->value,
            $recurrenceEnum->value
        );

        $now = \Carbon\Carbon::now();
        $trialEndDate = $this->planService->calculateTrialEndDate($now, $recurrenceEnum);
        $billingDays = $this->planService->getBillingDays($recurrenceEnum);
        $currentPeriodEnd = $trialEndDate->copy()->addDays($billingDays);

        return [
            'plan' => $recurrenceEnum->value,
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
