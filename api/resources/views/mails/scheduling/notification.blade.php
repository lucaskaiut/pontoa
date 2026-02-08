<h1>Olá, {{ $scheduling->customer->name }}!</h1>

<p>{!! nl2br(e($notification->message)) !!}</p>

<p><strong>Data do agendamento:</strong> {{ $scheduling->date->format('d/m/Y H:i') }}</p>

<p><strong>Serviço:</strong> {{ $scheduling->service->name }}</p>

