<?php

namespace App\Observers;

use App\Models\Package;

class PackageObserver
{
    public function creating(Package $package): void
    {
        $package->company_id = app('company')->company()->id;
    }

    public function created(Package $package): void
    {
        //
    }

    /**
     * Handle the Package "updated" event.
     */
    public function updated(Package $package): void
    {
        //
    }

    /**
     * Handle the Package "deleted" event.
     */
    public function deleted(Package $package): void
    {
        //
    }

    /**
     * Handle the Package "restored" event.
     */
    public function restored(Package $package): void
    {
        //
    }

    /**
     * Handle the Package "force deleted" event.
     */
    public function forceDeleted(Package $package): void
    {
        //
    }
}
