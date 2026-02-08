<?php

namespace App\Services\Payments;

use App\Contracts\PaymentContract;
use App\DTOs\CreditCardData;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Service;
use Exception;
use Illuminate\Database\Eloquent\Model;

final class FreeOrder implements PaymentContract
{
    public function createCard(array $data, Model $owner): CreditCardData
    {
        throw new Exception('FreeOrder não utiliza cartões de crédito');
    }

    public function createToken(array $data): string
    {
        throw new Exception('FreeOrder não utiliza tokens de pagamento');
    }

    public function billCompany(Company $company, ?float $amount = null)
    {
        throw new Exception('FreeOrder não é suportado para cobrança recorrente de empresas');
    }

    public function confirm(Customer $customer, Service $service, array $data): array
    {
        return [
            'id' => 'free_order_' . time(),
            'payment_link' => null,
        ];
    }

    public function confirmOrder(Customer $customer, Order $order, array $data): array
    {
        return [
            'id' => 'free_order_' . $order->id . '_' . time(),
            'payment_link' => null,
        ];
    }

    public function refund(string $paymentReference): bool
    {
        return true;
    }

    public function updatePaymentStatus(string $paymentReference): string
    {
        return 'paid';
    }
}
