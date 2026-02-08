<?php

namespace Tests\Feature;

use App\Constants\Permissions;
use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class SettingControllerTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupCompany();
    }

    public function test_can_list_public_settings_without_authentication()
    {
        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/settings');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [],
            ]);
    }

    public function test_can_list_all_settings_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_SETTINGS]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/settings');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [],
            ]);
    }

    public function test_can_store_settings_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_SETTINGS]);

        $settingsData = [
            'schedule_interval' => 30,
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/settings', $settingsData);

        $response->assertStatus(201);
    }

    public function test_cannot_store_settings_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $settingsData = [
            'schedule_interval' => 30,
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/settings', $settingsData);

        $response->assertStatus(403);
    }

    public function test_cannot_store_settings_as_customer()
    {
        $customer = $this->createCustomer($this->company);
        $token = $this->authenticateAsCustomer($customer);

        $settingsData = [
            'schedule_interval' => 30,
        ];

        $response = $this->withToken($token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/settings', $settingsData);

        $response->assertStatus(403);
    }
}
