<?php

namespace App\Services\Payments;

use App\Contracts\PaymentContract;
use App\DTOs\CreditCardData;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Service;
use App\Services\RequestLogService;
use App\Services\SettingService;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

abstract class PagarmeAbstract implements PaymentContract
{
    protected string $secretKey;

    protected string $url = 'https://api.pagar.me/core/v5';

    protected array $statuses = [];

    public function __construct()
    {
        $this->secretKey = app(SettingService::class)->get('pagarme_secret_key') ?? config('pagarme.secret_key');
    }

    abstract public function confirm(Customer $customer, Service $service, array $data): array;

    abstract public function confirmOrder(Customer $customer, Order $order, array $data): array;

    abstract public function createCard(array $data, Model $owner): CreditCardData;

    abstract public function createToken(array $data): string;

    abstract public function billCompany(Company $company, ?float $amount = null);

    public function refund(string $paymentReference): bool
    {
        $order = $this->execute("/orders/{$paymentReference}");

        $chargeId = $order['charges'][0]['id'];

        $response = $this->execute("/charges/{$chargeId}/refund", 'post');

        $statusInfo = $this->statuses[$response['status']] ?? null;

        return $statusInfo && $statusInfo['payment_status'] === 'canceled';
    }

    public function updatePaymentStatus(string $paymentReference): string
    {
        $response = $this->execute("/orders/{$paymentReference}");

        if (! isset($response['status'])) {
            return 'awaiting_payment';
        }

        $status = $response['status'];
        $statusInfo = $this->statuses[$status] ?? null;

        return $statusInfo ? $statusInfo['payment_status'] : 'awaiting_payment';
    }

    protected function createOrder($params)
    {
        $response = $this->execute('/orders', 'post', $params);

        $statusInfo = $this->statuses[$response['status']] ?? null;

        throw_if(! $statusInfo || ! $statusInfo['success'], new Exception('Não foi possível processar o pagamento', 422));

        return [
            'id' => (string) $response['id'],
            'payment_link' => null,
        ];
    }

    protected function getCustomer(string $document): ?string
    {
        $response = $this->execute("/customers?document=$document");

        return isset($response['data'][0]['id']) ? $response['data'][0]['id'] : null;
    }

    protected function createCustomer(Model $owner): string
    {
        $params = [
            'name' => $owner->name,
            'email' => $owner->email,
            'document' => $owner->document,
            'document_type' => strlen($owner->document) > 11 ? 'CNPJ' : 'CPF',
            'type' => strlen($owner->document) > 11 ? 'company' : 'individual',
            'phones' => [
                'home_phone' => [
                    'country_code' => '55',
                    'area_code' => substr(preg_replace('/[^0-9]/', '', $owner->phone), 0, 2),
                    'number' => substr(preg_replace('/[^0-9]/', '', $owner->phone), 2),
                ],
            ],
        ];

        $response = $this->execute('customers', 'post', $params);

        return $response['id'];
    }

    protected function execute(string $url, string $method = 'get', ?array $params = []): array
    {
        $request = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Authorization' => 'Basic '.base64_encode($this->secretKey.':'),
        ]);

        if ($params) {
            $request->withBody(json_encode($params), 'application/json');
        }

        $response = $request->$method($this->url.'/'.$url);

        (new RequestLogService)->create([
            'source' => $this::class,
            'method' => $method,
            'endpoint' => $this->url.'/'.$url,
            'body' => $response->json(),
            'params' => $params,
        ]);

        if ($response->failed()) {
            Log::error($this::class, ['url' => $this->url.'/'.$url, 'body' => $response->body(), 'params' => $params]);

            throw new \Exception('Houve um erro ao realizar seu cadastro');
        }

        return $response->json();
    }
}

