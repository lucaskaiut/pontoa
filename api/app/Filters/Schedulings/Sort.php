<?php

namespace App\Filters\Schedulings;

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

        $allowedColumns = ['date', 'status', 'payment_status', 'created_at', 'updated_at'];
        
        if (in_array($column, $allowedColumns)) {
            $this->query->orderBy($column, $direction);
        }
    }
}

