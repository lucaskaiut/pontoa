<?php

namespace App\Observers;

use App\Models\RequestLog;

class RequestLogObserver
{
    /**
     * Handle the RequestLog "creating" event.
     *
     * @param  \App\Models\RequestLog  $requestLog
     * @return void
     */
    public function creating(RequestLog $requestLog)
    {
        $requestLog->company_id = app('company')->company->id;
    }
}
