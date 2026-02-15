<?php

namespace App\Filters\Settings;

class IsPublic
{
    protected $query;

    public function __construct($query)
    {
        $this->query = $query;
    }

    public function handle($value = null): void
    {
        $this->query->where('is_public', filter_var($value, FILTER_VALIDATE_BOOLEAN));
    }
}
