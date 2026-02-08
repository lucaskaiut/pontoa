<h1>Novo Agendamento Recebido</h1>

<p>Um novo agendamento foi criado em sua empresa. Confira os detalhes abaixo.</p>

<h2>Informações do Cliente</h2>

<ul>
    <li><strong>Nome:</strong> {{ $scheduling->customer->name }}</li>
    
    @if($scheduling->customer->email)
    <li><strong>E-mail:</strong> {{ $scheduling->customer->email }}</li>
    @endif
    
    @if($scheduling->customer->phone)
    <li><strong>Telefone:</strong> {{ $scheduling->customer->phone }}</li>
    @endif
</ul>

<h2>Informações do Profissional</h2>

<ul>
    <li><strong>Nome:</strong> {{ $scheduling->user->name ?? 'N/A' }}</li>
    
    @if($scheduling->user && $scheduling->user->email)
    <li><strong>E-mail:</strong> {{ $scheduling->user->email }}</li>
    @endif
    
    @if($scheduling->user && $scheduling->user->phone)
    <li><strong>Telefone:</strong> {{ $scheduling->user->phone }}</li>
    @endif
</ul>

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
    
    <li><strong>Valor:</strong> R$ {{ number_format($scheduling->price, 2, ',', '.') }}</li>
    
    @if($scheduling->cost)
    <li><strong>Custo:</strong> R$ {{ number_format($scheduling->cost, 2, ',', '.') }}</li>
    @endif
    
    @if($scheduling->commission)
    <li><strong>Comissão:</strong> R$ {{ number_format($scheduling->commission, 2, ',', '.') }}</li>
    @endif
</ul>

@if($scheduling->company)
<h2>Informações da Empresa</h2>
<ul>
    <li><strong>Empresa:</strong> {{ $scheduling->company->name }}</li>
    
    @if($scheduling->company->phone)
    <li><strong>Telefone:</strong> {{ $scheduling->company->phone }}</li>
    @endif
</ul>
@endif

<p>Atenciosamente,<br><strong>{{ $scheduling->company->name ?? 'Equipe PontoA' }}</strong></p>

