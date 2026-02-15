<?php

namespace App\Filters\Users;

class Name
{
    protected $query;

    public function __construct($query)
    {
        $this->query = $query;
    }

    public function handle($value): void
    {
        if (empty($value)) {
            return;
        }

        $this->query->where('name', 'like', '%' . $value . '%');
    }
}

