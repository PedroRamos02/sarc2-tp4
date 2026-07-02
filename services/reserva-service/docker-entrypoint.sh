#!/bin/sh
set -e

echo "[reserva-service] Aguardando MySQL em ${MYSQL_HOST:-mysql}:${MYSQL_PORT:-3306}..."
npx wait-on -t 60000 "tcp:${MYSQL_HOST:-mysql}:${MYSQL_PORT:-3306}"

echo "[reserva-service] Executando migrations..."
npx prisma migrate deploy

echo "[reserva-service] Iniciando serviço..."
exec "$@"
