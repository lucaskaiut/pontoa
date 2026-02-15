<?php

namespace App\Http\Controllers;

use App\Constants\Permissions;
use App\Http\Resources\OrderCollection;
use App\Http\Resources\OrderResource;
use App\Models\Customer;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    private OrderService $service;

    public function __construct(OrderService $service)
    {
        $this->service = $service;
    }

    public function getCart(Request $request)
    {
        $customer = Auth::guard('sanctum')->user();
        $cartId = $request->input('cart_id');

        if ($customer instanceof Customer) {
            $cart = $this->service->getCart($customer->id);
        } elseif ($cartId) {
            $cart = $this->service->getCartById((int) $cartId);
        } else {
            return response()->json(['data' => null]);
        }

        if (! $cart) {
            return response()->json(['data' => null]);
        }

        return new OrderResource($cart);
    }

    public function addItemToCart(Request $request)
    {
        $authenticatedCustomer = Auth::guard('sanctum')->user();

        $validationRules = [
            'item_type' => 'required|string|in:package,service,scheduling',
            'quantity' => 'nullable|integer|min:1',
        ];

        if ($request->input('item_type') === 'scheduling') {
            $validationRules['service_id'] = 'required|integer';
            $validationRules['user_id'] = 'required|integer';
            $validationRules['date'] = 'required|date';
            $validationRules['name'] = 'nullable|string';
            $validationRules['email'] = 'nullable|email';
            $validationRules['phone'] = 'nullable|string';
        } else {
            $validationRules['item_id'] = 'required|integer';
        }

        $validated = $request->validate($validationRules);

        $customer = null;
        if ($authenticatedCustomer instanceof Customer) {
            $customer = $authenticatedCustomer;
        } elseif ($request->input('item_type') === 'scheduling') {
            throw_if(
                !isset($validated['email']) && !isset($validated['phone']),
                new \Exception('Email ou telefone é necessário para adicionar agendamento ao carrinho', 422)
            );

            $companyId = app('company')->company()->id;
            $customerService = new \App\Services\CustomerService;

            if (isset($validated['email'])) {
                $customer = $customerService->findByEmail($validated['email'], $companyId);
                
                if (!$customer) {
                    $customer = $customerService->create([
                        'email' => $validated['email'],
                        'name' => $validated['name'] ?? null,
                        'phone' => $validated['phone'] ?? null,
                    ]);
                } else {
                    $updateData = [];
                    if (isset($validated['name']) && !$customer->name) {
                        $updateData['name'] = $validated['name'];
                    }
                    if (isset($validated['phone']) && !$customer->phone) {
                        $updateData['phone'] = $validated['phone'];
                    }
                    if (!empty($updateData)) {
                        $customer->update($updateData);
                    }
                }
            } else {
                $customer = $customerService->findOrCreateByPhone($validated['phone']);
                
                $updateData = [];
                if (isset($validated['name']) && !$customer->name) {
                    $updateData['name'] = $validated['name'];
                }
                if (!empty($updateData)) {
                    $customer->update($updateData);
                }
            }
        } else {
            throw_if(! $authenticatedCustomer instanceof Customer, new \Exception('Cliente não autenticado', 401));
            $customer = $authenticatedCustomer;
        }

        if ($validated['item_type'] === 'scheduling') {
            $schedulingData = [
                'service_id' => $validated['service_id'],
                'user_id' => $validated['user_id'],
                'date' => $validated['date'],
            ];

            if (isset($validated['name']) || isset($validated['email']) || isset($validated['phone'])) {
                $schedulingData['customer'] = [
                    'name' => $validated['name'] ?? $customer->name,
                    'email' => $validated['email'] ?? $customer->email,
                    'phone' => $validated['phone'] ?? $customer->phone,
                ];
            }

            $this->service->addSchedulingToCart($customer->id, $schedulingData);
        } else {
            $this->service->addItemToCart(
                $customer->id,
                $validated['item_type'],
                $validated['item_id'],
                $validated['quantity'] ?? 1
            );
        }

        $cart = $this->service->getCart($customer->id);

        return new OrderResource($cart);
    }

    public function updateCartItem(Request $request, int $orderItemId)
    {
        $customer = Auth::guard('sanctum')->user();

        throw_if(! $customer instanceof Customer, new \Exception('Cliente não autenticado', 401));

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $item = $this->service->updateCartItemQuantity(
            $customer->id,
            $orderItemId,
            $validated['quantity']
        );

        $cart = $this->service->getCart($customer->id);

        return new OrderResource($cart);
    }

    public function removeItemFromCart(int $orderItemId)
    {
        $customer = Auth::guard('sanctum')->user();

        throw_if(! $customer instanceof Customer, new \Exception('Cliente não autenticado', 401));

        $this->service->removeItemFromCart($customer->id, $orderItemId);

        return response()->json(['message' => 'Item removido do carrinho']);
    }

    public function clearCart()
    {
        $customer = Auth::guard('sanctum')->user();

        throw_if(! $customer instanceof Customer, new \Exception('Cliente não autenticado', 401));

        $this->service->clearCart($customer->id);

        return response()->json(['message' => 'Carrinho limpo']);
    }

    public function checkout(Request $request)
    {
        $customer = Auth::guard('sanctum')->user();

        throw_if(! $customer instanceof Customer, new \Exception('Cliente não autenticado', 401));

        $settingService = app(\App\Services\SettingService::class);
        $requireCheckoutValue = $settingService->get('scheduling_require_checkout');
        $requireCheckout = $requireCheckoutValue !== null ? filter_var($requireCheckoutValue, FILTER_VALIDATE_BOOLEAN) : true;

        $validationRules = [
            'order_id' => 'required|integer',
        ];

        if ($requireCheckout) {
            $validationRules['payment'] = 'required|array';
            $validationRules['payment.method'] = 'required|string';
        } else {
            $validationRules['payment'] = 'nullable|array';
        }

        $validated = $request->validate($validationRules);

        return DB::transaction(function () use ($customer, $validated) {
            $order = $this->service->processCheckout(
                $validated['order_id'],
                $customer,
                $validated['payment'] ?? []
            );

            return new OrderResource($order);
        });
    }

    public function updatePaymentMethod(Request $request, Order $order)
    {
        $customer = Auth::guard('sanctum')->user();

        throw_if(! $customer instanceof Customer, new \Exception('Cliente não autenticado', 401));
        throw_if($order->customer_id !== $customer->id, new \Exception('Acesso negado', 403));

        $validated = $request->validate([
            'payment_method' => 'required|string',
        ]);

        $updatedOrder = $this->service->updatePaymentMethod($order->id, $customer->id, $validated['payment_method']);

        return new OrderResource($updatedOrder);
    }

    public function listMyOrders(Request $request)
    {
        $customer = Auth::guard('sanctum')->user();

        throw_if(! $customer instanceof Customer, new \Exception('Cliente não autenticado', 401));

        $filters = $request->all();
        $filters['customer_id'] = $customer->id;
        $filters['exclude_status'] = 'new';

        return new OrderCollection($this->service->list($filters));
    }

    public function show(Order $order)
    {
        $customer = Auth::guard('sanctum')->user();

        if ($customer instanceof Customer) {
            throw_if($order->customer_id !== $customer->id, new \Exception('Acesso negado', 403));
        } else {
            $this->authorizePermission(Permissions::MANAGE_ORDERS);
        }

        $order->load(['customer', 'items']);

        $response = new OrderResource($order);
        
        if ($customer instanceof Customer) {
            $packageService = new \App\Services\CustomerPackageService;
            $packageResolver = new \App\Services\PackageResolver($packageService);
            
            $availablePackages = [];
            foreach ($order->items as $item) {
                if ($item->item_type === 'scheduling' && $item->metadata) {
                    $serviceId = $item->metadata['service_id'] ?? null;
                    if ($serviceId) {
                        $customerPackage = $packageResolver->resolveForService($customer->id, $serviceId);
                        if ($customerPackage) {
                            $customerPackage->load('package');
                            if ($customerPackage->package) {
                                $availablePackages[] = [
                                    'item_id' => $item->id,
                                    'service_id' => $serviceId,
                                    'package' => [
                                        'id' => $customerPackage->package->id,
                                        'name' => $customerPackage->package->name,
                                        'remaining_sessions' => $customerPackage->remaining_sessions,
                                    ],
                                ];
                            }
                        }
                    }
                }
            }
            
            $responseData = $response->toArray(request());
            $responseData['available_packages'] = $availablePackages;
            
            return response()->json($responseData);
        }

        return $response;
    }

    public function index(Request $request)
    {
        $this->authorizePermission(Permissions::MANAGE_ORDERS);

        return new OrderCollection($this->service->list($request->all()));
    }

    public function cancel(Order $order)
    {
        $this->authorizePermission(Permissions::MANAGE_ORDERS);

        return DB::transaction(function () use ($order) {
            return new OrderResource($this->service->cancel($order));
        });
    }
}
