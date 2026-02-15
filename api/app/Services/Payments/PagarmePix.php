<?php

namespace App\Services\Payments;

use App\DTOs\CreditCardData;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Service;
use Exception;
use Illuminate\Database\Eloquent\Model;

final class PagarmePix extends PagarmeAbstract
{
    protected array $statuses = [
        'waiting_payment' => ['success' => true, 'payment_status' => 'awaiting_payment'],
        'paid' => ['success' => true, 'payment_status' => 'paid'],
        'pending_refund' => ['success' => true, 'payment_status' => 'awaiting_payment'],
        'refunded' => ['success' => false, 'payment_status' => 'canceled'],
        'with_error' => ['success' => false, 'payment_status' => 'canceled'],
        'failed' => ['success' => false, 'payment_status' => 'canceled'],
    ];

    public function confirm(Customer $customer, Service $service, array $data): array
    {
        $params = [
            'customer' => [
                'name' => $customer->name,
                'email' => $customer->email,
                'document' => preg_replace('/[^0-9]/', '', $customer->document),
                'document_type' => 'CPF',
                'type' => 'individual',
                'phones' => [
                    'mobile_phone' => [
                        'country_code' => '55',
                        'area_code' => substr(preg_replace('/[^0-9]/', '', $customer->phone), 0, 2),
                        'number' => substr(preg_replace('/[^0-9]/', '', $customer->phone), 2),
                    ],
                ],
            ],
            'items' => [
                [
                    'amount' => (int) ($service->price * 100),
                    'description' => $service->name,
                    'quantity' => 1,
                    'code' => $service->id,
                ],
            ],
            'payments' => [
                [
                    'payment_method' => 'pix',
                    'pix' => [
                        'expires_in' => $data['expires_in'] ?? 3600,
                    ],
                    'amount' => (int) ($service->price * 100),
                ],
            ],
        ];

        return $this->createOrder($params);
    }

    public function confirmOrder(Customer $customer, Order $order, array $data): array
    {
        $items = [];
        foreach ($order->items as $item) {
            $items[] = [
                'amount' => (int) ($item->unit_price * 100),
                'description' => $item->description,
                'quantity' => $item->quantity,
                'code' => "{$item->item_type}_{$item->item_id}",
            ];
        }

        $params = [
            'customer' => [
                'name' => $customer->name,
                'email' => $customer->email,
                'document' => preg_replace('/[^0-9]/', '', $customer->document),
                'document_type' => 'CPF',
                'type' => 'individual',
                'phones' => [
                    'mobile_phone' => [
                        'country_code' => '55',
                        'area_code' => substr(preg_replace('/[^0-9]/', '', $customer->phone), 0, 2),
                        'number' => substr(preg_replace('/[^0-9]/', '', $customer->phone), 2),
                    ],
                ],
            ],
            'items' => $items,
            'payments' => [
                [
                    'payment_method' => 'pix',
                    'pix' => [
                        'expires_in' => $data['expires_in'] ?? 3600,
                    ],
                    'amount' => (int) ($order->total_amount * 100),
                ],
            ],
        ];

        return $this->createOrder($params);
    }

    protected function createOrder($params)
    {
        $response = $this->execute('/orders', 'post', $params);

        $statusInfo = $this->statuses[$response['status']] ?? null;

        throw_if(! $statusInfo || ! $statusInfo['success'], new Exception('Não foi possível processar o pagamento', 422));

        $paymentLink = null;
        if (isset($response['charges'][0]['last_transaction']['qr_code_url'])) {
            $paymentLink = $response['charges'][0]['last_transaction']['qr_code_url'];
        }

        return [
            'id' => (string) $response['id'],
            'payment_link' => $paymentLink,
        ];
    }

    public function billCompany(Company $company, ?float $amount = null)
    {
        throw new Exception('PIX não é suportado para cobrança recorrente de empresas');
    }

    public function createToken(array $data): string
    {
        throw new Exception('PIX não utiliza tokens de pagamento');
    }

    public function createCard(array $data, Model $owner): CreditCardData
    {
        throw new Exception('PIX não utiliza cartões de crédito');
    }
}

