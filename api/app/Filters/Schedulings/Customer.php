<?php

namespace App\Filters\Schedulings;

class Customer
{
    protected $query;

    public function __construct($query)
    {
        $this->query = $query;
    }

    public function handle($value): void
    {
        $this->query->where('customer_id', $value);
    }
}