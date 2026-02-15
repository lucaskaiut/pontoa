<?php

namespace App\Filters\Schedulings;

class User
{
    protected $query;

    public function __construct($query)
    {
        $this->query = $query;
    }

    public function handle($value): void
    {
        $this->query->where('user_id', $value);
    }
}