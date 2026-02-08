<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'document' => $this->document,
            'bank' => $this->bank,
            'branch_number' => $this->branch_number,
            'account_number' => $this->account_number,
            'account_check_digit' => $this->account_check_digit,
            'bank_account_type' => $this->bank_account_type,
            'image' => $this->image ? asset($this->image) : null,
            'description' => $this->description,
            'url' => $this->url,
            'type' => $this->type,
            'created_at' => $this->created_at,
            'is_collaborator' => $this->is_collaborator,
            'updated_at' => $this->updated_at,
            'company' => new CompanyResource($this->company),
            'services' => ServiceCollection::make($this->whenLoaded('services') ? $this->services : $this->services()->get()),
            'schedules' => ScheduleCollection::make($this->whenLoaded('schedules') ? $this->schedules : $this->schedules()->get()),
            'roles' => $this->roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'description' => $role->description,
                    'permissions' => $role->permissions ?? [],
                ];
            }),
        ];
    }
}
