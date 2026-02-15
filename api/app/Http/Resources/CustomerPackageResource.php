<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CustomerPackageResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'customer_id' => $this->customer_id,
            'package_id' => $this->package_id,
            'order_id' => $this->order_id,
            'total_sessions' => $this->total_sessions,
            'remaining_sessions' => $this->remaining_sessions,
            'expires_at' => $this->expires_at,
            'is_expired' => $this->is_expired,
            'is_valid' => $this->is_valid,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'package' => new PackageResource($this->whenLoaded('package')),
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'usages' => PackageUsageResource::collection($this->whenLoaded('usages')),
        ];
    }
}
