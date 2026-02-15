<h1>Olá, {{ $scheduling->user->name }}!</h1>

<p>Você recebeu um novo agendamento! Confira os detalhes abaixo.</p>

<h2>Detalhes do Agendamento</h2>

<ul>
    <li><strong>Cliente:</strong> {{ $scheduling->customer->name }}</li>
    
    @if($scheduling->customer->phone)
    <li><strong>Telefone do Cliente:</strong> {{ $scheduling->customer->phone }}</li>
    @endif
    
    @if($scheduling->customer->email)
    <li><strong>E-mail do Cliente:</strong> {{ $scheduling->customer->email }}</li>
    @endif
    
    <li><strong>Serviço:</strong> {{ $scheduling->service->name ?? 'N/A' }}</li>
    
    @if($scheduling->service->description)
    <li><strong>Descrição:</strong> {{ $scheduling->service->description }}</li>
    @endif
    
    <li><strong>Data e Horário:</strong> {{ $scheduling->date->format('d/m/Y') }} às {{ $scheduling->date->format('H:i') }}</li>
    
    @if($scheduling->service->duration)
    <li><strong>Duração:</strong> {{ $scheduling->service->duration }} minutos</li>
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

<p><strong>Importante:</strong></p>
<ul>
    <li>Confirme sua disponibilidade para o horário agendado</li>
    <li>Entre em contato com o cliente se necessário</li>
    <li>Prepare-se com antecedência para o atendimento</li>
</ul>

<p>Atenciosamente,<br><strong>{{ $scheduling->company->name ?? 'Equipe PontoA' }}</strong></p>

