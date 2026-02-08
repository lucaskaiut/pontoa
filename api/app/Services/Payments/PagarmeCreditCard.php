<?php

namespace App\Services\Payments;

use App\DTOs\CreditCardData;
use App\Models\Address;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use App\Services\SettingService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

final class PagarmeCreditCard extends PagarmeAbstract
{
    protected array $statuses = [
        'paid' => ['success' => true, 'payment_status' => 'paid'],
        'approved' => ['success' => true, 'payment_status' => 'paid'],
        'captured' => ['success' => true, 'payment_status' => 'paid'],
        'authorized' => ['success' => true, 'payment_status' => 'paid'],
        'processing' => ['success' => true, 'payment_status' => 'awaiting_payment'],
        'analyzing' => ['success' => true, 'payment_status' => 'awaiting_payment'],
        'pending_review' => ['success' => true, 'payment_status' => 'awaiting_payment'],
        'waiting_payment' => ['success' => true, 'payment_status' => 'awaiting_payment'],
        'pending_refund' => ['success' => true, 'payment_status' => 'awaiting_payment'],
        'authorized_pending_capture' => ['success' => true, 'payment_status' => 'awaiting_payment'],
        'partial_capture' => ['success' => true, 'payment_status' => 'awaiting_payment'],
        'waiting_capture' => ['success' => true, 'payment_status' => 'awaiting_payment'],
        'refunded' => ['success' => false, 'payment_status' => 'canceled'],
        'partial_refunded' => ['success' => false, 'payment_status' => 'canceled'],
        'partial_void' => ['success' => false, 'payment_status' => 'canceled'],
        'not_authorized' => ['success' => false, 'payment_status' => 'canceled'],
        'voided' => ['success' => false, 'payment_status' => 'canceled'],
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
                    'payment_method' => 'credit_card',
                    'credit_card' => [
                        'operation_type' => 'auth_and_capture',
                        'installments' => 1,
                        'statement_descriptor' => Str::limit(preg_replace('/[^a-zA-Z0-9\s]/', '', $service->company->name), 13, ''),
                        'card_token' => $data['card_token'],
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
                    'payment_method' => 'credit_card',
                    'credit_card' => [
                        'operation_type' => 'auth_and_capture',
                        'installments' => 1,
                        'statement_descriptor' => Str::limit(preg_replace('/[^a-zA-Z0-9\s]/', '', $order->company->name), 13, ''),
                        'card_token' => $data['card_token'],
                    ],
                    'amount' => (int) ($order->total_amount * 100),
                ],
            ],
        ];

        return $this->createOrder($params);
    }

    public function createReceiver(User $user)
    {
        if ($user->receiver_id) {
            return;
        }

        $params = [
            'name' => $user->name,
            'email' => $user->email,
            'document' => preg_replace('/[^0-9]/', '', $user->document),
            'type' => 'individual',
            'code' => time(),
            'default_bank_account' => [
                'holder_name' => $user->name,
                'bank' => $user->bank,
                'branch_number' => $user->branch_number,
                'account_number' => $user->account_number,
                'account_check_digit' => $user->account_check_digit,
                'holder_type' => 'individual',
                'holder_document' => preg_replace('/[^0-9]/', '', $user->document),
                'type' => $user->bank_account_type,
            ],
            'transfer_settings' => [
                'transfer_enabled' => true,
                'transfer_interval' => 'daily',
                'transfer_day' => '0',
            ],
        ];

        $request = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Authorization' => 'Basic '.base64_encode($this->secretKey.':'),
        ]);

        if ($params) {
            $request->withBody(json_encode($params), 'application/json');
        }

        /** @var \Illuminate\Http\Client\Response $response */
        $response = $request->post($this->url.'/recipients');

        $responseData = $response->json();

        $user = User::find($user->id);

        $user->receiver_id = $responseData['id'];

        $user->save();
    }

    public function billCompany(Company $company, ?float $amount = null)
    {
        $planService = app(\App\Services\PlanService::class);

        $plan = null;
        if ($company->plan_name && $company->plan_recurrence) {
            $plan = $planService->getPlanByTypeAndRecurrence(
                $company->plan_name,
                $company->plan_recurrence
            );
        }

        if (! $plan && $company->plan) {
            $legacyPlan = $company->plans($company->plan);
            if ($legacyPlan) {
                $plan = (object) [
                    'price' => $legacyPlan['price'],
                ];
            }
        }

        if (! $plan) {
            throw new \Exception('Plano não encontrado para a empresa');
        }

        $amountToCharge = $amount ?? $plan->price;

        $customerId = $this->getCustomer($company->document);

        if (! $customerId) {
            $customerId = $this->createCustomer($company);
        }

        $planCode = $company->plan_recurrence ?? $company->plan ?? 'monthly';

        $params = [
            'customer_id' => $customerId,
            'items' => [
                [
                    'amount' => (int) ($amountToCharge * 100),
                    'description' => 'Renovação automática do PontoA',
                    'quantity' => 1,
                    'code' => $planCode,
                ],
            ],
            'payments' => [
                [
                    'payment_method' => 'credit_card',
                    'credit_card' => [
                        'card_id' => $company->card()->external_id,
                    ],
                    'amount' => (int) ($amountToCharge * 100),
                ],
            ],
        ];

        return $this->createOrder($params);
    }

    public function createToken(array $data): string
    {
        $expYear = $data['exp_year'];
        if (strlen($expYear) === 2) {
            $expYear = '20'.$expYear;
        }

        $params = [
            'type' => 'card',
            'card' => [
                'number' => $data['number'],
                'holder_name' => $data['holder_name'],
                'holder_document' => preg_replace('/[^0-9]/', '', $data['holder_document']),
                'exp_month' => $data['exp_month'],
                'exp_year' => $expYear,
                'cvv' => $data['cvv'],
            ],
        ];

        $publicKey = app(SettingService::class)->get('pagarme_public_key') ?? config('pagarme.public_key');
        $response = $this->execute('/tokens?appId='.$publicKey, 'post', $params);

        return $response['id'];
    }

    public function createCard(array $data, Model $owner): CreditCardData
    {
        $customerId = $data['customerId'] ?? null;

        if (! $customerId) {
            $customerId = $this->getCustomer($owner->document);

            if (! $customerId) {
                $customerId = $this->createCustomer($owner);
            }
        }

        if (isset($data['token'])) {
            $params = [
                'token' => $data['token'],
            ];
        } else {
            $expYear = $data['exp_year'] ?? '';
            if (strlen($expYear) === 2) {
                $expYear = '20'.$expYear;
            }

            $params = [
                'holder_name' => $data['holder_name'],
                'holder_document' => $data['holder_document'],
                'number' => $data['number'],
                'exp_month' => $data['exp_month'],
                'exp_year' => $expYear,
                'cvv' => $data['cvv'],
            ];
        }

        $billingAddress = [
            'line_1' => '',
            'line_2' => '',
            'zip_code' => '',
            'city' => '',
            'state' => '',
            'country' => 'BR',
        ];

        if (isset($data['address_id'])) {
            $address = Address::find($data['address_id']);
            if ($address) {
                $line1 = $address->address.', '.$address->number;
                $billingAddress = [
                    'line_1' => $line1,
                    'line_2' => $address->complement ?? '',
                    'zip_code' => preg_replace('/[^0-9]/', '', $address->postcode),
                    'city' => $address->city,
                    'state' => strtoupper($address->region),
                    'country' => 'BR',
                ];
            }
        }

        $params['billing_address'] = $billingAddress;

        $response = $this->execute("/customers/{$customerId}/cards", 'post', $params);

        return new CreditCardData([
            'source' => 'App\Services\Payments\PagarmeCreditCard',
            'external_id' => $response['id'],
        ]);
    }
}
