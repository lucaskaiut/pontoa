<?php

namespace Tests\Feature;

use App\Constants\Permissions;
use App\Models\Order;
use Tests\Concerns\WithCompanySetup;
use Tests\TestCase;

class OrderControllerTest extends TestCase
{
    use WithCompanySetup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupCompany();
        $this->setupAuthenticatedUser();
    }

    public function test_can_get_cart_as_customer()
    {
        $customer = $this->createCustomer($this->company);
        $token = $this->authenticateAsCustomer($customer);

        Order::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'status' => 'new',
            'total_amount' => 0,
        ]);

        $response = $this->withToken($token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/cart');

        $response->assertStatus(200);
    }

    public function test_cannot_get_cart_as_admin()
    {
        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/cart');

        $response->assertStatus(500);
    }

    public function test_can_add_item_to_cart_as_customer()
    {
        $customer = $this->createCustomer($this->company);
        $token = $this->authenticateAsCustomer($customer);
        $service = $this->createService($this->company, $this->authenticatedUser);

        $response = $this->withToken($token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson('/api/cart/items', [
                'item_type' => 'service',
                'item_id' => $service->id,
                'quantity' => 1,
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'items',
                ],
            ]);
    }

    public function test_can_update_cart_item_as_customer()
    {
        $customer = $this->createCustomer($this->company);
        $token = $this->authenticateAsCustomer($customer);
        $service = $this->createService($this->company, $this->authenticatedUser);

        $order = Order::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'status' => 'new',
            'total_amount' => 0,
        ]);

        $orderItem = $order->items()->create([
            'item_type' => 'service',
            'item_id' => $service->id,
            'quantity' => 1,
            'unit_price' => 100.00,
            'total_price' => 100.00,
            'description' => $service->name,
        ]);

        $response = $this->withToken($token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->putJson("/api/cart/items/{$orderItem->id}", [
                'quantity' => 2,
            ]);

        $response->assertStatus(200);
    }

    public function test_can_remove_item_from_cart_as_customer()
    {
        $customer = $this->createCustomer($this->company);
        $token = $this->authenticateAsCustomer($customer);
        $service = $this->createService($this->company, $this->authenticatedUser);

        $order = Order::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'status' => 'new',
            'total_amount' => 0,
        ]);

        $orderItem = $order->items()->create([
            'item_type' => 'service',
            'item_id' => $service->id,
            'quantity' => 1,
            'unit_price' => 100.00,
            'total_price' => 100.00,
            'description' => $service->name,
        ]);

        $response = $this->withToken($token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->deleteJson("/api/cart/items/{$orderItem->id}");

        $response->assertStatus(200);
    }

    public function test_can_clear_cart_as_customer()
    {
        $customer = $this->createCustomer($this->company);
        $token = $this->authenticateAsCustomer($customer);

        Order::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'status' => 'new',
            'total_amount' => 0,
        ]);

        $response = $this->withToken($token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->deleteJson('/api/cart');

        $response->assertStatus(200);
    }

    public function test_can_list_my_orders_as_customer()
    {
        $customer = $this->createCustomer($this->company);
        $token = $this->authenticateAsCustomer($customer);

        Order::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'status' => 'paid',
            'total_amount' => 100.00,
            'paid_at' => now(),
        ]);

        $response = $this->withToken($token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/orders/my-orders');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'status',
                        'total_amount',
                    ],
                ],
            ]);
    }

    public function test_can_show_order_as_customer()
    {
        $customer = $this->createCustomer($this->company);
        $token = $this->authenticateAsCustomer($customer);

        $order = Order::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'status' => 'paid',
            'total_amount' => 100.00,
            'paid_at' => now(),
        ]);

        $response = $this->withToken($token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/orders/{$order->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'status',
                ],
            ]);
    }

    public function test_cannot_show_other_customer_order()
    {
        $customer1 = $this->createCustomer($this->company);
        $customer2 = $this->createCustomer($this->company);
        $token1 = $this->authenticateAsCustomer($customer1);

        $order = Order::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer2->id,
            'status' => 'paid',
            'total_amount' => 100.00,
            'paid_at' => now(),
        ]);

        $response = $this->withToken($token1)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/orders/{$order->id}");

        $response->assertStatus(500);
    }

    public function test_can_list_orders_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_ORDERS]);

        $customer = $this->createCustomer($this->company);

        Order::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'status' => 'paid',
            'total_amount' => 100.00,
            'paid_at' => now(),
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/orders');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'status',
                    ],
                ],
            ]);
    }

    public function test_cannot_list_orders_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson('/api/orders');

        $response->assertStatus(403);
    }

    public function test_can_show_order_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_ORDERS]);

        $customer = $this->createCustomer($this->company);

        $order = Order::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'status' => 'paid',
            'total_amount' => 100.00,
            'paid_at' => now(),
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->getJson("/api/orders/{$order->id}");

        $response->assertStatus(200);
    }

    public function test_can_cancel_order_with_permission()
    {
        $this->setupAuthenticatedUser([Permissions::MANAGE_ORDERS]);

        $customer = $this->createCustomer($this->company);

        $order = Order::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'status' => 'pending',
            'total_amount' => 100.00,
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson("/api/orders/{$order->id}/cancel");

        $response->assertStatus(200);
    }

    public function test_cannot_cancel_order_without_permission()
    {
        $this->setupAuthenticatedUser([]);

        $customer = $this->createCustomer($this->company);

        $order = Order::create([
            'company_id' => $this->company->id,
            'customer_id' => $customer->id,
            'status' => 'pending',
            'total_amount' => 100.00,
        ]);

        $response = $this->withToken($this->token)
            ->withHeaders($this->withCompanyHeader($this->company))
            ->postJson("/api/orders/{$order->id}/cancel");

        $response->assertStatus(403);
    }
}
