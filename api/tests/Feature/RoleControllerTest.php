<?php

namespace Tests\Feature;

use App\Constants\Permissions;
use App\Models\Role;
use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class RoleControllerTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupCompany();
        $this->setupAuthenticatedUser([Permissions::MANAGE_ROLES]);
    }

    public function test_can_list_roles_with_permission()
    {
        Role::create([
            'company_id' => $this->company->id,
            'name' => 'Role 1',
            'permissions' => [],
        ]);
        Role::create([
            'company_id' => $this->company->id,
            'name' => 'Role 2',
            'permissions' => [],
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/roles');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'permissions',
                    ],
                ],
            ]);
    }

    public function test_cannot_list_roles_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/roles');

        $response->assertStatus(403);
    }

    public function test_can_create_role_with_permission()
    {
        $roleData = [
            'name' => 'Test Role',
            'description' => 'Test role description',
            'permissions' => [Permissions::MANAGE_USERS],
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/roles', $roleData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'permissions',
                ],
            ])
            ->assertJson([
                'data' => [
                    'name' => 'Test Role',
                ],
            ]);

        $this->assertDatabaseHas('roles', [
            'name' => 'Test Role',
            'company_id' => $this->company->id,
        ]);
    }

    public function test_cannot_create_role_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $roleData = [
            'name' => 'Test Role',
            'permissions' => [Permissions::MANAGE_USERS],
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/roles', $roleData);

        $response->assertStatus(403);
    }

    public function test_can_show_role_with_permission()
    {
        $role = Role::create([
            'company_id' => $this->company->id,
            'name' => 'Test Role',
            'permissions' => [],
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/roles/{$role->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'permissions',
                ],
            ]);
    }

    public function test_cannot_show_role_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $role = Role::create([
            'company_id' => $this->company->id,
            'name' => 'Test Role',
            'permissions' => [],
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/roles/{$role->id}");

        $response->assertStatus(403);
    }

    public function test_can_update_role_with_permission()
    {
        $role = Role::create([
            'company_id' => $this->company->id,
            'name' => 'Test Role',
            'permissions' => [],
        ]);

        $updateData = [
            'name' => 'Updated Role',
            'description' => 'Updated description',
            'permissions' => [Permissions::MANAGE_USERS, Permissions::MANAGE_CUSTOMERS],
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/roles/{$role->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'name' => 'Updated Role',
                ],
            ]);

        $this->assertDatabaseHas('roles', [
            'id' => $role->id,
            'name' => 'Updated Role',
        ]);
    }

    public function test_cannot_update_role_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $role = Role::create([
            'company_id' => $this->company->id,
            'name' => 'Test Role',
            'permissions' => [],
        ]);

        $updateData = [
            'name' => 'Updated Role',
            'permissions' => [Permissions::MANAGE_USERS],
        ];

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/roles/{$role->id}", $updateData);

        $response->assertStatus(403);
    }

    public function test_can_delete_role_with_permission()
    {
        $role = Role::create([
            'company_id' => $this->company->id,
            'name' => 'Test Role',
            'permissions' => [],
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->deleteJson("/api/roles/{$role->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('roles', [
            'id' => $role->id,
        ]);
    }

    public function test_cannot_delete_role_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $role = Role::create([
            'company_id' => $this->company->id,
            'name' => 'Test Role',
            'permissions' => [],
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->deleteJson("/api/roles/{$role->id}");

        $response->assertStatus(403);
    }

    public function test_can_list_permissions()
    {
        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/permissions');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'permissions' => [
                    '*' => [
                        'name',
                        'label',
                    ],
                ],
            ]);
    }

    public function test_cannot_list_permissions_without_authentication()
    {
        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/permissions');

        $response->assertStatus(401);
    }
}
