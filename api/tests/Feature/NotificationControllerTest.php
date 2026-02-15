<?php

namespace Tests\Feature;

use App\Constants\Permissions;
use App\Models\Notification;
use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class NotificationControllerTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupCompany();
        $this->setupAuthenticatedUser([Permissions::MANAGE_NOTIFICATIONS]);
    }

    public function test_can_list_notifications_with_permission()
    {
        Notification::create([
            'company_id' => $this->company->id,
            'time_before' => 24,
            'time_unit' => 'hours',
            'message' => 'Test message',
            'active' => true,
            'email_enabled' => true,
            'whatsapp_enabled' => false,
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/notifications');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'message',
                    ],
                ],
            ]);
    }

    public function test_cannot_list_notifications_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/notifications');

        $response->assertStatus(403);
    }

    public function test_can_create_notification_with_permission()
    {
        $notificationData = [
            'time_before' => 24,
            'time_unit' => 'hours',
            'message' => 'Notification message',
            'active' => true,
            'email_enabled' => true,
            'whatsapp_enabled' => false,
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/notifications', $notificationData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'message',
                ],
            ]);

        $this->assertDatabaseHas('notifications', [
            'message' => 'Notification message',
            'company_id' => $this->company->id,
        ]);
    }

    public function test_cannot_create_notification_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $notificationData = [
            'time_before' => 24,
            'time_unit' => 'hours',
            'message' => 'Notification message',
            'active' => true,
            'email_enabled' => true,
            'whatsapp_enabled' => false,
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/notifications', $notificationData);

        $response->assertStatus(403);
    }

    public function test_can_show_notification_with_permission()
    {
        $notification = Notification::create([
            'company_id' => $this->company->id,
            'time_before' => 24,
            'time_unit' => 'hours',
            'message' => 'Test message',
            'active' => true,
            'email_enabled' => true,
            'whatsapp_enabled' => false,
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/notifications/{$notification->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'message',
                ],
            ]);
    }

    public function test_can_update_notification_with_permission()
    {
        $notification = Notification::create([
            'company_id' => $this->company->id,
            'time_before' => 24,
            'time_unit' => 'hours',
            'message' => 'Test message',
            'active' => true,
            'email_enabled' => true,
            'whatsapp_enabled' => false,
        ]);

        $updateData = [
            'time_before' => 48,
            'time_unit' => 'hours',
            'message' => 'Updated message',
            'active' => true,
            'email_enabled' => true,
            'whatsapp_enabled' => true,
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/notifications/{$notification->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'message' => 'Updated message',
                ],
            ]);
    }

    public function test_can_delete_notification_with_permission()
    {
        $notification = Notification::create([
            'company_id' => $this->company->id,
            'time_before' => 24,
            'time_unit' => 'hours',
            'message' => 'Test message',
            'active' => true,
            'email_enabled' => true,
            'whatsapp_enabled' => false,
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->deleteJson("/api/notifications/{$notification->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('notifications', [
            'id' => $notification->id,
        ]);
    }
}
