<?php

namespace Tests\Feature;

use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class PaymentControllerTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupCompany();
    }

    public function test_can_create_payment_token_publicly()
    {
        \Illuminate\Support\Facades\Http::fake([
            'api.pagar.me/*' => \Illuminate\Support\Facades\Http::response([
                'id' => 'tok_test_123456789',
            ], 200),
        ]);

        $paymentData = [
            'method' => 'pagarmeCreditCard',
            'number' => '4111111111111111',
            'holder_name' => 'Test User',
            'holder_document' => '12345678901',
            'exp_month' => '12',
            'exp_year' => '2025',
            'cvv' => '123',
        ];

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/payments/token', $paymentData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'token',
            ]);
    }

    public function test_payment_token_creation_requires_method()
    {
        $paymentData = [
            'number' => '4111111111111111',
            'holder_name' => 'Test User',
            'holder_document' => '12345678901',
            'exp_month' => '12',
            'exp_year' => '2025',
            'cvv' => '123',
        ];

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/payments/token', $paymentData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['method']);
    }

    public function test_payment_token_creation_requires_card_number()
    {
        $paymentData = [
            'method' => 'pagarmeCreditCard',
            'holder_name' => 'Test User',
            'holder_document' => '12345678901',
            'exp_month' => '12',
            'exp_year' => '2025',
            'cvv' => '123',
        ];

        $response = $this->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/payments/token', $paymentData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['number']);
    }
}
