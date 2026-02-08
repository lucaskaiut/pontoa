<?php

namespace App\Services;

use App\Events\OrderPaid;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\Payments\PaymentService;
use App\Services\SettingService;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;

final class OrderService
{
    private const CART_EXPIRY_DAYS = 7;

    public function getOrCreateCart(int $customerId): Order
    {
        $cart = Order::where('customer_id', $customerId)
            ->where('status', 'new')
            ->first();

        if (! $cart) {
            $cart = Order::create([
                'customer_id' => $customerId,
                'status' => 'new',
                'total_amount' => 0,
                'expires_at' => Carbon::now()->addDays(self::CART_EXPIRY_DAYS),
            ]);
        } elseif ($cart->isExpired()) {
            $cart->delete();

            $cart = Order::create([
                'customer_id' => $customerId,
                'status' => 'new',
                'total_amount' => 0,
                'expires_at' => Carbon::now()->addDays(self::CART_EXPIRY_DAYS),
            ]);
        }

        return $cart;
    }

    public function addItemToCart(int $customerId, string $itemType, int $itemId, int $quantity = 1): OrderItem
    {
        return DB::transaction(function () use ($customerId, $itemType, $itemId, $quantity) {
            $cart = $this->getOrCreateCart($customerId);
            $cart->load('customer');

            $existingItem = OrderItem::where('order_id', $cart->id)
                ->where('item_type', $itemType)
                ->where('item_id', $itemId)
                ->first();

            $factory = new OrderItemFactory;
            $itemData = $factory->create($itemType, $itemId, $quantity);

            if ($existingItem) {
                $originalTotal = ($existingItem->original_unit_price ?? $existingItem->unit_price) * ($existingItem->quantity + $quantity);
                $existingItem->update([
                    'quantity' => $existingItem->quantity + $quantity,
                    'original_unit_price' => $existingItem->original_unit_price ?? $existingItem->unit_price,
                    'original_total_price' => $originalTotal,
                    'total_price' => ($existingItem->unit_price * ($existingItem->quantity + $quantity)),
                ]);

                $item = $existingItem;
            } else {
                $item = OrderItem::create([
                    'order_id' => $cart->id,
                    'original_unit_price' => $itemData['unit_price'],
                    'original_total_price' => $itemData['total_price'],
                    ...$itemData,
                ]);
            }

            $discountService = new OrderDiscountService(
                new CustomerPackageService,
                new PackageResolver(new CustomerPackageService)
            );
            $discountService->applyPackageDiscounts($cart->fresh());

            return $item->fresh();
        });
    }

    public function addSchedulingToCart(int $customerId, array $schedulingData): OrderItem
    {
        return DB::transaction(function () use ($customerId, $schedulingData) {
            $cart = $this->getOrCreateCart($customerId);
            $cart->load(['customer', 'items']);

            $schedulingService = new SchedulingService;
            $schedulingService->validateAvailability($schedulingData);

            $validator = new SchedulingCartValidator;
            $validator->validateNoConflicts($cart, $schedulingData);
            $validator->validateNoDuplicate($cart, $schedulingData);

            $packageResolver = new PackageResolver(new CustomerPackageService);
            $customerPackage = $packageResolver->resolveForService($customerId, $schedulingData['service_id']);

            if ($customerPackage) {
                $customerPackage->load('package');
                $schedulingData['package'] = [
                    'id' => $customerPackage->id,
                    'package_id' => $customerPackage->package_id,
                    'package_name' => $customerPackage->package->name ?? null,
                    'remaining_sessions' => $customerPackage->remaining_sessions,
                ];
            }

            $factory = new OrderItemFactory;
            $itemData = $factory->createScheduling($schedulingData);

            $item = OrderItem::create([
                'order_id' => $cart->id,
                'original_unit_price' => $itemData['unit_price'],
                'original_total_price' => $itemData['total_price'],
                ...$itemData,
            ]);

            $discountService = new OrderDiscountService(
                new CustomerPackageService,
                new PackageResolver(new CustomerPackageService)
            );
            $discountService->applyPackageDiscounts($cart->fresh());

            return $item->fresh();
        });
    }

    public function removeItemFromCart(int $customerId, int $orderItemId): void
    {
        DB::transaction(function () use ($customerId, $orderItemId) {
            $cart = $this->getCart($customerId);

            throw_if(! $cart, new Exception('Carrinho não encontrado', 404));

            $item = OrderItem::where('id', $orderItemId)
                ->where('order_id', $cart->id)
                ->firstOrFail();

            $item->delete();

            $cart->calculateTotal();
        });
    }

    public function updateCartItemQuantity(int $customerId, int $orderItemId, int $quantity): OrderItem
    {
        return DB::transaction(function () use ($customerId, $orderItemId, $quantity) {
            throw_if($quantity <= 0, new Exception('Quantidade deve ser maior que zero', 422));

            $cart = $this->getCart($customerId);
            $cart->load('customer');

            throw_if(! $cart, new Exception('Carrinho não encontrado', 404));

            $item = OrderItem::where('id', $orderItemId)
                ->where('order_id', $cart->id)
                ->firstOrFail();

            $originalUnitPrice = $item->original_unit_price ?? $item->unit_price;
            $originalTotalPrice = $originalUnitPrice * $quantity;

            $item->update([
                'quantity' => $quantity,
                'original_unit_price' => $originalUnitPrice,
                'original_total_price' => $originalTotalPrice,
                'total_price' => $item->unit_price * $quantity,
            ]);

            $discountService = new OrderDiscountService(
                new CustomerPackageService,
                new PackageResolver(new CustomerPackageService)
            );
            $discountService->applyPackageDiscounts($cart->fresh());

            return $item->fresh();
        });
    }

