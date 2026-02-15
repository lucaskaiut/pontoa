<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'appointment_id',
        'customer_id',
        'score',
        'comment',
        'classification',
        'is_public',
        'sent_to_google',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'sent_to_google' => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Scheduling::class, 'appointment_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public static function classifyScore(int $score): string
    {
        if ($score >= 9) {
            return 'promoter';
        }

        if ($score >= 7) {
            return 'neutral';
        }

        return 'detractor';
    }
}
