<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class CardCollection extends ResourceCollection
{
    public $collects = CardResource::class;

    public function toArray($request)
    {
        return parent::toArray($request);
    }
}

