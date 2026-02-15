<?php

namespace App\Services;

use App\Events\SchedulingCancelled;
use App\Events\SchedulingCreated;
use App\Models\Customer;
use App\Models\OrderItem;
use App\Models\Scheduling;
use App\Models\Service;
use App\Models\User;
use App\Services\Payments\PaymentService;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;

final class SchedulingService
{
    public function create(array $data): Scheduling
    {
        $service = $this->getService($data['service_id']);
        $scheduleInterval = $this->getScheduleInterval();

        $parsedDate = $this->parseDate($data['date']);
        $user = $this->resolveUser($data, $service, $scheduleInterval, $parsedDate);

        $this->validateUserAvailability($user, $service, $data['date'], $parsedDate);

        return DB::transaction(function () use ($service, $data, $user) {
            return $this->createSchedulingWithPayment($service, $user, $data);
        });
    }

    private function getService(int $serviceId): Service
    {
        return (new ServiceService)->findOrFail($serviceId);
    }

    private function getScheduleInterval(): int
    {
        return (int) (app(SettingService::class)->get('schedule_interval') ?? 15);
    }

    private function parseDate(string $date): array
    {
        return [
            'day' => Carbon::parse($date)->format('Y-m-d'),
            'hour' => Carbon::parse($date)->format('H:i'),
        ];
    }

    private function resolveUser(array $data, Service $service, int $scheduleInterval, array $parsedDate): User
    {
        if (isset($data['user_id']) && ! empty($data['user_id'])) {
            return (new UserService)->findOrFail($data['user_id']);
        }

        return $this->findAvailableUser($data['date'], $service, $scheduleInterval, $parsedDate);
    }

    private function findAvailableUser(string $date, Service $service, int $scheduleInterval, array $parsedDate): User
    {
        $scheduleService = new ScheduleService;
        $availableHours = $scheduleService->availableHours($date, $service->id, null);

        if (! isset($availableHours['schedule'][$parsedDate['day']]) || empty($availableHours['schedule'][$parsedDate['day']])) {
            throw new Exception('Não há profissionais disponíveis para o dia selecionado', 422);
        }

        $serviceSlots = $scheduleService->calculateServiceSlots($service->duration, $scheduleInterval);

        foreach ($availableHours['schedule'][$parsedDate['day']] as $userId => $hours) {
            if (! $scheduleService->isHourAvailable($parsedDate['hour'], $hours)) {
                continue;
            }

            if ($scheduleService->validateConsecutiveSlots($parsedDate['hour'], $hours, $serviceSlots, $scheduleInterval, $service->duration)) {
                return (new UserService)->findOrFail($userId);
            }
        }

        throw new Exception('Não há profissionais disponíveis para o horário selecionado', 422);
    }

    public function validateAvailability(array $schedulingData): void
    {
        $this->validateSchedulingData($schedulingData);

        $service = $this->getService($schedulingData['service_id']);
        $scheduleInterval = $this->getScheduleInterval();
        $parsedDate = $this->parseDate($schedulingData['date']);
        $user = $this->resolveUser($schedulingData, $service, $scheduleInterval, $parsedDate);

        $this->validateUserAvailability($user, $service, $schedulingData['date'], $parsedDate);
    }

    public function createFromOrderItem(OrderItem $orderItem): Scheduling
    {
        throw_if(
            ! $orderItem->isSchedulingType(),
            new Exception('OrderItem não é do tipo scheduling', 422)
        );

        $schedulingData = $orderItem->getSchedulingData();
        throw_if(
            ! $schedulingData,
            new Exception('Dados do agendamento não encontrados no OrderItem', 422)
        );

        $this->validateAvailability($schedulingData);

        return DB::transaction(function () use ($orderItem, $schedulingData) {
            $service = $this->getService($schedulingData['service_id']);
            $user = (new UserService)->findOrFail($schedulingData['user_id']);
            $order = $orderItem->order;
            $customer = $order->customer;

            $customerPackage = null;
            if (isset($schedulingData['customer']['email'])) {
                $packageResolver = new PackageResolver(new CustomerPackageService);
                $customerPackage = $packageResolver->resolveForService($customer->id, $service->id);
            }

            $scheduling = Scheduling::create([
                'customer_id' => $customer->id,
                'user_id' => $user->id,
                'service_id' => $service->id,
                'date' => Carbon::parse($schedulingData['date']),
                'cost' => $service->cost,
                'price' => $service->price,
                'commission' => $service->commission,
                'order_item_id' => $orderItem->id,
                'customer_package_id' => $customerPackage?->id,
                'used_package_session' => $customerPackage !== null,
            ]);

            if ($customerPackage) {
                $customerPackageService = new CustomerPackageService;
                $customerPackageService->consumeSession($customerPackage, $scheduling);
            }

            Event::dispatch(new SchedulingCreated($scheduling));

            return $scheduling;
        });
    }

    private function validateSchedulingData(array $data): void
    {
        throw_if(
            ! isset($data['service_id']) || ! isset($data['user_id']) || ! isset($data['date']),
            new Exception('Dados do agendamento incompletos. Necessário: service_id, user_id, date', 422)
        );
    }

    private function validateUserAvailability(User $user, Service $service, string $date, array $parsedDate): void
    {
        $scheduleService = new ScheduleService;
        $normalizedDate = Carbon::parse($date)->format('Y-m-d H:i');
        $availableHours = $scheduleService->availableHours($normalizedDate, $service->id, $user->id);

        if (! isset($availableHours['schedule'][$parsedDate['day']][$user->id]) || $user->status == 0) {
            throw new Exception('O profissional não está disponível para o dia selecionado', 422);
        }

        if (! $scheduleService->isHourAvailable($parsedDate['hour'], $availableHours['schedule'][$parsedDate['day']][$user->id])) {
            throw new Exception('O horário selecionado não está disponível', 422);
        }
    }

