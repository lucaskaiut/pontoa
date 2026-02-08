<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class PackageCollection extends ResourceCollection
{
    public $collects = PackageResource::class;

    public function toArray($request)
    {
        return parent::toArray($request);
    }
}
