<?php

namespace App\Observers;

use App\Models\Customer;
use App\Services\CustomerService;

class CustomerObserver
{
    public function creating(Customer $customer)
    {
        $customer->company_id = app('company')->company->id;
    }

    public function created(Customer $customer)
    {
        (new CustomerService())->dispatchFirstAccessEmail($customer);
    }
}




