<?php 

namespace App\Services;

use App\Mail\SchedulingNotificationMail;
use App\Models\Notification;
use App\Models\Scheduling;
use App\Models\SchedulingNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

final class NotificationSchedulingService 
{
    private ConfirmationRequestService $confirmationRequestService;

    public function __construct(ConfirmationRequestService $confirmationRequestService)
    {
        $this->confirmationRequestService = $confirmationRequestService;
    }

    public function processNotifications()
    {
        $notifications = Notification::where('active', true)->get();

        foreach ($notifications as $notification) {
            $this->processNotification($notification);
        }
    }

    private function processNotification(Notification $notification)
    {
        $now = Carbon::now()->subHours(3);
        $timeBeforeInMinutes = $this->getTimeBeforeInMinutes($notification);
        
        $targetSchedulingDate = $now->copy()->addMinutes($timeBeforeInMinutes);
        
        $tolerance = 5;
        $startDate = $targetSchedulingDate->copy()->subMinutes($tolerance);
        $endDate = $targetSchedulingDate->copy()->addMinutes($tolerance);

        $status = $notification->is_confirmation ? 'pending' : 'confirmed';

        $schedulings = Scheduling::where('company_id', $notification->company_id)
            ->where('status', $status)
            ->whereBetween('date', [$startDate, $endDate])
            ->get();

        foreach ($schedulings as $scheduling) {
            $this->sendNotificationIfNotSent($scheduling, $notification);
        }
    }

    private function getTimeBeforeInMinutes(Notification $notification): int
    {
        return match($notification->time_unit) {
            'days' => $notification->time_before * 24 * 60,
            'hours' => $notification->time_before * 60,
            'minutes' => $notification->time_before,
            default => 0,
        };
    }

    private function sendNotificationIfNotSent(Scheduling $scheduling, Notification $notification)
    {
        $alreadySent = SchedulingNotification::where('scheduling_id', $scheduling->id)
            ->where('notification_id', $notification->id)
            ->exists();

        if ($alreadySent) {
            return;
        }

        $this->sendNotification($scheduling, $notification);
    }

    private function sendNotification(Scheduling $scheduling, Notification $notification)
    {
        $sent = false;

        if ($notification->email_enabled) {
            $sent = $this->sendEmail($scheduling, $notification) || $sent;
        }

        if ($notification->whatsapp_enabled) {
            $sent = $this->sendWhatsApp($scheduling, $notification) || $sent;
        }

        if (!$sent) {
            return;
        }

        SchedulingNotification::create([
            'scheduling_id' => $scheduling->id,
            'notification_id' => $notification->id,
            'sent_at' => Carbon::now(),
        ]);

        if ($notification->is_confirmation && $notification->whatsapp_enabled) {
            $this->confirmationRequestService->create($scheduling, $notification, 24);
        }
    }

    private function sendEmail(Scheduling $scheduling, Notification $notification): bool
    {
        try {
            Mail::to($scheduling->customer->email)
                ->queue(new SchedulingNotificationMail($scheduling, $notification));

            return true;
        } catch (\Exception $e) {
            Log::error('Erro ao enviar notificação por email: ' . $e->getMessage());
            return false;
        }
    }

    private function sendWhatsApp(Scheduling $scheduling, Notification $notification): bool
    {
        $payload = [
            'number' => '55' . $scheduling->customer->phone,
            'text' => strip_tags($notification->message),
        ];

        $url = config('app.evolution_api_url') . '/message/sendText/' . app(SettingService::class)->get('whatsapp_instance_name');

        logger()->info('URL: ' . $url);
        logger()->info('Payload: ' . json_encode($payload));

        $response = Http::withHeaders(['apikey' => config('app.evolution_api_key')])->post($url, $payload);

        if ($response->successful()) {
            return true;
        }

        Log::error('Erro ao enviar notificação por WhatsApp: ' . $response->body());
        return false;
    }
}

