<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'appointment_id' => $this->appointment_id,
            'customer_id' => $this->customer_id,
            'score' => $this->score,
            'comment' => $this->comment,
            'classification' => $this->classification,
            'is_public' => $this->is_public,
            'sent_to_google' => $this->sent_to_google,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'customer' => $this->whenLoaded('customer', function () {
                return [
                    'name' => $this->customer->name,
                ];
            }),
            'appointment' => $this->whenLoaded('appointment', function () {
                $appointment = [
                    'id' => $this->appointment->id,
                    'date' => $this->appointment->date,
                ];

                if ($this->appointment->relationLoaded('service') && $this->appointment->service) {
                    $appointment['service'] = [
                        'id' => $this->appointment->service->id,
                        'name' => $this->appointment->service->name,
                    ];
                }

                if ($this->appointment->relationLoaded('user') && $this->appointment->user) {
                    $appointment['user'] = [
                        'id' => $this->appointment->user->id,
                        'name' => $this->appointment->user->name,
                    ];
                }

                return $appointment;
            }),
        ];
    }
}