    private function createSchedulingWithPayment(Service $service, User $user, array $data): Scheduling
    {
        $customer = $this->resolveCustomer($data);
        $paymentResult = null;
        $paymentMethod = null;
        $customerPackage = null;

        try {
            $packageResolver = new PackageResolver(new CustomerPackageService);
            $customerPackage = $packageResolver->resolveForService($customer->id, $service->id);

            if (! $customerPackage) {
                $paymentResult = $this->processPayment($service, $data, $customer);
                $paymentMethod = $data['payment']['method'] ?? null;
            }

            $scheduling = $this->createScheduling($service, $customer, $user, $data, $paymentResult, $customerPackage);

            if ($customerPackage) {
                $customerPackageService = new CustomerPackageService;
                $customerPackageService->consumeSession($customerPackage, $scheduling);
            }

            Event::dispatch(new SchedulingCreated($scheduling));

            return $scheduling;
        } catch (\Exception $e) {
            $paymentReference = $paymentResult['id'] ?? null;
            $this->handlePaymentRefundOnError($paymentReference, $paymentMethod);
            throw $e;
        }
    }

    private function resolveCustomer(array $data): Customer
    {
        $authenticatedUser = Auth::user();

        if ($authenticatedUser instanceof Customer) {
            return $authenticatedUser;
        }

        return $this->findOrCreateCustomer($data);
    }

    private function findOrCreateCustomer(array $data): Customer
    {
        $companyId = app('company')->company()->id;
        $customerService = new CustomerService;
        $customer = $customerService->findByEmail($data['email'], $companyId);

        if ($customer) {
            return $customer;
        }

        return $customerService->create([
            'email' => $data['email'],
            'name' => $data['name'],
            'phone' => $data['phone'],
        ]);
    }

    private function createScheduling(Service $service, Customer $customer, User $user, array $data, ?array $paymentResult, ?\App\Models\CustomerPackage $customerPackage = null): Scheduling
    {
        return Scheduling::create([
            'customer_id' => $customer->id,
            'user_id' => $user->id,
            'service_id' => $service->id,
            'date' => Carbon::parse($data['date']),
            'cost' => $service->cost,
            'price' => $service->price,
            'commission' => $service->commission,
            'payment_reference' => $paymentResult['id'] ?? null,
            'payment_link' => $paymentResult['payment_link'] ?? null,
            'payment_method' => $data['payment']['method'] ?? null,
            'customer_package_id' => $customerPackage?->id,
            'used_package_session' => $customerPackage !== null,
        ]);
    }

    private function handlePaymentRefundOnError(?string $payment, ?string $paymentMethod): void
    {
        if (! $payment || ! $paymentMethod) {
            return;
        }

        try {
            $this->refundPayment($payment, $paymentMethod);
        } catch (\Exception $refundException) {
            Log::error('Erro ao estornar pagamento após falha no agendamento', [
                'payment_reference' => $payment,
                'payment_method' => $paymentMethod,
                'error' => $refundException->getMessage(),
            ]);
        }
    }

    /**
     * @return Scheduling[]
     */
    public function list(array $filters = [])
    {
        $user = Auth::user();

        if ($user instanceof Customer) {
            $filters['customer'] = $user->id;
        }

        return Scheduling::filterBy($filters)->paginate(perPage: $filters['perPage'] ?? 15, page: $filters['page'] ?? 1);
    }

    public function all(array $filters = [])
    {
        return Scheduling::filterBy($filters)->get();
    }

    public function findOrFail($id): Scheduling
    {
        return Scheduling::findOrFail($id);
    }

    public function update(Scheduling $scheduling, array $data)
    {
        $scheduling->update($data);

        return $scheduling;
    }

    public function delete(Scheduling $scheduling)
    {
        $scheduling->delete();
    }

    public function cancel(Scheduling $scheduling): Scheduling
    {
        if ($scheduling->status === 'cancelled') {
            throw new Exception('O agendamento já está cancelado', 422);
        }

        $scheduling->update(['status' => 'cancelled']);

        Event::dispatch(new SchedulingCancelled($scheduling));

        return $scheduling;
    }

    public function confirm(Scheduling $scheduling): Scheduling
    {
        if ($scheduling->status === 'confirmed') {
            throw new Exception('O agendamento já está confirmado', 422);
        }

        $confirmationRequestService = app(\App\Services\ConfirmationRequestService::class);
        $confirmationRequestService->invalidatePendingRequests($scheduling);

        $scheduling->update(['status' => 'confirmed']);

        return $scheduling;
    }

    public function markAsNoShow(Scheduling $scheduling): Scheduling
    {
        if ($scheduling->status === 'no_show') {
            throw new Exception('O agendamento já está marcado como no-show', 422);
        }

        $scheduling->update(['status' => 'no_show']);

        return $scheduling;
    }

    private function processPayment(Service $service, array $data, Customer $customer): ?array
    {
        if (! app(SettingService::class)->get('scheduling_require_checkout')) {
            return null;
        }

        $paymentService = new PaymentService;

        $paymentResult = $paymentService->confirm(
            service: $service,
            customer: $customer,
            data: $data['payment']
        );

        throw_if(! $paymentResult || ! isset($paymentResult['id']), new Exception('Houve um erro ao processar o pagamento', 422));

        return $paymentResult;
    }

    private function refundPayment(string $paymentReference, string $method): void
    {
        if (! app(SettingService::class)->get('scheduling_require_checkout')) {
            return;
        }

        $paymentService = new PaymentService;
        $paymentService->refund($paymentReference, $method);
    }
}
