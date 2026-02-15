<?php

namespace Tests\Feature;

use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class ScheduleControllerTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupCompany();
        $this->setupAuthenticatedUser();
    }

    public function test_can_get_available_hours_publicly()
    {
        $service = $this->createService($this->company, $this->authenticatedUser);
        $tomorrow = now()->addDay();
        $dayOfWeek = $tomorrow->dayOfWeek;

        $schedule = $this->createSchedule($this->authenticatedUser, [
            'services' => [$service->id],
            'days' => (string) $dayOfWeek,
            'start_at' => '09:00:00',
            'end_at' => '18:00:00',
        ]);

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/schedules/hours?date='.urlencode($tomorrow->format('Y-m-d H:i')).'&service_id='.$service->id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'schedule',
                    'service',
                    'users',
                ],
            ]);
    }

    public function test_can_list_schedules_with_authentication()
    {
        $schedule = $this->createSchedule($this->authenticatedUser);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/schedules');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'days',
                        'start_at',
                        'end_at',
                    ],
                ],
            ]);
    }

    public function test_cannot_list_schedules_without_authentication()
    {
        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/schedules');

        $response->assertStatus(401);
    }

    public function test_can_create_schedule_with_authentication()
    {
        $service = $this->createService($this->company, $this->authenticatedUser);

        $scheduleData = [
            'days' => '0,1,2,3,4',
            'start_at' => '09:00:00',
            'end_at' => '18:00:00',
            'services' => [$service->id],
            'user_id' => $this->authenticatedUser->id,
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/schedules', $scheduleData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'days',
                    'start_at',
                    'end_at',
                ],
            ]);

        $this->assertDatabaseHas('schedules', [
            'days' => '0,1,2,3,4',
            'user_id' => $this->authenticatedUser->id,
            'company_id' => $this->company->id,
        ]);
    }

    public function test_cannot_create_schedule_without_authentication()
    {
        $scheduleData = [
            'days' => '0,1,2,3,4',
            'start_at' => '09:00:00',
            'end_at' => '18:00:00',
        ];

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/schedules', $scheduleData);

        $response->assertStatus(401);
    }

    public function test_can_show_schedule_with_authentication()
    {
        $schedule = $this->createSchedule($this->authenticatedUser);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/schedules/{$schedule->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'days',
                    'start_at',
                    'end_at',
                ],
            ]);
    }

    public function test_cannot_show_schedule_without_authentication()
    {
        $schedule = $this->createSchedule($this->authenticatedUser);

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/schedules/{$schedule->id}");

        $response->assertStatus(401);
    }

    public function test_can_update_schedule_with_authentication()
    {
        $service = $this->createService($this->company, $this->authenticatedUser);
        $schedule = $this->createSchedule($this->authenticatedUser, [
            'services' => [$service->id],
        ]);

        $updateData = [
            'days' => '1,2,3,4,5',
            'start_at' => '10:00:00',
            'end_at' => '19:00:00',
            'services' => [$service->id],
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/schedules/{$schedule->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'days',
                    'start_at',
                    'end_at',
                ],
            ])
            ->assertJson([
                'data' => [
                    'days' => '1,2,3,4,5',
                ],
            ]);

        $this->assertDatabaseHas('schedules', [
            'id' => $schedule->id,
            'days' => '1,2,3,4,5',
        ]);
    }

    public function test_cannot_update_schedule_without_authentication()
    {
        $schedule = $this->createSchedule($this->authenticatedUser);

        $updateData = [
            'days' => '1,2,3,4,5',
            'start_at' => '10:00:00',
            'end_at' => '19:00:00',
        ];

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/schedules/{$schedule->id}", $updateData);

        $response->assertStatus(401);
    }

    public function test_can_delete_schedule_with_authentication()
    {
        $schedule = $this->createSchedule($this->authenticatedUser);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->deleteJson("/api/schedules/{$schedule->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('schedules', [
            'id' => $schedule->id,
        ]);
    }

    public function test_cannot_delete_schedule_without_authentication()
    {
        $schedule = $this->createSchedule($this->authenticatedUser);

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->deleteJson("/api/schedules/{$schedule->id}");

        $response->assertStatus(401);
    }
}
