<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PackageUsage extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'used_at' => 'datetime',
    ];

    public function customerPackage()
    {
        return $this->belongsTo(CustomerPackage::class);
    }

    public function scheduling()
    {
        return $this->belongsTo(Scheduling::class, 'appointment_id');
    }
}
