<?php

namespace Tests\Feature;

use App\Models\Invitation;
use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class InvitationControllerTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupCompany();
        $this->setupAuthenticatedUser();
    }

    public function test_can_list_invitations_with_authentication()
    {
        Invitation::create([
            'company_id' => $this->company->id,
            'user_id' => $this->authenticatedUser->id,
            'email' => 'invited@test.com',
            'token' => \Illuminate\Support\Str::uuid(),
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/invitations');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'email',
                    ],
                ],
            ]);
    }

    public function test_cannot_list_invitations_without_authentication()
    {
        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/invitations');

        $response->assertStatus(401);
    }

    public function test_can_create_invitation_with_authentication()
    {
        $invitationData = [
            'email' => 'newinvite@test.com',
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/invitations', $invitationData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'email',
                ],
            ]);

        $this->assertDatabaseHas('invitations', [
            'email' => 'newinvite@test.com',
            'company_id' => $this->company->id,
        ]);
    }

    public function test_can_show_invitation_with_authentication()
    {
        $invitation = Invitation::create([
            'company_id' => $this->company->id,
            'user_id' => $this->authenticatedUser->id,
            'email' => 'invited@test.com',
            'token' => \Illuminate\Support\Str::uuid(),
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/invitations/{$invitation->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'email',
                ],
            ]);
    }

    public function test_can_delete_invitation_with_authentication()
    {
        $invitation = Invitation::create([
            'company_id' => $this->company->id,
            'user_id' => $this->authenticatedUser->id,
            'email' => 'invited@test.com',
            'token' => \Illuminate\Support\Str::uuid(),
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->deleteJson("/api/invitations/{$invitation->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('invitations', [
            'id' => $invitation->id,
        ]);
    }

    public function test_can_register_via_invitation_token()
    {
        $token = \Illuminate\Support\Str::uuid();
        $invitation = Invitation::create([
            'company_id' => $this->company->id,
            'user_id' => $this->authenticatedUser->id,
            'email' => 'invited@test.com',
            'token' => $token,
        ]);

        $registerData = [
            'name' => 'New User',
            'phone' => '11999999999',
            'document' => $this->faker->cpf(false),
            'password' => 'password123',
        ];

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->postJson("/api/invitations/register/{$token}", $registerData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'email',
                ],
            ]);

        $invitation->refresh();
        $this->assertNotNull($invitation->accepted_at);
    }

    public function test_cannot_register_with_invalid_invitation_token()
    {
        $registerData = [
            'name' => 'New User',
            'phone' => '11999999999',
            'document' => $this->faker->cpf(false),
            'password' => 'password123',
        ];

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/invitations/register/invalid-token', $registerData);

        $response->assertStatus(500);
    }
}
