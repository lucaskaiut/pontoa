<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\Log;

class Company extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function cards(): MorphMany
    {
        return $this->morphMany(Card::class, 'owner');
    }

    public function requestLogs(): HasMany
    {
        return $this->hasMany(RequestLog::class);
    }

    public function card()
    {
        return Card::where('id', $this->card_id)->first();
    }

    public function recurrencies(): HasMany
    {
        return $this->hasMany(CompanyRecurrency::class);
    }

    public function plans(?string $plan = null): ?array
    {
        $plans = [
            'monthly' => [
                'name' => 'Mensal',
                'free' => 7,
                'days' => 30,
                'price' => 50,
            ],
            'quarterly' => [
                'name' => 'Trimestral',
                'free' => 14,
                'days' => 90,
                'price' => 120,
            ],
            'yearly' => [
                'name' => 'Anual',
                'free' => 30,
                'days' => 365,
                'price' => 500,
            ],
        ];

        return $plan ? $plans[$plan] ?? null : $plans;
    }

    protected function phone(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => preg_replace('/[^0-9]/', '', $value)
        );
    }

    protected function supportPhone(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => $value ? preg_replace('/[^0-9]/', '', $value) : null
        );
    }

    protected function document(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => preg_replace('/[^0-9]/', '', $value)
        );
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function invitations()
    {
        return $this->hasMany(Invitation::class);
    }

    public function services()
    {
        return $this->hasMany(Service::class);
    }

    public function addresses()
    {
        return $this->morphMany(Address::class, 'model');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Company::class, 'parent_id');
    }

    public function scopeChildrenOf($query, int $parentId)
    {
        return $query->where('parent_id', $parentId);
    }
}
