<?php

namespace App\Filters\Schedulings;

class Service
{
    protected $query;

    public function __construct($query)
    {
        $this->query = $query;
    }

    public function handle($value): void
    {
        $this->query->where('service_id', $value);
    }
}

