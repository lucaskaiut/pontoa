<?php

namespace App\Mail;

use App\Models\Company;
use App\Services\CompanyService;
use App\Services\PlanService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BillingNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public Company $company;
    public bool $isInTrialPeriod;
    public ?string $nextBillingDate;
    public ?string $trialEndDate;

    public function __construct(Company $company)
    {
        $this->company = $company;

        $planService = app(PlanService::class);
        $companyService = app(CompanyService::class);

        $this->isInTrialPeriod = $planService->isInTrialPeriod($company);
        $nextBillingDate = $companyService->getNextBillingDate($company);
        $this->nextBillingDate = $nextBillingDate ? $nextBillingDate->format('d/m/Y') : null;

        if ($this->isInTrialPeriod && $company->plan_trial_ends_at) {
            $this->trialEndDate = \Carbon\Carbon::parse($company->plan_trial_ends_at)->format('d/m/Y');
        } else {
            $this->trialEndDate = null;
        }
    }

    public function envelope(): Envelope
    {
        $subject = $this->isInTrialPeriod
            ? 'Seu período grátis está chegando ao fim - PontoA'
            : 'Lembrete: Cobrança em 3 dias - PontoA';

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mails.company.billing-notification',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
