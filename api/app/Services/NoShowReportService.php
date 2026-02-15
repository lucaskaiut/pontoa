<?php

namespace App\Services;

use App\Models\Scheduling;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

final class NoShowReportService
{
    public function generate(array $filters): Collection|array
    {
        $dateStartAt = isset($filters['date_start_at']) 
            ? Carbon::parse($filters['date_start_at'])->startOfDay()
            : null;

        $dateEndAt = isset($filters['date_end_at'])
            ? Carbon::parse($filters['date_end_at'])->endOfDay()
            : null;

        $query = Scheduling::query()
            ->where('status', 'no_show')
            ->with(['customer', 'service', 'user']);

        if ($dateStartAt) {
            $query->where('date', '>=', $dateStartAt);
        }

        if ($dateEndAt) {
            $query->where('date', '<=', $dateEndAt);
        }

        if (isset($filters['service_id'])) {
            $query->where('service_id', $filters['service_id']);
        }

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        $groupBy = $filters['group_by'] ?? null;

        if (empty($groupBy)) {
            return $query->orderBy('date', 'asc')->get();
        }

        if ($groupBy === 'customer') {
            $results = $query
                ->select(
                    'customer_id',
                    DB::raw('COUNT(*) as count'),
                    DB::raw('SUM(price) as total_price')
                )
                ->whereNotNull('customer_id')
                ->groupBy('customer_id')
                ->orderBy('count', 'desc')
                ->get()
                ->map(function ($item) {
                    return (object) [
                        'customer_id' => $item->customer_id,
                        'count' => (int) $item->count,
                        'total_price' => (float) $item->total_price,
                    ];
                });

            $customerIds = $results->pluck('customer_id')->toArray();
            $customers = \App\Models\Customer::whereIn('id', $customerIds)->get()->keyBy('id');

            return $results->map(function ($item) use ($customers) {
                $customer = $customers->get($item->customer_id);
                return (object) [
                    'customer_id' => $item->customer_id,
                    'customer' => $customer ? (object) [
                        'id' => $customer->id,
                        'name' => $customer->name,
                    ] : null,
                    'count' => $item->count,
                    'total_price' => $item->total_price,
                ];
            })->all();
        }

        $dateFormat = $this->getDateFormat($groupBy);

        $results = $query
            ->select(
                DB::raw("DATE_FORMAT(date, '{$dateFormat}') as date"),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(price) as total_price')
            )
            ->groupBy(DB::raw("DATE_FORMAT(date, '{$dateFormat}')"))
            ->orderBy('date', 'asc')
            ->get()
            ->map(function ($item) {
                return (object) [
                    'date' => $item->date,
                    'count' => (int) $item->count,
                    'total_price' => (float) $item->total_price,
                ];
            });

        return $results->all();
    }

    private function getDateFormat(?string $groupBy): string
    {
        return match ($groupBy) {
            'day' => '%Y-%m-%d',
            'month' => '%Y-%m',
            'year' => '%Y',
            default => '%Y-%m-%d',
        };
    }
}

