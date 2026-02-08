<?php

namespace App\Models;

use App\Models\Scopes\UserScope;
use App\Utilities\FilterBuilder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Scheduling extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'date' => 'datetime',
    ];

    protected static function booted()
    {
        static::addGlobalScope(new UserScope);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function confirmationRequests()
    {
        return $this->hasMany(ConfirmationRequest::class);
    }

    public function customerPackage()
    {
        return $this->belongsTo(CustomerPackage::class);
    }

    public function packageUsage()
    {
        return $this->hasOne(PackageUsage::class, 'appointment_id');
    }

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class, 'order_item_id');
    }

    public function order()
    {
        return $this->hasOneThrough(Order::class, OrderItem::class, 'id', 'id', 'order_item_id', 'order_id');
    }

    public function executions()
    {
        return $this->hasMany(AppointmentExecution::class, 'appointment_id');
    }

    public function scopeFilterBy($query, $filters)
    {
        $namespace = 'App\Filters\Schedulings';

        return (new FilterBuilder($query, $filters, $namespace))->apply();
    }
}
