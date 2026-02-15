<?php

namespace App\Http\Controllers;

use App\Constants\Permissions;
use App\Http\Resources\SchedulingCollection;
use App\Http\Resources\SchedulingResource;
use App\Models\Scheduling;
use App\Services\SchedulingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SchedulingController extends Controller
{
    private SchedulingService $service;

    public function __construct(SchedulingService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $this->authorizePermission(Permissions::MANAGE_SCHEDULINGS);

        return new SchedulingCollection($this->service->list($request->all()));
    }

    public function store(Request $request)
    {
        return DB::transaction(function () use ($request) {
            return new SchedulingResource($this->service->create($request->all()));
        }); 
    }

    public function show(Scheduling $scheduling)
    {
        $this->authorizePermission(Permissions::MANAGE_SCHEDULINGS);

        return new SchedulingResource($scheduling);
    }

    public function update(Request $request, Scheduling $scheduling)
    {
        $this->authorizePermission(Permissions::MANAGE_SCHEDULINGS);

        return DB::transaction(function () use ($request, $scheduling) {
            return new SchedulingResource($this->service->update($scheduling, $request->except(['scheduling_id'])));
        }); 
    }

    public function destroy(Scheduling $scheduling)
    {
        $this->authorizePermission(Permissions::MANAGE_SCHEDULINGS);

        $this->service->delete($scheduling);
    }

    public function cancel(Scheduling $scheduling)  
    {
        $this->authorizePermission(Permissions::MANAGE_SCHEDULINGS);
        
        return DB::transaction(function () use ($scheduling) {
            return new SchedulingResource($this->service->cancel($scheduling));
        });
    }

    public function confirm(Scheduling $scheduling)
    {
        $this->authorizePermission(Permissions::MANAGE_SCHEDULINGS);
        
        return DB::transaction(function () use ($scheduling) {
            return new SchedulingResource($this->service->confirm($scheduling));
        });
    }

    public function noShow(Scheduling $scheduling)
    {
        $this->authorizePermission(Permissions::MANAGE_SCHEDULINGS);
        
        return DB::transaction(function () use ($scheduling) {
            return new SchedulingResource($this->service->markAsNoShow($scheduling));
        });
    }
}
    