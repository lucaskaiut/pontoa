<?php

namespace App\Models;

use App\Models\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppointmentExecution extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'scheduled_start_at' => 'datetime',
        'scheduled_end_at' => 'datetime',
        'checked_in_at' => 'datetime',
        'checked_out_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::addGlobalScope(new CompanyScope);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Scheduling::class, 'appointment_id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function collaborator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'collaborator_id');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function calculateActualDuration(): ?int
    {
        if (!$this->checked_in_at || !$this->checked_out_at) {
            return null;
        }

        return $this->checked_in_at->diffInMinutes($this->checked_out_at);
    }
}

