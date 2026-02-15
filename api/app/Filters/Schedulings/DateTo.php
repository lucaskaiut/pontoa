<?php

namespace App\Filters\Schedulings;

use Carbon\Carbon;

class DateTo
{
    protected $query;

    public function __construct($query)
    {
        $this->query = $query;
    }

    public function handle($value): void
    {
        $this->query->where('date', '<=', Carbon::parse($value));
    }
}