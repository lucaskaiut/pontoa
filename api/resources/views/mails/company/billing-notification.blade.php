<h1>Olá, {{ $company->name }}!</h1>

@if($isInTrialPeriod)
<p>Seu período grátis está chegando ao fim! Em 3 dias, sua assinatura será renovada automaticamente.</p>

@if($trialEndDate)
<p><strong>Data de término do período grátis:</strong> {{ $trialEndDate }}</p>
@endif

<p>A partir desta data, sua assinatura será cobrada automaticamente no cartão de crédito cadastrado.</p>
@else
<p>Este é um lembrete de que sua assinatura será renovada automaticamente em <strong>3 dias</strong>.</p>

@if($nextBillingDate)
<p><strong>Data da próxima cobrança:</strong> {{ $nextBillingDate }}</p>
@endif

<p>A cobrança será realizada automaticamente no cartão de crédito cadastrado em sua conta.</p>
@endif

<h2>Informações da Assinatura</h2>

<ul>
    <li><strong>Plano:</strong> 
        @if($company->plan_name === 'pro')
            PRO (com IA)
        @else
            Básico
        @endif
    </li>
    
    <li><strong>Recorrência:</strong> 
        @if($company->plan_recurrence === 'yearly')
            Anual
        @else
            Mensal
        @endif
    </li>
    
    @if($company->plan_price)
    <li><strong>Valor:</strong> R$ {{ number_format($company->plan_price, 2, ',', '.') }}</li>
    @endif
</ul>

<h2>Importante</h2>

<ul>
    <li>Certifique-se de que seu cartão de crédito está válido e com limite disponível</li>
    <li>A cobrança será realizada automaticamente na data informada</li>
    <li>Você receberá um comprovante por email após a cobrança ser processada</li>
    @if($isInTrialPeriod)
    <li>Se desejar cancelar antes do término do período grátis, acesse as configurações da sua conta</li>
    @else
    <li>Se desejar alterar ou cancelar sua assinatura, acesse as configurações da sua conta</li>
    @endif
</ul>

<p>Se tiver alguma dúvida ou precisar de ajuda, não hesite em entrar em contato conosco.</p>

<p>Atenciosamente,<br><strong>Equipe PontoA</strong></p>

