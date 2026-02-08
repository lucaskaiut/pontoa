<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class UserStoreTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();

        $this->setupCompany();
        $this->setupAuthenticatedUser();
    }

    public function test_can_create_user()
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'phone' => '11999999999',
            'document' => '12345678901',
            'password' => 'password123',
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/users', $userData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'email',
                    'phone',
                    'document',
                    'company' => [
                        'id',
                        'name',
                    ],
                    'roles' => [],
                ],
            ])
            ->assertJson([
                'data' => [
                    'name' => 'Test User',
                    'email' => 'testuser@example.com',
                    'phone' => '11999999999',
                    'document' => '12345678901',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'testuser@example.com',
            'company_id' => $this->company->id,
            'type' => 'admin',
        ]);

        $createdUser = User::where('email', 'testuser@example.com')->first();
        $this->assertNotNull($createdUser);
        $this->assertEquals($this->company->id, $createdUser->company_id);
        $this->assertTrue($createdUser->roles->isEmpty());
    }
}
