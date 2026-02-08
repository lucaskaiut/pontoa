<?php

namespace Tests\Concerns;

use App\Constants\Permissions;
use App\Enums\PlanType;
use App\Enums\RecurrenceType;
use App\Enums\SubscriptionStatus;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Role;
use App\Models\Schedule;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

trait WithCompanySetup
{
    use WithFaker;

    protected Company $company;

    protected User $authenticatedUser;

    protected string $token;

    protected function setupCompany(): Company
    {
        $companyName = $this->faker->company();
        $domain = Str::slug($companyName).'-'.uniqid().'.pontoa.com.br';

        $this->company = Company::create([
            'name' => $companyName,
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->numerify('###########'),
            'document' => $this->faker->cnpj(false),
            'domain' => $domain,
            'active' => true,
            'plan_name' => PlanType::BASIC->value,
            'plan_recurrence' => RecurrenceType::MONTHLY->value,
            'subscription_status' => SubscriptionStatus::ACTIVE->value,
            'current_period_end' => Carbon::now()->addDays(30),
            'is_free' => false,
        ]);

        app('company')->registerCompany($this->company);

        return $this->company;
    }

    protected function createAdminRole(Company $company, ?array $permissions = null): Role
    {
        if ($permissions === null) {
            $permissions = Permissions::all();
        }

        return Role::create([
            'company_id' => $company->id,
            'name' => 'Administrador',
            'description' => 'Perfil com acesso total ao sistema',
            'permissions' => $permissions,
        ]);
    }

    protected function createUserWithRole(Company $company, Role $role, array $attributes = []): User
    {
        $defaultAttributes = [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'password' => Hash::make('password'),
            'phone' => $this->faker->numerify('###########'),
            'document' => $this->faker->cpf(false),
            'type' => 'admin',
            'company_id' => $company->id,
        ];

        $user = User::create(array_merge($defaultAttributes, $attributes));
        $user->roles()->attach($role->id);

        return $user;
    }

    protected function setupAuthenticatedUser(array $permissions = []): User
    {
        if (empty($permissions)) {
            $permissions = [Permissions::MANAGE_USERS];
        }

        $role = $this->createAdminRole($this->company, $permissions);
        $this->authenticatedUser = $this->createUserWithRole($this->company, $role);

        $this->token = $this->authenticateAs($this->authenticatedUser);

        return $this->authenticatedUser;
    }

    protected function authenticateAs(User $user): string
    {
        $token = $user->createToken('test')->plainTextToken;

        return $token;
    }

    protected function createCustomer(Company $company, array $attributes = []): Customer
    {
        $defaultAttributes = [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'password' => Hash::make('password'),
            'phone' => $this->faker->numerify('###########'),
            'document' => $this->faker->cpf(false),
            'status' => true,
            'company_id' => $company->id,
        ];

        return Customer::create(array_merge($defaultAttributes, $attributes));
    }

    protected function authenticateAsCustomer(Customer $customer): string
    {
        $token = $customer->createToken('test')->plainTextToken;

        return $token;
    }

    protected function setupAuthenticatedCustomer(array $attributes = []): Customer
    {
        return $this->createCustomer($this->company, $attributes);
    }

    protected function createService(Company $company, User $user, array $attributes = []): Service
    {
        $defaultAttributes = [
            'company_id' => $company->id,
            'user_id' => $user->id,
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'price' => $this->faker->randomFloat(2, 50, 500),
            'cost' => $this->faker->randomFloat(2, 20, 200),
            'commission' => $this->faker->randomFloat(2, 5, 50),
            'status' => true,
            'duration' => $this->faker->randomElement([30, 60, 90, 120]),
        ];

        return Service::create(array_merge($defaultAttributes, $attributes));
    }

    protected function createSchedule(User $user, array $attributes = []): Schedule
    {
        $services = $attributes['services'] ?? null;
        unset($attributes['services']);

        $defaultAttributes = [
            'company_id' => $this->company->id,
            'user_id' => $user->id,
            'days' => '0,1,2,3,4',
            'start_at' => '09:00:00',
            'end_at' => '18:00:00',
        ];

        $schedule = Schedule::create(array_merge($defaultAttributes, $attributes));

        if ($services !== null && is_array($services)) {
            $schedule->services()->sync($services);
        }

        return $schedule;
    }

    protected function withCompanyHeader(Company $company): array
    {
        return ['X-Company-Domain' => $company->domain];
    }
}
