<?php

namespace App\Filters\Schedulings;

class Email
{
    protected $query;

    public function __construct($query)
    {
        $this->query = $query;
    }

    public function handle($value): void
    {
        $this->query->whereHas('customer', function ($query) use ($value) {
            $query->where('email', $value);
        });
    }
}