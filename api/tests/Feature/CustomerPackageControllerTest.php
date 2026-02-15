<?php

namespace Tests\Feature;

use App\Models\CustomerPackage;
use App\Models\Package;
use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class CustomerPackageControllerTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupCompany();
        $this->setupAuthenticatedUser();
    }

    public function test_can_list_customer_packages_with_authentication()
    {
        $customer = $this->createCustomer($this->company);
        $package = Package::create([
            'company_id' => $this->company->id,
            'name' => 'Test Package',
            'total_sessions' => 10,
            'price' => 500.00,
            'is_active' => true,
        ]);

        CustomerPackage::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'package_id' => $package->id,
            'total_sessions' => 10,
            'remaining_sessions' => 8,
            'expires_at' => now()->addDays(30),
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/customers/{$customer->id}/packages");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'package' => [
                            'id',
                            'name',
                        ],
                    ],
                ],
            ]);
    }

    public function test_can_activate_package_for_customer_with_authentication()
    {
        $customer = $this->createCustomer($this->company);
        $package = Package::create([
            'company_id' => $this->company->id,
            'name' => 'Test Package',
            'total_sessions' => 10,
            'price' => 500.00,
            'is_active' => true,
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson("/api/customers/{$customer->id}/packages/{$package->id}/activate");

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'package' => [
                        'id',
                        'name',
                    ],
                ],
            ]);
    }

    public function test_can_get_package_usages_with_authentication()
    {
        $customer = $this->createCustomer($this->company);
        $package = Package::create([
            'company_id' => $this->company->id,
            'name' => 'Test Package',
            'total_sessions' => 10,
            'price' => 500.00,
            'is_active' => true,
        ]);

        $customerPackage = CustomerPackage::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'package_id' => $package->id,
            'total_sessions' => 10,
            'remaining_sessions' => 8,
            'expires_at' => now()->addDays(30),
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/customers/{$customer->id}/packages/{$customerPackage->id}/usages");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [],
            ]);
    }

    public function test_cannot_list_customer_packages_without_authentication()
    {
        $customer = $this->createCustomer($this->company);

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/customers/{$customer->id}/packages");

        $response->assertStatus(401);
    }
}
