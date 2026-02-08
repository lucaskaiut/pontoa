<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PackageUsageResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'customer_package_id' => $this->customer_package_id,
            'appointment_id' => $this->appointment_id,
            'used_at' => $this->used_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'customer_package' => new CustomerPackageResource($this->whenLoaded('customerPackage')),
            'scheduling' => new SchedulingResource($this->whenLoaded('scheduling')),
        ];
    }
}
