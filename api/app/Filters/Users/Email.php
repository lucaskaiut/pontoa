<?php

namespace App\Filters\Users;

class Email
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

        $this->query->where('email', 'like', '%' . $value . '%');
    }
}

