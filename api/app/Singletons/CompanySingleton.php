<?php

namespace App\Singletons;

use App\Models\Company;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Eloquent\Builder;

class CompanySingleton
{
    public Company $company;

    public function registerCompany(Company $company)
    {
        $this->company = $company;

        foreach ($this->modelsWithCompanyId() as $model) {
            $model::addGlobalScope('company_scope', function(Builder $builder) use ($company) {
                $builder->where('company_id', $company->id);
            });
        }
    }

    public function company(): Company
    {
        return $this->company;
    }

    private function modelsWithCompanyId(): array
    {
        $models = [];

        foreach (File::allFiles(app_path('Models')) as $file) {
            $relativePath = $file->getRelativePathname();
            $class = 'App\\Models\\' . strtr(substr($relativePath, 0, -4), '/', '\\');

            if (!class_exists($class)) {
                continue;
            }

            if (!is_subclass_of($class, Model::class) && !is_subclass_of($class, Authenticatable::class)) {
                continue;
            }

            if (is_subclass_of($class, Scope::class)) {
                continue;
            }

            $instance = new $class();

            if (Schema::hasColumn($instance->getTable(), 'company_id')) {
                $models[] = $class;
            }
        }

        return $models;
    }
}