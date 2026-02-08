<?php

namespace App\Observers;

use App\Models\Notification;

class NotificationObserver
{
    public function creating(Notification $notification)
    {
        $notification->company_id = app('company')->company->id;
    }

    public function created(Notification $notification)
    {
        //
    }

    public function updated(Notification $notification)
    {
        //
    }

    public function deleted(Notification $notification)
    {
        //
    }

    public function restored(Notification $notification)
    {
        //
    }

    public function forceDeleted(Notification $notification)
    {
        //
    }
}

