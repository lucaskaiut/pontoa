<?php

namespace App\Http\Controllers;

use App\Http\Requests\ScheduleStoreRequest;
use App\Http\Resources\AvailableHoursResource;
use App\Http\Resources\ScheduleCollection;
use App\Http\Resources\ScheduleResource;
use App\Models\Schedule;
use App\Services\ScheduleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScheduleController extends Controller
{
    private ScheduleService $service;

    public function __construct(ScheduleService $service)
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
        return new ScheduleCollection($this->service->list($request->all()));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(ScheduleStoreRequest $request)
    {
        return DB::transaction(function () use ($request) {
            return new ScheduleResource($this->service->create($request->all()));
        });
    }

    /**
     * Display the specified resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function show(Schedule $schedule)
    {
        return new ScheduleResource($schedule);
    }

    /**
     * Update the specified resource in storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Schedule $schedule)
    {
        return DB::transaction(function () use ($request, $schedule) {
            return new ScheduleResource($this->service->update($schedule, $request->all()));
        });
    }

    /**
     * Remove the specified resource from storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function destroy(Schedule $schedule)
    {
        return DB::transaction(function () use ($schedule) {
            return $this->service->delete($schedule);
        });
    }

    public function hours(Request $request)
    {
        $availableHours = $this->service->availableHours(
            $request->get('date'),
            $request->get('service_id'),
            $request->get('user_id')
        );

        return new AvailableHoursResource($availableHours);
    }
}
