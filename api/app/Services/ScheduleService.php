<?php

namespace App\Services;

use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\Support\Arr;

final class ScheduleService
{
    public function create(array $data): Schedule
    {
        $schedule = Schedule::create(collect($data)->except(['services'])->all());

        $schedule->services()->sync($data['services']);

        return $schedule->load(['user', 'services']);
    }

    /**
     * @return Schedule[]
     */
    public function list(array $filters = [])
    {
        $query = Schedule::with(['user', 'services']);

        if (isset($filters['sort'])) {
            $parts = explode(',', $filters['sort']);
            $column = $parts[0] ?? null;
            $direction = strtoupper($parts[1] ?? 'ASC');

            if ($column && in_array($direction, ['ASC', 'DESC'])) {
                $allowedColumns = ['start_at', 'end_at', 'days', 'created_at', 'updated_at'];
                if (in_array($column, $allowedColumns)) {
                    $query->orderBy($column, $direction);
                }
            }
        } else {
            $query->orderBy('created_at', 'DESC');
        }

        return $query->paginate();
    }

    public function all()
    {
        return Schedule::all();
    }

    public function findOrFail($id): Schedule
    {
        return Schedule::with(['user', 'services'])->findOrFail($id);
    }

    public function update(Schedule $schedule, array $data)
    {
        $schedule->update(collect($data)->except(['services'])->all());
        $schedule->services()->sync($data['services']);

        return $schedule->load(['user', 'services']);
    }

    public function delete(Schedule $schedule)
    {
        $schedule->delete();
    }

    public function calculateServiceSlots(int $serviceDuration, int $scheduleInterval): int
    {
        if ($scheduleInterval <= 0) {
            throw new \InvalidArgumentException('Schedule interval must be greater than zero');
        }

        return (int) ceil($serviceDuration / $scheduleInterval);
    }

    public function validateConsecutiveSlots(string $requestedHour, array $availableHours, int $serviceSlots, int $scheduleInterval, ?int $serviceDuration = null): bool
    {
        $currentTime = Carbon::createFromFormat('H:i', $requestedHour);

        $sortedHours = collect($availableHours)->map(function ($hour) {
            return Carbon::createFromFormat('H:i', $hour);
        })->sort()->values();

        if ($sortedHours->isEmpty()) {
            return false;
        }

        $actualServiceDuration = $serviceDuration ?? ($serviceSlots * $scheduleInterval);
        $serviceEndTime = (clone $currentTime)->addMinutes($actualServiceDuration);

        $lastAvailableHour = $sortedHours->last();
        $nextSlotAfterLast = (clone $lastAvailableHour)->addMinutes($scheduleInterval);
        $serviceEndTimeFromLastSlot = (clone $lastAvailableHour)->addMinutes($actualServiceDuration);

        $serviceEndsExactlyAtNextSlot = $serviceEndTime->format('H:i') === $nextSlotAfterLast->format('H:i');
        $serviceStartsAtLastSlot = $currentTime->format('H:i') === $lastAvailableHour->format('H:i');
        $serviceEndsAtIntervalEnd = $serviceStartsAtLastSlot && $serviceEndTime->format('H:i') === $serviceEndTimeFromLastSlot->format('H:i') && $serviceEndTime->format('H:i') !== $nextSlotAfterLast->format('H:i');

        $slotsToCheck = $serviceSlots;
        if ($serviceEndsAtIntervalEnd || $serviceEndsExactlyAtNextSlot) {
            $slotsToCheck = $serviceSlots - 1;
        }

        for ($i = 0; $i < $slotsToCheck; $i++) {
            $requiredSlot = (clone $currentTime)->addMinutes($scheduleInterval * $i)->format('H:i');

            if (! in_array($requiredSlot, $availableHours)) {
                return false;
            }
        }

        return true;
    }

    public function isHourAvailable(string $requestedHour, array $availableHours): bool
    {
        return in_array($requestedHour, $availableHours);
    }

