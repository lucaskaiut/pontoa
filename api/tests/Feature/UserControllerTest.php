<?php

namespace Tests\Feature;

use App\Constants\Permissions;
use App\Models\User;
use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupCompany();
    }

    public function test_can_register_user_with_company()
    {
        $registerData = [
            'company' => [
                'name' => 'Test Company',
                'email' => 'company@test.com',
                'phone' => '11999999999',
                'document' => $this->faker->cnpj(false),
                'plan_type' => 'basic',
                'plan_recurrence' => 'monthly',
            ],
            'user' => [
                'name' => 'Test User',
                'email' => 'user@test.com',
                'phone' => '11988888888',
                'document' => $this->faker->cpf(false),
                'password' => 'password123',
            ],
        ];

        $response = $this->postJson('/api/users/register', $registerData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'email',
                    'company' => [
                        'id',
                        'name',
                    ],
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'user@test.com',
        ]);

        $this->assertDatabaseHas('companies', [
            'email' => 'company@test.com',
        ]);
    }

    public function test_cannot_register_with_duplicate_email()
    {
        User::factory()->create([
            'email' => 'existing@test.com',
            'phone' => '11999999999',
            'document' => $this->faker->cpf(false),
            'type' => 'admin',
        ]);

        $registerData = [
            'company' => [
                'name' => 'Test Company',
                'email' => 'company@test.com',
                'phone' => '11999999999',
                'document' => $this->faker->cnpj(false),
            ],
            'user' => [
                'name' => 'Test User',
                'email' => 'existing@test.com',
                'phone' => '11988888888',
                'document' => $this->faker->cpf(false),
                'password' => 'password123',
            ],
        ];

        $response = $this->postJson('/api/users/register', $registerData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['user.email']);
    }

    public function test_can_login_with_valid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => 'password123',
            'type' => 'admin',
            'company_id' => $this->company->id,
            'phone' => '11999999999',
            'document' => $this->faker->cpf(false),
        ]);

        $response = $this->postJson('/api/users/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'token',
                'user' => [
                    'id',
                    'name',
                    'email',
                ],
            ])
            ->assertJson([
                'user' => [
                    'email' => 'test@example.com',
                ],
            ]);
    }

    public function test_cannot_login_with_invalid_credentials()
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
            'type' => 'admin',
            'company_id' => $this->company->id,
            'phone' => '11999999999',
            'document' => $this->faker->cpf(false),
        ]);

        $response = $this->postJson('/api/users/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(404);
    }

    public function test_superadmin_can_login()
    {
        $user = User::factory()->create([
            'email' => 'superadmin@example.com',
            'password' => 'password123',
            'type' => 'superadmin',
            'company_id' => $this->company->id,
            'phone' => '11999999999',
            'document' => $this->faker->cpf(false),
        ]);

        $response = $this->postJson('/api/users/login', [
            'email' => 'superadmin@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'token',
                'user' => [
                    'id',
                    'name',
                    'email',
                ],
            ])
            ->assertJson([
                'user' => [
                    'email' => 'superadmin@example.com',
                ],
            ]);
    }

    public function test_admin_can_login()
    {
        $user = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'password123',
            'type' => 'admin',
            'company_id' => $this->company->id,
            'phone' => '11999999999',
            'document' => $this->faker->cpf(false),
        ]);

        $response = $this->postJson('/api/users/login', [
            'email' => 'admin@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'token',
                'user' => [
                    'id',
                    'name',
                    'email',
                ],
            ]);
    }

    public function test_customer_cannot_login_via_user_endpoint()
    {
        $user = User::factory()->create([
            'email' => 'customer@example.com',
            'password' => 'password123',
            'type' => 'customer',
            'company_id' => $this->company->id,
            'phone' => '11999999999',
            'document' => $this->faker->cpf(false),
        ]);

        $response = $this->postJson('/api/users/login', [
            'email' => 'customer@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(404);
    }

    public function test_can_get_authenticated_user()
    {
        $this->setupAuthenticatedUser();

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/users/me');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'email',
                ],
            ]);
    }

    public function test_cannot_get_user_without_authentication()
    {
        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/users/me');

        $response->assertStatus(401);
    }

    public function test_can_list_users_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_USERS]);

        User::factory()->count(3)->create([
            'company_id' => $this->company->id,
            'type' => 'admin',
            'phone' => '11999999999',
            'document' => $this->faker->cpf(false),
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/users');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'email',
                    ],
                ],
            ]);
    }

    public function test_cannot_list_users_without_permission()
    {
        $role = $this->createAdminRole($this->company, []);
        $user = $this->createUserWithRole($this->company, $role);
        $token = $this->authenticateAs($user);

        $response = $this->withToken($token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/users');

        $response->assertStatus(403);
    }

    public function test_can_create_user_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_USERS]);

        $userData = [
            'name' => 'New User',
            'email' => 'newuser@test.com',
            'phone' => '11999999999',
            'document' => $this->faker->cpf(false),
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
                ],
            ])
            ->assertJson([
                'data' => [
                    'name' => 'New User',
                    'email' => 'newuser@test.com',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'newuser@test.com',
            'company_id' => $this->company->id,
        ]);
    }

    public function test_cannot_create_user_without_permission()
    {
        $role = $this->createAdminRole($this->company, []);
        $user = $this->createUserWithRole($this->company, $role);
        $token = $this->authenticateAs($user);

        $userData = [
            'name' => 'New User',
            'email' => 'newuser@test.com',
            'phone' => '11999999999',
            'document' => $this->faker->cpf(false),
            'password' => 'password123',
        ];

        $response = $this->withToken($token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/users', $userData);

        $response->assertStatus(403);
    }

    public function test_cannot_create_user_with_duplicate_email_in_company()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_USERS]);

        User::factory()->create([
            'email' => 'duplicate@test.com',
            'company_id' => $this->company->id,
            'phone' => $this->faker->numerify('###########'),
            'document' => $this->faker->cpf(false),
        ]);

        $userData = [
            'name' => 'New User',
            'email' => 'duplicate@test.com',
            'phone' => '11999999999',
            'document' => $this->faker->cpf(false),
            'password' => 'password123',
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/users', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_can_show_user_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_USERS]);

        $role = $this->createAdminRole($this->company);
        $user = $this->createUserWithRole($this->company, $role);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/users/{$user->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'email',
                ],
            ])
            ->assertJson([
                'data' => [
                    'id' => $user->id,
                ],
            ]);
    }

    public function test_cannot_show_user_without_permission()
    {
        $role = $this->createAdminRole($this->company, []);
        $authUser = $this->createUserWithRole($this->company, $role);
        $token = $this->authenticateAs($authUser);

        $role2 = $this->createAdminRole($this->company);
        $user = $this->createUserWithRole($this->company, $role2);

        $response = $this->withToken($token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/users/{$user->id}");

        $response->assertStatus(403);
    }

    public function test_can_update_user_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_USERS]);

        $role = $this->createAdminRole($this->company);
        $user = $this->createUserWithRole($this->company, $role);

        $updateData = [
            'name' => 'Updated Name',
            'email' => $user->email,
            'phone' => $user->phone,
            'document' => $user->document,
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/users/{$user->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'name' => 'Updated Name',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_cannot_update_user_without_permission()
    {
        $role = $this->createAdminRole($this->company, []);
        $authUser = $this->createUserWithRole($this->company, $role);
        $token = $this->authenticateAs($authUser);

        $role2 = $this->createAdminRole($this->company);
        $user = $this->createUserWithRole($this->company, $role2);

        $updateData = [
            'name' => 'Updated Name',
            'email' => $user->email,
            'phone' => $user->phone,
            'document' => $user->document,
        ];

        $response = $this->withToken($token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/users/{$user->id}", $updateData);

        $response->assertStatus(403);
    }

    public function test_can_delete_user_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_USERS]);

        $role = $this->createAdminRole($this->company);
        $user = $this->createUserWithRole($this->company, $role);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->deleteJson("/api/users/{$user->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('users', [
            'id' => $user->id,
        ]);
    }

    public function test_cannot_delete_user_without_permission()
    {
        $role = $this->createAdminRole($this->company, []);
        $authUser = $this->createUserWithRole($this->company, $role);
        $token = $this->authenticateAs($authUser);

        $role2 = $this->createAdminRole($this->company);
        $user = $this->createUserWithRole($this->company, $role2);

        $response = $this->withToken($token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->deleteJson("/api/users/{$user->id}");

        $response->assertStatus(403);
    }

    public function test_can_update_user_bank_with_permission()
    {
        \Illuminate\Support\Facades\Http::fake([
            'api.pagar.me/*' => \Illuminate\Support\Facades\Http::response([
                'id' => 'rec_test_123456789',
            ], 200),
        ]);

        $this->setupAuthenticatedUser([Permissions::MANAGE_USERS]);

        $role = $this->createAdminRole($this->company);
        $user = $this->createUserWithRole($this->company, $role);

        $bankData = [
            'bank' => '001',
            'branch_number' => '1234',
            'account_number' => '56789',
            'account_check_digit' => '0',
            'bank_account_type' => 'checking',
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/users/{$user->id}/bank", $bankData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'bank',
                    'branch_number',
                    'account_number',
                ],
            ]);
    }

    public function test_cannot_update_user_bank_without_permission()
    {
        \Illuminate\Support\Facades\Http::fake([
            'api.pagar.me/*' => \Illuminate\Support\Facades\Http::response([
                'id' => 'rec_test_123456789',
            ], 200),
        ]);

        $role = $this->createAdminRole($this->company, []);
        $authUser = $this->createUserWithRole($this->company, $role);
        $token = $this->authenticateAs($authUser);

        $role2 = $this->createAdminRole($this->company);
        $user = $this->createUserWithRole($this->company, $role2);

        $bankData = [
            'bank' => '001',
            'branch_number' => '1234',
            'account_number' => '56789',
            'account_check_digit' => '0',
            'bank_account_type' => 'checking',
        ];

        $response = $this->withToken($token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/users/{$user->id}/bank", $bankData);

        $response->assertStatus(403);
    }

    public function test_can_list_collaborators_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_USERS]);

        User::factory()->count(2)->create([
            'company_id' => $this->company->id,
            'is_collaborator' => true,
            'phone' => $this->faker->numerify('###########'),
            'document' => $this->faker->cpf(false),
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/collaborators');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'email',
                    ],
                ],
            ]);
    }

    public function test_cannot_list_collaborators_without_permission()
    {
        $role = $this->createAdminRole($this->company, []);
        $user = $this->createUserWithRole($this->company, $role);
        $token = $this->authenticateAs($user);

        $response = $this->withToken($token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/collaborators');

        $response->assertStatus(403);
    }

    public function test_cannot_update_user_type_via_request()
    {
        $this->setupAuthenticatedUser();
        
        $user = User::factory()->create([
            'company_id' => $this->company->id,
            'type' => 'admin',
            'phone' => $this->faker->numerify('###########'),
            'document' => $this->faker->cpf(false),
        ]);

        $originalType = $user->type;

        $updateData = [
            'name' => 'Updated Name',
            'type' => 'superadmin',
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/users/{$user->id}", $updateData);

        $response->assertStatus(200);

        $user->refresh();
        $this->assertEquals($originalType, $user->type);
        $this->assertEquals('Updated Name', $user->name);
    }

    public function test_cannot_create_user_with_type_in_request()
    {
        $this->setupAuthenticatedUser();
        
        $userData = [
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'phone' => $this->faker->numerify('###########'),
            'document' => $this->faker->cpf(false),
            'password' => 'password123',
            'type' => 'superadmin',
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/users', $userData);

        $response->assertStatus(201);

        $createdUser = User::where('email', 'testuser@example.com')->first();
        $this->assertNotNull($createdUser);
        $this->assertEquals('admin', $createdUser->type);
    }

    public function test_type_is_set_by_code_only()
    {
        $this->setupAuthenticatedUser();
        
        $userData = [
            'name' => 'Test User',
            'email' => 'testuser2@example.com',
            'phone' => $this->faker->numerify('###########'),
            'document' => $this->faker->cpf(false),
            'password' => 'password123',
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/users', $userData);

        $response->assertStatus(201);

        $createdUser = User::where('email', 'testuser2@example.com')->first();
        $this->assertNotNull($createdUser);
        $this->assertEquals('admin', $createdUser->type);
    }
}
