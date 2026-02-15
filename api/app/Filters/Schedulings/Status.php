<?php

namespace App\Filters\Schedulings;

class Status
{
    protected $query;

    public function __construct($query)
    {
        $this->query = $query;
    }

    public function handle($value): void
    {
        $this->query->whereIn('status', explode(',', $value));
    }
}