#!/bin/sh
set -e

echo "[equipamento-service] Aguardando MySQL em ${MYSQL_HOST:-mysql}:${MYSQL_PORT:-3306}..."
npx wait-on -t 60000 "tcp:${MYSQL_HOST:-mysql}:${MYSQL_PORT:-3306}"

echo "[equipamento-service] Executando migrations..."
npx prisma migrate deploy

echo "[equipamento-service] Iniciando serviço..."
exec "$@"
