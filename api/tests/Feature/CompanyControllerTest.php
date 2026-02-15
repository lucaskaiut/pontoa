<?php

namespace Tests\Feature;

use App\Constants\Permissions;
use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class CompanyControllerTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupCompany();
    }

    public function test_can_get_company_info_publicly()
    {
        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/companies/me');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'email',
                ],
            ]);
    }

    public function test_can_get_recurrencies_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_PAYMENTS]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/companies/recurrencies');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [],
            ]);
    }

    public function test_cannot_get_recurrencies_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/companies/recurrencies');

        $response->assertStatus(403);
    }

    public function test_can_update_company_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_SETTINGS]);

        $updateData = [
            'name' => 'Updated Company Name',
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/companies/{$this->company->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                ],
            ]);
    }

    public function test_cannot_update_company_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $updateData = [
            'name' => 'Updated Company Name',
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/companies/{$this->company->id}", $updateData);

        $response->assertStatus(403);
    }

    public function test_can_get_cards_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_SETTINGS]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/companies/cards');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [],
            ]);
    }

    public function test_cannot_get_cards_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/companies/cards');

        $response->assertStatus(403);
    }

    public function test_can_configure_whatsapp_with_authentication()
    {
        $this->setupAuthenticatedUser();

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/companies/configure-whatsapp');

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [],
            ]);
    }

    public function test_can_get_whatsapp_qrcode_with_authentication()
    {
        $this->setupAuthenticatedUser();

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/companies/whatsapp-qrcode');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'qrcode',
                'connection_status',
            ]);
    }

    public function test_can_get_whatsapp_connection_status_with_authentication()
    {
        $this->setupAuthenticatedUser();

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/companies/whatsapp-connection-status');

        $response->assertStatus(200);
    }

    public function test_can_complete_onboarding_with_authentication()
    {
        $this->setupAuthenticatedUser();

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/companies/complete-onboarding');

        $response->assertStatus(200);

        $this->company->refresh();
        $this->assertEquals(1, $this->company->onboarding_completed);
    }

    public function test_can_cancel_subscription_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_SETTINGS]);

        $this->company->update([
            'plan_name' => 'basic',
            'plan_recurrence' => 'monthly',
            'subscription_status' => 'ACTIVE',
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/companies/cancel-subscription');

        $response->assertStatus(200);
    }

    public function test_can_reactivate_subscription_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_SETTINGS]);

        $this->company->update([
            'plan_name' => 'basic',
            'plan_recurrence' => 'monthly',
            'subscription_status' => 'CANCELED',
            'cancel_at_period_end' => true,
            'current_period_end' => now()->addDays(30),
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/companies/reactivate-subscription');

        $response->assertStatus(200);
    }
}
