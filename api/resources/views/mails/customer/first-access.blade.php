<h1>Bem-vindo, {{ $customer->name }}!</h1>
<p>Você foi cadastrado em nossa plataforma. Para acessar sua conta, defina sua senha clicando no link abaixo:</p>
<div>
    <p>
        <a href="{{ $firstAccessUrl }}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Definir minha senha
        </a>
    </p>
    <p>Ou copie e cole este link no seu navegador:</p>
    <p>{{ $firstAccessUrl }}</p>
</div>