    public function availableHours($date, $service_id, $user_id = null)
    {
        $service = (new ServiceService)->findOrFail($service_id);

        if ($user_id !== null) {
            $user = (new UserService)->findOrFail($user_id);
        }

        $scheduleInterval = max(1, (int) (app(SettingService::class)->get('schedule_interval') ?? 15));

        $days = [];

        $users = [];

        $sliceMinutes = function (Carbon $start, Carbon $end) use ($scheduleInterval) {
            $slices = [];

            while ($start < $end) {
                array_push($slices, (clone $start)->format('H:i'));

                $start->addMinutes($scheduleInterval);
            }

            return $slices;
        };

        $date = trim($date);
        $format = strpos($date, ':') !== false && substr_count($date, ':') === 2 ? 'Y-m-d H:i:s' : 'Y-m-d H:i';

        $requestDateLocal = Carbon::createFromFormat($format, $date, 'America/Sao_Paulo');
        $requestDate = clone $requestDateLocal;
        $start = clone $requestDateLocal;

        $serviceSlots = $this->calculateServiceSlots($service->duration, $scheduleInterval);

        $splitByValue = function (array $neddle, string $haystack) {
            $newArray = [];

            $index = 0;

            foreach ($neddle as $value) {
                if ($value !== $haystack) {
                    $newArray[$index][] = $value;
                } else {
                    $index++;
                }
            }

            return $newArray;
        };

        for ($i = 0; $i <= 365 && count($days) < 7; $i++) {
            $currentDay = (clone $start)->startOfDay();

            // Buscar schedules filtrados por user_id se fornecido
            $schedulesQuery = Schedule::query();

            if ($user_id !== null) {
                $schedulesQuery->where('user_id', $user_id);
            }

            $schedules = $schedulesQuery->get();

            $validSlots = $schedules->filter(function ($hour) use ($currentDay, $service) {
                $avaiableDays = explode(',', $hour->days);
                $avaiableDays = array_map('intval', $avaiableDays);

                $isDayAvailable = in_array($currentDay->dayOfWeek, $avaiableDays);

                return $isDayAvailable && $hour->services->contains($service->id);
            });

            if ($validSlots->count() > 0) {
                $allHoursDay = [];

                $minTimeForDay = null;
                if ($currentDay->isSameDay($requestDate)) {
                    $minTimeForDay = clone $requestDate;
                    $minutes = $minTimeForDay->minute;
                    $roundedMinutes = ceil($minutes / $scheduleInterval) * $scheduleInterval;

                    if ($roundedMinutes >= 60) {
                        $minTimeForDay->addHour();
                        $minTimeForDay->minute(0);
                        $minTimeForDay->second(0);
                    } else {
                        $minTimeForDay->minute($roundedMinutes);
                        $minTimeForDay->second(0);
                    }
                }

                foreach ($validSlots as $slot) {
                    $slotUser = $slot->user;

                    if ($slotUser) {
                        $users[$slotUser->id] = $slotUser;

                        if (! isset($allHoursDay[$slotUser->id])) {
                            $allHoursDay[$slotUser->id] = [];
                        }

                        $slotStart = Carbon::createFromFormat('Y-m-d H:i:s', $currentDay->format('Y-m-d').' '.$slot->start_at, 'America/Sao_Paulo');
                        $slotEnd = Carbon::createFromFormat('Y-m-d H:i:s', $currentDay->format('Y-m-d').' '.$slot->end_at, 'America/Sao_Paulo');

                        if ($minTimeForDay !== null && $currentDay->isSameDay($requestDate)) {
                            $slotStart = clone $minTimeForDay;
                        }

                        if ($slotStart->gte($slotEnd)) {
                            continue;
                        }

                        $hours = $sliceMinutes($slotStart, $slotEnd);

                        $allHoursDay[$slotUser->id] = array_merge($allHoursDay[$slotUser->id], $hours);
                    }
                }

                foreach ($allHoursDay as $user_id => $hours) {
                    $dayStart = (clone $currentDay)->startOfDay()->setTimezone('UTC');
                    $dayEnd = (clone $currentDay)->endOfDay()->setTimezone('UTC');

                    $schedulings = (new SchedulingService)->all([
                        'dateFrom' => $dayStart->format('Y-m-d H:i:s'),
                        'dateTo' => $dayEnd->format('Y-m-d H:i:s'),
                        'user' => $user_id,
                    ]);

                    $filledSchedulings = $schedulings->map(function ($scheduling) {
                        return [
                            'start_at' => Carbon::parse($scheduling->date),
                            'end_at' => Carbon::parse($scheduling->date)
                                ->addMinutes($scheduling->service()->first()->duration),
                        ];
                    });

                    $filledSchedulings = Arr::flatten(
                        $filledSchedulings->map(function ($scheduling) use ($sliceMinutes) {
                            return $sliceMinutes($scheduling['start_at'], $scheduling['end_at']);
                        })
                    );

                    $minTime = null;

                    if ($currentDay->isSameDay($requestDate)) {
                        $minTime = clone $requestDate;
                        $minutes = $minTime->minute;
                        $roundedMinutes = ceil($minutes / $scheduleInterval) * $scheduleInterval;

                        if ($roundedMinutes >= 60) {
                            $minTime->addHour();
                            $minTime->minute(0);
                            $minTime->second(0);
                        } else {
                            $minTime->minute($roundedMinutes);
                            $minTime->second(0);
                        }
                    }

                    $emptySchedulings = collect($allHoursDay[$user_id])->map(function ($hour) use ($filledSchedulings, $currentDay, $requestDate, $minTime) {
                        if (in_array($hour, $filledSchedulings)) {
                            return '-';
                        }

                        if ($minTime !== null && $currentDay->isSameDay($requestDate)) {
                            $hourTime = Carbon::createFromFormat('H:i', $hour, 'America/Sao_Paulo');
                            $minHourTime = $minTime->format('H:i');
                            $minHourTimeCarbon = Carbon::createFromFormat('H:i', $minHourTime, 'America/Sao_Paulo');

                            if ($hourTime->lt($minHourTimeCarbon)) {
                                return '-';
                            }
                        }

                        return $hour;
                    })->unique()->all();

                    $emptySchedulings = $splitByValue($emptySchedulings, '-');

                    $emptySchedulings = collect($emptySchedulings)->filter(function ($schedule) use ($serviceSlots) {
                        return count($schedule) >= $serviceSlots;
                    })->all();

                    $emptySchedulings = collect($emptySchedulings)->map(function ($slot) use ($validSlots, $service, $currentDay, $requestDate, $minTime) {
                        return collect($slot)->filter(function ($hour, $key) use ($validSlots, $service, $currentDay, $requestDate, $minTime) {
                            $startTime = Carbon::createFromFormat('H:i', $hour, 'America/Sao_Paulo');
                            $actualServiceDuration = $service->duration;
                            $endTime = (clone $startTime)->addMinutes($actualServiceDuration);

                            foreach ($validSlots as $validSlot) {
                                $intervalStart = Carbon::createFromFormat('H:i:s', $validSlot->start_at, 'America/Sao_Paulo');
                                $intervalEnd = Carbon::createFromFormat('H:i:s', $validSlot->end_at, 'America/Sao_Paulo');

                                if ($minTime !== null && $currentDay->isSameDay($requestDate)) {
                                    $minTimeOnly = Carbon::createFromFormat('H:i:s', $minTime->format('H:i:s'), 'America/Sao_Paulo');
                                    if ($intervalStart->gt($minTimeOnly)) {
                                        $intervalStart = $minTimeOnly;
                                    }
                                }

                                if ($startTime >= $intervalStart && $endTime <= $intervalEnd) {
                                    return true;
                                }
                            }

                            return false;
                        })->all();
                    })->all();

                    $emptySchedulings = Arr::flatten($emptySchedulings);

                    if (count($emptySchedulings) === 0) {
                        unset($allHoursDay[$user_id]);
                    } else {
                        $allHoursDay[$user_id] = $emptySchedulings;
                    }
                }

                if (count($allHoursDay) === 0) {
                    $start->addDay();

                    continue;
                }

                $days[$currentDay->format('Y-m-d')] = $allHoursDay;
            }

            $start->addDay();
        }

        return [
            'schedule' => $days,
            'service' => $service,
            'users' => collect($users)->unique()->all(),
        ];
    }
}
