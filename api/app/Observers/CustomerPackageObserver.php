<?php

namespace App\Observers;

use App\Models\CustomerPackage;

class CustomerPackageObserver
{
    public function creating(CustomerPackage $customerPackage): void
    {
        $customerPackage->company_id = app('company')->company()->id;
    }

    public function created(CustomerPackage $customerPackage): void
    {
        //
    }

    /**
     * Handle the CustomerPackage "updated" event.
     */
    public function updated(CustomerPackage $customerPackage): void
    {
        //
    }

    /**
     * Handle the CustomerPackage "deleted" event.
     */
    public function deleted(CustomerPackage $customerPackage): void
    {
        //
    }

    /**
     * Handle the CustomerPackage "restored" event.
     */
    public function restored(CustomerPackage $customerPackage): void
    {
        //
    }

    /**
     * Handle the CustomerPackage "force deleted" event.
     */
    public function forceDeleted(CustomerPackage $customerPackage): void
    {
        //
    }
}
