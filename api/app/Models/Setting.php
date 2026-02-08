<?php

namespace App\Models;

use App\Models\Scopes\CompanyScope;
use App\Utilities\FilterBuilder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function getValueAttribute($value)
    {
        $type = $this->attributes['type'] ?? 'text';

        return match ($type) {
            'int', 'integer' => (int) $value,
            'bool', 'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'float', 'double' => (float) $value,
            'array' => json_decode($value, true) ?? [],
            'json' => json_decode($value, true),
            'text', 'string' => $value,
            default => $value,
        };
    }

    public function setValueAttribute($value)
    {
        $type = $this->attributes['type'] ?? $this->getOriginal('type') ?? 'text';

        $this->attributes['value'] = match ($type) {
            'array', 'json' => is_string($value) ? $value : json_encode($value),
            'bool', 'boolean' => $value ? '1' : '0',
            default => (string) $value,
        };
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function scopeFilterBy($query, $filters)
    {
        $namespace = 'App\Filters\Settings';

        return (new FilterBuilder($query, $filters, $namespace))->apply();
    }
}
