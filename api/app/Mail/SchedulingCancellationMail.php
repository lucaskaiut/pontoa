<?php

namespace App\Mail;

use App\Models\Scheduling;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SchedulingCancellationMail extends Mailable
{
    use Queueable, SerializesModels;

    public Scheduling $scheduling;

    public function __construct(Scheduling $scheduling)
    {
        $this->scheduling = $scheduling;
    }

    public function envelope()
    {
        return new Envelope(
            subject: 'Seu agendamento foi cancelado',
        );
    }

    public function content()
    {
        return new Content(
            view: 'mails.scheduling.cancellation',
        );
    }

    public function attachments()
    {
        return [];
    }
}

