<?php

namespace App\Models\Scopes;

use App\Constants\Permissions;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class UserScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user || $user instanceof Customer) {
            return;
        }

        if ($user->type === 'customer') {
            return;
        }

        if (!$user->hasPermission(Permissions::MANAGE_OTHER_USER_INFORMATIONS)) {
            if (Schema::hasColumn($model->getTable(), 'user_id')) {
                $builder->where('user_id', $user->id);
            }
        }
    }
}

