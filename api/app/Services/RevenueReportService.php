<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

final class RevenueReportService
{
    public function generate(array $filters): Collection|array
    {
        $dateStartAt = isset($filters['date_start_at']) 
            ? Carbon::parse($filters['date_start_at'])->startOfDay()
            : null;

        $dateEndAt = isset($filters['date_end_at'])
            ? Carbon::parse($filters['date_end_at'])->endOfDay()
            : null;

        $query = OrderItem::query()
            ->with(['order.customer', 'scheduling.service', 'scheduling.user'])
            ->whereHas('order', function ($q) use ($dateStartAt, $dateEndAt) {
                if ($dateStartAt) {
                    $q->where('created_at', '>=', $dateStartAt);
                }

                if ($dateEndAt) {
                    $q->where('created_at', '<=', $dateEndAt);
                }
            })
            ->where(function ($q) {
                $q->where('item_type', '!=', 'scheduling')
                    ->orWhereHas('scheduling', function ($sq) {
                        $sq->where('status', 'confirmed');
                    });
            });

        if (isset($filters['service_id'])) {
            $query->where(function ($q) use ($filters) {
                $q->where(function ($sq) use ($filters) {
                    $sq->where('item_type', 'scheduling')
                        ->whereHas('scheduling', function ($ssq) use ($filters) {
                            $ssq->where('service_id', $filters['service_id']);
                        });
                })->orWhere(function ($sq) use ($filters) {
                    $sq->where('item_type', 'service')
                        ->where('item_id', $filters['service_id']);
                });
            });
        }

        if (isset($filters['user_id'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('item_type', 'scheduling')
                    ->whereHas('scheduling', function ($sq) use ($filters) {
                        $sq->where('user_id', $filters['user_id'])
                            ->where('status', 'confirmed');
                    });
            });
        }

        $groupBy = $filters['group_by'] ?? null;

        if (empty($groupBy)) {
            return $query->get()->sortBy(function ($item) {
                return $item->order->created_at;
            })->map(function ($item) {
                return $this->transformOrderItem($item);
            })->values()->all();
        }

        $dateFormat = $this->getDateFormat($groupBy);

        $baseQuery = OrderItem::query()
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where(function ($q) {
                $q->where('order_items.item_type', '!=', 'scheduling')
                    ->orWhereExists(function ($sq) {
                        $sq->select(DB::raw(1))
                            ->from('schedulings')
                            ->whereColumn('schedulings.order_item_id', 'order_items.id')
                            ->where('schedulings.status', '=', 'confirmed');
                    });
            });

        if ($dateStartAt) {
            $baseQuery->where('orders.created_at', '>=', $dateStartAt);
        }

        if ($dateEndAt) {
            $baseQuery->where('orders.created_at', '<=', $dateEndAt);
        }

        if (isset($filters['service_id'])) {
            $baseQuery->where(function ($q) use ($filters) {
                $q->where(function ($sq) use ($filters) {
                    $sq->where('order_items.item_type', 'scheduling')
                        ->whereExists(function ($ssq) use ($filters) {
                            $ssq->select(DB::raw(1))
                                ->from('schedulings')
                                ->whereColumn('schedulings.order_item_id', 'order_items.id')
                                ->where('schedulings.service_id', $filters['service_id'])
                                ->where('schedulings.status', '=', 'confirmed');
                        });
                })->orWhere(function ($sq) use ($filters) {
                    $sq->where('order_items.item_type', 'service')
                        ->where('order_items.item_id', $filters['service_id']);
                });
            });
        }

        if (isset($filters['user_id'])) {
            $baseQuery->where(function ($q) use ($filters) {
                $q->where('order_items.item_type', 'scheduling')
                    ->whereExists(function ($sq) use ($filters) {
                        $sq->select(DB::raw(1))
                            ->from('schedulings')
                            ->whereColumn('schedulings.order_item_id', 'order_items.id')
                            ->where('schedulings.user_id', $filters['user_id'])
                            ->where('schedulings.status', '=', 'confirmed');
                    });
            });
        }

        $results = $baseQuery
            ->leftJoin('schedulings', function ($join) {
                $join->on('order_items.id', '=', 'schedulings.order_item_id')
                    ->where('order_items.item_type', '=', 'scheduling')
                    ->where('schedulings.status', '=', 'confirmed');
            })
            ->select(
                DB::raw("DATE_FORMAT(orders.created_at, '{$dateFormat}') as date"),
                DB::raw('SUM(order_items.total_price) as price'),
                DB::raw('COALESCE(SUM(schedulings.cost), 0) as cost'),
                DB::raw('COUNT(DISTINCT order_items.id) as count')
            )
            ->groupBy(DB::raw("DATE_FORMAT(orders.created_at, '{$dateFormat}')"))
            ->orderBy('date', 'asc')
            ->get()
            ->map(function ($item) {
                return (object) [
                    'date' => $item->date,
                    'price' => (float) $item->price,
                    'cost' => (float) $item->cost,
                    'count' => (int) $item->count,
                ];
            });

        return $results->all();
    }

    private function transformOrderItem(OrderItem $item): object
    {
        $order = $item->order;
        $scheduling = $item->scheduling;

        $data = [
            'id' => $item->id,
            'order_id' => $order->id,
            'customer_id' => $order->customer_id,
            'date' => $order->created_at->format('Y-m-d H:i:s'),
            'price' => (float) $item->total_price,
            'cost' => 0.0,
            'created_at' => $item->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $item->updated_at->format('Y-m-d H:i:s'),
            'customer' => $order->customer ? [
                'id' => $order->customer->id,
                'name' => $order->customer->name,
            ] : null,
        ];

        if ($item->item_type === 'scheduling' && $scheduling && $scheduling->status === 'confirmed') {
            $data['service_id'] = $scheduling->service_id;
            $data['user_id'] = $scheduling->user_id;
            $data['cost'] = (float) ($scheduling->cost ?? 0);
            $data['service'] = $scheduling->service ? [
                'id' => $scheduling->service->id,
                'name' => $scheduling->service->name,
            ] : null;
            $data['user'] = $scheduling->user ? [
                'id' => $scheduling->user->id,
                'name' => $scheduling->user->name,
            ] : null;
        } else {
            $metadata = $item->metadata ?? [];
            if (isset($metadata['service_id'])) {
                $data['service_id'] = $metadata['service_id'];
            }
            if (isset($metadata['user_id'])) {
                $data['user_id'] = $metadata['user_id'];
            }
        }

        return (object) $data;
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

