<?php

namespace App\Services;

use App\Models\Package;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

final class PackageService
{
    public function create(array $data): Package
    {
        return DB::transaction(function () use ($data) {
            $services = $data['services'] ?? [];
            unset($data['services']);

            $package = Package::create($data);

            if (! empty($services)) {
                $package->services()->sync($services);
            }

            return $package->load('services');
        });
    }

    public function update(Package $package, array $data): Package
    {
        return DB::transaction(function () use ($package, $data) {
            $services = $data['services'] ?? null;
            unset($data['services']);

            $package->update($data);

            if ($services !== null) {
                $package->services()->sync($services);
            }

            return $package->load('services');
        });
    }

    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Package::with('services');

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        if (isset($filters['sort'])) {
            $parts = explode(',', $filters['sort']);
            $column = $parts[0] ?? null;
            $direction = strtoupper($parts[1] ?? 'DESC');

            if ($column && in_array($direction, ['ASC', 'DESC'])) {
                $allowedColumns = ['name', 'created_at', 'updated_at'];
                if (in_array($column, $allowedColumns)) {
                    $query->orderBy($column, $direction);
                }
            }
        } else {
            $query->orderBy('created_at', 'DESC');
        }

        return $query->paginate(perPage: $filters['perPage'] ?? 15, page: $filters['page'] ?? 1);
    }

    public function findOrFail(int $id): Package
    {
        return Package::with('services')->findOrFail($id);
    }

    public function delete(Package $package): void
    {
        DB::transaction(function () use ($package) {
            $package->services()->detach();
            $package->delete();
        });
    }

    public function toggleActive(Package $package): Package
    {
        $package->update(['is_active' => ! $package->is_active]);

        return $package->fresh();
    }

    public function listAvailable(): array
    {
        return Package::where('is_active', true)
            ->with('services')
            ->orderBy('created_at', 'DESC')
            ->get()
            ->toArray();
    }
}
