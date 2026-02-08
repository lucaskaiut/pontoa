<?php

namespace App\Filters\Users;

class Type
{
    protected $query;

    public function __construct($query)
    {
        $this->query = $query;
    }

    public function handle($value): void
    {
        $this->query->where('type', $value);
    }
}