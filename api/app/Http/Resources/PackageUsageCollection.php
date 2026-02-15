<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class PackageUsageCollection extends ResourceCollection
{
    public $collects = PackageUsageResource::class;

    public function toArray($request)
    {
        return parent::toArray($request);
    }
}
