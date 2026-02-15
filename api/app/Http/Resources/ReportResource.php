<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    public function toArray($request)
    {
        if (is_null($this->resource)) {
            return [];
        }

        if (is_array($this->resource)) {
            return $this->resource;
        }

        if (is_object($this->resource)) {
            if ($this->resource instanceof \Illuminate\Database\Eloquent\Model) {
                return $this->resource->toArray();
            }

            return (array) $this->resource;
        }

        return $this->resource;
    }
}

