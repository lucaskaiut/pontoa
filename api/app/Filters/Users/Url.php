<?php

namespace App\Filters\Users;

class Url
{
    protected $query;

    public function __construct($query)
    {
        $this->query = $query;
    }

    public function handle($value): void
    {
        $this->query->where('url', $value);
    }
}

