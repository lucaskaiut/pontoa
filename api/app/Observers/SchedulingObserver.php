<?php

namespace App\Observers;

use App\Events\SchedulingConfirmed;
use App\Models\Scheduling;
use App\Services\SettingService;
use Illuminate\Support\Facades\Event;

class SchedulingObserver
{
    public function creating(Scheduling $scheduling)
    {
        $scheduling->company_id = app('company')->company()->id;

        if (!app(SettingService::class)->get('scheduling_require_checkout')) {
            $scheduling->payment_status = 'paid';
        }
    }

    public function updated(Scheduling $scheduling)
    {
        if ($scheduling->wasChanged('status') && $scheduling->status === 'confirmed') {
            Event::dispatch(new SchedulingConfirmed($scheduling));
        }
    }
}
