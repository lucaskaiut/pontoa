<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Console\Commands\CheckCompanySubscription;
use App\Console\Commands\SendSchedulingNotifications;
class Kernel extends ConsoleKernel
{
    protected $commands = [
        CheckCompanySubscription::class,
        SendSchedulingNotifications::class,
        \App\Console\Commands\UpdatePaymentStatus::class,
        \App\Console\Commands\ExpireConfirmationRequests::class,
        \App\Console\Commands\SendNpsRequests::class,
        \App\Console\Commands\SendBillingNotifications::class,
    ];
    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->command('check:subscription')->everyMinute();
        $schedule->command('notifications:send')->everyMinute();
        $schedule->command('payments:update-status')->everyFifteenMinutes();
        $schedule->command('confirmations:expire')->everyMinute();
        $schedule->command('nps:send')->everyMinute();
        $schedule->command('billing:send-notifications')->hourly();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
