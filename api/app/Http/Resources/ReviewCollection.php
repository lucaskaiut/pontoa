<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class ReviewCollection extends ResourceCollection
{
    public $collects = ReviewResource::class;

    public function toArray($request)
    {
        return parent::toArray($request);
    }
}
