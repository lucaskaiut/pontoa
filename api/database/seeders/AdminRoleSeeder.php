<?php

namespace Database\Seeders;

use App\Constants\Permissions;
use App\Models\Company;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminRoleSeeder extends Seeder
{
    public function run(): void
    {
        $allPermissions = Permissions::all();

        Company::chunk(100, function ($companies) use ($allPermissions) {
            foreach ($companies as $company) {
                $role = Role::firstOrCreate(
                    [
                        'company_id' => $company->id,
                        'name' => 'Administrador',
                    ],
                    [
                        'description' => 'Perfil com acesso total ao sistema',
                        'permissions' => $allPermissions,
                    ]
                );

                if ($role->wasRecentlyCreated || !empty(array_diff($allPermissions, $role->permissions ?? []))) {
                    $role->update(['permissions' => $allPermissions]);
                }

                $users = User::where('company_id', $company->id)
                    ->where('type', 'admin')
                    ->get();

                foreach ($users as $user) {
                    if (!$user->roles()->where('roles.id', $role->id)->exists()) {
                        $user->roles()->attach($role->id);
                    }
                }
            }
        });
    }
}
