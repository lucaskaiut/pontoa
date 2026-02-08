<?php

namespace App\Traits;

use App\Models\Customer;
use App\Models\User;
use App\Constants\Permissions;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;

trait HasPermissions
{
    protected function authorizePermission(string $permission): void
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return;
        }

        if ($user instanceof Customer) {
            return;
        }

        if ($user instanceof User && !$user->hasPermission($permission)) {
            throw new HttpResponseException(
                response()->json(['message' => 'Acesso negado. Permissão necessária: ' . $permission], 403)
            );
        }
    }

    protected function authorizeAnyPermission(array $permissions): void
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return;
        }

        if ($user instanceof Customer) {
            return;
        }

        if ($user instanceof User && !$user->hasAnyPermission($permissions)) {
            throw new HttpResponseException(
                response()->json(['message' => 'Acesso negado. Permissão necessária.'], 403)
            );
        }
    }
}

