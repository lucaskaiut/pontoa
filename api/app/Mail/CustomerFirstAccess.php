<?php

namespace App\Mail;

use App\Models\Customer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomerFirstAccess extends Mailable
{
    use Queueable, SerializesModels;

    public $customer;

    /**
     * Create a new message instance.
     */
    public function __construct(Customer $customer)
    {
        $this->customer = $customer;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Defina sua senha de acesso',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $company = $this->customer->company;
        $firstAccessUrl = 'https://' . $company->domain . '/primeiro-acesso/' . $this->customer->first_access_token;

        return new Content(
            view: 'mails.customer.first-access',
            with: [
                'customer' => $this->customer,
                'token' => $this->customer->first_access_token,
                'firstAccessUrl' => $firstAccessUrl,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
