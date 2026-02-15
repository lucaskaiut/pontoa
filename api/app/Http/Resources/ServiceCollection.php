<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class ServiceCollection extends ResourceCollection
{
    public $collects = ServiceResource::class;

    public function toArray($request)
    {
        return parent::toArray($request);
    }
}
