<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchedulingNotification extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    public function scheduling()
    {
        return $this->belongsTo(Scheduling::class);
    }

    public function notification()
    {
        return $this->belongsTo(Notification::class);
    }
}

