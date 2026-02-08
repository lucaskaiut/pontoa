<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class PackageService extends Pivot
{
    use HasFactory;

    protected $table = 'package_services';

    public $timestamps = true;
}
