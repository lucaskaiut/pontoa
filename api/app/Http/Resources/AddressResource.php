<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AddressResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        $fields = [
            'id',
            'address',
            'number',
            'complement',
            'district',
            'city',
            'region',
            'postcode',
        ];

        $response = [];

        foreach ($fields as $field) {
            $response[$field] = $this->$field;
        }

        return $response;
    }
}
