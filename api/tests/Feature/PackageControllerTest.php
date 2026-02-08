<?php

namespace Tests\Feature;

use App\Constants\Permissions;
use App\Models\Package;
use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class PackageControllerTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupCompany();
        $this->setupAuthenticatedUser([Permissions::MANAGE_PACKAGES]);
    }

    public function test_can_list_available_packages_publicly()
    {
        Package::create([
            'company_id' => $this->company->id,
            'name' => 'Test Package',
            'total_sessions' => 10,
            'price' => 500.00,
            'is_active' => true,
        ]);

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/packages/available');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'total_sessions',
                        'price',
                    ],
                ],
            ]);
    }

    public function test_can_list_packages_with_permission()
    {
        Package::create([
            'company_id' => $this->company->id,
            'name' => 'Test Package',
            'total_sessions' => 10,
            'price' => 500.00,
            'is_active' => true,
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/packages');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'total_sessions',
                    ],
                ],
            ]);
    }

    public function test_cannot_list_packages_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/packages');

        $response->assertStatus(403);
    }

    public function test_can_create_package_with_permission()
    {
        $packageData = [
            'name' => 'New Package',
            'description' => 'Package description',
            'total_sessions' => 10,
            'bonus_sessions' => 2,
            'price' => 500.00,
            'is_active' => true,
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/packages', $packageData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'total_sessions',
                ],
            ]);

        $this->assertDatabaseHas('packages', [
            'name' => 'New Package',
            'company_id' => $this->company->id,
        ]);
    }

    public function test_cannot_create_package_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $packageData = [
            'name' => 'New Package',
            'total_sessions' => 10,
            'price' => 500.00,
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/packages', $packageData);

        $response->assertStatus(403);
    }

    public function test_can_show_package_with_permission()
    {
        $package = Package::create([
            'company_id' => $this->company->id,
            'name' => 'Test Package',
            'total_sessions' => 10,
            'price' => 500.00,
            'is_active' => true,
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/packages/{$package->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'total_sessions',
                ],
            ]);
    }

    public function test_can_update_package_with_permission()
    {
        $package = Package::create([
            'company_id' => $this->company->id,
            'name' => 'Test Package',
            'total_sessions' => 10,
            'price' => 500.00,
            'is_active' => true,
        ]);

        $updateData = [
            'name' => 'Updated Package',
            'total_sessions' => 15,
            'price' => 600.00,
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/packages/{$package->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'name' => 'Updated Package',
                ],
            ]);
    }

    public function test_can_delete_package_with_permission()
    {
        $package = Package::create([
            'company_id' => $this->company->id,
            'name' => 'Test Package',
            'total_sessions' => 10,
            'price' => 500.00,
            'is_active' => true,
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->deleteJson("/api/packages/{$package->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('packages', [
            'id' => $package->id,
        ]);
    }

    public function test_can_toggle_package_active_with_permission()
    {
        $package = Package::create([
            'company_id' => $this->company->id,
            'name' => 'Test Package',
            'total_sessions' => 10,
            'price' => 500.00,
            'is_active' => true,
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson("/api/packages/{$package->id}/toggle-active");

        $response->assertStatus(200);
    }
}
