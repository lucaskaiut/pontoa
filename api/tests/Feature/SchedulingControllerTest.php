<?php

namespace Tests\Feature;

use App\Constants\Permissions;
use App\Models\Scheduling;
use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class SchedulingControllerTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupCompany();
        $this->setupAuthenticatedUser();
    }

    public function test_can_create_scheduling_publicly()
    {
        $service = $this->createService($this->company, $this->authenticatedUser);
        $schedule = $this->createSchedule($this->authenticatedUser, [
            'services' => [$service->id],
            'days' => (string) now()->addDay()->dayOfWeek,
            'start_at' => '09:00:00',
            'end_at' => '18:00:00',
        ]);
        $customer = $this->createCustomer($this->company);

        $tomorrow = now()->addDay();
        $availableHour = '09:00';
        $schedulingData = [
            'service_id' => $service->id,
            'customer_id' => $customer->id,
            'date' => $tomorrow->format('Y-m-d').' '.$availableHour,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
        ];

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/schedulings', $schedulingData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'date',
                    'status',
                ],
            ]);
    }

    public function test_can_list_schedulings_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_SCHEDULINGS]);

        $service = $this->createService($this->company, $this->authenticatedUser);
        $customer = $this->createCustomer($this->company);

        Scheduling::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'user_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'date' => now(),
            'price' => 100.00,
            'cost' => 50.00,
            'status' => 'pending',
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/schedulings');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'date',
                        'status',
                    ],
                ],
            ]);
    }

    public function test_cannot_list_schedulings_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/schedulings');

        $response->assertStatus(403);
    }

    public function test_can_show_scheduling_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_SCHEDULINGS]);

        $service = $this->createService($this->company, $this->authenticatedUser);
        $customer = $this->createCustomer($this->company);

        $scheduling = Scheduling::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'user_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'date' => now(),
            'price' => 100.00,
            'cost' => 50.00,
            'status' => 'pending',
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/schedulings/{$scheduling->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'date',
                    'status',
                ],
            ]);
    }

    public function test_cannot_show_scheduling_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $service = $this->createService($this->company, $this->authenticatedUser);
        $customer = $this->createCustomer($this->company);

        $scheduling = Scheduling::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'user_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'date' => now(),
            'price' => 100.00,
            'cost' => 50.00,
            'status' => 'pending',
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/schedulings/{$scheduling->id}");

        $response->assertStatus(403);
    }

    public function test_can_update_scheduling_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_SCHEDULINGS]);

        $service = $this->createService($this->company, $this->authenticatedUser);
        $customer = $this->createCustomer($this->company);

        $scheduling = Scheduling::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'user_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'date' => now(),
            'price' => 100.00,
            'cost' => 50.00,
            'status' => 'pending',
        ]);

        $updateData = [
            'date' => now()->addDays(2)->format('Y-m-d H:i'),
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/schedulings/{$scheduling->id}", $updateData);

        $response->assertStatus(200);
    }

    public function test_cannot_update_scheduling_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $service = $this->createService($this->company, $this->authenticatedUser);
        $customer = $this->createCustomer($this->company);

        $scheduling = Scheduling::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'user_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'date' => now(),
            'price' => 100.00,
            'cost' => 50.00,
            'status' => 'pending',
        ]);

        $updateData = [
            'date' => now()->addDays(2)->format('Y-m-d H:i'),
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/schedulings/{$scheduling->id}", $updateData);

        $response->assertStatus(403);
    }

    public function test_can_delete_scheduling_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_SCHEDULINGS]);

        $service = $this->createService($this->company, $this->authenticatedUser);
        $customer = $this->createCustomer($this->company);

        $scheduling = Scheduling::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'user_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'date' => now(),
            'price' => 100.00,
            'cost' => 50.00,
            'status' => 'pending',
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->deleteJson("/api/schedulings/{$scheduling->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('schedulings', [
            'id' => $scheduling->id,
        ]);
    }

    public function test_cannot_delete_scheduling_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $service = $this->createService($this->company, $this->authenticatedUser);
        $customer = $this->createCustomer($this->company);

        $scheduling = Scheduling::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'user_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'date' => now(),
            'price' => 100.00,
            'cost' => 50.00,
            'status' => 'pending',
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->deleteJson("/api/schedulings/{$scheduling->id}");

        $response->assertStatus(403);
    }

    public function test_can_cancel_scheduling_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_SCHEDULINGS]);

        $service = $this->createService($this->company, $this->authenticatedUser);
        $customer = $this->createCustomer($this->company);

        $scheduling = Scheduling::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'user_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'date' => now(),
            'price' => 100.00,
            'cost' => 50.00,
            'status' => 'pending',
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson("/api/schedulings/{$scheduling->id}/cancel");

        $response->assertStatus(200);
    }

    public function test_can_confirm_scheduling_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_SCHEDULINGS]);

        $service = $this->createService($this->company, $this->authenticatedUser);
        $customer = $this->createCustomer($this->company);

        $scheduling = Scheduling::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'user_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'date' => now(),
            'price' => 100.00,
            'cost' => 50.00,
            'status' => 'pending',
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson("/api/schedulings/{$scheduling->id}/confirm");

        $response->assertStatus(200);
    }

    public function test_can_mark_scheduling_as_no_show_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_SCHEDULINGS]);

        $service = $this->createService($this->company, $this->authenticatedUser);
        $customer = $this->createCustomer($this->company);

        $scheduling = Scheduling::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'user_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'date' => now(),
            'price' => 100.00,
            'cost' => 50.00,
            'status' => 'confirmed',
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson("/api/schedulings/{$scheduling->id}/no-show");

        $response->assertStatus(200);
    }
}
