<?php

namespace App\Services;

use App\Events\AppointmentCheckedIn;
use App\Events\AppointmentCheckedOut;
use App\Models\AppointmentExecution;
use App\Models\Scheduling;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;

final class AppointmentExecutionService
{
    private const DEFAULT_CHECK_IN_MINUTES_BEFORE = 15;
    private const DEFAULT_CHECK_IN_MINUTES_AFTER = 30;

    public function checkIn(Scheduling $scheduling, ?User $user = null): AppointmentExecution
    {
        $user = $user ?? Auth::user();
        
        if (!$user instanceof User) {
            throw new Exception('Usuário não autenticado', 401);
        }

        $this->validateCheckInPermission($user, $scheduling);
        $this->validateCheckInTimeWindow($scheduling);

        $service = $scheduling->service;
        $scheduledStartAt = $scheduling->date;
        $scheduledEndAt = $scheduledStartAt->copy()->addMinutes($service->duration ?? 0);

        return DB::transaction(function () use ($scheduling, $scheduledStartAt, $scheduledEndAt) {
            $now = Carbon::now();
            
            $execution = AppointmentExecution::create([
                'appointment_id' => $scheduling->id,
                'company_id' => $scheduling->company_id,
                'collaborator_id' => $scheduling->user_id,
                'service_id' => $scheduling->service_id,
                'scheduled_start_at' => $scheduledStartAt,
                'scheduled_end_at' => $scheduledEndAt,
                'checked_in_at' => $now,
                'status' => 'in_progress',
            ]);

            Event::dispatch(new AppointmentCheckedIn($execution->fresh()));

            return $execution->fresh();
        });
    }

    public function checkOut(Scheduling $scheduling, ?User $user = null, ?int $executionId = null): AppointmentExecution
    {
        $user = $user ?? Auth::user();
        
        if (!$user instanceof User) {
            throw new Exception('Usuário não autenticado', 401);
        }

        $this->validateCheckOutPermission($user, $scheduling);

        if ($executionId) {
            $execution = AppointmentExecution::where('appointment_id', $scheduling->id)
                ->where('id', $executionId)
                ->first();
        } else {
            $execution = AppointmentExecution::where('appointment_id', $scheduling->id)
                ->where('status', 'in_progress')
                ->whereNotNull('checked_in_at')
                ->whereNull('checked_out_at')
                ->latest('checked_in_at')
                ->first();
        }

        if (!$execution) {
            throw new Exception('Não existe execução em progresso para este atendimento', 404);
        }

        if ($execution->checked_in_at === null) {
            throw new Exception('Não é possível realizar check-out sem check-in prévio', 422);
        }

        if ($execution->checked_out_at !== null) {
            throw new Exception('Check-out já realizado para esta execução', 422);
        }

        if ($execution->status === 'canceled') {
            throw new Exception('Não é possível realizar check-out em execução cancelada', 422);
        }

        return DB::transaction(function () use ($execution) {
            $now = Carbon::now();
            $actualDuration = $execution->checked_in_at->diffInMinutes($now);

            $execution->update([
                'checked_out_at' => $now,
                'actual_duration_minutes' => $actualDuration,
                'status' => 'completed',
            ]);

            Event::dispatch(new AppointmentCheckedOut($execution->fresh()));

            return $execution->fresh();
        });
    }

    public function getExecution(Scheduling $scheduling, ?int $executionId = null): ?AppointmentExecution
    {
        if ($executionId) {
            return AppointmentExecution::where('appointment_id', $scheduling->id)
                ->where('id', $executionId)
                ->first();
        }

        return AppointmentExecution::where('appointment_id', $scheduling->id)
            ->latest('created_at')
            ->first();
    }

