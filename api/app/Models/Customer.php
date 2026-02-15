<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;

class Customer extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'document',
        'status',
        'company_id',
        'should_reset_password',
        'first_access_token',
        'identifier',
        'context',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'status' => 'boolean',
        'should_reset_password' => 'boolean',
    ];

    protected function phone(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => preg_replace('/[^0-9]/', '', $value)
        );
    }

    protected function document(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => preg_replace('/[^0-9]/', '', $value)
        );
    }

    protected function password(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => $value ? Hash::make($value) : null
        );
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function schedulings()
    {
        return $this->hasMany(Scheduling::class, 'customer_id');
    }

    public function conversationContext()
    {
        return $this->hasOne(ConversationContext::class);
    }
}
