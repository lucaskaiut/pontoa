<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class CompanyScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     *
     * @return void
     */
    public function apply(Builder $builder, Model $model)
    {
        $companySingleton = app('company');

        try {
            $reflection = new \ReflectionClass($companySingleton);
            $property = $reflection->getProperty('company');

            if (! $property->isInitialized($companySingleton)) {
                return;
            }

            $company = $companySingleton->company();

            if ($company) {
                $builder->where('company_id', $company->id);
            }
        } catch (\ReflectionException|\Error $e) {
            return;
        }
    }
}