    public function getExecutions(Scheduling $scheduling): \Illuminate\Database\Eloquent\Collection
    {
        return AppointmentExecution::where('appointment_id', $scheduling->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getAverageDurationByService(int $serviceId, ?int $companyId = null): ?float
    {
        $query = AppointmentExecution::where('service_id', $serviceId)
            ->whereNotNull('actual_duration_minutes')
            ->where('status', 'completed');

        if ($companyId) {
            $query->where('company_id', $companyId);
        }

        return $query->avg('actual_duration_minutes');
    }

    public function getAverageDurationByCollaborator(int $collaboratorId, ?int $companyId = null): ?float
    {
        $query = AppointmentExecution::where('collaborator_id', $collaboratorId)
            ->whereNotNull('actual_duration_minutes')
            ->where('status', 'completed');

        if ($companyId) {
            $query->where('company_id', $companyId);
        }

        return $query->avg('actual_duration_minutes');
    }

    public function getAverageDurationByCompany(int $companyId): ?float
    {
        return AppointmentExecution::where('company_id', $companyId)
            ->whereNotNull('actual_duration_minutes')
            ->where('status', 'completed')
            ->avg('actual_duration_minutes');
    }

    public function getScheduledVsActualDifference(int $executionId): ?int
    {
        $execution = AppointmentExecution::find($executionId);

        if (!$execution || !$execution->actual_duration_minutes) {
            return null;
        }

        $scheduledDuration = $execution->scheduled_start_at->diffInMinutes($execution->scheduled_end_at);
        
        return $execution->actual_duration_minutes - $scheduledDuration;
    }

    private function validateCheckInPermission(User $user, Scheduling $scheduling): void
    {
        $companyId = app('company')->company()->id;

        if ($scheduling->company_id !== $companyId) {
            throw new Exception('Atendimento não pertence à empresa do usuário', 403);
        }

        $isCollaborator = $user->id === $scheduling->user_id && $user->is_collaborator;
        $isAdmin = $user->hasPermission(\App\Constants\Permissions::MANAGE_APPOINTMENT_EXECUTIONS);

        if (!$isCollaborator && !$isAdmin) {
            throw new Exception('Acesso negado. Apenas o colaborador responsável ou administradores podem realizar check-in', 403);
        }
    }

    private function validateCheckOutPermission(User $user, Scheduling $scheduling): void
    {
        $companyId = app('company')->company()->id;

        if ($scheduling->company_id !== $companyId) {
            throw new Exception('Atendimento não pertence à empresa do usuário', 403);
        }

        $isCollaborator = $user->id === $scheduling->user_id && $user->is_collaborator;
        $isAdmin = $user->hasPermission(\App\Constants\Permissions::MANAGE_APPOINTMENT_EXECUTIONS);

        if (!$isCollaborator && !$isAdmin) {
            throw new Exception('Acesso negado. Apenas o colaborador responsável ou administradores podem realizar check-out', 403);
        }
    }

    private function validateCheckInTimeWindow(Scheduling $scheduling): void
    {
        $scheduledStart = $scheduling->date;
        $now = Carbon::now();

        $minutesBefore = $this->getCheckInMinutesBefore();
        $minutesAfter = $this->getCheckInMinutesAfter();

        $earliestAllowed = $scheduledStart->copy()->subMinutes($minutesBefore);
        $latestAllowed = $scheduledStart->copy()->addMinutes($minutesAfter);

        if ($now->lt($earliestAllowed)) {
            throw new Exception(
                "Check-in permitido apenas a partir de {$minutesBefore} minutos antes do horário agendado",
                422
            );
        }

        if ($now->gt($latestAllowed)) {
            throw new Exception(
                "Check-in permitido apenas até {$minutesAfter} minutos após o horário agendado",
                422
            );
        }
    }

    private function getCheckInMinutesBefore(): int
    {
        $settingService = app(SettingService::class);
        return (int) ($settingService->get('check_in_minutes_before') ?? self::DEFAULT_CHECK_IN_MINUTES_BEFORE);
    }

    private function getCheckInMinutesAfter(): int
    {
        $settingService = app(SettingService::class);
        return (int) ($settingService->get('check_in_minutes_after') ?? self::DEFAULT_CHECK_IN_MINUTES_AFTER);
    }
}

