<?php

namespace App\Services\Payments;

use App\Contracts\PaymentContract;
use App\DTOs\CreditCardData;
use App\Events\SchedulingPaymentCanceled;
use App\Events\SchedulingPaymentPaid;
use App\Events\SchedulingPaymentStatusUpdated;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Scheduling;
use App\Models\Service;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;

final class PaymentService
{
    public function createCreditCard($data, Model $owner): CreditCardData
    {
        return $this->source()->createCard($data, $owner);
    }

    public function createToken(string $method, array $data): string
    {
        $source = 'App\Services\Payments\\'.ucfirst($method);

        return $this->source($source)->createToken($data);
    }

    private function source(?string $source = null): PaymentContract
    {
        if (! $source) {
            if (request()->get('use_platform_payment', false)) {
                $activePaymentMethod = config('app.active_payment_method');
            } else {
                $activePaymentMethod = config('app.active_payment_method');
            }

            throw_if(!$activePaymentMethod, new \Exception('Método de pagamento não configurado', 500));

            $source = 'App\Services\Payments\\'.ucfirst($activePaymentMethod);
        }

        $service = new $source;

        throw_if(! is_a($service, PaymentContract::class), new \Exception('Houve um erro com o pagamento, tente novamente com outro cartão'));

        return $service;
    }

    public function billCompany(Company $company, ?float $amount = null): string
    {
        return $this->source($company->card()->source)->billCompany($company, $amount);
    }

    public function confirm(Customer $customer, Service $service, array $data): array
    {
        $source = 'App\Services\Payments\\'.ucfirst($data['method']);

        return $this->source($source)->confirm($customer, $service, $data);
    }

    public function confirmOrder(Customer $customer, Order $order, array $data): void
    {
        $source = 'App\Services\Payments\\'.ucfirst($data['method']);

        $result = $this->source($source)->confirmOrder($customer, $order, $data);

        $order->update([
            'payment_reference' => $result['id'],
            'payment_link' => $result['payment_link'],
            'payment_method' => $data['method'],
        ]);
    }

    public function refund(string $paymentReference, string $method): bool
    {
        $source = 'App\Services\Payments\\'.ucfirst($method);

        return $this->source($source)->refund($paymentReference);
    }

    public function updatePaymentStatus(): void
    {
        $schedulings = Scheduling::filterBy(['payment_status' => 'awaiting_payment'])->get();

        foreach ($schedulings as $scheduling) {
            app('company')->registerCompany($scheduling->company);

            if (! $scheduling->payment_method || ! $scheduling->payment_reference) {
                continue;
            }

            try {
                $source = 'App\Services\Payments\\'.ucfirst($scheduling->payment_method);
                $paymentService = $this->source($source);

                $oldStatus = $scheduling->payment_status;
                $newStatus = $paymentService->updatePaymentStatus($scheduling->payment_reference);

                if ($oldStatus !== $newStatus) {
                    $scheduling->update(['payment_status' => $newStatus]);

                    Event::dispatch(new SchedulingPaymentStatusUpdated($scheduling, $oldStatus, $newStatus));

                    if ($newStatus === 'paid') {
                        Event::dispatch(new SchedulingPaymentPaid($scheduling));
                    } elseif ($newStatus === 'canceled') {
                        Event::dispatch(new SchedulingPaymentCanceled($scheduling));
                    }
                }
            } catch (\Exception $e) {
                Log::error('Erro ao atualizar status de pagamento', [
                    'scheduling_id' => $scheduling->id,
                    'payment_reference' => $scheduling->payment_reference,
                    'payment_method' => $scheduling->payment_method,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
