<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class CustomerPackageCollection extends ResourceCollection
{
    public $collects = CustomerPackageResource::class;

    public function toArray($request)
    {
        return parent::toArray($request);
    }
}
