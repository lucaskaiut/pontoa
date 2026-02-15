<?php

namespace Tests\Feature;

use App\Constants\Permissions;
use App\Models\AppointmentExecution;
use App\Models\Company;
use App\Models\Scheduling;
use Carbon\Carbon;
use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class AppointmentExecutionControllerTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupCompany();
        $this->setupAuthenticatedUser();
    }

    public function test_can_check_in_appointment_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_APPOINTMENT_EXECUTIONS]);
        $this->authenticatedUser->update(['is_collaborator' => true]);

        $service = $this->createService($this->company, $this->authenticatedUser);
        $customer = $this->createCustomer($this->company);

        $scheduling = Scheduling::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'user_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'date' => now()->subMinutes(10),
            'price' => 100.00,
            'cost' => 50.00,
            'status' => 'confirmed',
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson("/api/schedulings/{$scheduling->id}/check-in");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'checked_in_at',
                    'status',
                ],
            ]);

        $this->assertDatabaseHas('appointment_executions', [
            'appointment_id' => $scheduling->id,
            'status' => 'in_progress',
        ]);
    }

    public function test_cannot_check_in_without_permission()
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
            'status' => 'confirmed',
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson("/api/schedulings/{$scheduling->id}/check-in");

        $response->assertStatus(403);
    }

    public function test_can_check_in_multiple_times()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_APPOINTMENT_EXECUTIONS]);
        $this->authenticatedUser->update(['is_collaborator' => true]);

        $service = $this->createService($this->company, $this->authenticatedUser);
        $customer = $this->createCustomer($this->company);

        $scheduling = Scheduling::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'user_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'date' => now()->subMinutes(10),
            'price' => 100.00,
            'cost' => 50.00,
            'status' => 'confirmed',
        ]);

        $firstResponse = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson("/api/schedulings/{$scheduling->id}/check-in");

        $firstResponse->assertStatus(200);

        $secondResponse = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson("/api/schedulings/{$scheduling->id}/check-in");

        $secondResponse->assertStatus(200);

        $executionsCount = AppointmentExecution::where('appointment_id', $scheduling->id)->count();
        $this->assertEquals(2, $executionsCount);
    }

    public function test_can_check_out_after_check_in()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_APPOINTMENT_EXECUTIONS]);
        $this->authenticatedUser->update(['is_collaborator' => true]);

        $service = $this->createService($this->company, $this->authenticatedUser);
        $customer = $this->createCustomer($this->company);

        $scheduling = Scheduling::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'user_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'date' => now()->subMinutes(10),
            'price' => 100.00,
            'cost' => 50.00,
            'status' => 'confirmed',
        ]);

        $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson("/api/schedulings/{$scheduling->id}/check-in");

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson("/api/schedulings/{$scheduling->id}/check-out");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'checked_in_at',
                    'checked_out_at',
                    'actual_duration_minutes',
                    'status',
                ],
            ]);

        $this->assertDatabaseHas('appointment_executions', [
            'appointment_id' => $scheduling->id,
            'status' => 'completed',
        ]);
    }

    public function test_cannot_check_out_without_check_in()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_APPOINTMENT_EXECUTIONS]);
        $this->authenticatedUser->update(['is_collaborator' => true]);

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
            ->postJson("/api/schedulings/{$scheduling->id}/check-out");

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Não é possível realizar check-out sem check-in prévio',
            ]);
    }

    public function test_cannot_check_out_same_execution_twice()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_APPOINTMENT_EXECUTIONS]);
        $this->authenticatedUser->update(['is_collaborator' => true]);

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

        $checkInResponse = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson("/api/schedulings/{$scheduling->id}/check-in");

        $executionId = $checkInResponse->json('data.id');

        $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson("/api/schedulings/{$scheduling->id}/check-out");

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson("/api/schedulings/{$scheduling->id}/check-out");

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Check-out já realizado para esta execução',
            ]);
    }

    public function test_check_out_calculates_actual_duration()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_APPOINTMENT_EXECUTIONS]);
        $this->authenticatedUser->update(['is_collaborator' => true]);

        $service = $this->createService($this->company, $this->authenticatedUser);
        $customer = $this->createCustomer($this->company);

        $scheduling = Scheduling::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'user_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'date' => now()->subMinutes(10),
            'price' => 100.00,
            'cost' => 50.00,
            'status' => 'confirmed',
        ]);

        $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson("/api/schedulings/{$scheduling->id}/check-in");

        sleep(2);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson("/api/schedulings/{$scheduling->id}/check-out");

        $response->assertStatus(200);
        $execution = AppointmentExecution::where('appointment_id', $scheduling->id)->first();
        $this->assertNotNull($execution->actual_duration_minutes);
        $this->assertGreaterThan(0, $execution->actual_duration_minutes);
    }

    public function test_can_show_last_execution()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_APPOINTMENT_EXECUTIONS]);

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

        AppointmentExecution::create([
            'appointment_id' => $scheduling->id,
            'company_id' => $this->company->id,
            'collaborator_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'scheduled_start_at' => now(),
            'scheduled_end_at' => now()->addMinutes(30),
            'status' => 'pending',
        ]);

        $lastExecution = AppointmentExecution::create([
            'appointment_id' => $scheduling->id,
            'company_id' => $this->company->id,
            'collaborator_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'scheduled_start_at' => now(),
            'scheduled_end_at' => now()->addMinutes(30),
            'status' => 'completed',
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/schedulings/{$scheduling->id}/execution");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'appointment_id',
                    'status',
                ],
            ]);

        $this->assertEquals($lastExecution->id, $response->json('data.id'));
    }

    public function test_can_show_all_executions()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_APPOINTMENT_EXECUTIONS]);

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

        AppointmentExecution::create([
            'appointment_id' => $scheduling->id,
            'company_id' => $this->company->id,
            'collaborator_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'scheduled_start_at' => now(),
            'scheduled_end_at' => now()->addMinutes(30),
            'status' => 'pending',
        ]);

        AppointmentExecution::create([
            'appointment_id' => $scheduling->id,
            'company_id' => $this->company->id,
            'collaborator_id' => $this->authenticatedUser->id,
            'service_id' => $service->id,
            'scheduled_start_at' => now(),
            'scheduled_end_at' => now()->addMinutes(30),
            'status' => 'completed',
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/schedulings/{$scheduling->id}/execution?all=true");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'appointment_id',
                        'status',
                    ],
                ],
            ]);

        $this->assertCount(2, $response->json('data'));
    }

    public function test_checks_tenant_isolation()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_APPOINTMENT_EXECUTIONS]);
        $this->authenticatedUser->update(['is_collaborator' => true]);

        $otherCompanyDomain = 'other-company-'.uniqid().'.pontoa.com.br';
        $otherCompany = Company::create([
            'name' => 'Other Company',
            'email' => 'other@example.com',
            'phone' => '11999999999',
            'document' => '12345678901234',
            'domain' => $otherCompanyDomain,
            'active' => true,
        ]);

        $service = $this->createService($otherCompany, $this->authenticatedUser);
        $customer = $this->createCustomer($otherCompany);

        $scheduling = Scheduling::create([
            'company_id' => $otherCompany->id,
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
            ->postJson("/api/schedulings/{$scheduling->id}/check-in");

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Atendimento não pertence à empresa do usuário',
            ]);
    }
}

