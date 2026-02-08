<?php

namespace Tests\Feature;

use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class ServiceControllerTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupCompany();
        $this->setupAuthenticatedUser();
    }

    public function test_can_list_services_publicly()
    {
        $service = $this->createService($this->company, $this->authenticatedUser);

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/services');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'price',
                        'duration',
                    ],
                ],
            ]);
    }

    public function test_can_create_service_with_authentication()
    {
        $serviceData = [
            'name' => 'Test Service',
            'description' => 'Service description',
            'price' => 100.00,
            'cost' => 50.00,
            'commission' => 10.00,
            'duration' => 60,
            'status' => true,
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/services', $serviceData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'price',
                    'duration',
                ],
            ])
            ->assertJson([
                'data' => [
                    'name' => 'Test Service',
                ],
            ]);

        $this->assertDatabaseHas('services', [
            'name' => 'Test Service',
            'company_id' => $this->company->id,
            'user_id' => $this->authenticatedUser->id,
        ]);
    }

    public function test_cannot_create_service_without_authentication()
    {
        $serviceData = [
            'name' => 'Test Service',
            'price' => 100.00,
            'duration' => 60,
            'status' => true,
        ];

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/services', $serviceData);

        $response->assertStatus(401);
    }

    public function test_can_show_service_with_authentication()
    {
        $service = $this->createService($this->company, $this->authenticatedUser);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/services/{$service->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'price',
                    'duration',
                ],
            ]);
    }

    public function test_cannot_show_service_without_authentication()
    {
        $service = $this->createService($this->company, $this->authenticatedUser);

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/services/{$service->id}");

        $response->assertStatus(401);
    }

    public function test_can_update_service_with_authentication()
    {
        $service = $this->createService($this->company, $this->authenticatedUser);

        $updateData = [
            'name' => 'Updated Service',
            'price' => 150.00,
            'duration' => 90,
            'status' => true,
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/services/{$service->id}", $updateData);

        $response->assertStatus(200);

        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'name' => 'Updated Service',
        ]);

        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'name' => 'Updated Service',
        ]);
    }

    public function test_cannot_update_service_without_authentication()
    {
        $service = $this->createService($this->company, $this->authenticatedUser);

        $updateData = [
            'name' => 'Updated Service',
            'price' => 150.00,
            'duration' => 90,
            'status' => true,
        ];

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/services/{$service->id}", $updateData);

        $response->assertStatus(401);
    }

    public function test_can_delete_service_with_authentication()
    {
        $service = $this->createService($this->company, $this->authenticatedUser);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->deleteJson("/api/services/{$service->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('services', [
            'id' => $service->id,
        ]);
    }

    public function test_cannot_delete_service_without_authentication()
    {
        $service = $this->createService($this->company, $this->authenticatedUser);

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->deleteJson("/api/services/{$service->id}");

        $response->assertStatus(401);
    }

    public function test_service_creation_requires_name()
    {
        $serviceData = [
            'price' => 100.00,
            'duration' => 60,
            'status' => true,
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/services', $serviceData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_service_creation_requires_price()
    {
        $serviceData = [
            'name' => 'Test Service',
            'duration' => 60,
            'status' => true,
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/services', $serviceData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['price']);
    }

    public function test_service_creation_requires_duration()
    {
        $serviceData = [
            'name' => 'Test Service',
            'price' => 100.00,
            'status' => true,
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/services', $serviceData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['duration']);
    }
}
