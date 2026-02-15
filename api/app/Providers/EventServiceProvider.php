<?php

namespace App\Providers;

use App\Events\OrderPaid;
use App\Events\ReviewNegativeReceived;
use App\Events\SchedulingCancelled;
use App\Events\SchedulingConfirmed;
use App\Events\SchedulingCreated;
use App\Events\SchedulingPaymentPaid;
use App\Listeners\ConfirmScheduling;
use App\Listeners\HandleReviewNegativeReceived;
use App\Listeners\ProcessOrderItems;
use App\Listeners\RefundSchedulingPayment;
use App\Listeners\RevertPackageSession;
use App\Listeners\SendSchedulingCancellationNotification;
use App\Listeners\SendSchedulingConfirmationNotification;
use App\Listeners\SendSchedulingCreatedNotification;
use App\Models\Company;
use App\Models\Customer;
use App\Models\CustomerPackage;
use App\Models\File;
use App\Models\Invitation;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Package;
use App\Models\RequestLog;
use App\Models\Schedule;
use App\Models\Scheduling;
use App\Models\Service;
use App\Models\Setting;
use App\Models\User;
use App\Observers\CompanyObserver;
use App\Observers\CustomerObserver;
use App\Observers\CustomerPackageObserver;
use App\Observers\FileObserver;
use App\Observers\InvitationObserver;
use App\Observers\NotificationObserver;
use App\Observers\OrderObserver;
use App\Observers\PackageObserver;
use App\Observers\RequestLogObserver;
use App\Observers\ScheduleObserver;
use App\Observers\SchedulingObserver;
use App\Observers\ServiceObserver;
use App\Observers\SettingObserver;
use App\Observers\UserObserver;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        SchedulingCreated::class => [
            SendSchedulingCreatedNotification::class,
        ],
        SchedulingConfirmed::class => [
            SendSchedulingConfirmationNotification::class,
        ],
        SchedulingCancelled::class => [
            RevertPackageSession::class,
            RefundSchedulingPayment::class,
            SendSchedulingCancellationNotification::class,
        ],
        SchedulingPaymentPaid::class => [
            ConfirmScheduling::class,
        ],
        OrderPaid::class => [
            ProcessOrderItems::class,
        ],
        ReviewNegativeReceived::class => [
            HandleReviewNegativeReceived::class,
        ],
    ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        Company::observe(CompanyObserver::class);
        User::observe(UserObserver::class);
        Customer::observe(CustomerObserver::class);
        Invitation::observe(InvitationObserver::class);
        Service::observe(ServiceObserver::class);
        Schedule::observe(ScheduleObserver::class);
        RequestLog::observe(RequestLogObserver::class);
        File::observe(FileObserver::class);
        Notification::observe(NotificationObserver::class);
        Setting::observe(SettingObserver::class);
        Scheduling::observe(SchedulingObserver::class);
        Package::observe(PackageObserver::class);
        Order::observe(OrderObserver::class);
        CustomerPackage::observe(CustomerPackageObserver::class);
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     *
     * @return bool
     */
    public function shouldDiscoverEvents()
    {
        return false;
    }
}
