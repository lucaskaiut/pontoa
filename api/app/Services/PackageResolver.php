<?php

namespace App\Services;

use App\Models\CustomerPackage;

final class PackageResolver
{
    private CustomerPackageService $customerPackageService;

    public function __construct(CustomerPackageService $customerPackageService)
    {
        $this->customerPackageService = $customerPackageService;
    }

    public function resolveForService(int $customerId, int $serviceId): ?CustomerPackage
    {
        return $this->customerPackageService->findValidForService($customerId, $serviceId);
    }
}
