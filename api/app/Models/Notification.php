<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'active' => 'boolean',
        'email_enabled' => 'boolean',
        'whatsapp_enabled' => 'boolean',
        'is_confirmation' => 'boolean',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function confirmationRequests()
    {
        return $this->hasMany(ConfirmationRequest::class);
    }
}

