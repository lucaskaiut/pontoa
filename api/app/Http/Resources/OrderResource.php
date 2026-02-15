<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'total_amount' => $this->total_amount,
            'original_total_amount' => $this->original_total_amount ?? $this->total_amount,
            'discount_amount' => $this->discount_amount ?? 0,
            'payment_method' => $this->payment_method,
            'payment_reference' => $this->payment_reference,
            'payment_link' => $this->payment_link,
            'paid_at' => $this->paid_at,
            'expires_at' => $this->expires_at,
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
