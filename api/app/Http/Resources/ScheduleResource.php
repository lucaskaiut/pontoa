<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ScheduleResource extends JsonResource
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
            'days' => $this->days,
            'start_at' => $this->start_at,
            'end_at' => $this->end_at,
            'user' => new UserResource($this->whenLoaded('user')),
            'services' => new ServiceCollection($this->resource->services()->get()),
        ];
    }
}
