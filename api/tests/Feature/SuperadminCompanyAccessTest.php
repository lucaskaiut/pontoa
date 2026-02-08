<?php

namespace Tests\Feature;

use App\Constants\Permissions;
use App\Models\Company;
use App\Models\Role;
use App\Models\User;
use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class SuperadminCompanyAccessTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupCompany();
    }

    public function test_superadmin_can_access_child_company_data()
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

        $role = Role::create([
            'company_id' => $parentCompany->id,
            'name' => 'Super Admin',
            'description' => 'Super Admin Role',
            'permissions' => Permissions::all(),
        ]);
        $superadmin->roles()->attach($role->id);

        User::factory()->create([
            'company_id' => $childCompany->id,
            'type' => 'admin',
            'phone' => $this->faker->numerify('###########'),
            'document' => $this->faker->cpf(false),
        ]);

        $token = $superadmin->createToken('test')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson("/api/users?company_id={$childCompany->id}");

        $response->assertStatus(200);
    }

    public function test_superadmin_cannot_access_non_child_company()
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
            ->getJson("/api/users?company_id={$otherCompany->id}");

        $response->assertStatus(403);
    }

    public function test_superadmin_uses_own_company_when_no_company_id_provided()
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
            ->getJson('/api/users');

        $response->assertStatus(200);
    }

    public function test_admin_cannot_use_company_id_filter()
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

        $admin = User::factory()->create([
            'company_id' => $parentCompany->id,
            'type' => 'admin',
            'email' => 'admin@test.com',
            'password' => 'password123',
            'phone' => '11999999999',
            'document' => $this->faker->cpf(false),
        ]);

        $role = Role::create([
            'company_id' => $parentCompany->id,
            'name' => 'Admin',
            'description' => 'Admin Role',
            'permissions' => Permissions::all(),
        ]);
        $admin->roles()->attach($role->id);

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson("/api/users?company_id={$childCompany->id}");

        $response->assertStatus(200);
        
        $responseData = $response->json();
        $this->assertNotEmpty($responseData['data'] ?? []);
        
        $this->assertEquals($parentCompany->id, app('company')->company()->id);
    }

    public function test_superadmin_can_access_multiple_child_companies()
    {
        $parentCompany = Company::create([
            'name' => 'Parent Company',
            'email' => 'parent@test.com',
            'phone' => '11999999999',
            'document' => $this->faker->cnpj(false),
            'domain' => 'parent.test',
        ]);

        $childCompany1 = Company::create([
            'name' => 'Child Company 1',
            'email' => 'child1@test.com',
            'phone' => '11888888888',
            'document' => $this->faker->cnpj(false),
            'domain' => 'child1.test',
            'parent_id' => $parentCompany->id,
        ]);

        $childCompany2 = Company::create([
            'name' => 'Child Company 2',
            'email' => 'child2@test.com',
            'phone' => '11777777777',
            'document' => $this->faker->cnpj(false),
            'domain' => 'child2.test',
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

        $role = Role::create([
            'company_id' => $parentCompany->id,
            'name' => 'Super Admin',
            'description' => 'Super Admin Role',
            'permissions' => Permissions::all(),
        ]);
        $superadmin->roles()->attach($role->id);

        User::factory()->create([
            'company_id' => $childCompany1->id,
            'type' => 'admin',
            'phone' => $this->faker->numerify('###########'),
            'document' => $this->faker->cpf(false),
        ]);

        User::factory()->create([
            'company_id' => $childCompany2->id,
            'type' => 'admin',
            'phone' => $this->faker->numerify('###########'),
            'document' => $this->faker->cpf(false),
        ]);

        $token = $superadmin->createToken('test')->plainTextToken;

        $response1 = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson("/api/users?company_id={$childCompany1->id}");

        $response1->assertStatus(200);

        $response2 = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson("/api/users?company_id={$childCompany2->id}");

        $response2->assertStatus(200);
    }
}

