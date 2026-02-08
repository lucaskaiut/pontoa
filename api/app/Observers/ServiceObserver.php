<?php

namespace App\Observers;

use App\Models\Service;
use Illuminate\Support\Facades\Auth;

class ServiceObserver
{
    public function creating(Service $service)
    {
        $service->company_id = app('company')->company->id;

        $user = Auth::user();
        if (! $service->user_id && $user && ! $user instanceof \App\Models\Customer) {
            $service->user_id = $user->id;
        }
    }

    /**
     * Handle the Service "created" event.
     *
     * @return void
     */
    public function created(Service $service)
    {
        //
    }

    /**
     * Handle the Service "updated" event.
     *
     * @return void
     */
    public function updated(Service $service)
    {
        //
    }

    /**
     * Handle the Service "deleted" event.
     *
     * @return void
     */
    public function deleted(Service $service)
    {
        //
    }

    /**
     * Handle the Service "restored" event.
     *
     * @return void
     */
    public function restored(Service $service)
    {
        //
    }

    /**
     * Handle the Service "force deleted" event.
     *
     * @return void
     */
    public function forceDeleted(Service $service)
    {
        //
    }
}
