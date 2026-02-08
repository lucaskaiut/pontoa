<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'original_unit_price' => 'decimal:2',
        'original_total_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'metadata' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function scheduling()
    {
        return $this->hasOne(Scheduling::class, 'order_item_id');
    }

    public function isSchedulingType(): bool
    {
        return $this->item_type === 'scheduling';
    }

    public function getSchedulingData(): ?array
    {
        if (!$this->isSchedulingType() || !$this->metadata) {
            return null;
        }

        return $this->metadata;
    }

    public function calculateTotal(): float
    {
        $total = $this->unit_price * $this->quantity;
        $this->update(['total_price' => $total]);

        return (float) $total;
    }

    public function getItemModel()
    {
        if ($this->item_type === 'scheduling') {
            return $this->scheduling;
        }

        $modelClass = match ($this->item_type) {
            'package' => Package::class,
            'service' => Service::class,
            default => null,
        };

        if (! $modelClass) {
            return null;
        }

        return $modelClass::find($this->item_id);
    }
}
