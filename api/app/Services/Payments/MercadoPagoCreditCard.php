<?php

namespace App\Services\Payments;

use App\Contracts\PaymentContract;
use App\DTOs\CreditCardData;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Service;
use App\Services\RequestLogService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

final class MercadoPagoCreditCard implements PaymentContract
{
    private $url = 'https://api.mercadopago.com/v1';

    public function billCompany(Company $company, ?float $amount = null)
    {
        // $params = $this->billCompanyParams($company, $amount);

        // $this->bill($params);

        return (string) Str::uuid();
    }

    public function createToken(array $data): string
    {
        $settings = json_decode(config('app.payment_method', '{}'), true);
        $publicKey = $settings['public']['public_key'] ?? $settings['public_key'] ?? null;

        throw_if(! $publicKey, new \Exception('Chave pública do Mercado Pago não configurada'));

        $params = [
            'card_number' => $data['number'],
            'cardholder' => [
                'name' => $data['holder_name'],
                'identification' => [
                    'type' => strlen(preg_replace('/[^0-9]/', '', $data['holder_document'])) > 11 ? 'CNPJ' : 'CPF',
                    'number' => preg_replace('/[^0-9]/', '', $data['holder_document']),
                ],
            ],
            'card_expiration_month' => $data['exp_month'],
            'card_expiration_year' => $data['exp_year'],
            'security_code' => $data['cvv'],
        ];

        $request = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-Idempotency-Key' => Str::uuid()->toString(),
        ])->post('https://api.mercadopago.com/v1/card_tokens?public_key='.$publicKey, $params);

        (new RequestLogService)->create([
            'source' => $this::class,
            'method' => 'post',
            'endpoint' => 'https://api.mercadopago.com/v1/card_tokens',
            'body' => $request->json(),
            'params' => $params,
        ]);

        throw_if($request->failed(), new \Exception('Houve um erro ao criar o token do cartão'));

        $response = $request->json();

        return $response['id'];
    }

    public function createCard(array $data, Model $owner): CreditCardData
    {
        $company = app('company')->company();

        $response = $this->execute('customers/search?email='.$owner->email, $company);
        $customer = $response['results'][0] ?? null;

        if (! $customer) {
            $customer = $this->execute('customers', $company, 'post', ['email' => $owner->email]);
        }

        $card = $this->execute('customers/'.$customer['id'].'/cards', $company, 'post', ['token' => $data['token']]);

        return new CreditCardData([
            'source' => 'App\Services\Payments\MercadoPagoCreditCard',
            'external_id' => $card['id'],
        ]);
    }

    public function confirm(Customer $customer, Service $service, array $data): array
    {
        $id = (string) Str::uuid();
        return [
            'id' => $id,
            'payment_link' => null,
        ];
    }

    public function confirmOrder(Customer $customer, Order $order, array $data): array
    {
        $id = (string) Str::uuid();
        return [
            'id' => $id,
            'payment_link' => null,
        ];
    }

    public function refund(string $paymentReference): bool
    {
        $company = app('company')->company();
        $response = $this->execute("payments/{$paymentReference}/refunds", $company, 'post');

        return isset($response['status']) && $response['status'] === 'refunded';
    }

    public function updatePaymentStatus(string $paymentReference): string
    {
        return 'awaiting_payment';
    }

    private function execute(string $endpoint, $company, string $method = 'get', ?array $params = []): array
    {
        $settings = [];

        if (request()->get('use_platform_payment', false)) {
            $settings = json_decode(config('app.payment_method', '{}'), true);
            $settings['access_token'] = $settings['private']['access_token'];
            $settings['public_key'] = $settings['public']['public_key'];
        }

        $request = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer '.$settings['access_token'],
        ]);

        if ($params) {
            $request->withBody(json_encode($params), 'application/json');
        }

        $response = $request->$method($this->url.'/'.$endpoint);

        (new RequestLogService)->create([
            'source' => $this::class,
            'method' => $method,
            'endpoint' => $this->url.'/'.$endpoint,
            'body' => $response->json(),
            'params' => $params,
        ]);

        throw_if($response->failed(), new \Exception('Houve um erro ao realizar seu cadastro'));

        return $response->json();
    }

    private function billCompanyParams(Company $company): array
    {
        $planService = app(\App\Services\PlanService::class);

        // Get plan using new system or fallback to legacy
        $plan = null;
        if ($company->plan_name && $company->plan_recurrence) {
            $plan = $planService->getPlanByTypeAndRecurrence(
                $company->plan_name,
                $company->plan_recurrence
            );
        }

        // Fallback to legacy
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

        $legacyPlan = $company->plans($company->plan ?? 'monthly') ?? ['price' => $plan->price];
        $response = $this->execute('customers/search?email='.$company->email, $company);
        $customer = $response['results'][0] ?? null;

        throw_if(! $customer, new \Exception('Não foi possível efetuar o pagamento'));

        $params = [
            'installments' => '',
            'payer' => [],
            'token' => '',
            'transaction_amount' => '',
        ];

        return $params;
    }

    private function bill(array $params) {}
}