    public function getCart(int $customerId): ?Order
    {
        $cart = Order::where('customer_id', $customerId)
            ->where('status', 'new')
            ->with(['items', 'customer'])
            ->first();

        if ($cart) {
            $cart->syncPricesAndRecalculate();
        }

        return $cart;
    }

    public function getCartById(int $cartId): ?Order
    {
        $cart = Order::where('id', $cartId)
            ->where('status', 'new')
            ->with(['items', 'customer'])
            ->first();

        if ($cart) {
            $cart->syncPricesAndRecalculate();
        }

        return $cart;
    }

    public function assignCartToCustomer(int $cartId, int $customerId): Order
    {
        return DB::transaction(function () use ($cartId, $customerId) {
            $cart = Order::where('id', $cartId)
                ->where('status', 'new')
                ->firstOrFail();

            throw_if($cart->customer_id !== null && $cart->customer_id !== $customerId, new Exception('Carrinho não pode ser atribuído a este cliente', 403));

            $existingCart = Order::where('customer_id', $customerId)
                ->where('status', 'new')
                ->where('id', '!=', $cartId)
                ->first();

            if ($existingCart) {
                $existingCart->delete();
            }

            $cart->update(['customer_id' => $customerId]);

            return $cart->fresh(['items', 'customer']);
        });
    }

    public function clearCart(int $customerId): void
    {
        DB::transaction(function () use ($customerId) {
            $cart = $this->getCart($customerId);

            if ($cart) {
                $cart->items()->delete();
                $cart->update(['total_amount' => 0]);
            }
        });
    }

    public function updatePaymentMethod(int $orderId, int $customerId, string $paymentMethod): Order
    {
        return DB::transaction(function () use ($orderId, $customerId, $paymentMethod) {
            $order = Order::where('id', $orderId)
                ->where('customer_id', $customerId)
                ->where('status', 'new')
                ->firstOrFail();

            $order->update(['payment_method' => $paymentMethod]);

            return $order->fresh(['items', 'customer']);
        });
    }

    public function processCheckout(int $orderId, Customer $customer, array $paymentData): Order
    {
        return DB::transaction(function () use ($orderId, $customer, $paymentData) {
            $order = Order::where('id', $orderId)
                ->where('customer_id', $customer->id)
                ->with('items')
                ->firstOrFail();

            throw_if($order->status !== 'new', new Exception('Pedido não pode ser finalizado', 422));
            throw_if($order->items->isEmpty(), new Exception('Carrinho está vazio', 422));

            $settingService = app(SettingService::class);
            $requireCheckoutValue = $settingService->get('scheduling_require_checkout');
            $requireCheckout = $requireCheckoutValue !== null ? filter_var($requireCheckoutValue, FILTER_VALIDATE_BOOLEAN) : true;

            if (!$requireCheckout) {
                $order->update(['status' => 'paid', 'paid_at' => Carbon::now()]);
                Event::dispatch(new OrderPaid($order));
                return $order->fresh();
            }

            if ((float) $order->total_amount <= 0) {
                $paymentData['method'] = 'freeOrder';
            }

            $order->update(['status' => 'pending']);

            try {
                $paymentService = new PaymentService;
                $paymentService->confirmOrder($customer, $order, $paymentData);

                $order->fresh();

                if ($paymentData['method'] === 'freeOrder') {
                    $order->update(['status' => 'paid', 'paid_at' => Carbon::now()]);
                    Event::dispatch(new OrderPaid($order));
                    return $order->fresh();
                }

                if ($paymentData['method'] === 'pagarmePix') {
                    return $order;
                }

                $order->update(['status' => 'paid', 'paid_at' => Carbon::now()]);

                Event::dispatch(new OrderPaid($order));

                return $order->fresh();
            } catch (Exception $e) {
                $order->update(['status' => 'new']);
                throw $e;
            }
        });
    }

    public function calculateTotal(Order $order): float
    {
        return $order->calculateTotal();
    }

    public function list(array $filters = [])
    {
        $query = Order::with(['customer', 'items']);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (isset($filters['exclude_status'])) {
            $query->where('status', '!=', $filters['exclude_status']);
        }

        if (isset($filters['sort'])) {
            $parts = explode(',', $filters['sort']);
            $column = $parts[0] ?? null;
            $direction = strtoupper($parts[1] ?? 'DESC');

            if ($column && in_array($direction, ['ASC', 'DESC'])) {
                $allowedColumns = ['created_at', 'total_amount', 'status'];
                if (in_array($column, $allowedColumns)) {
                    $query->orderBy($column, $direction);
                }
            }
        } else {
            $query->orderBy('created_at', 'DESC');
        }

        return $query->paginate(perPage: $filters['perPage'] ?? 15, page: $filters['page'] ?? 1);
    }

    public function findOrFail(int $id): Order
    {
        $order = Order::with(['customer', 'items'])->findOrFail($id);

        if ($order->status === 'new') {
            $order->syncPricesAndRecalculate();
        }

        return $order->fresh();
    }

    public function cancel(Order $order): Order
    {
        throw_if(! $order->canBeCanceled(), new Exception('Pedido não pode ser cancelado', 422));

        $order->update(['status' => 'canceled']);

        return $order;
    }
}
