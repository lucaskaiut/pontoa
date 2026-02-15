<?php 

namespace App\Services;

use App\Mail\UserRegistration;
use App\Models\User;
use App\Services\ScheduleService;
use App\Services\ServiceService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class UserService 
{
    public function create(array $data): User
    {
        $data['type'] = 'admin';
        $schedules = $data['schedules'] ?? [];
        $services = $data['services'] ?? [];
        $roles = $data['roles'] ?? [];
        unset($data['schedules'], $data['services'], $data['roles']);
        
        $user = User::create($data);

        if (!empty($services)) {
            $this->createServicesForUser($user, $services);
        }

        if (!empty($schedules)) {
            $this->createSchedulesForUser($user, $schedules);
        }

        if (!empty($roles)) {
            $this->syncRoles($user, $roles);
        }

        return $user->load(['schedules', 'services', 'roles']);
    }

    public function createSuperadmin(array $data): User
    {
        $data['type'] = 'superadmin';
        $schedules = $data['schedules'] ?? [];
        $services = $data['services'] ?? [];
        $roles = $data['roles'] ?? [];
        unset($data['schedules'], $data['services'], $data['roles']);
        
        $user = User::create($data);

        if (!empty($services)) {
            $this->createServicesForUser($user, $services);
        }

        if (!empty($schedules)) {
            $this->createSchedulesForUser($user, $schedules);
        }

        if (!empty($roles)) {
            $this->syncRoles($user, $roles);
        }

        return $user->load(['schedules', 'services', 'roles']);
    }

    public function login(array $data): array
    {
        $user = User::with(['schedules', 'services'])
            ->where('email', $data['email'])
            ->whereIn('type', ['admin', 'superadmin'])
            ->first();

        throw_if(!$user, new NotFoundHttpException('Credenciais inválidas'));

        throw_if(!Hash::check($data['password'], $user->password), new NotFoundHttpException('Credenciais inválidas'));

        $token = $user->createToken('login');

        return [
            'token' => $token->plainTextToken,
            'user' => $user,
        ];
    }

    /**
     * @return User[]
     */
    public function list(array $filters = [])
    {
        $users = User::with(['schedules', 'services', 'roles'])->filterBy($filters)->paginate();

        return $users;
    }

    public function findOrFail($id): User
    {
        return User::with(['schedules', 'services', 'roles'])->findOrFail($id);
    }

    public function update(User $user, array $data)
    {
        $schedules = $data['schedules'] ?? null;
        $services = $data['services'] ?? null;
        $roles = $data['roles'] ?? null;
        unset($data['schedules'], $data['services'], $data['roles'], $data['type']);
        
        $user->update($data);

        if ($services !== null) {
            $this->updateServicesForUser($user, $services);
        }

        if ($schedules !== null) {
            $this->updateSchedulesForUser($user, $schedules);
        }

        if ($roles !== null) {
            $this->syncRoles($user, $roles);
        }

        return $user->load(['schedules', 'services', 'roles']);
    }

    public function delete(User $user)
    {
        $user->delete();
    }

    public function dispathUserRegistrationMail(User $user)
    {
        Mail::to($user->email)->queue(new UserRegistration($user));
    }

    private function createServicesForUser(User $user, array $services): void
    {
        $serviceService = new ServiceService();
        $companyId = $user->company_id;

        foreach ($services as $serviceData) {
            $serviceData['user_id'] = $user->id;
            $serviceData['company_id'] = $companyId;
            $serviceService->create($serviceData);
        }
    }

    private function createSchedulesForUser(User $user, array $schedules): void
    {
        $scheduleService = new ScheduleService();
        $companyId = $user->company_id;

        foreach ($schedules as $scheduleData) {
            $scheduleData['user_id'] = $user->id;
            $scheduleData['company_id'] = $companyId;
            $scheduleService->create($scheduleData);
        }
    }

    private function updateServicesForUser(User $user, array $services): void
    {
        $serviceService = new ServiceService();
        $companyId = $user->company_id;
        
        if (empty($services)) {
            foreach ($user->services as $service) {
                $serviceService->delete($service);
            }
            return;
        }

        $existingServiceIds = $user->services->pluck('id')->toArray();
        $newServiceIds = [];

        foreach ($services as $serviceData) {
            $serviceId = $serviceData['id'] ?? null;
            
            if ($serviceId && in_array($serviceId, $existingServiceIds)) {
                $service = $serviceService->findOrFail($serviceId);
                $serviceData['user_id'] = $user->id;
                $serviceData['company_id'] = $companyId;
                $serviceService->update($service, $serviceData);
                $newServiceIds[] = $serviceId;
            } else {
                $serviceData['user_id'] = $user->id;
                $serviceData['company_id'] = $companyId;
                $newService = $serviceService->create($serviceData);
                $newServiceIds[] = $newService->id;
            }
        }

        $servicesToDelete = array_diff($existingServiceIds, $newServiceIds);
        foreach ($servicesToDelete as $serviceId) {
            $service = $serviceService->findOrFail($serviceId);
            $serviceService->delete($service);
        }
    }

    private function updateSchedulesForUser(User $user, array $schedules): void
    {
        $scheduleService = new ScheduleService();
        $companyId = $user->company_id;
        
        if (empty($schedules)) {
            foreach ($user->schedules as $schedule) {
                $scheduleService->delete($schedule);
            }
            return;
        }

        $existingScheduleIds = $user->schedules->pluck('id')->toArray();
        $newScheduleIds = [];

        foreach ($schedules as $scheduleData) {
            $scheduleId = $scheduleData['id'] ?? null;
            
            if ($scheduleId && in_array($scheduleId, $existingScheduleIds)) {
                $schedule = $scheduleService->findOrFail($scheduleId);
                $scheduleData['user_id'] = $user->id;
                $scheduleData['company_id'] = $companyId;
                $scheduleService->update($schedule, $scheduleData);
                $newScheduleIds[] = $scheduleId;
            } else {
                $scheduleData['user_id'] = $user->id;
                $scheduleData['company_id'] = $companyId;
                $newSchedule = $scheduleService->create($scheduleData);
                $newScheduleIds[] = $newSchedule->id;
            }
        }

        $schedulesToDelete = array_diff($existingScheduleIds, $newScheduleIds);
        foreach ($schedulesToDelete as $scheduleId) {
            $schedule = $scheduleService->findOrFail($scheduleId);
            $scheduleService->delete($schedule);
        }
    }

    public function syncRoles(User $user, array $roleIds): void
    {
        $companyId = $user->company_id;
        
        $validRoleIds = \App\Models\Role::where('company_id', $companyId)
            ->whereIn('id', $roleIds)
            ->pluck('id')
            ->toArray();

        $user->roles()->sync($validRoleIds);
    }
}