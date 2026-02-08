<?php

namespace Tests\Feature;

use App\Constants\Permissions;
use App\Models\Customer;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class CustomerControllerTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupCompany();
    }

    public function test_can_register_customer()
    {
        $customerData = [
            'name' => 'Test Customer',
            'email' => 'customer@test.com',
            'phone' => '11999999999',
            'document' => $this->faker->cpf(false),
            'password' => 'password123',
        ];

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/customers/register', $customerData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'email',
                ],
            ]);

        $this->assertDatabaseHas('customers', [
            'email' => 'customer@test.com',
            'company_id' => $this->company->id,
        ]);
    }

    public function test_can_register_customer_without_password()
    {
        $customerData = [
            'name' => 'Test Customer',
            'email' => 'customer@test.com',
            'phone' => '11999999999',
            'document' => $this->faker->cpf(false),
        ];

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/customers/register', $customerData);

        $response->assertStatus(201);

        $customer = Customer::where('email', 'customer@test.com')->first();
        $this->assertNotNull($customer->first_access_token);
        $this->assertTrue($customer->should_reset_password);
    }

    public function test_cannot_register_customer_with_duplicate_email_in_company()
    {
        Customer::factory()->create([
            'email' => 'existing@test.com',
            'company_id' => $this->company->id,
        ]);

        $customerData = [
            'name' => 'Test Customer',
            'email' => 'existing@test.com',
            'phone' => '11999999999',
            'document' => $this->faker->cpf(false),
            'password' => 'password123',
        ];

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/customers/register', $customerData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_can_login_customer_with_valid_credentials()
    {
        $customer = $this->createCustomer($this->company, [
            'email' => 'customer@test.com',
            'password' => 'password123',
        ]);

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/customers/login', [
                'email' => 'customer@test.com',
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

    public function test_cannot_login_customer_with_invalid_credentials()
    {
        $this->createCustomer($this->company, [
            'email' => 'customer@test.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/customers/login', [
                'email' => 'customer@test.com',
                'password' => 'wrongpassword',
            ]);

        $response->assertStatus(404);
    }

    public function test_cannot_login_customer_without_password_set()
    {
        $customer = $this->createCustomer($this->company, [
            'email' => 'customer@test.com',
            'password' => null,
            'should_reset_password' => true,
            'first_access_token' => Str::uuid(),
        ]);

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/customers/login', [
                'email' => 'customer@test.com',
                'password' => 'password123',
            ]);

        $response->assertStatus(404);
    }

    public function test_can_complete_first_access()
    {
        $token = Str::uuid();
        $customer = $this->createCustomer($this->company, [
            'email' => 'customer@test.com',
            'password' => null,
            'should_reset_password' => true,
            'first_access_token' => $token,
        ]);

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->postJson("/api/customers/first-access/{$token}", [
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
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

        $customer->refresh();
        $this->assertFalse($customer->should_reset_password);
        $this->assertNull($customer->first_access_token);
    }

    public function test_cannot_complete_first_access_with_invalid_token()
    {
        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/customers/first-access/invalid-token', [
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ]);

        $response->assertStatus(404);
    }

    public function test_can_update_customer_profile()
    {
        $customer = $this->createCustomer($this->company);

        $updateData = [
            'name' => 'Updated Name',
            'email' => $customer->email,
            'phone' => $customer->phone,
            'document' => $customer->document,
        ];

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/customers/{$customer->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'name' => 'Updated Name',
                ],
            ]);
    }

    public function test_can_get_authenticated_customer()
    {
        $customer = $this->createCustomer($this->company);
        $token = $this->authenticateAsCustomer($customer);

        $response = $this->withToken($token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/customers/me');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'email',
                ],
            ]);
    }

    public function test_cannot_get_customer_without_authentication()
    {
        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/customers/me');

        $response->assertStatus(401);
    }

    public function test_can_list_customers_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_CUSTOMERS]);

        Customer::factory()->count(3)->create(['company_id' => $this->company->id]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/customers');

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

    public function test_cannot_list_customers_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/customers');

        $response->assertStatus(403);
    }

    public function test_can_show_customer_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_CUSTOMERS]);

        $customer = $this->createCustomer($this->company);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/customers/{$customer->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'email',
                ],
            ]);
    }

    public function test_cannot_show_customer_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $customer = $this->createCustomer($this->company);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/customers/{$customer->id}");

        $response->assertStatus(403);
    }

    public function test_can_update_customer_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_CUSTOMERS]);

        $customer = $this->createCustomer($this->company);

        $updateData = [
            'name' => 'Updated Name',
            'email' => $customer->email,
            'phone' => $customer->phone,
            'document' => $customer->document,
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/customers/{$customer->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'name' => 'Updated Name',
                ],
            ]);
    }

    public function test_cannot_update_customer_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $customer = $this->createCustomer($this->company);

        $updateData = [
            'name' => 'Updated Name',
            'email' => $customer->email,
            'phone' => $customer->phone,
            'document' => $customer->document,
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/customers/{$customer->id}", $updateData);

        $response->assertStatus(403);
    }

    public function test_can_delete_customer_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_CUSTOMERS]);

        $customer = $this->createCustomer($this->company);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->deleteJson("/api/customers/{$customer->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('customers', [
            'id' => $customer->id,
        ]);
    }

    public function test_cannot_delete_customer_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $customer = $this->createCustomer($this->company);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->deleteJson("/api/customers/{$customer->id}");

        $response->assertStatus(403);
    }

    public function test_can_update_customer_notes_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_CUSTOMERS]);

        $customer = $this->createCustomer($this->company);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/customers/{$customer->id}/notes", [
                'notes' => 'Customer notes here',
            ]);

        $response->assertStatus(200);
    }

    public function test_cannot_update_customer_notes_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $customer = $this->createCustomer($this->company);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/customers/{$customer->id}/notes", [
                'notes' => 'Customer notes here',
            ]);

        $response->assertStatus(403);
    }

    public function test_can_update_customer_context()
    {
        $identifier = '11999999999';

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/customers/context/{identifier}', [
                'context' => 'test context',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'context',
                ],
            ]);
    }

    public function test_can_get_customer_context()
    {
        $identifier = '11999999999';
        $customer = $this->createCustomer($this->company, [
            'phone' => $identifier,
            'context' => 'existing context',
        ]);

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/customers/context/$identifier");

        $response->assertStatus(200)
            ->assertJson([
                'identifier' => $identifier,
                'context' => 'existing context',
            ]);
    }
}
