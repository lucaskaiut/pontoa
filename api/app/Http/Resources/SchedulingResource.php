<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SchedulingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'date' => $this->date,
            'commission' => $this->commission,
            'cost' => $this->cost,
            'price' => $this->price,
            'service' => new ServiceResource($this->service),
            'user' => new UserResource($this->user),
            'customer' => new CustomerResource($this->customer),
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'create_at' => $this->created_at,
            'updated_at' => $this->created_at,
        ];
    }
}
