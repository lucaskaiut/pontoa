#!/bin/sh
set -e

if [ ! -f ".env" ]; then
    echo "Copiando .env"
    cp .env.docker .env
fi

if [ ! -d "vendor" ]; then
  echo "Pasta vendor/ não encontrada. Executando composer install..."
  composer install
fi

echo "Verificando conexão com o banco de dados..."
php /database-health.php

php artisan key:generate --force
php artisan storage:link

# Rodar as migrações (caso necessário)
echo "Executando migrações..."
php artisan migrate --force --no-interaction

php-fpm -D && echo "PHP-FPM iniciado com sucesso!" || echo "Falha ao iniciar PHP-FPM!"

tail -f /dev/null