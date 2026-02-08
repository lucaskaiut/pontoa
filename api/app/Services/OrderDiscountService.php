<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;

final class OrderDiscountService
{
    private CustomerPackageService $customerPackageService;
    private PackageResolver $packageResolver;

    public function __construct(
        CustomerPackageService $customerPackageService,
        PackageResolver $packageResolver
    ) {
        $this->customerPackageService = $customerPackageService;
        $this->packageResolver = $packageResolver;
    }

    public function applyPackageDiscounts(Order $order): void
    {
        if ($order->status !== 'new') {
            return;
        }

        $customer = $order->customer;
        if (!$customer) {
            return;
        }

        DB::transaction(function () use ($order, $customer) {
            $totalOriginalAmount = 0;
            $totalDiscountAmount = 0;

            foreach ($order->items as $item) {
                if ($item->item_type !== 'scheduling') {
                    $originalTotal = $item->original_total_price ?? $item->total_price;
                    $totalOriginalAmount += $originalTotal;
                    if (!$item->original_unit_price) {
                        $item->update([
                            'original_unit_price' => $item->unit_price,
                            'original_total_price' => $originalTotal,
                        ]);
                    }
                    continue;
                }

                $schedulingData = $item->getSchedulingData();
                if (!$schedulingData || !isset($schedulingData['service_id'])) {
                    $originalTotal = $item->total_price;
                    $totalOriginalAmount += $originalTotal;
                    continue;
                }

                $serviceId = $schedulingData['service_id'];
                $customerPackage = $this->packageResolver->resolveForService($customer->id, $serviceId);

                $originalUnitPrice = $item->original_unit_price ?? $item->unit_price;
                $originalTotalPrice = $item->original_total_price ?? ($originalUnitPrice * $item->quantity);
                $totalOriginalAmount += $originalTotalPrice;

                if ($customerPackage) {
                    $discountAmount = $originalTotalPrice;
                    $newUnitPrice = 0;
                    $newTotalPrice = 0;
                    $totalDiscountAmount += $discountAmount;
                } else {
                    $discountAmount = 0;
                    $newUnitPrice = $originalUnitPrice;
                    $newTotalPrice = $originalTotalPrice;
                }

                $item->update([
                    'original_unit_price' => $originalUnitPrice,
                    'original_total_price' => $originalTotalPrice,
                    'unit_price' => $newUnitPrice,
                    'total_price' => $newTotalPrice,
                    'discount_amount' => $discountAmount,
                ]);
            }

            $newTotalAmount = $totalOriginalAmount - $totalDiscountAmount;

            $order->update([
                'original_total_amount' => $totalOriginalAmount,
                'discount_amount' => $totalDiscountAmount,
                'total_amount' => $newTotalAmount,
            ]);
        });
    }
}

