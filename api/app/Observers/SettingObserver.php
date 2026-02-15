<?php

namespace App\Observers;

use App\Models\Setting;

class SettingObserver
{
    public function creating(Setting $setting)
    {
        $setting->company_id = app('company')->company()->id;
    }
}
