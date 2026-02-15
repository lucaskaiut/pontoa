<?php

namespace App\Contracts;

use App\DTOs\CreditCardData;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Service;
use Illuminate\Database\Eloquent\Model;

interface PaymentContract
{
    public function createCard(array $data, Model $owner): CreditCardData;

    public function createToken(array $data): string;

    public function billCompany(Company $company, ?float $amount = null);

    public function confirm(Customer $user, Service $service, array $data): array;

    public function confirmOrder(Customer $customer, Order $order, array $data): array;

    public function refund(string $paymentReference): bool;

    public function updatePaymentStatus(string $paymentReference): string;
}
