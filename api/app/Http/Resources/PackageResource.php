<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PackageResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'name' => $this->name,
            'description' => $this->description,
            'total_sessions' => $this->total_sessions,
            'bonus_sessions' => $this->bonus_sessions,
            'expires_in_days' => $this->expires_in_days,
            'is_active' => $this->is_active,
            'price' => $this->price,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'services' => ServiceResource::collection($this->whenLoaded('services')),
        ];
    }
}
