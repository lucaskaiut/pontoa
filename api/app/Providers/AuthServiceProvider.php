<?php

namespace App\Providers;

// use Illuminate\Support\Facades\Gate;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
    ];

    public function boot()
    {
        Gate::define('update-customer', function ($user, Customer $customer) {
            if ($user instanceof Customer) {
                return $user->id === $customer->id;
            }
            if ($user instanceof User) {
                return true;
            }
            return false;
        });

        Gate::define('delete-customer', function ($user, Customer $customer) {
            return $user instanceof User;
        });

        Gate::define('show-customer', function ($user, Customer $customer) {
            if ($user instanceof Customer) {
                return $user->id === $customer->id;
            }
            if ($user instanceof User) {
                return true;
            }
            return false;
        });
    }
}
