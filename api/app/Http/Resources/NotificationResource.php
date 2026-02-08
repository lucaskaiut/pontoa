<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'time_before' => $this->time_before,
            'time_unit' => $this->time_unit,
            'message' => $this->message,
            'active' => $this->active,
            'email_enabled' => $this->email_enabled,
            'whatsapp_enabled' => $this->whatsapp_enabled,
            'is_confirmation' => $this->is_confirmation,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

