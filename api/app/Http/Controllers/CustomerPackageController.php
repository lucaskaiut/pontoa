<?php

namespace App\Http\Controllers;

use App\Http\Resources\CustomerPackageCollection;
use App\Http\Resources\CustomerPackageResource;
use App\Http\Resources\PackageUsageCollection;
use App\Models\Customer;
use App\Models\CustomerPackage;
use App\Services\CustomerPackageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerPackageController extends Controller
{
    private CustomerPackageService $customerPackageService;

    public function __construct(CustomerPackageService $customerPackageService)
    {
        $this->customerPackageService = $customerPackageService;
    }

    public function index(Customer $customer, Request $request)
    {
        $packages = $this->customerPackageService->listByCustomer($customer->id, $request->all());

        return new CustomerPackageCollection($packages);
    }

    public function myPackages(Request $request)
    {
        $customer = auth('sanctum')->user();

        throw_if(! $customer instanceof Customer, new \Exception('Cliente não autenticado', 401));

        $packages = $this->customerPackageService->listByCustomer($customer->id, $request->all());

        return new CustomerPackageCollection($packages);
    }

    public function activate(Customer $customer, int $package, Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'nullable|integer|exists:orders,id',
        ]);

        return DB::transaction(function () use ($customer, $package, $validated) {
            $customerPackage = $this->customerPackageService->activate(
                $package,
                $customer->id,
                $validated['order_id'] ?? null
            );

            return new CustomerPackageResource($customerPackage);
        });
    }

    public function usages(Customer $customer, CustomerPackage $customerPackage)
    {
        $usages = $customerPackage->usages()->with('scheduling')->get();

        return new PackageUsageCollection($usages);
    }
}
