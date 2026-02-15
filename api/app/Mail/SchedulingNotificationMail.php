<?php

namespace App\Mail;

use App\Models\Notification;
use App\Models\Scheduling;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SchedulingNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public Scheduling $scheduling;
    public Notification $notification;

    public function __construct(Scheduling $scheduling, Notification $notification)
    {
        $this->scheduling = $scheduling;
        $this->notification = $notification;
    }

    public function envelope()
    {
        return new Envelope(
            subject: 'Lembrete de Agendamento',
        );
    }

    public function content()
    {
        return new Content(
            view: 'mails.scheduling.notification',
        );
    }

    public function attachments()
    {
        return [];
    }
}

