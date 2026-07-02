#!/bin/sh
set -e

echo "[sala-service] Aguardando MySQL em ${MYSQL_HOST:-mysql}:${MYSQL_PORT:-3306}..."
npx wait-on -t 60000 "tcp:${MYSQL_HOST:-mysql}:${MYSQL_PORT:-3306}"

echo "[sala-service] Executando migrations..."
npx prisma migrate deploy

echo "[sala-service] Iniciando serviço..."
exec "$@"
