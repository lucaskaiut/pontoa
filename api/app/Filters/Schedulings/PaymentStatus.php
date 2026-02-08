<?php

namespace App\Filters\Schedulings;

class PaymentStatus
{
    protected $query;

    public function __construct($query)
    {
        $this->query = $query;
    }

    public function handle($value): void
    {
        $this->query->where('payment_status', $value);
    }
}
