<?php

namespace App\Filters\Users;

class CreatedAtFrom
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

        $this->query->where('created_at', '>=', $value);
    }
}

