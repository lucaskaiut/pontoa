<?php

namespace App\Services;

use App\Constants\Permissions;
use App\Models\Role;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class RoleService
{
    public function create(array $data): Role
    {
        $permissions = $data['permissions'] ?? [];
        unset($data['permissions']);

        $validatedPermissions = $this->validatePermissions($permissions);
        $data['permissions'] = $validatedPermissions;

        return Role::create($data);
    }

    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Role::query();

        if (isset($filters['company_id'])) {
            $query->where('company_id', $filters['company_id']);
        }

        if (isset($filters['sort'])) {
            $parts = explode(',', $filters['sort']);
            $column = $parts[0] ?? null;
            $direction = strtoupper($parts[1] ?? 'ASC');

            if ($column && in_array($direction, ['ASC', 'DESC'])) {
                $allowedColumns = ['name', 'description', 'created_at', 'updated_at'];
                if (in_array($column, $allowedColumns)) {
                    $query->orderBy($column, $direction);
                }
            }
        } else {
            $query->orderBy('created_at', 'DESC');
        }

        return $query->paginate();
    }

    public function findOrFail(int $id): Role
    {
        return Role::findOrFail($id);
    }

    public function update(Role $role, array $data): Role
    {
        $permissions = $data['permissions'] ?? null;
        unset($data['permissions']);

        if ($permissions !== null) {
            $data['permissions'] = $this->validatePermissions($permissions);
        }

        $role->update($data);

        return $role;
    }

    public function delete(Role $role): void
    {
        $role->delete();
    }

    private function validatePermissions(array $permissions): array
    {
        $validPermissions = Permissions::all();
        return array_intersect($permissions, $validPermissions);
    }
}

