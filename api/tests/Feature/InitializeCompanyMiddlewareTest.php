<?php

namespace Tests\Feature;

use App\Constants\Permissions;
use App\Models\Company;
use App\Models\Role;
use App\Models\User;
use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class InitializeCompanyMiddlewareTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupCompany();
    }

    public function test_middleware_registers_company_for_admin()
    {
        $admin = User::factory()->create([
            'company_id' => $this->company->id,
            'type' => 'admin',
            'email' => 'admin@test.com',
            'password' => 'password123',
            'phone' => '11999999999',
            'document' => $this->faker->cpf(false),
        ]);

        $role = Role::create([
            'company_id' => $this->company->id,
            'name' => 'Admin',
            'description' => 'Admin Role',
            'permissions' => Permissions::all(),
        ]);
        $admin->roles()->attach($role->id);

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson('/api/users/me');

        $response->assertStatus(200);
        $this->assertEquals($this->company->id, app('company')->company()->id);
    }

    public function test_middleware_registers_child_company_for_superadmin()
    {
        $parentCompany = Company::create([
            'name' => 'Parent Company',
            'email' => 'parent@test.com',
            'phone' => '11999999999',
            'document' => $this->faker->cnpj(false),
            'domain' => 'parent.test',
        ]);

        $childCompany = Company::create([
            'name' => 'Child Company',
            'email' => 'child@test.com',
            'phone' => '11888888888',
            'document' => $this->faker->cnpj(false),
            'domain' => 'child.test',
            'parent_id' => $parentCompany->id,
        ]);

        $superadmin = User::factory()->create([
            'company_id' => $parentCompany->id,
            'type' => 'superadmin',
            'email' => 'superadmin@test.com',
            'password' => 'password123',
            'phone' => '11999999999',
            'document' => $this->faker->cpf(false),
        ]);

        $role = Role::create([
            'company_id' => $parentCompany->id,
            'name' => 'Super Admin',
            'description' => 'Super Admin Role',
            'permissions' => Permissions::all(),
        ]);
        $superadmin->roles()->attach($role->id);

        $token = $superadmin->createToken('test')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson("/api/users/me?company_id={$childCompany->id}");

        $response->assertStatus(200);
        $this->assertEquals($childCompany->id, app('company')->company()->id);
    }

    public function test_middleware_rejects_invalid_child_company()
    {
        $parentCompany = Company::create([
            'name' => 'Parent Company',
            'email' => 'parent@test.com',
            'phone' => '11999999999',
            'document' => $this->faker->cnpj(false),
            'domain' => 'parent.test',
        ]);

        $otherCompany = Company::create([
            'name' => 'Other Company',
            'email' => 'other@test.com',
            'phone' => '11777777777',
            'document' => $this->faker->cnpj(false),
            'domain' => 'other.test',
            'parent_id' => null,
        ]);

        $superadmin = User::factory()->create([
            'company_id' => $parentCompany->id,
            'type' => 'superadmin',
            'email' => 'superadmin@test.com',
            'password' => 'password123',
            'phone' => '11999999999',
            'document' => $this->faker->cpf(false),
        ]);

        $role = Role::create([
            'company_id' => $parentCompany->id,
            'name' => 'Super Admin',
            'description' => 'Super Admin Role',
            'permissions' => Permissions::all(),
        ]);
        $superadmin->roles()->attach($role->id);

        $token = $superadmin->createToken('test')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson("/api/users/me?company_id={$otherCompany->id}");

        $response->assertStatus(403);
    }

    public function test_middleware_uses_superadmin_company_when_no_filter()
    {
        $parentCompany = Company::create([
            'name' => 'Parent Company',
            'email' => 'parent@test.com',
            'phone' => '11999999999',
            'document' => $this->faker->cnpj(false),
            'domain' => 'parent.test',
        ]);

        $superadmin = User::factory()->create([
            'company_id' => $parentCompany->id,
            'type' => 'superadmin',
            'email' => 'superadmin@test.com',
            'password' => 'password123',
            'phone' => '11999999999',
            'document' => $this->faker->cpf(false),
        ]);

        $role = Role::create([
            'company_id' => $parentCompany->id,
            'name' => 'Super Admin',
            'description' => 'Super Admin Role',
            'permissions' => Permissions::all(),
        ]);
        $superadmin->roles()->attach($role->id);

        $token = $superadmin->createToken('test')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson('/api/users/me');

        $response->assertStatus(200);
        $this->assertEquals($parentCompany->id, app('company')->company()->id);
    }
}

