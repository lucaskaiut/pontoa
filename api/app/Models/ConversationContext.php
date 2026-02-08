<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConversationContext extends Model
{
    protected $guarded = [];

    protected $casts = [
        'state_payload' => 'array',
        'locked_until' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function isLocked(): bool
    {
        if ($this->current_state === 'idle') {
            return false;
        }

        if ($this->locked_until === null) {
            return true;
        }

        return $this->locked_until->isFuture();
    }

    public function isExpired(): bool
    {
        if ($this->locked_until === null) {
            return false;
        }

        return $this->locked_until->isPast();
    }

    public function close(): void
    {
        $this->update([
            'current_state' => 'idle',
            'state_payload' => null,
            'locked_until' => null,
        ]);
    }

    public function setState(string $state, ?array $payload = null, ?Carbon $lockedUntil = null): void
    {
        $this->update([
            'current_state' => $state,
            'state_payload' => $payload,
            'locked_until' => $lockedUntil,
        ]);
    }
}
