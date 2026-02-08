<?php

namespace App\Http\Controllers;

use App\Constants\Permissions;
use App\Http\Resources\AppointmentExecutionResource;
use App\Models\Scheduling;
use App\Services\AppointmentExecutionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AppointmentExecutionController extends Controller
{
    private AppointmentExecutionService $service;

    public function __construct(AppointmentExecutionService $service)
    {
        $this->service = $service;
    }

    public function checkIn(Scheduling $scheduling)
    {
        $this->authorizePermission(Permissions::MANAGE_APPOINTMENT_EXECUTIONS);

        return DB::transaction(function () use ($scheduling) {
            $execution = $this->service->checkIn($scheduling);
            return new AppointmentExecutionResource($execution);
        });
    }

    public function checkOut(Scheduling $scheduling)
    {
        $this->authorizePermission(Permissions::MANAGE_APPOINTMENT_EXECUTIONS);

        return DB::transaction(function () use ($scheduling) {
            $execution = $this->service->checkOut($scheduling);
            return new AppointmentExecutionResource($execution);
        });
    }

    public function show(Scheduling $scheduling, Request $request)
    {
        $this->authorizePermission(Permissions::MANAGE_APPOINTMENT_EXECUTIONS);

        $executionId = $request->query('execution_id');
        $all = filter_var($request->query('all', false), FILTER_VALIDATE_BOOLEAN);

        if ($executionId) {
            $execution = $this->service->getExecution($scheduling, (int) $executionId);
            
            if (!$execution) {
                return response()->json(['message' => 'Execução não encontrada'], 404);
            }

            return new AppointmentExecutionResource($execution);
        }

        if ($all) {
            $executions = $this->service->getExecutions($scheduling);
            return AppointmentExecutionResource::collection($executions);
        }

        $execution = $this->service->getExecution($scheduling);

        if (!$execution) {
            return response()->json(['message' => 'Execução não encontrada'], 404);
        }

        return new AppointmentExecutionResource($execution);
    }
}

