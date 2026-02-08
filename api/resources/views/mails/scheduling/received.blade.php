<h1>Olá, {{ $scheduling->customer->name }}!</h1>

<p>Recebemos seu agendamento com sucesso! Agradecemos sua preferência.</p>

<p>Seu agendamento está sendo processado e você receberá uma confirmação em breve.</p>

<h2>Detalhes do Agendamento</h2>

<ul>
    <li><strong>Serviço:</strong> {{ $scheduling->service->name ?? 'N/A' }}</li>
    
    @if($scheduling->service->description)
    <li><strong>Descrição:</strong> {{ $scheduling->service->description }}</li>
    @endif
    
    <li><strong>Data e Horário:</strong> {{ $scheduling->date->format('d/m/Y') }} às {{ $scheduling->date->format('H:i') }}</li>
    
    @if($scheduling->service->duration)
    <li><strong>Duração:</strong> {{ $scheduling->service->duration }} minutos</li>
    @endif
    
    <li><strong>Profissional:</strong> {{ $scheduling->user->name ?? 'N/A' }}</li>
    
    @if($scheduling->user->phone)
    <li><strong>Telefone do Profissional:</strong> {{ $scheduling->user->phone }}</li>
    @endif
    
    <li><strong>Valor:</strong> R$ {{ number_format($scheduling->price, 2, ',', '.') }}</li>
</ul>

@if($scheduling->company)
<h2>Informações da Empresa</h2>
<ul>
    <li><strong>Empresa:</strong> {{ $scheduling->company->name }}</li>
    
    @if($scheduling->company->phone)
    <li><strong>Telefone:</strong> {{ $scheduling->company->phone }}</li>
    @endif
    
    @if($scheduling->company->email)
    <li><strong>E-mail:</strong> {{ $scheduling->company->email }}</li>
    @endif
</ul>
@endif

<p><strong>Próximos passos:</strong></p>
<ul>
    <li>Você receberá uma confirmação do agendamento em breve</li>
    <li>Em caso de necessidade de cancelamento ou alteração, entre em contato conosco</li>
    <li>Se tiver alguma dúvida, não hesite em nos contatar</li>
</ul>

<p>Estamos à sua disposição para qualquer esclarecimento.</p>

<p>Atenciosamente,<br><strong>{{ $scheduling->company->name ?? 'Equipe PontoA' }}</strong></p>

