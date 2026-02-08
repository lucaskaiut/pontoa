<?php

namespace App\Http\Middleware;

use App\Models\Scheduling;
use App\Models\User;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class EnableGlobalScopes
{
    private array $models = [
        User::class,
        Scheduling::class,
    ];

    public function handle(Request $request, Closure $next)
    {
        foreach ($this->models as $model) {
            $model::addGlobalScope('company_scope', function(Builder $builder) {
                $builder->where('company_id', app('company')->company()->id);
            });
        }

        return $next($request);
    }
}