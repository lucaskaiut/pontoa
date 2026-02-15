<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentExecutionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'appointment_id' => $this->appointment_id,
            'company_id' => $this->company_id,
            'collaborator_id' => $this->collaborator_id,
            'service_id' => $this->service_id,
            'scheduled_start_at' => $this->scheduled_start_at?->toIso8601String(),
            'scheduled_end_at' => $this->scheduled_end_at?->toIso8601String(),
            'checked_in_at' => $this->checked_in_at?->toIso8601String(),
            'checked_out_at' => $this->checked_out_at?->toIso8601String(),
            'actual_duration_minutes' => $this->actual_duration_minutes,
            'status' => $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'appointment' => new SchedulingResource($this->whenLoaded('appointment')),
            'collaborator' => new UserResource($this->whenLoaded('collaborator')),
            'service' => new ServiceResource($this->whenLoaded('service')),
        ];
    }
}

