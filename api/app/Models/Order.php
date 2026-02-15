<?php

namespace App\Models;

use App\Models\Scopes\CompanyScope;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'original_total_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::addGlobalScope(new CompanyScope);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function customerPackages()
    {
        return $this->hasMany(CustomerPackage::class);
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isNew(): bool
    {
        return $this->status === 'new';
    }

    public function canBeCanceled(): bool
    {
        return in_array($this->status, ['new', 'pending']);
    }

    public function isExpired(): bool
    {
        if (! $this->expires_at) {
            return false;
        }

        return $this->expires_at->isPast();
    }

    public function calculateTotal(): float
    {
        $total = $this->items()->sum('total_price');
        $this->update(['total_amount' => $total]);

        return (float) $total;
    }

    public function markAsPaid(string $paymentReference, string $paymentMethod): void
    {
        $this->update([
            'status' => 'paid',
            'payment_reference' => $paymentReference,
            'payment_method' => $paymentMethod,
            'paid_at' => Carbon::now(),
        ]);
    }

    public function syncPricesAndRecalculate(): void
    {
        if ($this->status !== 'new') {
            return;
        }

        $this->load('customer', 'items');

        $factory = new \App\Services\OrderItemFactory;
        $hasChanges = false;

        foreach ($this->items as $item) {
            $itemModel = $item->getItemModel();

            if (! $itemModel) {
                continue;
            }

            $currentPrice = $factory->getPrice($item->item_type, $itemModel);
            $originalPrice = $item->original_unit_price ?? $item->unit_price;

            if ((float) $originalPrice !== (float) $currentPrice) {
                $item->update([
                    'original_unit_price' => $currentPrice,
                    'original_total_price' => $currentPrice * $item->quantity,
                    'unit_price' => $currentPrice,
                    'total_price' => $currentPrice * $item->quantity,
                ]);
                $hasChanges = true;
            }
        }

        $discountService = new \App\Services\OrderDiscountService(
            new \App\Services\CustomerPackageService,
            new \App\Services\PackageResolver(new \App\Services\CustomerPackageService)
        );
        $discountService->applyPackageDiscounts($this->fresh(['customer', 'items']));
    }
}
