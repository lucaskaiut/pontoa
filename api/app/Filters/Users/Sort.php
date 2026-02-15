<?php

namespace App\Filters\Users;

class Sort
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

        $parts = explode(',', $value);
        $column = $parts[0] ?? null;
        $direction = strtoupper($parts[1] ?? 'ASC');

        if (!$column || !in_array($direction, ['ASC', 'DESC'])) {
            return;
        }

        $allowedColumns = ['name', 'email', 'created_at', 'updated_at'];
        
        if (in_array($column, $allowedColumns)) {
            $this->query->orderBy($column, $direction);
        }
    }
}

