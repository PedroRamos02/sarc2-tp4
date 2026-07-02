#!/bin/sh
set -e

echo "[professor-service] Aguardando MySQL em ${MYSQL_HOST:-mysql}:${MYSQL_PORT:-3306}..."
npx wait-on -t 60000 "tcp:${MYSQL_HOST:-mysql}:${MYSQL_PORT:-3306}"

echo "[professor-service] Executando migrations..."
npx prisma migrate deploy

echo "[professor-service] Iniciando serviço..."
exec "$@"
