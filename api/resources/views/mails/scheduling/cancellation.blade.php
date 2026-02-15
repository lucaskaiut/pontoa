<h1>Olá, {{ $scheduling->customer->name }}!</h1>

<p>Infelizmente, seu agendamento foi cancelado.</p>

<p>Detalhes do agendamento cancelado:</p>
<ul>
    <li>Serviço: {{ $scheduling->service->name ?? 'N/A' }}</li>
    <li>Data: {{ $scheduling->date->format('d/m/Y H:i') }}</li>
    <li>Profissional: {{ $scheduling->user->name ?? 'N/A' }}</li>
</ul>

<p>Se você tiver alguma dúvida ou precisar reagendar, entre em contato conosco.</p>

<p>Atenciosamente,<br>Equipe PontoA</p>

