<?php

namespace App\Http\Controllers;

use App\Constants\Permissions;
use App\Http\Resources\RoleCollection;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use App\Services\RoleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    private RoleService $service;

    public function __construct(RoleService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $this->authorizePermission(Permissions::MANAGE_ROLES);

        $filters = $request->all();
        $filters['company_id'] = app('company')->company->id;

        $roles = $this->service->list($filters);

        return new RoleCollection($roles);
    }

    public function store(Request $request)
    {
        $this->authorizePermission(Permissions::MANAGE_ROLES);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|in:' . implode(',', \App\Constants\Permissions::all()),
        ]);

        return DB::transaction(function () use ($validated) {
            $validated['company_id'] = app('company')->company->id;
            $role = $this->service->create($validated);

            return new RoleResource($role);
        });
    }

    public function show(Role $role)
    {
        $this->authorizePermission(Permissions::MANAGE_ROLES);

        return new RoleResource($this->service->findOrFail($role->id));
    }

    public function update(Request $request, Role $role)
    {
        $this->authorizePermission(Permissions::MANAGE_ROLES);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|in:' . implode(',', \App\Constants\Permissions::all()),
        ]);

        return DB::transaction(function () use ($role, $validated) {
            $role = $this->service->update($role, $validated);

            return new RoleResource($role);
        });
    }

    public function destroy(Role $role)
    {
        $this->authorizePermission(Permissions::MANAGE_ROLES);

        return DB::transaction(function () use ($role) {
            $this->service->delete($role);

            return response()->json([], 204);
        });
    }
}
