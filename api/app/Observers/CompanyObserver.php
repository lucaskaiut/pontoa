<?php

namespace App\Observers;

use App\Models\Company;
use Illuminate\Support\Str;

class CompanyObserver
{
    public function creating(Company $company)
    {
        $company->domain = Str::slug($company->name) . '.pontoa.com.br';
        $company->parent_id = 1;
    }
}
