<?php

namespace App\Services;

use App\Models\CustomerPackage;
use App\Models\PackageUsage;
use App\Models\Scheduling;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

final class CustomerPackageService
{
    public function activate(int $packageId, int $customerId, ?int $orderId = null): CustomerPackage
    {
        return DB::transaction(function () use ($packageId, $customerId, $orderId) {
            $package = \App\Models\Package::findOrFail($packageId);
            $companyId = app('company')->company()->id;

            $expiresAt = null;
            if ($package->expires_in_days) {
                $expiresAt = Carbon::now()->addDays($package->expires_in_days);
            }

            $totalSessions = $package->total_sessions + $package->bonus_sessions;

            $customerPackage = CustomerPackage::create([
                'company_id' => $companyId,
                'customer_id' => $customerId,
                'package_id' => $packageId,
                'order_id' => $orderId,
                'total_sessions' => $totalSessions,
                'remaining_sessions' => $totalSessions,
                'expires_at' => $expiresAt,
            ]);

            return $customerPackage->load(['package', 'customer']);
        });
    }

    public function activateFromOrder(int $packageId, int $customerId, int $orderId): CustomerPackage
    {
        return $this->activate($packageId, $customerId, $orderId);
    }

    public function findValidForService(int $customerId, int $serviceId): ?CustomerPackage
    {
        $companyId = app('company')->company()->id;

        return CustomerPackage::where('customer_id', $customerId)
            ->where('company_id', $companyId)
            ->where('remaining_sessions', '>', 0)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', Carbon::now());
            })
            ->whereHas('package.services', function ($query) use ($serviceId) {
                $query->where('services.id', $serviceId);
            })
            ->orderBy('created_at', 'ASC')
            ->first();
    }

    public function consumeSession(CustomerPackage $customerPackage, Scheduling $scheduling): PackageUsage
    {
        return DB::transaction(function () use ($customerPackage, $scheduling) {
            throw_if($customerPackage->remaining_sessions <= 0, new Exception('Pacote sem saldo disponível', 422));
            throw_if($customerPackage->is_expired, new Exception('Pacote expirado', 422));

            $customerPackage->decrement('remaining_sessions');

            $usage = PackageUsage::create([
                'customer_package_id' => $customerPackage->id,
                'appointment_id' => $scheduling->id,
                'used_at' => Carbon::now(),
            ]);

            $scheduling->update([
                'customer_package_id' => $customerPackage->id,
                'used_package_session' => true,
            ]);

            return $usage;
        });
    }

    public function revertSession(PackageUsage $usage): void
    {
        DB::transaction(function () use ($usage) {
            $customerPackage = $usage->customerPackage;
            $scheduling = $usage->scheduling;

            $customerPackage->increment('remaining_sessions');

            $scheduling->update([
                'customer_package_id' => null,
                'used_package_session' => false,
            ]);

            $usage->delete();
        });
    }

    public function listByCustomer(int $customerId, array $filters = []): Collection
    {
        $companyId = app('company')->company()->id;

        $query = CustomerPackage::where('customer_id', $customerId)
            ->where('company_id', $companyId)
            ->with(['package', 'usages.scheduling']);

        if (isset($filters['valid_only'])) {
            $query->where('remaining_sessions', '>', 0)
                ->where(function ($q) {
                    $q->whereNull('expires_at')
                        ->orWhere('expires_at', '>', Carbon::now());
                });
        }

        return $query->orderBy('created_at', 'DESC')->get();
    }

    public function validateBalance(CustomerPackage $customerPackage): bool
    {
        if ($customerPackage->remaining_sessions <= 0) {
            return false;
        }

        if ($customerPackage->is_expired) {
            return false;
        }

        return true;
    }
}
