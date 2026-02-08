<?php

namespace App\Http\Controllers;

use App\Constants\Permissions;
use App\Http\Resources\ReportResource;
use App\Services\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    private ReportService $service;

    public function __construct(ReportService $service)
    {
        $this->service = $service;
    }

    public function show(Request $request, string $type)
    {
        $this->authorizePermission(Permissions::MANAGE_REPORTS);

        $data = $this->service->generate($type, $request->all());

        return ReportResource::collection($data);
    }
}

